import type { Category, Item, Rental, User } from "@/types/domain";

const DAY_MS = 24 * 60 * 60 * 1000;
const daysAgo = (days: number, now: Date) => new Date(now.getTime() - days * DAY_MS).toISOString();

type SeedItem = { id: string; name: string; category: Category; addedDaysAgo: number };

const DEFAULT_ITEMS: SeedItem[] = [
  { id: "it_001", name: "MacBook Pro 14", category: "laptops", addedDaysAgo: 60 },
  { id: "it_002", name: "MacBook Air M3", category: "laptops", addedDaysAgo: 58 },
  { id: "it_003", name: "Dell XPS 13", category: "laptops", addedDaysAgo: 55 },
  { id: "it_004", name: "Apple TV 4K", category: "audio-video", addedDaysAgo: 50 },
  { id: "it_005", name: "AirPods Pro 2", category: "audio-video", addedDaysAgo: 45 },
  { id: "it_006", name: "Dell UltraSharp Webcam", category: "audio-video", addedDaysAgo: 40 },
  { id: "it_007", name: "Apple Magic Keyboard", category: "peripherals", addedDaysAgo: 30 },
  { id: "it_008", name: "Dell UltraSharp U2723QE", category: "peripherals", addedDaysAgo: 28 },
  { id: "it_010", name: "iPhone 15 Pro", category: "mobile", addedDaysAgo: 15 },
  { id: "it_012", name: "Google Pixel 8 Pro", category: "mobile", addedDaysAgo: 5 },
];

const SEED_USERS: Array<Omit<User, "createdAt">> = [
  { id: "us_admin", name: "Seed Admin", role: "admin" },
  { id: "us_member", name: "Seed Member", role: "member" },
];

const CATEGORY_CYCLE: Category[] = ["laptops", "audio-video", "peripherals", "mobile"];

export function buildSeed(name: "default" | "empty" | "large", now = new Date()) {
  const users = new Map<string, User>();
  const items = new Map<string, Item>();
  const rentals = new Map<string, Rental>();

  if (name === "empty") return { users, items, rentals };

  for (const user of SEED_USERS) {
    users.set(user.id, { ...user, createdAt: daysAgo(90, now) });
  }

  for (const seed of DEFAULT_ITEMS) {
    items.set(seed.id, {
      id: seed.id,
      name: seed.name,
      category: seed.category,
      status: "available",
      addedAt: daysAgo(seed.addedDaysAgo, now),
    });
  }

  // One completed rental in history so the History tab has content for the seed member.
  rentals.set("rt_001", {
    id: "rt_001",
    itemId: "it_007",
    itemName: "Apple Magic Keyboard",
    itemCategory: "peripherals",
    memberId: "us_member",
    memberName: "Seed Member",
    status: "returned",
    requestedAt: daysAgo(14, now),
    decidedAt: daysAgo(13, now),
    returnRequestedAt: daysAgo(8, now),
    returnedAt: daysAgo(7, now),
  });

  if (name === "large") {
    for (let index = 1; index <= 40; index += 1) {
      const id = `it_l${String(index).padStart(3, "0")}`;
      items.set(id, {
        id,
        name: `Generated Device ${index}`,
        category: CATEGORY_CYCLE[index % CATEGORY_CYCLE.length],
        status: "available",
        addedAt: daysAgo(100 + index, now),
      });
    }
  }

  return { users, items, rentals };
}
