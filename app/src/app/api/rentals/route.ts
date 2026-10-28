import { requireUser } from "@/server/auth";
import { jsonResponse, readJson, withApi } from "@/server/http";
import { store } from "@/server/store";
import { newRentalSchema, rentalStatusSchema } from "@/types/domain";

export const dynamic = "force-dynamic";

/** Members see their own rentals; admins see everyone's. */
export const GET = withApi(async (request) => {
  const actor = requireUser(request);
  const rawStatus = new URL(request.url).searchParams.get("status");
  const status = rawStatus ? rentalStatusSchema.parse(rawStatus) : undefined;
  return jsonResponse({ items: store.listRentals(actor, { status }) });
});

export const POST = withApi(async (request) => {
  const actor = requireUser(request);
  const input = newRentalSchema.parse(await readJson(request));
  return jsonResponse(store.requestRental(actor, input.itemId), { status: 201 });
});
