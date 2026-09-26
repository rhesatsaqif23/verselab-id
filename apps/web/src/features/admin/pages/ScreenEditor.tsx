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
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "#/components/ui/alert-dialog.tsx";
import { Button } from "#/components/ui/button.tsx";
import { ScreenListPanel } from "../components/ScreenListPanel.tsx";
import { ScreenEditPanel } from "../components/ScreenEditPanel.tsx";
import {
  isScreenEmpty,
  isScreenIncomplete,
  type ScreenEditorApi,
} from "../components/ScreenForm.tsx";

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

  const allScreens: AdminScreen[] = screens ?? [];

  const [selectedScreenId, setSelectedScreenId] = useState<string | null>(null);
  const [pendingScreenId, setPendingScreenId] = useState<string | null>(null);
  const [switching, setSwitching] = useState(false);
  const editorApiRef = useRef<ScreenEditorApi | null>(null);
  // Screens created in this session are drafts the user is still filling in,
  // so they are cleaned up on leave instead of on sight.
  const newScreenIdsRef = useRef<Set<string>>(new Set());
  // Screens confirmed saved at least once are never treated as trash.
  const savedScreenIdsRef = useRef<Set<string>>(new Set());
  const cleanedIdsRef = useRef<Set<string>>(new Set());
  const abandonEmptyIdsRef = useRef<string[]>([]);

  const createMutation = useMutation({
    mutationFn: (data: Parameters<typeof adminCreateScreen>[0]["data"]) =>
      adminCreateScreen({ data }),
    onMutate: async (data) => {
      // Show the blank draft instantly so the user can fill it before the
      // server round-trip finishes. The id is client-generated, so tracking
      // never depends on the create response shape.
      await queryClient.cancelQueries({ queryKey: ["admin-screens", lessonId] });
      const previous = queryClient.getQueryData<AdminScreen[]>(["admin-screens", lessonId]);
      const draft: AdminScreen = {
        id: data.id ?? crypto.randomUUID(),
        lessonId,
        type: data.type,
        slug: data.id ?? "",
        prompt: data.prompt ?? "",
        explain: data.explain ?? "",
        options: data.options ?? null,
        correctId: data.correctId ?? null,
        numericUnit: data.numericUnit ?? null,
        acceptRangeMin: data.acceptRangeMin ?? null,
        acceptRangeMax: data.acceptRangeMax ?? null,
        categories: data.categories ?? null,
        rule: data.rule ?? null,
        sortOrder: previous?.length ?? 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      queryClient.setQueryData<AdminScreen[]>(["admin-screens", lessonId], (old) => [
        ...(old ?? []),
        draft,
      ]);
      return { previous };
    },
    onSuccess: (created: AdminScreen, variables) => {
      const draftId = variables.id;
      const serverId = created?.id ?? draftId;
      let abandoned = false;
      if (draftId) {
        abandoned = cleanedIdsRef.current.delete(draftId);
        newScreenIdsRef.current.delete(draftId);
      }
      if (serverId) {
        newScreenIdsRef.current.add(serverId);
        // Follow the server id, but never steal the selection back if the
        // user already moved on while the create was in flight.
        setSelectedScreenId((current) =>
          current === draftId || current === null ? serverId : current,
        );
        if (draftId && serverId !== draftId) {
          queryClient.setQueryData<AdminScreen[]>(["admin-screens", lessonId], (old) =>
            old ? old.map((r) => (r.id === draftId ? { ...r, id: serverId } : r)) : old,
          );
        }
        if (abandoned) cleanedIdsRef.current.add(serverId);
      }
      queryClient.invalidateQueries({ queryKey: ["admin-screens", lessonId] });
      toast.success("Screen berhasil ditambahkan");
      // The draft was left blank while the create was still in flight; now
      // that the row exists it can actually be removed — no ghost rows.
      if (serverId && abandoned) {
        deleteMutation.mutate({ id: serverId, silent: true });
      }
    },
    onError: (err: Error, variables, context) => {
      if (context?.previous) {
        queryClient.setQueryData(["admin-screens", lessonId], context.previous);
      }
      const failedId = variables.id;
      if (failedId) {
        newScreenIdsRef.current.delete(failedId);
        cleanedIdsRef.current.delete(failedId);
        setSelectedScreenId((current) =>
          current === failedId ? (context?.previous?.[0]?.id ?? null) : current,
        );
      }
      toast.error(translateAdminError(err, "Gagal menambahkan screen"));
    },
  });

  const deleteMutation = useMutation({
    mutationFn: ({ id }: { id: string; silent?: boolean }) => adminDeleteScreen({ data: { id } }),
    onMutate: async ({ id }) => {
      // Remove the row locally instead of invalidating. A refetch here could
      // race a pending create (snapshot without the new row) and make the
      // freshly added screen vanish from the list.
      await queryClient.cancelQueries({ queryKey: ["admin-screens", lessonId] });
      const previous = queryClient.getQueryData<AdminScreen[]>(["admin-screens", lessonId]);
      queryClient.setQueryData<AdminScreen[]>(["admin-screens", lessonId], (old) =>
        old ? old.filter((r) => r.id !== id) : old,
      );
      return { previous };
    },
    onSuccess: (_result, variables) => {
      newScreenIdsRef.current.delete(variables.id);
      savedScreenIdsRef.current.delete(variables.id);
      if (!variables.silent) toast.success("Screen berhasil dihapus");
    },
    onError: (err: Error, variables, context) => {
      if (context?.previous) {
        queryClient.setQueryData(["admin-screens", lessonId], context.previous);
      }
      // Reconcile with the server after a failed delete.
      queryClient.invalidateQueries({ queryKey: ["admin-screens", lessonId] });
      if (variables.silent) {
        // Allow a later data refresh to retry silent trash cleanup.
        cleanedIdsRef.current.delete(variables.id);
        return;
      }
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

  // The guard compares the live form against the last saved server response.
  // A saved screen never blocks; only a real unsaved difference does. This
  // covers sidebar, breadcrumb, header and browser back navigations.
  function hasUnsavedChanges() {
    return editorApiRef.current?.hasUnsaved() ?? false;
  }

  const blocker = useBlocker({
    shouldBlockFn: hasUnsavedChanges,
    enableBeforeUnload: hasUnsavedChanges,
    withResolver: true,
  });
  const routeBlocked = blocker.status === "blocked";
  const guardOpen = pendingScreenId !== null || routeBlocked;

  function silentDelete(id: string) {
    if (cleanedIdsRef.current.has(id)) return;
    cleanedIdsRef.current.add(id);
    // A draft whose create is still in flight cannot be deleted yet — the row
    // may not exist on the server. Defer to createMutation.onSuccess.
    if (createMutation.isPending && newScreenIdsRef.current.has(id)) return;
    deleteMutation.mutate({ id, silent: true });
  }

  /** An unsaved blank draft is trash when the user leaves it behind. */
  function shouldDropOnLeave(screen: AdminScreen | undefined): screen is AdminScreen {
    if (!screen) return false;
    if (savedScreenIdsRef.current.has(screen.id)) return false;
    return isScreenEmpty(screen);
  }

  function handleSelectScreen(id: string) {
    if (id === selectedScreenId || id === pendingScreenId) return;
    if (hasUnsavedChanges()) {
      setPendingScreenId(id);
      return;
    }
    const current = allScreens.find((s) => s.id === selectedScreenId);
    if (shouldDropOnLeave(current)) silentDelete(current.id);
    setSelectedScreenId(id);
  }

  async function handleSaveAndProceed() {
    setSwitching(true);
    try {
      const currentId = selectedScreenId;
      const saved = await editorApiRef.current?.save();
      if (!saved) {
        // Validation errors are already toasted by the form. Close the dialog
        // so the user can fill the required field on the now-visible form;
        // the guard reopens on the next navigation attempt.
        handleCancelGuard();
        return;
      }
      if (currentId) handleSavedScreenId(currentId);
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
    const leaving = allScreens.find((s) => s.id === selectedScreenId);
    if (
      leaving &&
      isScreenIncomplete(leaving) &&
      !savedScreenIdsRef.current.has(leaving.id) &&
      (newScreenIdsRef.current.has(leaving.id) || isScreenEmpty(leaving))
    ) {
      silentDelete(leaving.id);
    }
    if (blocker.status === "blocked") {
      setPendingScreenId(null);
      blocker.proceed();
      return;
    }
    if (pendingScreenId) setSelectedScreenId(pendingScreenId);
    setPendingScreenId(null);
  }

  function handleSavedScreenId(id: string) {
    newScreenIdsRef.current.delete(id);
    savedScreenIdsRef.current.add(id);
  }

  /** X / close: cancel the pending navigation, keep the edits and selection. */
  function handleCancelGuard() {
    setPendingScreenId(null);
    if (blocker.status === "blocked") blocker.reset();
  }

  useEffect(() => {
    // Establish the selection first so the trash pass below knows what the
    // user is looking at. A blank draft is trashed only when the user leaves
    // it for another screen or page while it is still blank — never on sight.
    let currentId = selectedScreenId;
    if (allScreens.length > 0) {
      if (!currentId) {
        currentId =
          initialScreenId && allScreens.some((s) => s.id === initialScreenId)
            ? initialScreenId
            : allScreens[0].id;
        setSelectedScreenId(currentId);
      } else if (!allScreens.some((s) => s.id === currentId)) {
        // A freshly created draft stays selected until its row arrives; only
        // fall back when the selection is genuinely gone.
        if (!newScreenIdsRef.current.has(currentId)) {
          currentId = allScreens[0].id;
          setSelectedScreenId(currentId);
        }
      }
    } else {
      currentId = null;
      setSelectedScreenId(null);
    }
    for (const screen of allScreens) {
      if (!isScreenEmpty(screen)) continue;
      if (screen.id === currentId) continue;
      if (newScreenIdsRef.current.has(screen.id)) continue;
      if (savedScreenIdsRef.current.has(screen.id)) continue;
      silentDelete(screen.id);
    }
    abandonEmptyIdsRef.current = allScreens
      .filter((screen) => isScreenEmpty(screen) && !savedScreenIdsRef.current.has(screen.id))
      .map((screen) => screen.id);
  }, [allScreens, selectedScreenId, initialScreenId]);

  const activeScreen = allScreens.find((s) => s.id === selectedScreenId) ?? null;

  useEffect(() => {
    if (!activeScreen) editorApiRef.current = null;
  }, [activeScreen]);

  // Best-effort removal of an abandoned blank draft when leaving the editor
  // without going through the guard (for example, closing the tab).
  useEffect(
    () => () => {
      for (const id of abandonEmptyIdsRef.current) {
        if (savedScreenIdsRef.current.has(id)) continue;
        if (cleanedIdsRef.current.has(id)) continue;
        cleanedIdsRef.current.add(id);
        void Promise.resolve()
          .then(() => adminDeleteScreen({ data: { id } }))
          .catch(() => undefined);
      }
    },
    [],
  );

  function moveScreen(index: number, direction: "up" | "down") {
    const next = allScreens.map((s) => s.id);
    const swap = direction === "up" ? index - 1 : index + 1;
    [next[index], next[swap]] = [next[swap], next[index]];
    reorderMutation.mutate(next);
  }

  function handleDeleteScreen(id: string) {
    deleteMutation.mutate({ id });
  }

  function handleCreateScreen(type: AdminScreen["type"]) {
    // The draft id is generated up front so the new row is tracked, selected
    // and rendered before the server responds — it can never look like trash.
    const draftId = crypto.randomUUID();
    newScreenIdsRef.current.add(draftId);
    cleanedIdsRef.current.delete(draftId);
    setSelectedScreenId(draftId);

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

    createMutation.mutate({ ...data, id: draftId });
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
            onSavedScreenId={handleSavedScreenId}
          />
        </div>
      </div>

      <AlertDialog
        open={guardOpen}
        onOpenChange={(open) => {
          // Only Simpan and Buang may resolve the guard. Ignore implicit
          // dismissals so a failed save keeps the dialog open.
          if (!open && guardOpen) return;
        }}
      >
        <AlertDialogContent size="sm" onCloseClick={handleCancelGuard}>
          <AlertDialogHeader>
            <AlertDialogTitle>Simpan perubahan?</AlertDialogTitle>
            <AlertDialogDescription>
              Screen ini masih memiliki perubahan yang belum disimpan. Simpan dulu agar tidak
              hilang.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
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
