import { useEffect, useState } from "react";
import { toast } from "sonner";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  adminGetScreens,
  adminCreateScreen,
  adminDeleteScreen,
  adminReorderScreens,
  type AdminScreen,
} from "#/libs/admin-content-fns.ts";
import { AddScreenDialog } from "./AddScreenDialog.tsx";
import { ScreenListPanel } from "./ScreenListPanel.tsx";
import { ScreenEditPanel } from "./ScreenEditPanel.tsx";

interface ScreenEditorProps {
  lessonId: string;
}

export function ScreenEditor({ lessonId }: ScreenEditorProps) {
  const queryClient = useQueryClient();

  const { data: screens, isLoading } = useQuery({
    queryKey: ["admin-screens", lessonId],
    queryFn: () => adminGetScreens({ data: { lessonId } }),
  });

  const createMutation = useMutation({
    mutationFn: (data: Parameters<typeof adminCreateScreen>[0]["data"]) =>
      adminCreateScreen({ data }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-screens", lessonId] });
      toast.success("Screen berhasil ditambahkan");
    },
    onError: (err: Error) => {
      toast.error(err.message || "Gagal menambahkan screen");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => adminDeleteScreen({ data: { id } }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-screens", lessonId] });
      toast.success("Screen berhasil dihapus");
    },
    onError: (err: Error) => {
      toast.error(err.message || "Gagal menghapus screen");
    },
  });

  const reorderMutation = useMutation({
    mutationFn: (ids: string[]) => adminReorderScreens({ data: { ids } }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin-screens", lessonId] }),
  });

  const allScreens: AdminScreen[] = screens ?? [];

  const [selectedScreenId, setSelectedScreenId] = useState<string | null>(null);

  useEffect(() => {
    if (allScreens.length > 0) {
      if (!selectedScreenId || !allScreens.some((s) => s.id === selectedScreenId)) {
        setSelectedScreenId(allScreens[0].id);
      }
    } else {
      setSelectedScreenId(null);
    }
  }, [allScreens, selectedScreenId]);

  const activeScreen = allScreens.find((s) => s.id === selectedScreenId) ?? null;

  function moveScreen(index: number, direction: "up" | "down") {
    const next = allScreens.map((s) => s.id);
    const swap = direction === "up" ? index - 1 : index + 1;
    [next[index], next[swap]] = [next[swap], next[index]];
    reorderMutation.mutate(next);
  }

  function handleDeleteScreen(id: string) {
    deleteMutation.mutate(id);
  }

  function handleCreateScreen(type: AdminScreen["type"]) {
    let data: Parameters<typeof adminCreateScreen>[0]["data"];

    if (type === "concept") {
      data = {
        lessonId,
        type: "concept",
        prompt: "Pertanyaan Konsep Baru",
        explain: "Penjelasan",
      };
    } else if (type === "choice") {
      data = {
        lessonId,
        type: "choice",
        prompt: "Pertanyaan Pilihan Ganda Baru",
        explain: "Penjelasan",
        options: [
          { id: "opt1", label: "Pilihan 1" },
          { id: "opt2", label: "Pilihan 2" },
        ],
        correctId: "opt1",
      };
    } else if (type === "numeric") {
      data = {
        lessonId,
        type: "numeric",
        prompt: "Pertanyaan Angka Baru",
        explain: "Penjelasan",
        numericUnit: "Rp",
        acceptRangeMin: 0,
        acceptRangeMax: 100,
      };
    } else {
      data = {
        lessonId,
        type: "allocation",
        prompt: "Pertanyaan Alokasi Baru",
        explain: "Penjelasan",
        categories: ["Tabungan", "Pengeluaran"],
        rule: { type: "min", categoryId: "Tabungan", min: 20 },
      };
    }

    createMutation.mutate(data);
  }

  if (isLoading) {
    return <p className="p-4 text-muted-foreground">Memuat screen...</p>;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-black text-foreground">Editor Screen</h1>
        <AddScreenDialog onAdd={handleCreateScreen} />
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-12">
        <div className="space-y-2 md:col-span-5 lg:col-span-4">
          <ScreenListPanel
            screens={allScreens}
            selectedScreenId={selectedScreenId}
            onSelectScreen={setSelectedScreenId}
            onMoveScreen={moveScreen}
            onDeleteScreen={handleDeleteScreen}
          />
        </div>

        <div className="md:col-span-7 lg:col-span-8">
          <ScreenEditPanel activeScreen={activeScreen} lessonId={lessonId} />
        </div>
      </div>
    </div>
  );
}
