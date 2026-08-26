import { useEffect, useState } from "react";
import { Link, useParams } from "@tanstack/react-router";
import { ChevronDown, ChevronUp, Trash2 } from "lucide-react";
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
import { contentStore, useContentStore } from "#/content/contentStore.ts";
import { AddScreenDialog } from "./AddScreenDialog.tsx";
import { ScreenForm } from "./ScreenForm.tsx";

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
      initialScreen = { type: "concept", prompt: "Pertanyaan Konsep Baru", explain: "Penjelasan" };
    } else if (type === "choice") {
      initialScreen = {
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
      initialScreen = {
        type: "numeric",
        prompt: "Pertanyaan Angka Baru",
        explain: "Penjelasan",
        unit: "Rp",
        acceptRange: [0, 100],
      };
    } else {
      initialScreen = {
        type: "allocation",
        prompt: "Pertanyaan Alokasi Baru",
        explain: "Penjelasan",
        categories: ["Tabungan", "Pengeluaran"],
        rule: { category: "Tabungan", min: 20 },
      };
    }

    addScreen(lessonId, initialScreen);
  }

  if (!lesson) {
    return <p className="p-4 text-muted-foreground">Lesson tidak ditemukan.</p>;
  }

  return (
    <div className="space-y-4">
      {/* Breadcrumb */}
      <div className="flex items-center gap-1.5 text-sm">
        <Link to="/admin" className="text-primary hover:underline">
          Unit
        </Link>
        <span className="text-muted-foreground">/</span>
        <Link to="/admin/$unitId" params={{ unitId }} className="text-primary hover:underline">
          {unit?.title ?? unitId}
        </Link>
        <span className="text-muted-foreground">/</span>
        <span className="font-medium text-foreground">{lesson.title}</span>
      </div>

      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-foreground">Editor Screen</h2>
        <AddScreenDialog onAdd={handleCreateScreen} />
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-12">
        {/* Left Column: Screen List */}
        <div className="space-y-2 md:col-span-5 lg:col-span-4">
          <div className="rounded-md border bg-card">
            <div className="border-b p-3 text-sm font-medium text-card-foreground">
              Daftar Screen ({screens.length})
            </div>
            <div className="divide-y max-h-150 overflow-y-auto">
              {screens.length === 0 && (
                <div className="p-4 text-center text-sm text-muted-foreground">
                  Belum ada screen di lesson ini.
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
                        <Badge variant="outline" className="font-mono text-xs uppercase">
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
                        aria-label="Pindah ke atas"
                      >
                        <ChevronUp className="size-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="size-6"
                        disabled={index === screens.length - 1}
                        onClick={() => moveScreen(index, "down")}
                        aria-label="Pindah ke bawah"
                      >
                        <ChevronDown className="size-3.5" />
                      </Button>

                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="size-6 text-destructive hover:text-destructive"
                            aria-label="Hapus screen"
                          >
                            <Trash2 className="size-3.5" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent size="sm">
                          <AlertDialogHeader>
                            <AlertDialogTitle>Hapus screen?</AlertDialogTitle>
                            <AlertDialogDescription>
                              Tindakan ini tidak dapat dibatalkan.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Batal</AlertDialogCancel>
                            <AlertDialogAction
                              variant="destructive"
                              onClick={() => deleteScreen(screen.id)}
                            >
                              Hapus
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
            <div className="space-y-5 rounded-md border bg-card p-5">
              <div className="flex items-center justify-between border-b pb-3">
                <h3 className="text-base font-semibold">Edit Screen</h3>
                <Badge variant="secondary" className="font-mono uppercase">
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
              Pilih screen dari daftar di sebelah kiri untuk mengedit detailnya.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
