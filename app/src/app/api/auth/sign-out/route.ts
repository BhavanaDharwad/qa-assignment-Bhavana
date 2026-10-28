import { clearSessionCookie } from "@/server/auth";
import { jsonResponse, withApi } from "@/server/http";

export const dynamic = "force-dynamic";

export const POST = withApi(async () => {
  const response = jsonResponse({ ok: true });
  clearSessionCookie(response);
  return response;
});
