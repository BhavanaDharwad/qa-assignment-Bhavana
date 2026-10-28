import { z } from "zod";

// ---------- Users and sessions ----------

export const ROLES = ["admin", "member"] as const;
export const roleSchema = z.enum(ROLES);
export type Role = z.infer<typeof roleSchema>;

export const userSchema = z.object({
  id: z.string(),
  name: z.string(),
  role: roleSchema,
  createdAt: z.string(),
});
export type User = z.infer<typeof userSchema>;

export const signInSchema = z.object({
  name: z.string().trim().min(2, "Name must have at least 2 characters").max(40, "Name is too long"),
  role: roleSchema,
});
export type SignInInput = z.infer<typeof signInSchema>;

// ---------- Items ----------

export const CATEGORIES = ["laptops", "audio-video", "peripherals", "mobile"] as const;
export const categorySchema = z.enum(CATEGORIES);
export type Category = z.infer<typeof categorySchema>;

export const ITEM_STATUSES = ["available", "requested", "on-loan", "return-pending"] as const;
export const itemStatusSchema = z.enum(ITEM_STATUSES);
export type ItemStatus = z.infer<typeof itemStatusSchema>;

export const itemSchema = z.object({
  id: z.string(),
  name: z.string(),
  category: categorySchema,
  status: itemStatusSchema,
  addedAt: z.string(),
});
export type Item = z.infer<typeof itemSchema>;

export const newItemSchema = z.object({
  name: z.string().trim().min(2, "Name must have at least 2 characters").max(60, "Name is too long"),
  category: categorySchema,
});
export type NewItem = z.infer<typeof newItemSchema>;

// ---------- Rentals ----------

export const RENTAL_STATUSES = ["requested", "approved", "return-pending", "returned", "rejected"] as const;
export const rentalStatusSchema = z.enum(RENTAL_STATUSES);
export type RentalStatus = z.infer<typeof rentalStatusSchema>;

export const rentalSchema = z.object({
  id: z.string(),
  itemId: z.string(),
  itemName: z.string(),
  itemCategory: categorySchema,
  memberId: z.string(),
  memberName: z.string(),
  status: rentalStatusSchema,
  requestedAt: z.string(),
  decidedAt: z.string().nullable(),
  returnRequestedAt: z.string().nullable(),
  returnedAt: z.string().nullable(),
});
export type Rental = z.infer<typeof rentalSchema>;

export const newRentalSchema = z.object({
  itemId: z.string().min(1),
});
export type NewRental = z.infer<typeof newRentalSchema>;

/** Statuses that count as "active" for a member and block the item for others. */
export const ACTIVE_RENTAL_STATUSES: RentalStatus[] = ["requested", "approved", "return-pending"];

// ---------- Misc ----------

export const apiErrorSchema = z.object({
  error: z.string(),
  code: z.string(),
  fields: z.record(z.string(), z.string()).optional(),
});
export type ApiErrorBody = z.infer<typeof apiErrorSchema>;

export const SEED_NAMES = ["default", "empty", "large"] as const;
export type SeedName = (typeof SEED_NAMES)[number];

/** Maximum simultaneous active rentals per member. */
export const MAX_ACTIVE_RENTALS_PER_MEMBER = 3;
