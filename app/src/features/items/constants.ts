import type { Category, ItemStatus } from "@/types/domain";

export const CATEGORY_LABELS: Record<Category, string> = {
  laptops: "Laptops",
  "audio-video": "Audio & video",
  peripherals: "Peripherals",
  mobile: "Mobile",
};

/** Decorative only: rendered with aria-hidden so accessible names stay the plain labels. */
export const CATEGORY_EMOJI: Record<Category, string> = {
  laptops: "💻",
  "audio-video": "🎥",
  peripherals: "🔌",
  mobile: "📱",
};

export const CATEGORY_ORDER: Category[] = ["laptops", "audio-video", "peripherals", "mobile"];

export const ITEM_STATUS_LABELS: Record<ItemStatus, string> = {
  available: "Available",
  requested: "Requested",
  "on-loan": "On loan",
  "return-pending": "Return pending",
};

/** Colour per item status. Same hues are reused for rental statuses so meaning stays consistent. */
export const ITEM_STATUS_CLASSES: Record<ItemStatus, string> = {
  available: "border-transparent bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300",
  requested: "border-transparent bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300",
  "on-loan": "border-transparent bg-sky-100 text-sky-800 dark:bg-sky-950 dark:text-sky-300",
  "return-pending": "border-transparent bg-violet-100 text-violet-800 dark:bg-violet-950 dark:text-violet-300",
};

export const SEARCH_DEBOUNCE_MS = 300;
