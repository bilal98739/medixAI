import { NextRequest } from "next/server";
import { verifyToken, JWTPayload } from "@/lib/jwt";
import { COOKIE_NAME } from "@/constants";
import { unauthorizedResponse, forbiddenResponse } from "@/lib/apiResponse";

export async function getAuthUser(request: NextRequest): Promise<JWTPayload | null> {
  // First try headers (set by middleware)
  const userId = request.headers.get("x-user-id");
  const email = request.headers.get("x-user-email");
  const role = request.headers.get("x-user-role");

  if (userId && email && role) {
    return { userId, email, role };
  }

  // Fallback: verify token from cookie
  const token = request.cookies.get(COOKIE_NAME)?.value;
  if (!token) return null;

  try {
    return await verifyToken(token);
  } catch {
    return null;
  }
}

export async function requireAuth(request: NextRequest) {
  const user = await getAuthUser(request);
  if (!user) return { error: unauthorizedResponse(), user: null };
  return { error: null, user };
}

export async function requireRole(request: NextRequest, ...roles: string[]) {
  const { error, user } = await requireAuth(request);
  if (error) return { error, user: null };
  if (!roles.includes(user!.role)) {
    return { error: forbiddenResponse("Insufficient permissions"), user: null };
  }
  return { error: null, user };
}
