import { Search, Paperclip } from "lucide-react";
import { Input } from "#/components/ui/input";
import { Button } from "#/components/ui/button";

export default function SearchBar() {
  return (
    <div className="flex items-center gap-2 rounded-full border-2 bg-card p-1.5 transition focus-within:border-primary/40">
      <Search className="ml-3 h-4 w-4 shrink-0 text-muted-foreground" />
      <Input
        type="text"
        placeholder="We're learning about systems"
        className="h-9 flex-1 border-0 bg-tr    ansparent px-2 text-sm shadow-none placeholder:text-muted-foreground/50 focus-visible:ring-0"
      />
      <button
        type="button"
        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-muted-foreground transition hover:bg-muted"
        aria-label="Attach file"
      >
        <Paperclip className="h-4 w-4" />
      </button>
      <Button variant="ghost" size="sm" className="rounded-full px-5">
        Ask
      </Button>
    </div>
  );
}
