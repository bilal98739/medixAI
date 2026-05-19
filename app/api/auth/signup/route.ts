import { NextRequest } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { User } from "@/models/User";
import { PatientProfile } from "@/models/PatientProfile";
import { DoctorProfile } from "@/models/DoctorProfile";
import { signToken } from "@/lib/jwt";
import { signupSchema } from "@/validations";
import { successResponse, errorResponse } from "@/lib/apiResponse";
import { COOKIE_NAME, COOKIE_MAX_AGE } from "@/constants";

export async function POST(request: NextRequest) {
  try {
    await connectDB();

    const body = await request.json();
    const parsed = signupSchema.safeParse(body);

    if (!parsed.success) {
      return errorResponse(
        parsed.error.errors[0].message,
        400
      );
    }

    const { name, email, password, role, phone } = parsed.data;
    const adminEmail = process.env.ADMIN_EMAIL?.toLowerCase();
    const effectiveRole = adminEmail && email.toLowerCase() === adminEmail ? "admin" : role;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return errorResponse("An account with this email already exists", 409);
    }

    const user = await User.create({ name, email, password, role: effectiveRole, phone });

    // Create role-specific profile
    if (effectiveRole === "patient") {
      await PatientProfile.create({ userId: user._id });
    } else if (effectiveRole === "doctor") {
      await DoctorProfile.create({
        userId: user._id,
        specialization: "General Physician",
        consultationFee: 0,
        qualifications: [],
        availableDays: [],
      });
    }

    const token = await signToken({
      _id: user._id.toString(),
      email: user.email,
      role: user.role,
    });

    const response = successResponse(
      { user, token },
      "Account created successfully",
      201
    );

    response.cookies.set(COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: COOKIE_MAX_AGE,
      path: "/",
    });

    return response;
  } catch (error) {
    return errorResponse("Failed to create account", 500, error);
  }
}
