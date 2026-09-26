// AuthSubmitButton: full-width primary submit button with an inline loading
// spinner and disabled state, shared by all auth forms.
import { Loader2 } from "lucide-react";
import { Button } from "#/components/ui/button";

export function AuthSubmitButton({
  children,
  loading = false,
  disabled = false,
}: {
  children: React.ReactNode;
  loading?: boolean;
  disabled?: boolean;
}) {
  return (
    <Button type="submit" className="w-full font-bold" disabled={disabled || loading}>
      {loading ? <Loader2 className="size-4 animate-spin" /> : null}
      {children}
    </Button>
  );
}
