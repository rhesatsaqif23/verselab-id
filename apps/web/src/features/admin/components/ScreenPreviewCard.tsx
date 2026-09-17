import { useEffect, useState } from "react";
import { Badge } from "#/components/ui/badge.tsx";
import type { AdminScreen } from "#/libs/admin-content-fns.ts";
import { renderScreen } from "#/domains/registry.tsx";
import type { Screen } from "#/engine/types.ts";

interface ScreenPreviewCardProps {
  screen: AdminScreen;
}

function adminScreenToScreen(admin: AdminScreen): Screen {
  const base = {
    prompt: admin.prompt || "(Belum ada teks pertanyaan)",
    explain: admin.explain || "",
  };

  switch (admin.type) {
    case "concept":
      return { type: "concept", ...base };
    case "choice":
      return {
        type: "choice",
        ...base,
        options:
          admin.options && admin.options.length > 0
            ? admin.options
            : [
                { id: "opt1", label: "Pilihan 1" },
                { id: "opt2", label: "Pilihan 2" },
              ],
        correctId: admin.correctId || "opt1",
      };
    case "numeric":
      return {
        type: "numeric",
        ...base,
        unit: admin.numericUnit || "Rp",
        acceptRange: [admin.acceptRangeMin ?? 0, admin.acceptRangeMax ?? 100],
      };
    case "allocation": {
      const categories =
        admin.categories && admin.categories.length > 0
          ? admin.categories
          : ["Kategori 1", "Kategori 2"];
      return {
        type: "allocation",
        ...base,
        categories,
        rule: admin.rule
          ? { category: admin.rule.categoryId, min: admin.rule.min }
          : { category: categories[0], min: 20 },
      };
    }
  }
}

export function ScreenPreviewCard({ screen }: ScreenPreviewCardProps) {
  const [debouncedScreen, setDebouncedScreen] = useState(screen);

  useEffect(() => {
    if (debouncedScreen.id !== screen.id) {
      setDebouncedScreen(screen);
      return;
    }

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

      <div key={reloadKey}>
        {renderScreen(adminScreenToScreen(debouncedScreen), () => {}, null)}
      </div>
    </div>
  );
}
