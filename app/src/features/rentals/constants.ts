import type { RentalStatus } from "@/types/domain";

export const RENTAL_STATUS_LABELS: Record<RentalStatus, string> = {
  requested: "Requested",
  approved: "Approved",
  "return-pending": "Return pending",
  returned: "Returned",
  rejected: "Rejected",
};

/** Same hues as item statuses: amber = waiting on admin, sky = out, violet = coming back, emerald = done, red = refused. */
export const RENTAL_STATUS_CLASSES: Record<RentalStatus, string> = {
  requested: "border-transparent bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300",
  approved: "border-transparent bg-sky-100 text-sky-800 dark:bg-sky-950 dark:text-sky-300",
  "return-pending": "border-transparent bg-violet-100 text-violet-800 dark:bg-violet-950 dark:text-violet-300",
  returned: "border-transparent bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300",
  rejected: "border-transparent bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300",
};
