/* ── Types partagés du catalogue ─────────────────────── */

export type Category =
  | "Freinage"
  | "Moteur"
  | "Électricité"
  | "Carrosserie"
  | "Filtres"
  | "Embrayage"
  | "Suspension"
  | "Direction";

export type Part = {
  name: string;
  zone: string;
  price: number;
  available: boolean;
  brand: string;
  category: Category;
  phone: string;
  ref: string;
};
