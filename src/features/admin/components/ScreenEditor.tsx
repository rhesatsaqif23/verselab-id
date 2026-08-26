import { useEffect, useState } from "react";
import { Link, useParams } from "@tanstack/react-router";
import { ChevronDown, ChevronUp, Plus, Trash2 } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "#/components/ui/alert-dialog.tsx";
import { Badge } from "#/components/ui/badge.tsx";
import { Button } from "#/components/ui/button.tsx";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "#/components/ui/dialog.tsx";
import { Input } from "#/components/ui/input.tsx";
import { Label } from "#/components/ui/label.tsx";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "#/components/ui/select.tsx";
import { Textarea } from "#/components/ui/textarea.tsx";
import { contentStore, useContentStore } from "#/content/contentStore.ts";

type ContentState = ReturnType<typeof contentStore.getState>;
type ScreenItem = ContentState["screens"][string];
type ScreenType = ScreenItem["type"];

interface ScreenEditorProps {
  lessonId: string;
}

export function ScreenEditor({ lessonId }: ScreenEditorProps) {
  const { unitId } = useParams({ from: "/admin/$unitId/$lessonId" });
  const lesson = useContentStore((s) => s.lessons[lessonId]);
  const unit = useContentStore((s) => s.units[unitId]);
  const screenIds = useContentStore((s) => s.lessons[lessonId]?.screenIds ?? []);
  const screens = useContentStore((s) =>
    (s.lessons[lessonId]?.screenIds ?? []).map((id) => s.screens[id]),
  );

  const addScreen = useContentStore((s) => s.addScreen);
  const updateScreen = useContentStore((s) => s.updateScreen);
  const deleteScreen = useContentStore((s) => s.deleteScreen);
  const reorderScreens = useContentStore((s) => s.reorderScreens);

  const [selectedScreenId, setSelectedScreenId] = useState<string | null>(null);

  // Sync selected screen ID when screens list updates
  useEffect(() => {
    if (screenIds.length > 0) {
      if (!selectedScreenId || !screenIds.includes(selectedScreenId)) {
        setSelectedScreenId(screenIds[0]);
      }
    } else {
      setSelectedScreenId(null);
    }
  }, [screenIds, selectedScreenId]);

  const activeScreen = useContentStore((s) =>
    selectedScreenId ? s.screens[selectedScreenId] : undefined,
  );

  function moveScreen(index: number, direction: "up" | "down") {
    const next = [...screenIds];
    const swap = direction === "up" ? index - 1 : index + 1;
    [next[index], next[swap]] = [next[swap], next[index]];
    reorderScreens(lessonId, next);
  }

  function handleCreateScreen(type: ScreenType) {
    let initialScreen: Omit<ScreenItem, "id">;
    if (type === "concept") {
      initialScreen = { type: "concept", prompt: "New Concept Prompt", explain: "Explanation" };
    } else if (type === "choice") {
      initialScreen = {
        type: "choice",
        prompt: "New Choice Question",
        explain: "Explanation",
        options: [
          { id: "opt1", label: "Option 1" },
          { id: "opt2", label: "Option 2" },
        ],
        correctId: "opt1",
      };
    } else if (type === "numeric") {
      initialScreen = {
        type: "numeric",
        prompt: "New Numeric Question",
        explain: "Explanation",
        unit: "Rp",
        acceptRange: [0, 100],
      };
    } else {
      initialScreen = {
        type: "allocation",
        prompt: "New Allocation Question",
        explain: "Explanation",
        categories: ["Savings", "Expenses"],
        rule: { category: "Savings", min: 20 },
      };
    }

    addScreen(lessonId, initialScreen);
  }

  if (!lesson) {
    return <p className="p-4 text-muted-foreground">Lesson not found.</p>;
  }

  return (
    <div className="space-y-4">
      {/* Breadcrumb */}
      <div className="flex items-center gap-1.5 text-sm">
        <Link to="/admin" className="text-primary hover:underline">
          Units
        </Link>
        <span className="text-muted-foreground">/</span>
        <Link to="/admin/$unitId" params={{ unitId }} className="text-primary hover:underline">
          {unit?.title ?? unitId}
        </Link>
        <span className="text-muted-foreground">/</span>
        <span className="font-medium text-foreground">{lesson.title}</span>
      </div>

      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-foreground">Screen Editor</h2>
        <AddScreenDialog onAdd={handleCreateScreen} />
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-12">
        {/* Left Column: Screen List */}
        <div className="space-y-2 md:col-span-5 lg:col-span-4">
          <div className="rounded-md border bg-card">
            <div className="border-b p-3 font-medium text-sm text-card-foreground">
              Screens ({screens.length})
            </div>
            <div className="divide-y max-h-150 overflow-y-auto">
              {screens.length === 0 && (
                <div className="p-4 text-center text-sm text-muted-foreground">
                  No screens in this lesson yet.
                </div>
              )}
              {screens.map((screen, index) => {
                if (!screen) return null;
                const isSelected = screen.id === selectedScreenId;
                return (
                  <div
                    key={screen.id}
                    onClick={() => setSelectedScreenId(screen.id)}
                    className={`flex cursor-pointer items-center justify-between p-3 transition-colors ${
                      isSelected ? "bg-accent/50 font-medium" : "hover:bg-card/50"
                    }`}
                  >
                    <div className="flex min-w-0 flex-1 flex-col gap-1 pr-2">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-xs uppercase font-mono">
                          {screen.type}
                        </Badge>
                        <span className="text-xs text-muted-foreground">#{index + 1}</span>
                      </div>
                      <p className="truncate text-sm text-foreground">{screen.prompt}</p>
                    </div>

                    <div className="flex items-center gap-0.5" onClick={(e) => e.stopPropagation()}>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="size-6"
                        disabled={index === 0}
                        onClick={() => moveScreen(index, "up")}
                        aria-label="Move up"
                      >
                        <ChevronUp className="size-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="size-6"
                        disabled={index === screens.length - 1}
                        onClick={() => moveScreen(index, "down")}
                        aria-label="Move down"
                      >
                        <ChevronDown className="size-3.5" />
                      </Button>

                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="size-6 text-destructive hover:text-destructive"
                            aria-label="Delete screen"
                          >
                            <Trash2 className="size-3.5" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent size="sm">
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete screen?</AlertDialogTitle>
                            <AlertDialogDescription>
                              This action cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              variant="destructive"
                              onClick={() => deleteScreen(screen.id)}
                            >
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Column: Screen Form Editor */}
        <div className="md:col-span-7 lg:col-span-8">
          {activeScreen ? (
            <div className="rounded-md border bg-card p-5 space-y-5">
              <div className="flex items-center justify-between border-b pb-3">
                <h3 className="font-semibold text-base">Edit Screen</h3>
                <Badge variant="secondary" className="uppercase font-mono">
                  {activeScreen.type}
                </Badge>
              </div>

              <ScreenForm
                key={activeScreen.id}
                screen={activeScreen}
                onSave={(patch) => updateScreen(activeScreen.id, patch)}
              />
            </div>
          ) : (
            <div className="flex h-64 items-center justify-center rounded-md border border-dashed p-8 text-center text-muted-foreground">
              Select a screen from the list to edit its details.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Add Screen Dialog ────────────────────────────────────────────────────────

function AddScreenDialog({ onAdd }: { onAdd: (type: ScreenType) => void }) {
  const [open, setOpen] = useState(false);
  const [type, setType] = useState<ScreenType>("concept");

  function handleAdd() {
    onAdd(type);
    setOpen(false);
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm">
          <Plus className="size-4" />
          Add Screen
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add New Screen</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col gap-4 py-2">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="screen-type">Screen Type</Label>
            <Select value={type} onValueChange={(val) => setType(val as ScreenType)}>
              <SelectTrigger id="screen-type" className="w-full">
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="concept">Concept</SelectItem>
                <SelectItem value="choice">Multiple Choice</SelectItem>
                <SelectItem value="numeric">Numeric</SelectItem>
                <SelectItem value="allocation">Allocation</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter>
          <Button onClick={handleAdd}>Create Screen</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ── Screen Form ─────────────────────────────────────────────────────────────

function ScreenForm({
  screen,
  onSave,
}: {
  screen: ScreenItem;
  onSave: (patch: Partial<ScreenItem>) => void;
}) {
  const [formData, setFormData] = useState<ScreenItem>(screen);

  useEffect(() => {
    setFormData(screen);
  }, [screen]);

  function handleChange<K extends keyof ScreenItem>(key: K, value: ScreenItem[K]) {
    const updated = { ...formData, [key]: value };
    setFormData(updated);
    onSave({ [key]: value });
  }

  return (
    <div className="space-y-4">
      {/* Base Fields */}
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="prompt">Prompt</Label>
        <Textarea
          id="prompt"
          value={formData.prompt}
          onChange={(e) => handleChange("prompt", e.target.value)}
          placeholder="Question / Prompt text"
          rows={3}
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="explain">Explanation</Label>
        <Textarea
          id="explain"
          value={formData.explain}
          onChange={(e) => handleChange("explain", e.target.value)}
          placeholder="Explanation text shown after user answers"
          rows={3}
        />
      </div>

      {/* Type Specific Fields */}
      {screen.type === "choice" && (
        <ChoiceFields
          screen={formData}
          onChange={(patch) => {
            setFormData((prev) => ({ ...prev, ...patch }));
            onSave(patch);
          }}
        />
      )}

      {screen.type === "numeric" && (
        <NumericFields
          screen={formData}
          onChange={(patch) => {
            setFormData((prev) => ({ ...prev, ...patch }));
            onSave(patch);
          }}
        />
      )}

      {screen.type === "allocation" && (
        <AllocationFields
          screen={formData}
          onChange={(patch) => {
            setFormData((prev) => ({ ...prev, ...patch }));
            onSave(patch);
          }}
        />
      )}
    </div>
  );
}

// ── Choice Fields Component ──────────────────────────────────────────────────

function ChoiceFields({
  screen,
  onChange,
}: {
  screen: ScreenItem;
  onChange: (patch: Partial<ScreenItem>) => void;
}) {
  const options = screen.options ?? [];

  function handleOptionChange(index: number, label: string) {
    const newOpts = [...options];
    newOpts[index] = { ...newOpts[index], label };
    onChange({ options: newOpts });
  }

  function handleAddOption() {
    const newId = `opt_${Date.now()}`;
    const newOpts = [...options, { id: newId, label: `Option ${options.length + 1}` }];
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
    <div className="space-y-4 pt-2 border-t">
      <div className="flex items-center justify-between">
        <Label>Options</Label>
        <Button variant="outline" size="sm" onClick={handleAddOption}>
          <Plus className="size-3.5 mr-1" /> Add Option
        </Button>
      </div>

      <div className="space-y-2">
        {options.map((opt, i) => (
          <div key={opt.id} className="flex items-center gap-2">
            <Input
              value={opt.label}
              onChange={(e) => handleOptionChange(i, e.target.value)}
              placeholder={`Option ${i + 1}`}
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
        <Label htmlFor="correct-id">Correct Option</Label>
        <Select value={screen.correctId} onValueChange={(val) => onChange({ correctId: val })}>
          <SelectTrigger id="correct-id" className="w-full">
            <SelectValue placeholder="Select correct option" />
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

// ── Numeric Fields Component ─────────────────────────────────────────────────

function NumericFields({
  screen,
  onChange,
}: {
  screen: ScreenItem;
  onChange: (patch: Partial<ScreenItem>) => void;
}) {
  const [min, max] = screen.acceptRange ?? [0, 0];

  return (
    <div className="space-y-4 pt-2 border-t">
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="unit-label">Unit Prefix/Suffix (e.g. Rp, %)</Label>
        <Input
          id="unit-label"
          value={screen.unit ?? ""}
          onChange={(e) => onChange({ unit: e.target.value })}
          placeholder="Rp"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="min-range">Accept Range Min</Label>
          <Input
            id="min-range"
            type="number"
            value={min}
            onChange={(e) => onChange({ acceptRange: [Number(e.target.value), max] })}
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="max-range">Accept Range Max</Label>
          <Input
            id="max-range"
            type="number"
            value={max}
            onChange={(e) => onChange({ acceptRange: [min, Number(e.target.value)] })}
          />
        </div>
      </div>
    </div>
  );
}

// ── Allocation Fields Component ──────────────────────────────────────────────

function AllocationFields({
  screen,
  onChange,
}: {
  screen: ScreenItem;
  onChange: (patch: Partial<ScreenItem>) => void;
}) {
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
    const newCat = `Category ${categories.length + 1}`;
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
    <div className="space-y-4 pt-2 border-t">
      <div className="flex items-center justify-between">
        <Label>Categories</Label>
        <Button variant="outline" size="sm" onClick={handleAddCategory}>
          <Plus className="size-3.5 mr-1" /> Add Category
        </Button>
      </div>

      <div className="space-y-2">
        {categories.map((cat, i) => (
          <div key={i} className="flex items-center gap-2">
            <Input
              value={cat}
              onChange={(e) => handleCategoryChange(i, e.target.value)}
              placeholder={`Category ${i + 1}`}
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

      <div className="space-y-3 pt-2 border-t">
        <Label>Rule Validation</Label>
        <div className="grid grid-cols-3 gap-2">
          <div className="flex flex-col gap-1.5 col-span-1">
            <Label htmlFor="rule-category" className="text-xs">
              Category
            </Label>
            <Select
              value={rule.category}
              onValueChange={(val) => onChange({ rule: { ...rule, category: val } })}
            >
              <SelectTrigger id="rule-category" className="w-full">
                <SelectValue placeholder="Category" />
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

          <div className="flex flex-col gap-1.5 col-span-1">
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

          <div className="flex flex-col gap-1.5 col-span-1">
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
