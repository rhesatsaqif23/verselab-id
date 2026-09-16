import { Trash2 } from "lucide-react";
import { toast } from "sonner";
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
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { adminDeleteScreen, type AdminScreen } from "#/libs/admin-content-fns.ts";
import { ScreenForm } from "./ScreenForm.tsx";
import { ScreenPreviewCard } from "./ScreenPreviewCard.tsx";

interface ScreenEditPanelProps {
  activeScreen: AdminScreen | null;
  lessonId: string;
}

export function ScreenEditPanel({ activeScreen, lessonId }: ScreenEditPanelProps) {
  const queryClient = useQueryClient();

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

  if (!activeScreen) {
    return (
      <div className="flex h-64 items-center justify-center rounded-md border border-dashed p-8 text-center text-base text-muted-foreground">
        Pilih screen dari daftar di sebelah kiri untuk mengedit detailnya.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="space-y-5 rounded-md border bg-card p-5">
        <div className="flex items-center justify-between border-b pb-3">
          <h3 className="text-lg font-semibold">Edit Screen</h3>
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="uppercase">
              {activeScreen.type}
            </Badge>
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
                    Tindakan ini tidak dapat dibatalkan.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Batal</AlertDialogCancel>
                  <AlertDialogAction
                    variant="destructive"
                    onClick={() => deleteMutation.mutate(activeScreen.id)}
                  >
                    Hapus
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>

        <ScreenForm key={activeScreen.id} screen={activeScreen} lessonId={lessonId} />
      </div>

      <ScreenPreviewCard screen={activeScreen} />
    </div>
  );
}
