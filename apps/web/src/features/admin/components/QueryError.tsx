// AdminQueryError: error state for failed admin data fetches (fetch failures
// otherwise masquerade as empty tables). Shows a retry button.
import { TriangleAlert } from "lucide-react";
import { Button } from "#/components/ui/button.tsx";

type QueryErrorProps = {
  message?: string;
  onRetry: () => void;
};

export function AdminQueryError({ message = "Gagal memuat data.", onRetry }: QueryErrorProps) {
  return (
    <div className="flex flex-col items-center gap-2 rounded-md border bg-card p-8 text-center">
      <TriangleAlert className="size-8 text-destructive" />
      <p className="text-base font-semibold text-foreground">{message}</p>
      <p className="text-sm text-muted-foreground">Periksa koneksi lalu coba lagi.</p>
      <Button size="sm" onClick={onRetry} className="mt-1">
        Muat ulang
      </Button>
    </div>
  );
}
