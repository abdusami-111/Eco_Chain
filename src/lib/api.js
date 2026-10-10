import { NextResponse } from "next/server";
import { AuthError } from "@/lib/auth";

export function ok(data, init) {
  return NextResponse.json({ ok: true, data }, init);
}

export function fail(message, status = 400) {
  return NextResponse.json({ ok: false, error: message }, { status });
}

// Wraps a route handler so AuthError and generic errors become clean JSON
// responses instead of raw 500s with stack traces leaking to the client.
export function withApiError(handler) {
  return async (...args) => {
    try {
      return await handler(...args);
    } catch (err) {
      if (err instanceof AuthError) {
        return fail(err.message, err.status);
      }
      console.error(err);
      return fail(err.message || "Internal error", 500);
    }
  };
}
