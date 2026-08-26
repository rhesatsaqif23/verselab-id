import { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "#/components/ui/button.tsx";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "#/components/ui/dialog.tsx";
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
type ScreenType = ScreenItem["type"];

interface AddScreenDialogProps {
  onAdd: (type: ScreenType) => void;
}

export function AddScreenDialog({ onAdd }: AddScreenDialogProps) {
  const [open, setOpen] = useState(false);
  const [type, setType] = useState<ScreenType>("concept");

  function handleAdd() {
    onAdd(type);
    setOpen(false);
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" className="w-36">
          <Plus className="size-4" /> Tambah Screen
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Tambah Screen Baru</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col gap-4 py-2">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="screen-type">Tipe Screen</Label>
            <Select value={type} onValueChange={(val) => setType(val as ScreenType)}>
              <SelectTrigger id="screen-type" className="w-full">
                <SelectValue placeholder="Pilih tipe" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="concept">Konsep</SelectItem>
                <SelectItem value="choice">Pilihan Ganda</SelectItem>
                <SelectItem value="numeric">Angka</SelectItem>
                <SelectItem value="allocation">Alokasi</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter>
          <Button onClick={handleAdd}>Buat Screen</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
