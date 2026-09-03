import { useEffect, useState } from "react";
import { Label } from "#/components/ui/label.tsx";
import { Textarea } from "#/components/ui/textarea.tsx";
import type { contentStore } from "#/content/contentStore.ts";
import { AllocationFields } from "./AllocationFields.tsx";
import { ChoiceFields } from "./ChoiceFields.tsx";
import { NumericFields } from "./NumericFields.tsx";

type ContentState = ReturnType<typeof contentStore.getState>;
type ScreenItem = ContentState["screens"][string];

interface ScreenFormProps {
  screen: ScreenItem;
  onSave: (patch: Partial<ScreenItem>) => void;
}

export function ScreenForm({ screen, onSave }: ScreenFormProps) {
  const [formData, setFormData] = useState<ScreenItem>(screen);

  useEffect(() => {
    setFormData(screen);
  }, [screen]);

  function handleChange<K extends keyof ScreenItem>(key: K, value: ScreenItem[K]) {
    const updated = { ...formData, [key]: value };
    setFormData(updated);
    onSave({ [key]: value });
  }

  function handlePatch(patch: Partial<ScreenItem>) {
    setFormData((prev) => ({ ...prev, ...patch }));
    onSave(patch);
  }

  return (
    <div className="space-y-4">
      {/* Base Fields */}
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

      {/* Type Specific Fields */}
      {screen.type === "choice" && <ChoiceFields screen={formData} onChange={handlePatch} />}

      {screen.type === "numeric" && <NumericFields screen={formData} onChange={handlePatch} />}

      {screen.type === "allocation" && (
        <AllocationFields screen={formData} onChange={handlePatch} />
      )}
    </div>
  );
}
