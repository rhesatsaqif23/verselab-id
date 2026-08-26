import { Plus, Trash2 } from "lucide-react";
import { Button } from "#/components/ui/button.tsx";
import { Input } from "#/components/ui/input.tsx";
import { Label } from "#/components/ui/label.tsx";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "#/components/ui/select.tsx";
import type { contentStore } from "#/content/contentStore.ts";

type ContentState = ReturnType<typeof contentStore.getState>;
type ScreenItem = ContentState["screens"][string];

interface ChoiceFieldsProps {
  screen: ScreenItem;
  onChange: (patch: Partial<ScreenItem>) => void;
}

export function ChoiceFields({ screen, onChange }: ChoiceFieldsProps) {
  const options = screen.options ?? [];

  function handleOptionChange(index: number, label: string) {
    const newOpts = [...options];
    newOpts[index] = { ...newOpts[index], label };
    onChange({ options: newOpts });
  }

  function handleAddOption() {
    const newId = `opt_${Date.now()}`;
    const newOpts = [...options, { id: newId, label: `Pilihan ${options.length + 1}` }];
    onChange({
      options: newOpts,
      correctId: screen.correctId ?? newId,
    });
  }

  function handleRemoveOption(index: number) {
    const optToRemove = options[index];
    const newOpts = options.filter((_, i) => i !== index);
    const patch: Partial<ScreenItem> = { options: newOpts };
    if (screen.correctId === optToRemove.id && newOpts.length > 0) {
      patch.correctId = newOpts[0].id;
    }
    onChange(patch);
  }

  return (
    <div className="space-y-4 border-t pt-2">
      <div className="flex items-center justify-between">
        <Label>Pilihan Jawaban</Label>
        <Button variant="shadowless" size="sm" onClick={handleAddOption}>
          <Plus className="mr-1 size-3.5" /> Tambah Pilihan
        </Button>
      </div>

      <div className="space-y-2">
        {options.map((opt, i) => (
          <div key={opt.id} className="flex items-center gap-2">
            <Input
              value={opt.label}
              onChange={(e) => handleOptionChange(i, e.target.value)}
              placeholder={`Pilihan ${i + 1}`}
            />
            <Button
              variant="ghost"
              size="icon"
              className="size-9 text-destructive"
              onClick={() => handleRemoveOption(i)}
              disabled={options.length <= 1}
            >
              <Trash2 className="size-4" />
            </Button>
          </div>
        ))}
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="correct-id">Jawaban Benar</Label>
        <Select value={screen.correctId} onValueChange={(val) => onChange({ correctId: val })}>
          <SelectTrigger id="correct-id" className="w-full">
            <SelectValue placeholder="Pilih jawaban benar" />
          </SelectTrigger>
          <SelectContent>
            {options.map((opt) => (
              <SelectItem key={opt.id} value={opt.id}>
                {opt.label || opt.id}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
