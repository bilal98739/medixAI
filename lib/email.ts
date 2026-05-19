import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT),
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
}

export async function sendEmail({ to, subject, html }: EmailOptions) {
  await transporter.sendMail({
    from: `"MedixAI" <${process.env.EMAIL_FROM}>`,
    to,
    subject,
    html,
  });
}

export function resetPasswordEmail(name: string, resetUrl: string) {
  return `
    <div style="font-family:Arial,sans-serif;max-width:600px;margin:auto;padding:20px">
      <div style="background:linear-gradient(135deg,#2563EB,#4F46E5);padding:30px;border-radius:12px;text-align:center">
        <h1 style="color:white;margin:0">MedixAI</h1>
        <p style="color:rgba(255,255,255,0.8);margin:8px 0 0">Smart Hospital Management</p>
      </div>
      <div style="padding:30px;background:#f9fafb;border-radius:0 0 12px 12px">
        <h2 style="color:#1f2937">Reset Your Password</h2>
        <p style="color:#6b7280">Hi ${name}, click the button below to reset your password. This link expires in 1 hour.</p>
        <a href="${resetUrl}" style="display:inline-block;background:#2563EB;color:white;padding:14px 28px;border-radius:8px;text-decoration:none;font-weight:600;margin:20px 0">Reset Password</a>
        <p style="color:#9ca3af;font-size:12px">If you didn't request this, please ignore this email.</p>
      </div>
    </div>
  `;
}

export function appointmentConfirmationEmail(
  patientName: string,
  doctorName: string,
  date: string,
  timeSlot: string
) {
  return `
    <div style="font-family:Arial,sans-serif;max-width:600px;margin:auto;padding:20px">
      <div style="background:linear-gradient(135deg,#059669,#0891B2);padding:30px;border-radius:12px;text-align:center">
        <h1 style="color:white;margin:0">MedixAI</h1>
      </div>
      <div style="padding:30px;background:#f9fafb;border-radius:0 0 12px 12px">
        <h2 style="color:#1f2937">Appointment Confirmed ✓</h2>
        <p style="color:#6b7280">Hi ${patientName}, your appointment has been confirmed.</p>
        <div style="background:white;border-radius:8px;padding:20px;border:1px solid #e5e7eb">
          <p><strong>Doctor:</strong> Dr. ${doctorName}</p>
          <p><strong>Date:</strong> ${date}</p>
          <p><strong>Time:</strong> ${timeSlot}</p>
        </div>
      </div>
    </div>
  `;
}
