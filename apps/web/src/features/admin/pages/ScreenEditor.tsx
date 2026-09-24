import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useBlocker } from "@tanstack/react-router";
import {
  adminGetScreens,
  adminCreateScreen,
  adminDeleteScreen,
  adminReorderScreens,
  translateAdminError,
  type AdminScreen,
} from "#/libs/admin-content-fns.ts";
import { AddScreenDialog } from "../components/AddScreenDialog.tsx";
import { AdminQueryError } from "../components/QueryError.tsx";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "#/components/ui/alert-dialog.tsx";
import { Button } from "#/components/ui/button.tsx";
import { ScreenListPanel } from "../components/ScreenListPanel.tsx";
import { ScreenEditPanel } from "../components/ScreenEditPanel.tsx";
import type { ScreenEditorApi } from "../components/ScreenForm.tsx";

interface ScreenEditorProps {
  lessonId: string;
  initialScreenId?: string;
}

export function ScreenEditor({ lessonId, initialScreenId }: ScreenEditorProps) {
  const queryClient = useQueryClient();

  const {
    data: screens,
    isLoading,
    isError,
    refetch,
  } = useQuery({
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
      toast.error(translateAdminError(err, "Gagal menambahkan screen"));
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => adminDeleteScreen({ data: { id } }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-screens", lessonId] });
      toast.success("Screen berhasil dihapus");
    },
    onError: (err: Error) => {
      toast.error(translateAdminError(err, "Gagal menghapus screen"));
    },
  });

  const reorderMutation = useMutation({
    mutationFn: (ids: string[]) => adminReorderScreens({ data: { ids } }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin-screens", lessonId] }),
    onError: (err: Error) => {
      queryClient.invalidateQueries({ queryKey: ["admin-screens", lessonId] });
      toast.error(translateAdminError(err, "Gagal menyusun ulang screen"));
    },
  });

  const allScreens: AdminScreen[] = screens ?? [];

  const [selectedScreenId, setSelectedScreenId] = useState<string | null>(null);
  const [pendingScreenId, setPendingScreenId] = useState<string | null>(null);
  const [switching, setSwitching] = useState(false);
  const editorApiRef = useRef<ScreenEditorApi | null>(null);

  // Block route-level navigation (sidebar, breadcrumb, back button) and page
  // unload while the form has unsaved changes. Screen-to-screen switching is
  // guarded separately via pendingScreenId below.
  const blocker = useBlocker({
    shouldBlockFn: () => editorApiRef.current?.hasUnsaved() ?? false,
    enableBeforeUnload: () => editorApiRef.current?.hasUnsaved() ?? false,
    withResolver: true,
  });
  const routeBlocked = blocker.status === "blocked";
  const guardOpen = pendingScreenId !== null || routeBlocked;

  function handleSelectScreen(id: string) {
    if (id === selectedScreenId || id === pendingScreenId) return;
    if (editorApiRef.current?.hasUnsaved()) {
      setPendingScreenId(id);
      return;
    }
    setSelectedScreenId(id);
  }

  async function handleSaveAndProceed() {
    setSwitching(true);
    try {
      const saved = await editorApiRef.current?.save();
      if (!saved) {
        // Validation errors already toasted by the form; release the route
        // block (if any) but stay put.
        setPendingScreenId(null);
        if (blocker.status === "blocked") blocker.reset();
        return;
      }
      if (blocker.status === "blocked") {
        setPendingScreenId(null);
        blocker.proceed();
        return;
      }
      const target = pendingScreenId;
      if (target) {
        setSelectedScreenId(target);
        setPendingScreenId(null);
      }
    } finally {
      setSwitching(false);
    }
  }

  function handleDiscardAndProceed() {
    if (blocker.status === "blocked") {
      setPendingScreenId(null);
      blocker.proceed();
      return;
    }
    if (pendingScreenId) setSelectedScreenId(pendingScreenId);
    setPendingScreenId(null);
  }

  function handleCancelGuard() {
    setPendingScreenId(null);
    if (blocker.status === "blocked") blocker.reset();
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

  if (isError) {
    return (
      <div className="space-y-4">
        <h1 className="text-2xl font-black text-foreground">Editor Screen</h1>
        <AdminQueryError onRetry={() => refetch()} />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-black text-foreground">Editor Screen</h1>
        <AddScreenDialog onAdd={handleCreateScreen} pending={createMutation.isPending} />
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
            onRegisterValidator={(api) => {
              editorApiRef.current = api;
            }}
          />
        </div>
      </div>

      <AlertDialog
        open={guardOpen}
        onOpenChange={(open) => {
          if (!open) handleCancelGuard();
        }}
      >
        <AlertDialogContent size="sm">
          <AlertDialogHeader>
            <AlertDialogTitle>Simpan perubahan?</AlertDialogTitle>
            <AlertDialogDescription>
              Screen ini masih memiliki perubahan yang belum disimpan. Simpan dulu agar tidak
              hilang.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={switching}>Batal</AlertDialogCancel>
            <Button
              type="button"
              variant="outline"
              disabled={switching}
              onClick={handleDiscardAndProceed}
            >
              Buang
            </Button>
            <AlertDialogAction disabled={switching} onClick={handleSaveAndProceed}>
              {switching ? "Menyimpan..." : "Simpan & pindah"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
