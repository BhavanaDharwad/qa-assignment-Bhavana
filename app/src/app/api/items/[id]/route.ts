import { requireUser } from "@/server/auth";
import { jsonResponse, withApi } from "@/server/http";
import { store } from "@/server/store";

export const dynamic = "force-dynamic";

type Context = { params: Promise<{ id: string }> };

export const GET = withApi<Context>(async (request, { params }) => {
  requireUser(request);
  const { id } = await params;
  return jsonResponse(store.getItem(id));
});

export const DELETE = withApi<Context>(async (request, { params }) => {
  const actor = requireUser(request);
  const { id } = await params;
  store.deleteItem(actor, id);
  return new Response(null, { status: 204, headers: { "Cache-Control": "no-store" } });
});
