import { NextRequest } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { User } from "@/models/User";
import { forgotPasswordSchema } from "@/validations";
import { successResponse, errorResponse } from "@/lib/apiResponse";
import { sendEmail, resetPasswordEmail } from "@/lib/email";
import { generateRandomToken } from "@/utils";
import crypto from "crypto";

export async function POST(request: NextRequest) {
  try {
    await connectDB();

    const body = await request.json();
    const parsed = forgotPasswordSchema.safeParse(body);
    if (!parsed.success) return errorResponse(parsed.error.errors[0].message, 400);

    const { email } = parsed.data;
    const user = await User.findOne({ email, isActive: true }).select(
      "+resetPasswordToken +resetPasswordExpires"
    );

    // Always return success to prevent email enumeration
    if (!user) {
      return successResponse(null, "If this email exists, a reset link has been sent.");
    }

    const token = generateRandomToken(32);
    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

    user.resetPasswordToken = hashedToken;
    user.resetPasswordExpires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
    await user.save({ validateBeforeSave: false });

    const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL}/reset-password?token=${token}`;

    await sendEmail({
      to: user.email,
      subject: "Reset your MedixAI password",
      html: resetPasswordEmail(user.name, resetUrl),
    });

    return successResponse(null, "If this email exists, a reset link has been sent.");
  } catch (error) {
    return errorResponse("Failed to process request", 500, error);
  }
}
