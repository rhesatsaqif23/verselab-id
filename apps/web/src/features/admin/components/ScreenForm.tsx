import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "#/components/ui/button.tsx";
import { Label } from "#/components/ui/label.tsx";
import { Textarea } from "#/components/ui/textarea.tsx";
import { adminUpdateScreen, type AdminScreen } from "#/libs/admin-content-fns.ts";
import { ChoiceFields } from "./ChoiceFields.tsx";
import { NumericFields } from "./NumericFields.tsx";
import { AllocationFields } from "./AllocationFields.tsx";

interface ScreenFormProps {
  screen: AdminScreen;
  lessonId: string;
  onRegisterValidator?: (fn: () => boolean) => void;
}

export function ScreenForm({ screen, lessonId, onRegisterValidator }: ScreenFormProps) {
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState<AdminScreen>(() => screen);
  const validateRef = useRef<() => boolean>(() => true);

  useEffect(() => {
    validateRef.current = () => {
      const errors = validateForm();
      if (errors.length > 0) {
        errors.forEach((msg) => toast.error(msg));
        return false;
      }
      return true;
    };
  });

  useEffect(() => {
    if (onRegisterValidator) {
      onRegisterValidator(() => validateRef.current());
    }
  }, [onRegisterValidator]);

  const saveMutation = useMutation({
    mutationFn: (patch: Parameters<typeof adminUpdateScreen>[0]["data"]) =>
      adminUpdateScreen({ data: patch }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-screens", lessonId] });
      toast.success("Screen berhasil disimpan");
    },
    onError: (err: Error) => {
      toast.error(err.message || "Gagal menyimpan screen");
    },
  });

  function handleChange<K extends keyof AdminScreen>(key: K, value: AdminScreen[K]) {
    setFormData((prev) => ({ ...prev, [key]: value }));
  }

  function handlePatch(patch: Partial<AdminScreen>) {
    setFormData((prev) => ({ ...prev, ...patch }));
  }

  function validateForm(): string[] {
    const errors: string[] = [];
    if (!formData.prompt.trim()) errors.push("Pertanyaan / Prompt wajib diisi");

    if (!formData.explain.trim()) errors.push("Penjelasan wajib diisi");

    if (formData.type === "choice") {
      const options = formData.options ?? [];
      if (options.length < 2) errors.push("Minimal 2 pilihan jawaban");
      if (options.some((o) => !o.label.trim())) errors.push("Semua pilihan jawaban wajib diisi");
      if (!formData.correctId) errors.push("Jawaban benar wajib dipilih");
    }

    if (formData.type === "numeric") {
      if (formData.acceptRangeMin == null) errors.push("Rentang diterima (Min) wajib diisi");
      if (formData.acceptRangeMax == null) errors.push("Rentang diterima (Max) wajib diisi");
    }

    if (formData.type === "allocation") {
      const categories = formData.categories ?? [];
      if (categories.length === 0) errors.push("Minimal 1 kategori alokasi");
      if (categories.some((c) => !c.trim())) errors.push("Semua kategori alokasi wajib diisi");
      if (!formData.rule?.categoryId) errors.push("Kategori aturan wajib dipilih");
      if (formData.rule?.min == null) errors.push("Min (%) aturan wajib diisi");
    }

    return errors;
  }

  function handleSave() {
    const errors = validateForm();
    if (errors.length > 0) {
      errors.forEach((msg) => toast.error(msg));
      return;
    }

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

    saveMutation.mutate({ id: screen.id, ...patch } as Parameters<
      typeof adminUpdateScreen
    >[0]["data"]);
  }

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
