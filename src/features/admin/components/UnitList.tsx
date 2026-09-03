import { Link } from "@tanstack/react-router";
import { ChevronDown, ChevronUp, Eye, Pencil, Plus, Trash2 } from "lucide-react";
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
import { Button, buttonVariants } from "#/components/ui/button.tsx";
import { useContentStore } from "#/content/contentStore.ts";
import { UnitFormDialog } from "./UnitFormDialog.tsx";

export function UnitList() {
  const unitOrder = useContentStore((s) => s.unitOrder);
  const units = useContentStore((s) =>
    s.unitOrder.map((id) => ({
      ...s.units[id],
      lessonCount: s.units[id].lessonIds.length,
    })),
  );
  const addUnit = useContentStore((s) => s.addUnit);
  const updateUnit = useContentStore((s) => s.updateUnit);
  const deleteUnit = useContentStore((s) => s.deleteUnit);
  const reorderUnits = useContentStore((s) => s.reorderUnits);

  function moveUnit(index: number, direction: "up" | "down") {
    const next = [...unitOrder];
    const swap = direction === "up" ? index - 1 : index + 1;
    [next[index], next[swap]] = [next[swap], next[index]];
    reorderUnits(next);
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-black text-foreground">Daftar Unit</h1>
        <UnitFormDialog
          trigger={
            <Button size="sm" className="w-36 text-sm">
              <Plus className="size-4" /> Tambah Unit
            </Button>
          }
          onSave={(values) => addUnit(values)}
        />
      </div>

      <div className="rounded-md border bg-card">
        <table className="w-full">
          <thead>
            <tr className="border-b bg-card/50">
              <th className="p-3 text-left text-lg font-bold text-card-foreground">Judul</th>
              <th className="p-3 text-center text-lg font-bold text-card-foreground">Lesson</th>
              <th className="p-3 text-center text-lg font-bold text-card-foreground">Urutan</th>
              <th className="p-3 pr-12 text-right text-lg font-bold text-card-foreground">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {units.length === 0 && (
              <tr>
                <td colSpan={4} className="p-6 text-center text-base text-muted-foreground">
                  Belum ada unit. Tambahkan unit baru di atas.
                </td>
              </tr>
            )}
            {units.map((unit, index) => (
              <tr key={unit.id} className="border-b last:border-0 hover:bg-card/30">
                <td className="p-3">
                  <div className="text-lg font-medium text-foreground">{unit.title}</div>
                  <div className="text-sm text-muted-foreground">{unit.id}</div>
                </td>
                <td className="p-3 text-center text-base tabular-nums">{unit.lessonCount}</td>

                {/* Order */}
                <td className="p-3">
                  <div className="flex items-center justify-center gap-1">
                    <Button
                      variant="shadowless"
                      size="icon"
                      disabled={index === 0}
                      onClick={() => moveUnit(index, "up")}
                      aria-label="Pindah ke atas"
                    >
                      <ChevronUp className="size-5" />
                    </Button>
                    <Button
                      variant="shadowless"
                      size="icon"
                      disabled={index === units.length - 1}
                      onClick={() => moveUnit(index, "down")}
                      aria-label="Pindah ke bawah"
                    >
                      <ChevronDown className="size-5" />
                    </Button>
                  </div>
                </td>

                {/* Actions */}
                <td className="p-3">
                  <div className="flex items-center justify-end gap-1">
                    <Link
                      to="/admin/$unitId"
                      params={{ unitId: unit.id }}
                      className={buttonVariants({ variant: "shadowless", size: "icon" })}
                      title="Lihat unit"
                      aria-label="Lihat unit"
                    >
                      <Eye className="size-5" />
                    </Link>

                    <UnitFormDialog
                      trigger={
                        <Button variant="shadowless" size="icon" aria-label="Edit unit">
                          <Pencil className="size-5" />
                        </Button>
                      }
                      initialValues={{ id: unit.id, title: unit.title, imageUrl: unit.imageUrl }}
                      onSave={({ title, imageUrl }) => updateUnit(unit.id, { title, imageUrl })}
                    />

                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          variant="shadowless"
                          size="icon"
                          className="text-destructive hover:text-destructive"
                          aria-label="Hapus unit"
                        >
                          <Trash2 className="size-5" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent size="sm">
                        <AlertDialogHeader>
                          <AlertDialogTitle>Hapus unit?</AlertDialogTitle>
                          <AlertDialogDescription>
                            Tindakan ini akan menghapus unit{" "}
                            <span className="font-medium text-foreground">{unit.title}</span>{" "}
                            beserta semua lesson dan screen di dalamnya secara permanen. Tindakan
                            ini tidak dapat dibatalkan.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Batal</AlertDialogCancel>
                          <AlertDialogAction
                            variant="destructive"
                            onClick={() => deleteUnit(unit.id)}
                          >
                            Hapus
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
