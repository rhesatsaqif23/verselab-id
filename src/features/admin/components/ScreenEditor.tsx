import { useEffect, useState } from "react";
import { Link, useParams } from "@tanstack/react-router";
import { contentStore, useContentStore } from "#/content/contentStore.ts";
import { AddScreenDialog } from "./AddScreenDialog.tsx";
import { ScreenListPanel } from "./ScreenListPanel.tsx";
import { ScreenEditPanel } from "./ScreenEditPanel.tsx";

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
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-black text-foreground">Editor Screen</h1>
        <AddScreenDialog onAdd={handleCreateScreen} />
      </div>

      {/* Breadcrumb */}
      <div className="flex items-center gap-1.5 text-base">
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

      <div className="grid grid-cols-1 gap-6 md:grid-cols-12">
        {/* Left Column: Screen List */}
        <div className="space-y-2 md:col-span-5 lg:col-span-4">
          <ScreenListPanel
            screens={screens}
            selectedScreenId={selectedScreenId}
            onSelectScreen={setSelectedScreenId}
            onMoveScreen={moveScreen}
            onDeleteScreen={deleteScreen}
          />
        </div>

        {/* Right Column: Screen Form Editor & Preview */}
        <div className="md:col-span-7 lg:col-span-8">
          <ScreenEditPanel
            activeScreen={activeScreen}
            onUpdateScreen={updateScreen}
            onDeleteScreen={deleteScreen}
          />
        </div>
      </div>
    </div>
  );
}
