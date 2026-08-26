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

interface AllocationFieldsProps {
  screen: ScreenItem;
  onChange: (patch: Partial<ScreenItem>) => void;
}

export function AllocationFields({ screen, onChange }: AllocationFieldsProps) {
  const categories = screen.categories ?? [];
  const rule = screen.rule ?? { category: categories[0] ?? "", min: 0 };

  function handleCategoryChange(index: number, val: string) {
    const newCats = [...categories];
    const oldVal = newCats[index];
    newCats[index] = val;
    const patch: Partial<ScreenItem> = { categories: newCats };
    if (rule.category === oldVal) {
      patch.rule = { ...rule, category: val };
    }
    onChange(patch);
  }

  function handleAddCategory() {
    const newCat = `Kategori ${categories.length + 1}`;
    const newCats = [...categories, newCat];
    onChange({
      categories: newCats,
      rule: rule.category ? rule : { category: newCat, min: 0 },
    });
  }

  function handleRemoveCategory(index: number) {
    const catToRemove = categories[index];
    const newCats = categories.filter((_, i) => i !== index);
    const patch: Partial<ScreenItem> = { categories: newCats };
    if (rule.category === catToRemove && newCats.length > 0) {
      patch.rule = { ...rule, category: newCats[0] };
    }
    onChange(patch);
  }

  return (
    <div className="space-y-4 border-t pt-2">
      <div className="flex items-center justify-between">
        <Label>Kategori Alokasi</Label>
        <Button variant="outline" size="sm" onClick={handleAddCategory}>
          <Plus className="mr-1 size-3.5" /> Tambah Kategori
        </Button>
      </div>

      <div className="space-y-2">
        {categories.map((cat, i) => (
          <div key={i} className="flex items-center gap-2">
            <Input
              value={cat}
              onChange={(e) => handleCategoryChange(i, e.target.value)}
              placeholder={`Kategori ${i + 1}`}
            />
            <Button
              variant="ghost"
              size="icon"
              className="size-9 text-destructive"
              onClick={() => handleRemoveCategory(i)}
              disabled={categories.length <= 1}
            >
              <Trash2 className="size-4" />
            </Button>
          </div>
        ))}
      </div>

      <div className="space-y-3 border-t pt-2">
        <Label>Validasi Aturan (Rule)</Label>
        <div className="grid grid-cols-3 gap-2">
          <div className="col-span-1 flex flex-col gap-1.5">
            <Label htmlFor="rule-category" className="text-xs">
              Kategori
            </Label>
            <Select
              value={rule.category}
              onValueChange={(val) => onChange({ rule: { ...rule, category: val } })}
            >
              <SelectTrigger id="rule-category" className="w-full">
                <SelectValue placeholder="Kategori" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((cat, i) => (
                  <SelectItem key={i} value={cat}>
                    {cat}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="col-span-1 flex flex-col gap-1.5">
            <Label htmlFor="rule-min" className="text-xs">
              Min (%)
            </Label>
            <Input
              id="rule-min"
              type="number"
              value={rule.min ?? ""}
              onChange={(e) =>
                onChange({
                  rule: {
                    ...rule,
                    min: e.target.value ? Number(e.target.value) : undefined,
                  },
                })
              }
              placeholder="Min %"
            />
          </div>

          <div className="col-span-1 flex flex-col gap-1.5">
            <Label htmlFor="rule-max" className="text-xs">
              Max (%)
            </Label>
            <Input
              id="rule-max"
              type="number"
              value={rule.max ?? ""}
              onChange={(e) =>
                onChange({
                  rule: {
                    ...rule,
                    max: e.target.value ? Number(e.target.value) : undefined,
                  },
                })
              }
              placeholder="Max %"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
