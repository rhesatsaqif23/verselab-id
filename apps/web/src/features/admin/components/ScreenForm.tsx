import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "#/components/ui/button.tsx";
import { Label } from "#/components/ui/label.tsx";
import { Textarea } from "#/components/ui/textarea.tsx";
import {
  adminUpdateScreen,
  translateAdminError,
  type AdminScreen,
} from "#/libs/admin-content-fns.ts";
import { ChoiceFields } from "./ChoiceFields.tsx";
import { NumericFields } from "./NumericFields.tsx";
import { AllocationFields } from "./AllocationFields.tsx";

/** Editor API exposed to the parent (screen switching guard). */
export type ScreenEditorApi = {
  /** True when the current form differs from the last saved server response. */
  hasUnsaved: () => boolean;
  /** Validates and saves. Returns true when the form is cleanly saved. */
  save: () => Promise<boolean>;
};

/** Required-field validation for a screen, independent of the editor. */
export function validateScreenFields(s: AdminScreen): string[] {
  const errors: string[] = [];
  if (!s.prompt.trim()) errors.push("Pertanyaan / Prompt wajib diisi");

  if (!s.explain.trim()) errors.push("Penjelasan wajib diisi");

  if (s.type === "choice") {
    const options = s.options ?? [];
    if (options.length < 2) errors.push("Minimal 2 pilihan jawaban");
    if (options.some((o) => !o.label.trim())) errors.push("Semua pilihan jawaban wajib diisi");
    if (!s.correctId) errors.push("Jawaban benar wajib dipilih");
  }

  if (s.type === "numeric") {
    if (s.acceptRangeMin == null) errors.push("Rentang diterima (Min) wajib diisi");
    if (s.acceptRangeMax == null) errors.push("Rentang diterima (Max) wajib diisi");
    if (
      s.acceptRangeMin != null &&
      s.acceptRangeMax != null &&
      s.acceptRangeMin > s.acceptRangeMax
    ) {
      errors.push("Rentang Min tidak boleh lebih besar dari Max");
    }
  }

  if (s.type === "allocation") {
    const categories = s.categories ?? [];
    if (categories.length === 0) errors.push("Minimal 1 kategori alokasi");
    if (categories.some((c) => !c.trim())) errors.push("Semua kategori alokasi wajib diisi");
    if (!s.rule?.categoryId) errors.push("Kategori aturan wajib dipilih");
    if (s.rule?.min == null) errors.push("Min (%) aturan wajib diisi");
    if (s.rule?.min != null && s.rule?.max != null && s.rule.min > s.rule.max) {
      errors.push("Min (%) aturan tidak boleh lebih besar dari Max (%)");
    }
  }

  return errors;
}

/** True when at least one required field is missing or invalid. */
export function isScreenIncomplete(s: AdminScreen): boolean {
  return validateScreenFields(s).length > 0;
}

/** True when the screen holds no entered content at all (a blank draft). */
export function isScreenEmpty(s: AdminScreen): boolean {
  if (s.prompt.trim() || s.explain.trim()) return false;
  if ((s.options ?? []).some((o) => o.label.trim())) return false;
  if (s.numericUnit?.trim()) return false;
  if ((s.categories ?? []).some((c) => c.trim())) return false;
  if (s.rule?.categoryId.trim()) return false;
  return true;
}

/** Deep-sort object keys so snapshots ignore key order (Postgres jsonb
 * reorders keys on read — without this, a saved screen looks dirty forever). */
function canonicalize(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(canonicalize);
  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value as Record<string, unknown>)
        .sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0))
        .map(([key, entry]) => [key, canonicalize(entry)]),
    );
  }
  return value;
}

/** Normalized snapshot for dirty-checking (trims text, nulls blanks). */
export function snapshotScreenForm(s: AdminScreen): string {
  return JSON.stringify(
    canonicalize({
      prompt: s.prompt.trim(),
      explain: s.explain.trim(),
      options: s.options ?? null,
      correctId: s.correctId ?? null,
      numericUnit: s.numericUnit?.trim() || null,
      acceptRangeMin: s.acceptRangeMin ?? null,
      acceptRangeMax: s.acceptRangeMax ?? null,
      categories: s.categories ?? null,
      rule: s.rule ?? null,
    }),
  );
}

interface ScreenFormProps {
  screen: AdminScreen;
  lessonId: string;
  onRegisterValidator?: (api: ScreenEditorApi) => void;
  onSavedScreenId?: (id: string) => void;
}

