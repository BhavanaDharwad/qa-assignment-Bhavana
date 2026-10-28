import {
  ACTIVE_RENTAL_STATUSES,
  MAX_ACTIVE_RENTALS_PER_MEMBER,
  type Category,
  type Item,
  type ItemStatus,
  type NewItem,
  type Rental,
  type RentalStatus,
  type SeedName,
  type SignInInput,
  type User,
} from "@/types/domain";
import { buildSeed } from "./seed-data";

export class StoreError extends Error {
  constructor(
    readonly status: number,
    readonly code: string,
    message: string,
    readonly fields?: Record<string, string>,
  ) {
    super(message);
    this.name = "StoreError";
  }
}

type StoreData = {
  users: Map<string, User>;
  items: Map<string, Item>;
  rentals: Map<string, Rental>;
  counter: number;
};

// Next.js dev mode may re-evaluate modules; keep the store on globalThis so
// data survives hot reloads within one server process.
const globalStore = globalThis as typeof globalThis & { __kitDeskStore?: StoreData };

function freshData(seed: SeedName): StoreData {
  const { users, items, rentals } = buildSeed(seed);
  return { users, items, rentals, counter: 1000 };
}

function data(): StoreData {
  if (!globalStore.__kitDeskStore) globalStore.__kitDeskStore = freshData("default");
  return globalStore.__kitDeskStore;
}

function nextId(prefix: string): string {
  data().counter += 1;
  return `${prefix}_${data().counter}`;
}

const normalise = (value: string) => value.trim().toLocaleLowerCase();
const now = () => new Date().toISOString();

function requireAdmin(user: User): void {
  if (user.role !== "admin") throw new StoreError(403, "forbidden", "Only an admin can do this");
}

function requireMember(user: User): void {
  if (user.role !== "member") throw new StoreError(403, "forbidden", "Only a member can do this");
}

function setItemStatus(itemId: string, status: ItemStatus): void {
  const item = data().items.get(itemId);
  if (item) data().items.set(itemId, { ...item, status });
}

