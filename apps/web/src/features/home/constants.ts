// Home constants: weekday labels for the streak tracker checklist and per-unit icons.
import { Calculator, Compass, Rocket, Wallet, type LucideIcon } from "lucide-react";

export const WEEKDAY_LABELS = ["S", "S", "R", "K", "J", "S", "M"];

export const UNIT_ICONS: Record<string, LucideIcon> = {
  keuangan: Wallet,
  akuntansi: Calculator,
  "manajemen-produk": Compass,
  kewirausahaan: Rocket,
};
