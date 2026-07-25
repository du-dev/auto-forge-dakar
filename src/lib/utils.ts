import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Formater un prix en FCFA (ex: 45 000 FCFA) */
export function formatFCFA(n: number): string {
  return `${n.toLocaleString("fr-FR").replace(/,/g, " ")} FCFA`;
}
