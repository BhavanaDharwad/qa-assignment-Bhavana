import { NextResponse } from "next/server";
import type { User } from "@/types/domain";
import { store, StoreError } from "./store";

export const SESSION_COOKIE = "kitdesk_session";
/** Test and API clients can act as a user without a cookie by sending this header. */
export const USER_HEADER = "x-user-id";

function readCookie(request: Request, name: string): string | null {
  const header = request.headers.get("cookie");
  if (!header) return null;
  for (const part of header.split(";")) {
    const [key, ...rest] = part.trim().split("=");
    if (key === name) return decodeURIComponent(rest.join("="));
  }
  return null;
}

export function currentUser(request: Request): User | null {
  const id = request.headers.get(USER_HEADER) ?? readCookie(request, SESSION_COOKIE);
  return id ? store.getUser(id) : null;
}

export function requireUser(request: Request): User {
  const user = currentUser(request);
  if (!user) throw new StoreError(401, "unauthenticated", "Sign in to continue");
  return user;
}

export function setSessionCookie(response: NextResponse, userId: string): void {
  response.cookies.set({ name: SESSION_COOKIE, value: userId, httpOnly: true, sameSite: "lax", path: "/" });
}

export function clearSessionCookie(response: NextResponse): void {
  response.cookies.set({ name: SESSION_COOKIE, value: "", maxAge: 0, path: "/" });
}
