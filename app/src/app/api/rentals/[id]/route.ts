import { requireUser } from "@/server/auth";
import { jsonResponse, withApi } from "@/server/http";
import { store, StoreError } from "@/server/store";

export const dynamic = "force-dynamic";

type Context = { params: Promise<{ id: string }> };

export const GET = withApi<Context>(async (request, { params }) => {
  const actor = requireUser(request);
  const { id } = await params;
  const rental = store.getRental(id);
  if (actor.role === "member" && rental.memberId !== actor.id) {
    throw new StoreError(404, "rental_not_found", `Rental ${id} does not exist`);
  }
  return jsonResponse(rental);
});
