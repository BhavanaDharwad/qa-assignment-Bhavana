import { setSessionCookie } from "@/server/auth";
import { jsonResponse, readJson, withApi } from "@/server/http";
import { store } from "@/server/store";
import { signInSchema } from "@/types/domain";

export const dynamic = "force-dynamic";

export const POST = withApi(async (request) => {
  const input = signInSchema.parse(await readJson(request));
  const user = store.signIn(input);
  const response = jsonResponse(user);
  setSessionCookie(response, user.id);
  return response;
});

