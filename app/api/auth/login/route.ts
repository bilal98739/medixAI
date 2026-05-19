import { NextRequest } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { User } from "@/models/User";
import { signToken } from "@/lib/jwt";
import { loginSchema } from "@/validations";
import { successResponse, errorResponse } from "@/lib/apiResponse";
import { COOKIE_NAME, COOKIE_MAX_AGE } from "@/constants";

export async function POST(request: NextRequest) {
  try {
    await connectDB();

    const body = await request.json();
    const parsed = loginSchema.safeParse(body);

    if (!parsed.success) {
      return errorResponse(parsed.error.errors[0].message, 400);
    }

    const { email, password } = parsed.data;

    const user = await User.findOne({ email, isActive: true }).select("+password");
    if (!user) {
      return errorResponse("Invalid email or password", 401);
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return errorResponse("Invalid email or password", 401);
    }

    const token = await signToken({
      _id: user._id.toString(),
      email: user.email,
      role: user.role,
    });

    // Remove password from response
    const userObj = user.toJSON();

    const response = successResponse({ user: userObj, token }, "Login successful");

    response.cookies.set(COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: COOKIE_MAX_AGE,
      path: "/",
    });

    return response;
  } catch (error) {
    return errorResponse("Login failed", 500, error);
  }
}
