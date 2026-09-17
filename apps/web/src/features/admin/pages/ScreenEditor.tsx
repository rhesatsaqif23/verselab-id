import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  adminGetScreens,
  adminCreateScreen,
  adminDeleteScreen,
  adminReorderScreens,
  type AdminScreen,
} from "#/libs/admin-content-fns.ts";
import { AddScreenDialog } from "../components/AddScreenDialog.tsx";
import { ScreenListPanel } from "../components/ScreenListPanel.tsx";
import { ScreenEditPanel } from "../components/ScreenEditPanel.tsx";

interface ScreenEditorProps {
  lessonId: string;
  initialScreenId?: string;
}

export function ScreenEditor({ lessonId, initialScreenId }: ScreenEditorProps) {
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
  const canSwitchRef = useRef<(() => boolean) | null>(null);

  function handleSelectScreen(id: string) {
    if (canSwitchRef.current && !canSwitchRef.current()) return;
    setSelectedScreenId(id);
  }

  useEffect(() => {
    if (allScreens.length > 0) {
      if (!selectedScreenId) {
        if (initialScreenId && allScreens.some((s) => s.id === initialScreenId)) {
          setSelectedScreenId(initialScreenId);
        } else {
          setSelectedScreenId(allScreens[0].id);
        }
      } else if (!allScreens.some((s) => s.id === selectedScreenId)) {
        setSelectedScreenId(allScreens[0].id);
      }
    } else {
      setSelectedScreenId(null);
    }
  }, [allScreens, selectedScreenId, initialScreenId]);

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
      data = { lessonId, type: "concept", prompt: "", explain: "" };
    } else if (type === "choice") {
      data = {
        lessonId,
        type: "choice",
        prompt: "",
        explain: "",
        options: [
          { id: "opt1", label: "" },
          { id: "opt2", label: "" },
        ],
        correctId: "opt1",
      };
    } else if (type === "numeric") {
      data = {
        lessonId,
        type: "numeric",
        prompt: "",
        explain: "",
        numericUnit: "",
        acceptRangeMin: 0,
        acceptRangeMax: 100,
      };
    } else {
      data = {
        lessonId,
        type: "allocation",
        prompt: "",
        explain: "",
        categories: [""],
        rule: { type: "min", categoryId: "", min: 0 },
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
            onSelectScreen={handleSelectScreen}
            onMoveScreen={moveScreen}
            onDeleteScreen={handleDeleteScreen}
          />
        </div>

        <div className="md:col-span-7 lg:col-span-8">
          <ScreenEditPanel
            activeScreen={activeScreen}
            lessonId={lessonId}
            onRegisterValidator={(fn) => {
              canSwitchRef.current = fn;
            }}
          />
        </div>
      </div>
    </div>
  );
}
