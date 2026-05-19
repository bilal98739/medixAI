import { NextResponse } from "next/server";

export function successResponse<T>(data: T, message = "Success", status = 200) {
  return NextResponse.json({ success: true, message, data }, { status });
}

export function errorResponse(message: string, status = 400, error?: unknown) {
  const errorMessage =
    error instanceof Error ? error.message : "An unexpected error occurred";
  return NextResponse.json(
    { success: false, message, error: errorMessage },
    { status }
  );
}

export function unauthorizedResponse(message = "Unauthorized") {
  return NextResponse.json({ success: false, message }, { status: 401 });
}

export function forbiddenResponse(message = "Forbidden") {
  return NextResponse.json({ success: false, message }, { status: 403 });
}

export function notFoundResponse(message = "Not found") {
  return NextResponse.json({ success: false, message }, { status: 404 });
}
