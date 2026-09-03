import { Badge } from "#/components/ui/badge.tsx";
import type { contentStore } from "#/content/contentStore.ts";
import { ScreenForm } from "./ScreenForm.tsx";
import { ScreenPreviewCard } from "./ScreenPreviewCard.tsx";

type ContentState = ReturnType<typeof contentStore.getState>;
type ScreenItem = ContentState["screens"][string];

interface ScreenEditPanelProps {
  activeScreen?: ScreenItem;
  onUpdateScreen: (id: string, patch: Partial<ScreenItem>) => void;
}

export function ScreenEditPanel({ activeScreen, onUpdateScreen }: ScreenEditPanelProps) {
  if (!activeScreen) {
    return (
      <div className="flex h-64 items-center justify-center rounded-md border border-dashed p-8 text-center text-muted-foreground">
        Pilih screen dari daftar di sebelah kiri untuk mengedit detailnya.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Edit Screen Card */}
      <div className="space-y-5 rounded-md border bg-card p-5">
        <div className="flex items-center justify-between border-b pb-3">
          <h3 className="text-base font-semibold">Edit Screen</h3>
          <Badge variant="secondary" className="uppercase">
            {activeScreen.type}
          </Badge>
        </div>

        <ScreenForm
          key={activeScreen.id}
          screen={activeScreen}
          onSave={(patch) => onUpdateScreen(activeScreen.id, patch)}
        />
      </div>

      {/* Preview Screen Card */}
      <ScreenPreviewCard screen={activeScreen} />
    </div>
  );
}
