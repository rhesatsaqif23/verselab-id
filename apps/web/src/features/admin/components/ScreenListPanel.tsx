import { GripVertical, Trash2 } from "lucide-react";
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
import type { AdminScreen } from "#/libs/admin-content-fns.ts";
import { useDragReorder } from "../hooks/useDragReorder.ts";

interface ScreenListPanelProps {
  screens: AdminScreen[];
  selectedScreenId: string | null;
  onSelectScreen: (id: string) => void;
  onReorderScreen: (fromIndex: number, toIndex: number) => void;
  /** Persists the current order after a drag (or keyboard move) finishes. */
  onPersistOrder: () => void;
  onDeleteScreen: (id: string) => void;
  /** Blocks new drags while a reorder request is in flight. */
  reorderPending?: boolean;
}

export function ScreenListPanel({
  screens,
  selectedScreenId,
  onSelectScreen,
  onReorderScreen,
  onPersistOrder,
  onDeleteScreen,
  reorderPending = false,
}: ScreenListPanelProps) {
  const { draggingId, getRowProps, getHandleProps } = useDragReorder({
    ids: screens.map((s) => s.id),
    disabled: reorderPending,
    onReorder: onReorderScreen,
    onDrop: onPersistOrder,
  });

  return (
    <div className="rounded-md border bg-card">
      <div className="border-b p-3 text-base font-bold text-card-foreground">
        Daftar Screen ({screens.length})
      </div>
      <div className="max-h-150 divide-y overflow-y-auto">
        {screens.length === 0 && (
          <div className="p-4 text-center text-base text-muted-foreground">
            Belum ada screen di lesson ini.
          </div>
        )}
        {screens.map((screen, index) => {
          const isSelected = screen.id === selectedScreenId;
          const isDragging = screen.id === draggingId;
          return (
            <div
              key={screen.id}
              data-testid="screen-row"
              {...getRowProps(screen.id)}
              onClick={() => onSelectScreen(screen.id)}
              className={`flex cursor-pointer items-center p-3 transition-colors ${
                isSelected ? "bg-primary-soft font-medium text-primary" : "hover:bg-card/50"
              } ${index === screens.length - 1 ? "rounded-b-md" : ""} ${
                isDragging ? "bg-primary-soft/60 opacity-70" : ""
              }`}
            >
              <button
                type="button"
                {...getHandleProps(screen.id, index)}
                disabled={reorderPending}
                title="Seret untuk menyusun"
                className="flex shrink-0 cursor-grab touch-none items-center self-stretch px-1 text-muted-foreground select-none hover:text-foreground active:cursor-grabbing disabled:cursor-default disabled:opacity-40"
              >
                <GripVertical className="size-4" />
              </button>

              <div className="flex min-w-0 flex-1 flex-col gap-1 pr-2">
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className="border-0 text-xs uppercase">
                    {screen.type}
                  </Badge>
                  <span className="text-base text-muted-foreground">#{index + 1}</span>
                </div>
                <p className="truncate text-base text-foreground">{screen.prompt}</p>
              </div>

              <div className="flex items-center gap-0.5" onClick={(e) => e.stopPropagation()}>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                      variant="shadowless"
                      size="icon-sm"
                      className="text-destructive hover:text-destructive"
                      aria-label="Hapus screen"
                    >
                      <Trash2 className="size-4" />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent size="sm">
                    <AlertDialogHeader>
                      <AlertDialogTitle>Hapus screen?</AlertDialogTitle>
                      <AlertDialogDescription>
                        Screen{" "}
                        <span className="font-medium text-foreground">
                          {screen.prompt.trim()
                            ? `"${screen.prompt.trim().slice(0, 60)}${screen.prompt.trim().length > 60 ? "…" : ""}"`
                            : "(belum diisi)"}
                        </span>{" "}
                        akan dihapus permanen beserta isinya.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Batal</AlertDialogCancel>
                      <AlertDialogAction
                        variant="destructive"
                        onClick={() => onDeleteScreen(screen.id)}
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
  );
}