export function ScreenForm({
  screen,
  lessonId,
  onRegisterValidator,
  onSavedScreenId,
}: ScreenFormProps) {
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState<AdminScreen>(() => screen);
  const baselineRef = useRef<string>(snapshotScreenForm(screen));

  useEffect(() => {
    baselineRef.current = snapshotScreenForm(screen);
  }, [screen]);

  const saveMutation = useMutation({
    mutationFn: (patch: Parameters<typeof adminUpdateScreen>[0]["data"]) =>
      adminUpdateScreen({ data: patch }),
    onSuccess: (updated: AdminScreen) => {
      // Trust the server response as the new baseline so later comparisons do
      // not flag server-side normalization as an unsaved change.
      setFormData(updated);
      baselineRef.current = snapshotScreenForm(updated);
      onSavedScreenId?.(updated.id);
      queryClient.invalidateQueries({ queryKey: ["admin-screens", lessonId] });
      toast.success("Screen berhasil disimpan");
    },
    onError: (err: Error) => {
      toast.error(translateAdminError(err, "Gagal menyimpan screen"));
    },
  });

  function handleChange<K extends keyof AdminScreen>(key: K, value: AdminScreen[K]) {
    setFormData((prev) => ({ ...prev, [key]: value }));
  }

  function handlePatch(patch: Partial<AdminScreen>) {
    setFormData((prev) => ({ ...prev, ...patch }));
  }

  function validateForm(): string[] {
    return validateScreenFields(formData);
  }

  function handleSave() {
    const errors = validateForm();
    if (errors.length > 0) {
      errors.forEach((msg) => toast.error(msg));
      return;
    }

    saveMutation.mutate({ id: screen.id, ...buildPatch() } as Parameters<
      typeof adminUpdateScreen
    >[0]["data"]);
  }

  function buildPatch(): Partial<AdminScreen> {
    const patch: Partial<AdminScreen> = {
      prompt: formData.prompt.trim(),
      explain: formData.explain.trim(),
    };

    if (formData.type === "choice") {
      patch.options = formData.options ?? [];
      patch.correctId = formData.correctId || null;
      patch.numericUnit = null;
      patch.acceptRangeMin = null;
      patch.acceptRangeMax = null;
      patch.categories = null;
      patch.rule = null;
    } else if (formData.type === "numeric") {
      patch.options = null;
      patch.correctId = null;
      patch.numericUnit = formData.numericUnit?.trim() || null;
      patch.acceptRangeMin = formData.acceptRangeMin;
      patch.acceptRangeMax = formData.acceptRangeMax;
      patch.categories = null;
      patch.rule = null;
    } else if (formData.type === "allocation") {
      patch.options = null;
      patch.correctId = null;
      patch.numericUnit = null;
      patch.acceptRangeMin = null;
      patch.acceptRangeMax = null;
      patch.categories = formData.categories ?? [];
      patch.rule = formData.rule;
    } else {
      patch.options = null;
      patch.correctId = null;
      patch.numericUnit = null;
      patch.acceptRangeMin = null;
      patch.acceptRangeMax = null;
      patch.categories = null;
      patch.rule = null;
    }

    return patch;
  }

  useEffect(() => {
    if (onRegisterValidator) {
      onRegisterValidator({
        hasUnsaved: () => snapshotScreenForm(formData) !== baselineRef.current,
        save: async () => {
          const errors = validateForm();
          if (errors.length > 0) {
            errors.forEach((msg) => toast.error(msg));
            return false;
          }
          try {
            await saveMutation.mutateAsync({ id: screen.id, ...buildPatch() } as Parameters<
              typeof adminUpdateScreen
            >[0]["data"]);
            return true;
          } catch {
            return false;
          }
        },
      });
    }
  });

  const isPending = saveMutation.isPending;

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="prompt" className="text-base">
          Pertanyaan / Prompt <span className="text-destructive">*</span>
        </Label>
        <Textarea
          id="prompt"
          value={formData.prompt}
          onChange={(e) => handleChange("prompt", e.target.value)}
          placeholder="Teks pertanyaan / prompt"
          rows={3}
          className="md:text-base"
        />
      </div>

      {formData.type === "choice" && <ChoiceFields screen={formData} onChange={handlePatch} />}
      {formData.type === "numeric" && <NumericFields screen={formData} onChange={handlePatch} />}
      {formData.type === "allocation" && (
        <AllocationFields screen={formData} onChange={handlePatch} />
      )}

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="explain" className="text-base">
          Penjelasan <span className="text-destructive">*</span>
        </Label>
        <Textarea
          id="explain"
          value={formData.explain}
          onChange={(e) => handleChange("explain", e.target.value)}
          placeholder="Teks penjelasan yang muncul setelah pengguna menjawab"
          rows={3}
          className="md:text-base"
        />
      </div>

      <div className="flex justify-end border-t pt-4">
        <Button onClick={handleSave} disabled={isPending} size="sm">
          {isPending ? "Menyimpan..." : "Simpan"}
        </Button>
      </div>
    </div>
  );
}
