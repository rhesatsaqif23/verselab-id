// ExplanationDialog: modal that shows the explanation of the current screen.
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "#/components/ui/dialog.tsx";

type ExplanationDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  text: string;
};

export default function ExplanationDialog({ open, onOpenChange, text }: ExplanationDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Penjelasan</DialogTitle>
        </DialogHeader>
        <p className="text-base leading-relaxed text-foreground">{text}</p>
      </DialogContent>
    </Dialog>
  );
}
