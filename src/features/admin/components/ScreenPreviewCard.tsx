import { useEffect, useState } from "react";
import { Badge } from "#/components/ui/badge.tsx";
import type { contentStore } from "#/content/contentStore.ts";
import ChoiceRenderer from "#/domains/personal-finance/screens/ChoiceRenderer.tsx";
import ConceptRenderer from "#/domains/personal-finance/screens/ConceptRenderer.tsx";
import NumericRenderer from "#/domains/personal-finance/screens/NumericRenderer.tsx";
import AllocationRenderer from "#/domains/personal-finance/screens/AllocationRenderer.tsx";

type ContentState = ReturnType<typeof contentStore.getState>;
type ScreenItem = ContentState["screens"][string];

interface ScreenPreviewCardProps {
  screen: ScreenItem;
}

function renderScreenContent(screen: ScreenItem) {
  switch (screen.type) {
    case "concept":
      return (
        <ConceptRenderer
          screen={{
            type: "concept",
            prompt: screen.prompt || "(Belum ada teks pertanyaan)",
            explain: screen.explain || "",
          }}
        />
      );
    case "choice": {
      const options =
        screen.options && screen.options.length > 0
          ? screen.options
          : [
              { id: "opt1", label: "Pilihan 1" },
              { id: "opt2", label: "Pilihan 2" },
            ];
      return (
        <ChoiceRenderer
          screen={{
            type: "choice",
            prompt: screen.prompt || "(Belum ada teks pertanyaan)",
            options,
            correctId: screen.correctId || options[0].id,
            explain: screen.explain || "",
          }}
          onSelect={() => {}}
          checked={null}
        />
      );
    }
    case "numeric":
      return (
        <NumericRenderer
          screen={{
            type: "numeric",
            prompt: screen.prompt || "(Belum ada teks pertanyaan)",
            unit: screen.unit || "Rp",
            acceptRange: screen.acceptRange || [0, 100],
            explain: screen.explain || "",
          }}
          onChange={() => {}}
          checked={null}
        />
      );
    case "allocation": {
      const categories =
        screen.categories && screen.categories.length > 0
          ? screen.categories
          : ["Kategori 1", "Kategori 2"];
      return (
        <AllocationRenderer
          screen={{
            type: "allocation",
            prompt: screen.prompt || "(Belum ada teks pertanyaan)",
            categories,
            rule: screen.rule || { category: categories[0], min: 20 },
            explain: screen.explain || "",
          }}
          onChange={() => {}}
          checked={null}
        />
      );
    }
  }
}

export function ScreenPreviewCard({ screen }: ScreenPreviewCardProps) {
  const [debouncedScreen, setDebouncedScreen] = useState(screen);

  useEffect(() => {
    // If switching to a different screen ID, update immediately
    if (debouncedScreen.id !== screen.id) {
      setDebouncedScreen(screen);
      return;
    }

    // Debounce live updates when editing inputs
    const timer = setTimeout(() => {
      setDebouncedScreen(screen);
    }, 300);

    return () => clearTimeout(timer);
  }, [screen, debouncedScreen.id]);

  const reloadKey = `${debouncedScreen.id}-${debouncedScreen.type}-${JSON.stringify(debouncedScreen)}`;

  return (
    <div className="space-y-4 rounded-md border bg-card p-5">
      <div className="flex items-center justify-between border-b pb-3">
        <div className="flex items-center gap-2">
          <h3 className="text-lg font-semibold">Pratinjau Halaman</h3>
        </div>
        <Badge variant="secondary" className="uppercase">
          {debouncedScreen.type}
        </Badge>
      </div>

      <div key={reloadKey}>{renderScreenContent(debouncedScreen)}</div>
    </div>
  );
}
