import { useEffect, useState } from "react";
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
}

export function ScreenForm({ screen, lessonId }: ScreenFormProps) {
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState(screen);

  useEffect(() => {
    setFormData(screen);
  }, [screen.id]);

  const saveMutation = useMutation({
    mutationFn: (patch: Parameters<typeof adminUpdateScreen>[0]["data"]) =>
      adminUpdateScreen({ data: patch }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin-screens", lessonId] }),
  });

  function handleChange<K extends keyof AdminScreen>(key: K, value: AdminScreen[K]) {
    setFormData((prev) => ({ ...prev, [key]: value }));
  }

  function handlePatch(patch: Partial<AdminScreen>) {
    setFormData((prev) => ({ ...prev, ...patch }));
  }

  function handleSave() {
    const patch: Record<string, unknown> = {};
    if (formData.prompt !== screen.prompt) patch.prompt = formData.prompt;
    if (formData.explain !== screen.explain) patch.explain = formData.explain;
    if (JSON.stringify(formData.options) !== JSON.stringify(screen.options))
      patch.options = formData.options;
    if (formData.correctId !== screen.correctId) patch.correctId = formData.correctId;
    if (formData.numericUnit !== screen.numericUnit) patch.numericUnit = formData.numericUnit;
    if (formData.acceptRangeMin !== screen.acceptRangeMin)
      patch.acceptRangeMin = formData.acceptRangeMin;
    if (formData.acceptRangeMax !== screen.acceptRangeMax)
      patch.acceptRangeMax = formData.acceptRangeMax;
    if (JSON.stringify(formData.categories) !== JSON.stringify(screen.categories))
      patch.categories = formData.categories;
    if (JSON.stringify(formData.rule) !== JSON.stringify(screen.rule))
      patch.rule = formData.rule;

    if (Object.keys(patch).length === 0) return;
    saveMutation.mutate({ id: screen.id, ...patch } as Parameters<typeof adminUpdateScreen>[0]["data"]);
  }

  const isPending = saveMutation.isPending;

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="prompt" className="text-base">
          Pertanyaan / Prompt
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

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="explain" className="text-base">
          Penjelasan
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

      {screen.type === "choice" && <ChoiceFields screen={formData} onChange={handlePatch} />}
      {screen.type === "numeric" && <NumericFields screen={formData} onChange={handlePatch} />}
      {screen.type === "allocation" && (
        <AllocationFields screen={formData} onChange={handlePatch} />
      )}

      <div className="flex justify-end border-t pt-4">
        <Button onClick={handleSave} disabled={isPending} size="sm">
          {isPending ? "Menyimpan..." : "Simpan"}
        </Button>
      </div>
    </div>
  );
}
