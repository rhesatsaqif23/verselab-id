export type ScreenData = {
  id: string;
  type: "concept" | "choice" | "numeric" | "allocation";
  prompt: string;
  explain: string;
  options?: { id: string; label: string }[];
  correctId?: string;
  unit?: string;
  acceptRange?: [number, number];
  categories?: string[];
  rule?: { category: string; min?: number; max?: number };
};
