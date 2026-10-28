import { requireUser } from "@/server/auth";
import { jsonResponse, withApi } from "@/server/http";
import { store } from "@/server/store";

export const dynamic = "force-dynamic";

type Context = { params: Promise<{ id: string }> };

export const POST = withApi<Context>(async (request, { params }) => {
  const actor = requireUser(request);
  const { id } = await params;
  return jsonResponse(store.approveRental(actor, id));
});
