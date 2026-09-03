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

import ChoiceRenderer from "#/domains/personal-finance/screens/ChoiceRenderer.tsx";
import ConceptRenderer from "#/domains/personal-finance/screens/ConceptRenderer.tsx";
import NumericRenderer from "#/domains/personal-finance/screens/NumericRenderer.tsx";
import AllocationRenderer from "#/domains/personal-finance/screens/AllocationRenderer.tsx";

type ContentState = ReturnType<typeof contentStore.getState>;
type ScreenItem = ContentState["screens"][string];
type ScreenType = ScreenItem["type"];

interface AddScreenDialogProps {
  onAdd: (type: ScreenType) => void;
}

function ScreenPreview({ type }: { type: ScreenType }) {
  switch (type) {
    case "concept":
      return (
        <ConceptRenderer
          screen={{
            type: "concept",
            prompt:
              "Dana darurat adalah simpanan yang disiapkan khusus untuk mengantisipasi kejadian tak terduga dalam kehidupan sehari-hari.",
            explain: "Penjelasan konsep.",
          }}
        />
      );
    case "choice":
      return (
        <ChoiceRenderer
          screen={{
            type: "choice",
            prompt: "Berapa porsi minimal dari penghasilan bulanan yang disarankan untuk ditabung?",
            options: [
              { id: "opt1", label: "20% dari total penghasilan" },
              { id: "opt2", label: "5% dari total penghasilan" },
            ],
            correctId: "opt1",
            explain: "Disarankan menyisihkan minimal 20% penghasilan.",
          }}
          onSelect={() => {}}
          checked={null}
        />
      );
    case "numeric":
      return (
        <NumericRenderer
          screen={{
            type: "numeric",
            prompt:
              "Jika penghasilan bulanan Rp 5.000.000, berapa rupiah nilai 20% yang harus Anda tabung?",
            unit: "Rupiah",
            acceptRange: [1000000, 1000000],
            explain: "20% dari Rp 5.000.000 adalah Rp 1.000.000.",
          }}
          onChange={() => {}}
          checked={null}
        />
      );
    case "allocation":
      return (
        <AllocationRenderer
          screen={{
            type: "allocation",
            prompt: "Atur alokasi pembagian pengeluaran bulanan Anda:",
            categories: ["Kebutuhan", "Tabungan"],
            rule: { category: "Tabungan", min: 20 },
            explain: "Alokasikan sebagian pendapatan untuk tabungan.",
          }}
          onChange={() => {}}
          checked={null}
        />
      );
  }
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

          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between">
              <Label>Preview Struktur Screen</Label>
              <span className="text-xs text-muted">Contoh dummy</span>
            </div>
            <div className="max-h-85 overflow-y-auto rounded-xl border border-border bg-muted/15 p-4">
              <div key={type}>
                <ScreenPreview type={type} />
              </div>
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button onClick={handleAdd}>Buat Screen</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
