<<<<<<< HEAD
# 🏥 MedixAI — Smart Hospital Management System

<div align="center">

![MedixAI Banner](https://img.shields.io/badge/MedixAI-Smart%20Hospital%20Management-2563EB?style=for-the-badge&logo=activity&logoColor=white)

[![Next.js](https://img.shields.io/badge/Next.js-15-black?style=flat-square&logo=next.js)](https://nextjs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-blue?style=flat-square&logo=typescript)](https://typescriptlang.org)
[![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-green?style=flat-square&logo=mongodb)](https://mongodb.com)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-CSS-38bdf8?style=flat-square&logo=tailwindcss)](https://tailwindcss.com)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=flat-square)](LICENSE)

**Enterprise-grade healthcare SaaS platform with AI-ready architecture**

[Features](#-features) · [Tech Stack](#-tech-stack) · [Quick Start](#-quick-start) · [Architecture](#-architecture) · [API Docs](#-api-documentation) · [Deployment](#-deployment)

</div>

---

## 📸 Overview

MedixAI is a production-ready **Smart Hospital Management System** built with Next.js 15 App Router, TypeScript, MongoDB, and Tailwind CSS. It provides a complete workflow for patients, doctors, and administrators with modern UI/UX and a scalable, AI-ready architecture.

### 🎯 What it does

| Role | Capabilities |
|------|-------------|
| **Patient** | Register, book appointments, view doctors, track history, manage profile |
| **Doctor** | Accept/reject appointments, manage schedule, view patients, write prescriptions |
| **Admin** | Full system oversight, analytics, user management, activity logs |

---

## ✨ Features

### 🔐 Authentication & Security
- JWT authentication with HTTP-only secure cookies
- Role-based access control (Patient / Doctor / Admin)
- Bcrypt password hashing (12 rounds)
- Middleware-level route protection
- Forgot/reset password via email tokens

### 📅 Appointment System
- Real-time availability calendar
- Time slot selection with conflict detection
- Status workflow: Pending → Confirmed → Completed / Rejected / Cancelled
- Doctor notes & prescription system
- Automated email + in-app notifications

### 🩺 Doctor Module
- Rich profile: specialization, qualifications, experience, bio, fee
- Working hours & available days configuration
- Appointment management dashboard with accept/reject/complete actions

### 👤 Patient Module
- Complete profile with medical history, allergies, emergency contacts
- Browse & filter doctors by specialization
- Book appointments with date/time picker
- Full appointment history

### 🏢 Admin Module
- Analytics dashboard with revenue charts (Recharts)
- System-wide user and appointment management
- Monthly trends visualization

### 🔔 Notification System
- In-app notifications with unread counts
- Email notifications via Nodemailer
- Notification types: booking, confirmed, cancelled, completed, system alerts

### 🧠 AI-Ready Architecture
- `services/ai/` scaffold with typed interfaces
- Placeholder hooks for: Symptom Checker, Report Analyzer, Diagnosis AI, OCR, Chatbot
- Drop-in ready for OpenAI, Anthropic, or custom LLM providers

---

## 🛠 Tech Stack

### Frontend
| Technology | Version | Purpose |
|-----------|---------|---------|
| Next.js | 15.1 | Full-stack React framework (App Router) |
| React | 19 | UI library |
| TypeScript | 5.7 | Type safety |
| Tailwind CSS | 3.4 | Utility-first styling |
| Framer Motion | 11 | Animations |
| Lucide React | 0.469 | Icon library |
| Recharts | 2.15 | Analytics charts |

### Backend
| Technology | Version | Purpose |
|-----------|---------|---------|
| Next.js Route Handlers | 15.1 | REST API endpoints |
| Mongoose | 8.9 | MongoDB ODM |
| JWT | 9.0 | Authentication tokens |
| Bcryptjs | 2.4 | Password hashing |
| Zod | 3.24 | Schema validation |
| Nodemailer | 6.9 | Email service |

### Infrastructure
| Service | Purpose |
|---------|---------|
| MongoDB Atlas | Cloud database |
| Cloudinary | Image/media storage |
| Vercel | Deployment platform |

---

## 🚀 Quick Start

### Prerequisites

- Node.js 18.17+
- npm / yarn / pnpm
- MongoDB Atlas account
- Cloudinary account (for image uploads)
- Gmail App Password (for email)

### 1. Clone & Install

```bash
git clone https://github.com/yourusername/medixai.git
cd medixai
npm install
```

### 2. Configure Environment

```bash
cp .env.example .env.local
```

Fill in your `.env.local`:

```env
# App
NEXT_PUBLIC_APP_URL=http://localhost:3000

# MongoDB Atlas
MONGODB_URI=mongodb+srv://<user>:<password>@cluster.mongodb.net/medixai

# JWT (generate a strong random string)
JWT_SECRET=your_super_secret_32_character_key
JWT_EXPIRES_IN=7d

# Cloudinary
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Email (Gmail)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your@gmail.com
SMTP_PASS=your_app_password
EMAIL_FROM=noreply@medixai.com

# Security
BCRYPT_ROUNDS=12
```

### 3. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

### 4. Demo Accounts

Seed the database with demo accounts using the API or create them through the signup page:

| Role | Email | Password |
|------|-------|----------|
| Patient | patient@demo.com | Demo1234 |
| Doctor | doctor@demo.com | Demo1234 |
| Admin | admin@demo.com | Demo1234 |

---

## 📂 Project Structure

```
medixai/
├── app/                          # Next.js App Router
│   ├── (auth)/                   # Auth pages (login, signup, etc.)
│   ├── api/                      # REST API endpoints
│   │   ├── auth/                 # Authentication routes
│   │   ├── appointments/         # Appointment CRUD
│   │   ├── doctors/              # Doctor listing & profiles
│   │   ├── notifications/        # Notification system
│   │   └── users/                # User management & analytics
│   ├── appointments/             # Appointment pages
│   ├── dashboard/                # Role-specific dashboards
│   │   ├── patient/
│   │   ├── doctor/
│   │   └── admin/
│   ├── doctors/                  # Doctor listing & booking
│   ├── notifications/            # Notification center
│   ├── profile/                  # User profile
│   └── settings/                 # Account settings
│
├── components/                   # Reusable UI components
├── constants/                    # App-wide constants
├── hooks/                        # Custom React hooks
├── lib/                          # Utilities & connections
│   ├── mongodb.ts                # DB connection (connection pooling)
│   ├── jwt.ts                    # JWT sign/verify
│   ├── email.ts                  # Email templates & sender
│   ├── cloudinary.ts             # Image upload
│   └── apiResponse.ts            # Standardized API responses
├── middleware/                   # Auth middleware helpers
├── middleware.ts                 # Next.js edge middleware (route guards)
├── models/                       # Mongoose schemas
│   ├── User.ts
│   ├── DoctorProfile.ts
│   ├── PatientProfile.ts
│   ├── Appointment.ts
│   └── Notification.ts
├── services/
│   └── ai/                       # 🧠 AI-ready service layer (scaffold)
├── store/                        # Zustand state management
├── types/                        # TypeScript type definitions
├── utils/                        # Helper functions
└── validations/                  # Zod schemas
```

---

## 📡 API Documentation

### Auth

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| `POST` | `/api/auth/signup` | Register new user | ❌ |
| `POST` | `/api/auth/login` | Login | ❌ |
| `POST` | `/api/auth/logout` | Logout (clear cookie) | ✅ |
| `GET` | `/api/auth/me` | Get current user | ✅ |
| `POST` | `/api/auth/forgot-password` | Send reset email | ❌ |
| `POST` | `/api/auth/reset-password` | Reset password with token | ❌ |

### Appointments

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| `GET` | `/api/appointments` | List appointments (role-filtered) | ✅ |
| `POST` | `/api/appointments` | Book appointment | Patient |
| `GET` | `/api/appointments/:id` | Get appointment detail | ✅ |
| `PATCH` | `/api/appointments/:id` | Update status/notes | ✅ |

### Doctors

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| `GET` | `/api/doctors` | List doctors (with filter) | ❌ |
| `GET` | `/api/doctors/:id` | Doctor detail | ❌ |

### Users (Admin)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| `GET` | `/api/users` | List all users | Admin |
| `PATCH` | `/api/users/me` | Update own profile | ✅ |
| `GET` | `/api/users/analytics` | Dashboard analytics | Admin |

### Notifications

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| `GET` | `/api/notifications` | Get notifications | ✅ |
| `PATCH` | `/api/notifications` | Mark all as read | ✅ |

---

## 🗄 Database Models

### User
```typescript
{ name, email, password (hashed), role, avatar, phone, isActive, isVerified }
```

### DoctorProfile
```typescript
{ userId, specialization, qualifications[], experience, bio, consultationFee,
  rating, totalReviews, availableDays[], workingHours, isAvailable }
```

### PatientProfile
```typescript
{ userId, dateOfBirth, gender, bloodGroup, address, emergencyContact,
  medicalHistory[], allergies[] }
```

### Appointment
```typescript
{ patientId, doctorId, doctorProfileId, date, timeSlot, status,
  reason, notes, prescription, fee }
```

### Notification
```typescript
{ userId, type, title, message, isRead, data }
```

---

## 🧠 AI Integration (Future)

The `services/ai/` directory contains typed interfaces ready for AI integration:

```typescript
// Drop in your AI provider:
import { checkSymptoms, analyzeReport, chatbotResponse } from "@/services/ai";

// Symptom Checker
const result = await checkSymptoms({ symptoms, age, gender, medicalHistory });

// Report Analyzer
const analysis = await analyzeReport({ reportText, reportType: "blood_test" });

// AI Chatbot
const response = await chatbotResponse(message, context);
```

Planned integrations:
- **Chatbot** — Patient support via OpenAI / Anthropic
- **Symptom Checker** — LLM-powered triage
- **Report Analyzer** — OCR + NLP for medical documents
- **Diagnosis Assistant** — AI-aided clinical decision support

---

## ☁️ Deployment

### Vercel (Recommended)

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod
```

Add all environment variables in the Vercel dashboard under **Project → Settings → Environment Variables**.

### Environment Checklist

- [ ] `MONGODB_URI` — MongoDB Atlas connection string
- [ ] `JWT_SECRET` — Strong random string (32+ chars)
- [ ] `CLOUDINARY_*` — Cloud name, API key, API secret
- [ ] `SMTP_*` — Email credentials
- [ ] `NEXT_PUBLIC_APP_URL` — Production URL

---

## 🔒 Security Notes

- Passwords hashed with bcrypt (12 rounds)
- JWT stored in HTTP-only cookies (not localStorage)
- Role-based middleware on all protected routes
- Input validation with Zod on all API endpoints
- API responses never expose password fields
- Reset tokens are SHA-256 hashed in the database
- Env variables never committed to version control

---

## 📋 Roadmap

- [x] Core auth system (JWT + cookies)
- [x] Patient, Doctor, Admin dashboards
- [x] Appointment booking & management
- [x] Notification system
- [x] Analytics dashboard
- [x] AI-ready service layer
- [ ] AI Symptom Checker
- [ ] AI Report Analyzer
- [ ] Video consultations (WebRTC)
- [ ] Payment gateway integration
- [ ] Mobile app (React Native)
- [ ] Multi-language support (i18n)

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/ai-chatbot`)
3. Commit changes (`git commit -m 'Add AI chatbot integration'`)
4. Push to branch (`git push origin feature/ai-chatbot`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License — see the [LICENSE](LICENSE) file for details.

---

<div align="center">

Built with ❤️ for the healthcare industry

**[⬆ Back to top](#-medixai--smart-hospital-management-system)**

</div>
=======
# medixAI
>>>>>>> 48505bbc91477c71f18134598dc5b2fe15aa3b9e
