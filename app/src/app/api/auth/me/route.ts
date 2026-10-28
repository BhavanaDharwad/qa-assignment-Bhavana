import { currentUser } from "@/server/auth";
import { jsonResponse, withApi } from "@/server/http";

export const dynamic = "force-dynamic";

/** Returns the signed-in user, or `{ user: null }` when there is no session. */
export const GET = withApi(async (request) => jsonResponse({ user: currentUser(request) }));
