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
import type { AdminScreen } from "#/libs/admin-content-fns.ts";

interface ScreenListPanelProps {
  screens: AdminScreen[];
  selectedScreenId: string | null;
  onSelectScreen: (id: string) => void;
  onMoveScreen: (index: number, direction: "up" | "down") => void;
  onDeleteScreen: (id: string) => void;
  /** Blocks the move buttons while a reorder request is in flight. */
  reorderPending?: boolean;
}

export function ScreenListPanel({
  screens,
  selectedScreenId,
  onSelectScreen,
  onMoveScreen,
  onDeleteScreen,
  reorderPending = false,
}: ScreenListPanelProps) {
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
          return (
            <div
              key={screen.id}
              onClick={() => onSelectScreen(screen.id)}
              className={`flex cursor-pointer items-center justify-between p-3 transition-colors ${
                isSelected ? "bg-primary-soft font-medium text-primary" : "hover:bg-card/50"
              } ${index === screens.length - 1 ? "rounded-b-md" : ""}`}
            >
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
                <Button
                  variant="shadowless"
                  size="icon-sm"
                  disabled={index === 0 || reorderPending}
                  onClick={() => onMoveScreen(index, "up")}
                  aria-label="Pindah ke atas"
                >
                  <ChevronUp className="size-4" />
                </Button>
                <Button
                  variant="shadowless"
                  size="icon-sm"
                  disabled={index === screens.length - 1 || reorderPending}
                  onClick={() => onMoveScreen(index, "down")}
                  aria-label="Pindah ke bawah"
                >
                  <ChevronDown className="size-4" />
                </Button>

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
