import { NextResponse } from "next/server";
import { ZodError } from "zod";
import type { ApiErrorBody } from "@/types/domain";
import { simulateLatency } from "./delay";
import { StoreError } from "./store";

const NO_STORE_HEADERS = { "Cache-Control": "no-store" } as const;

export function jsonResponse<T>(body: T, init: { status?: number } = {}): NextResponse {
  return NextResponse.json(body, { status: init.status ?? 200, headers: NO_STORE_HEADERS });
}

export function errorResponse(status: number, body: ApiErrorBody): NextResponse {
  return NextResponse.json(body, { status, headers: NO_STORE_HEADERS });
}

function fieldErrors(error: ZodError): Record<string, string> {
  const fields: Record<string, string> = {};
  for (const issue of error.issues) {
    const key = issue.path.map(String).join(".") || "_";
    if (!(key in fields)) fields[key] = issue.message;
  }
  return fields;
}

/**
 * Wraps a route handler: applies the simulated latency first, then maps
 * validation and store errors to JSON error responses.
 */
export function withApi<Context>(
  handler: (request: Request, context: Context) => Promise<Response> | Response,
): (request: Request, context: Context) => Promise<Response> {
  return async (request, context) => {
    await simulateLatency(request);
    try {
      return await handler(request, context);
    } catch (error) {
      if (error instanceof ZodError) {
        return errorResponse(400, { error: "Validation failed", code: "validation_error", fields: fieldErrors(error) });
      }
      if (error instanceof StoreError) {
        return errorResponse(error.status, { error: error.message, code: error.code, fields: error.fields });
      }
      if (error instanceof SyntaxError) {
        return errorResponse(400, { error: "Request body is not valid JSON", code: "invalid_json" });
      }
      console.error(error);
      return errorResponse(500, { error: "Unexpected server error", code: "internal_error" });
    }
  };
}

export async function readJson(request: Request): Promise<unknown> {
  const text = await request.text();
  if (text.trim() === "") return {};
  return JSON.parse(text);
}
