import { requireUser } from "@/server/auth";
import { jsonResponse, readJson, withApi } from "@/server/http";
import { store } from "@/server/store";
import { categorySchema, itemStatusSchema, newItemSchema } from "@/types/domain";

export const dynamic = "force-dynamic";

export const GET = withApi(async (request) => {
  requireUser(request);
  const url = new URL(request.url);
  const query = url.searchParams.get("q") ?? undefined;
  const rawCategory = url.searchParams.get("category");
  const rawStatus = url.searchParams.get("status");
  return jsonResponse({
    items: store.listItems({
      query,
      category: rawCategory ? categorySchema.parse(rawCategory) : undefined,
      status: rawStatus ? itemStatusSchema.parse(rawStatus) : undefined,
    }),
  });
});

export const POST = withApi(async (request) => {
  const actor = requireUser(request);
  const input = newItemSchema.parse(await readJson(request));
  return jsonResponse(store.createItem(actor, input), { status: 201 });
});