export const store = {
  reset(seed: SeedName = "default"): void {
    globalStore.__kitDeskStore = freshData(seed);
  },

  // ---------- Users ----------

  signIn(input: SignInInput): User {
    const existing = [...data().users.values()].find(
      (user) => normalise(user.name) === normalise(input.name) && user.role === input.role,
    );
    if (existing) return existing;
    const user: User = { id: nextId("us"), name: input.name, role: input.role, createdAt: now() };
    data().users.set(user.id, user);
    return user;
  },

  getUser(id: string): User | null {
    return data().users.get(id) ?? null;
  },

  // ---------- Items ----------

  listItems(filter: { query?: string; category?: Category; status?: ItemStatus }): Item[] {
    const query = filter.query ? normalise(filter.query) : "";
    return [...data().items.values()]
      .filter((item) => (filter.category ? item.category === filter.category : true))
      .filter((item) => (filter.status ? item.status === filter.status : true))
      .filter((item) => (query ? normalise(item.name).includes(query) : true))
      .sort((a, b) => b.addedAt.localeCompare(a.addedAt) || b.id.localeCompare(a.id));
  },

  getItem(id: string): Item {
    const item = data().items.get(id);
    if (!item) throw new StoreError(404, "item_not_found", `Item ${id} does not exist`);
    return item;
  },

  createItem(actor: User, input: NewItem): Item {
    requireAdmin(actor);
    const duplicate = [...data().items.values()].find((item) => normalise(item.name) === normalise(input.name));
    if (duplicate) {
      throw new StoreError(409, "duplicate_item", "An item with this name already exists", {
        name: "An item with this name already exists",
      });
    }
    const item: Item = { id: nextId("it"), name: input.name, category: input.category, status: "available", addedAt: now() };
    data().items.set(item.id, item);
    return item;
  },

  deleteItem(actor: User, id: string): void {
    requireAdmin(actor);
    const item = this.getItem(id);
    if (item.status !== "available") {
      throw new StoreError(409, "item_in_use", "Only available items can be removed");
    }
    data().items.delete(id);
  },

  // ---------- Rentals ----------

  listRentals(actor: User, filter: { status?: RentalStatus }): Rental[] {
    return [...data().rentals.values()]
      .filter((rental) => (actor.role === "member" ? rental.memberId === actor.id : true))
      .filter((rental) => (filter.status ? rental.status === filter.status : true))
      .sort((a, b) => b.requestedAt.localeCompare(a.requestedAt) || b.id.localeCompare(a.id));
  },

  getRental(id: string): Rental {
    const rental = data().rentals.get(id);
    if (!rental) throw new StoreError(404, "rental_not_found", `Rental ${id} does not exist`);
    return rental;
  },

  requestRental(actor: User, itemId: string): Rental {
    requireMember(actor);
    const item = this.getItem(itemId);
    if (item.status !== "available") {
      throw new StoreError(409, "item_unavailable", `${item.name} is not available`);
    }
    const active = [...data().rentals.values()].filter(
      (rental) => rental.memberId === actor.id && ACTIVE_RENTAL_STATUSES.includes(rental.status),
    );
    if (active.length >= MAX_ACTIVE_RENTALS_PER_MEMBER) {
      throw new StoreError(
        422,
        "rental_limit_reached",
        `You already have ${MAX_ACTIVE_RENTALS_PER_MEMBER} active rentals`,
      );
    }
    const rental: Rental = {
      id: nextId("rt"),
      itemId: item.id,
      itemName: item.name,
      itemCategory: item.category,
      memberId: actor.id,
      memberName: actor.name,
      status: "requested",
      requestedAt: now(),
      decidedAt: null,
      returnRequestedAt: null,
      returnedAt: null,
    };
    data().rentals.set(rental.id, rental);
    setItemStatus(item.id, "requested");
    return rental;
  },

  approveRental(actor: User, id: string): Rental {
    requireAdmin(actor);
    const rental = this.getRental(id);
    if (rental.status !== "requested") {
      throw new StoreError(409, "invalid_transition", `Cannot approve a rental that is ${rental.status}`);
    }
    const next: Rental = { ...rental, status: "approved", decidedAt: now() };
    data().rentals.set(id, next);
    setItemStatus(rental.itemId, "on-loan");
    return next;
  },

  rejectRental(actor: User, id: string): Rental {
    requireAdmin(actor);
    const rental = this.getRental(id);
    if (rental.status !== "requested") {
      throw new StoreError(409, "invalid_transition", `Cannot reject a rental that is ${rental.status}`);
    }
    const next: Rental = { ...rental, status: "rejected", decidedAt: now() };
    data().rentals.set(id, next);
    setItemStatus(rental.itemId, "available");
    return next;
  },

  requestReturn(actor: User, id: string): Rental {
    requireMember(actor);
    const rental = this.getRental(id);
    if (rental.memberId !== actor.id) {
      throw new StoreError(403, "forbidden", "You can only return your own rentals");
    }
    if (rental.status !== "approved") {
      throw new StoreError(409, "invalid_transition", `Cannot return a rental that is ${rental.status}`);
    }
    const next: Rental = { ...rental, status: "return-pending", returnRequestedAt: now() };
    data().rentals.set(id, next);
    setItemStatus(rental.itemId, "return-pending");
    return next;
  },

  confirmReturn(actor: User, id: string): Rental {
    requireAdmin(actor);
    const rental = this.getRental(id);
    if (rental.status !== "return-pending") {
      throw new StoreError(409, "invalid_transition", `Cannot confirm a return for a rental that is ${rental.status}`);
    }
    const next: Rental = { ...rental, status: "returned", returnedAt: now() };
    data().rentals.set(id, next);
    setItemStatus(rental.itemId, "available");
    return next;
  },
};
