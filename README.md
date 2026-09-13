# CampusVoice — Privacy-First Student Grievance & Query Management Platform

> **Tagline:** *“Your Voice. Your Privacy. Better Campus.”*

CampusVoice is a full-stack web application designed for universities, colleges, and residential hostels. It enables students to anonymously report problems, complaints, safety emergencies, suggestions, and queries to authorized wardens and management **without revealing their personal student identity**.

---

## 🔐 Core Privacy Architecture: Identity Separation Guarantee

The single most critical architectural requirement of CampusVoice is:

> **«Management, faculty, and wardens must NOT be able to identify which student submitted a complaint.»**

### How It Works Under the Hood:
1. **Decoupled Database Tables:**
   - `profiles`: Contains student names, emails, roll numbers, and contact info.
   - `complaints`: Contains problem categories, descriptions, photos/audio, locations, and random public pseudonyms (e.g. `Anonymous Student #A7F29`) with zero student ID foreign keys.
   - `complaint_identity_map`: An isolated vault table linking complaint IDs to student UUIDs.
2. **PostgreSQL Row Level Security (RLS) Policies:**
   - Students can `SELECT` only their own row in `complaint_identity_map`.
   - **ZERO `SELECT` permissions** are granted to any management role (`warden`, `department_staff`, `admin`, `super_admin`) on `complaint_identity_map`.
   - Even if management queries the database directly or intercepts API responses, the PostgreSQL kernel rejects any attempt to query the identity mapping.
3. **Encrypted Anonymous Two-Way Chat:**
   - Students communicate using real-time WebSockets directly with assigned staff while their messages are branded exclusively as `Anonymous Student #XXXX`.

---

## 🛠️ Technology Stack

- **Frontend:** React 18, Vite, TypeScript, Tailwind CSS
- **Routing:** React Router v6
- **Database & Auth:** Supabase (PostgreSQL, Row Level Security, Realtime WebSockets, Storage)
- **Icons & UI:** Lucide React, Tailwind Merge, Custom Reusable Component System
- **Data Analytics:** Recharts for interactive trend charts, SLA velocity metrics, and problem heatmaps
- **Audio & Media:** Web Audio `MediaRecorder` API for voice notes, audio playback, image zoom modals, and video previews
- **AI Intelligence Layer:** Pluggable AI Service supporting built-in heuristic analysis, Google Gemini API, and OpenAI

---

## 🚀 Getting Started

### 1. Prerequisites
- Node.js (v18 or higher)
- npm or yarn

### 2. Installation
```bash
# Clone the repository
git clone <repo-url>
cd "campusvoice"

# Install dependencies
npm install
```

### 3. Environment Variables
Create a `.env` file in the root directory (refer to `.env.example`):
```env
# Supabase Configuration
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-public-key

# AI Configuration (Optional - Defaults to Heuristic Fallback Engine)
VITE_AI_PROVIDER=heuristic # Options: heuristic | gemini | openai
VITE_GEMINI_API_KEY=
VITE_OPENAI_API_KEY=
```

> **Note:** If Supabase environment variables are omitted, CampusVoice automatically operates in an interactive **Sandbox Demo Mode** with realistic seed records and instant persona switching.

### 4. Database Setup (Supabase)
1. Open your Supabase Project SQL Editor.
2. Run the SQL schema migration file located at:
   `supabase/migrations/20260913000000_campusvoice_schema.sql`
3. (Optional) Run the seed file to populate standard departments and sample grievances:
   `supabase/seed.sql`
4. In Supabase Storage, create a bucket named `complaints`.

### 5. Run Local Development Server
```bash
npm run dev
```
Open `http://localhost:3000` in your browser.

---

## 👥 Role-Based Portals & Access

| Persona / Role | Scope of Access | Dashboard Features |
|---|---|---|
| **Student** | Anonymous submission, my reports, suggestions, privacy center | Multi-step submission form, voice note recorder, duplicate issue detection, two-way anonymous chat, resolution verification rating ($⭐⭐⭐⭐⭐$) |
| **Hostel Warden** | Hostel rooms, water, food, cleanliness, residential safety | Hostel triage table, status transitions, department routing, anonymous chat replies |
| **IT Staff** | Wi-Fi, Ethernet, portal systems, network labs | IT issue queue, turnaround SLA tracking |
| **Maintenance** | Plumbing, electrical, civil repairs, structural hazards | Field task investigation, resolution notes |
| **Admin / Super Admin** | Full institutional authority | System settings, campus problem heatmap, broadcast announcements, security audit logs |

---

## 📁 Project Structure

```
campusvoice/
├── public/
│   ├── _redirects             # SPA routing for Netlify
│   └── favicon.svg
├── supabase/
│   ├── migrations/            # Complete PostgreSQL Schema & RLS
│   └── seed.sql               # Seed data with departments & demo complaints
├── src/
│   ├── components/
│   │   ├── analytics/         # Recharts charts, StatsCard, CampusHeatmap
│   │   ├── chat/              # Realtime anonymous MessageThread & MessageComposer
│   │   ├── common/            # PrivacyBadge, NotificationBell, DemoBanner
│   │   ├── complaints/        # ComplaintCard, ComplaintTable, Timeline, Filters
│   │   ├── layout/            # Navbar, Header, Sidebar, MobileNav, Footer
│   │   ├── media/             # AudioRecorder, AudioPlayer, FileUploader, Previews
│   │   └── ui/                # Button, Card, Modal, Badge, Toast, Skeleton
│   ├── context/               # AuthContext, ToastContext
│   ├── hooks/                 # useAuth, useToast, useMediaRecorder
│   ├── lib/                   # Supabase client, utils, constants
│   ├── pages/
│   │   ├── student/           # StudentDashboard, CreateComplaint, EmergencyReport, PrivacyCenter...
│   │   ├── management/        # ManagementDashboard, ComplaintsList, Analytics, AuditLogs...
│   │   ├── Landing.tsx
│   │   ├── Login.tsx
│   │   └── Register.tsx
│   ├── routes/                # ProtectedRoute, AppRoutes
│   ├── services/
│   │   ├── ai/                # AI service with Heuristic & Gemini providers
│   │   └── supabase/          # Complaint, Message, Suggestion, Storage services
│   └── types/                 # TypeScript interfaces and database schemas
├── package.json
├── tailwind.config.js
├── vite.config.ts
└── vercel.json                # SPA rewrites for Vercel
```

---

## 🌐 Production Build & Deployment

To build for production:
```bash
npm run build
```

- **Vercel:** Works out of the box using `vercel.json` rewrite configuration.
- **Netlify:** Works out of the box using `public/_redirects`.
