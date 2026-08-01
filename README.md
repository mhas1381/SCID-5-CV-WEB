# SCID-5-CV-WEB

Frontend application for **Smart SCID-5-CV** — a digital implementation of the Structured Clinical Interview for DSM-5 Disorders, Clinician Version. Bilingual (English/Farsi, RTL) React client for conducting diagnostic interviews.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| **UI** | React 19 + TypeScript + Vite + Tailwind CSS 4 |
| **State/API** | Redux Toolkit (RTK Query) |
| **Routing** | React Router 7 |
| **i18n** | react-i18next (EN/FA, RTL support) |
| **Icons** | lucide-react |
| **Auth** | JWT stored in `localStorage` |

## Project Structure

```
src/
├── pages/            # Landing, Login, Dashboard, Patients, PatientForm,
│                     #   NewInterview, Overview, InterviewSession,
│                     #   InterviewResults, Sessions, Profile
├── store/api/        # RTK Query endpoints (auth, patient, interview, profile, dashboard, location)
├── components/       # UI components (Button, Card, Input, ConfirmDialog, etc.)
├── types/            # TypeScript interfaces
├── locales/          # en.json, fa.json
├── hooks/            # useAppStore, useDirection
└── utils/            # download.ts (PDF download helper), error, cn, etc.
```

## Key Features

### 1. Selected-Module Interviews (`/interview` → `NewInterviewPage`)

The interview creation page lets the clinician choose **only the modules they need** instead of the full SCID-5-CV:

- **Module cards** (A–J) displayed in a 2-column grid, each with a colored code badge and a module icon.
- **Auto-paired toggles**: selecting **A** automatically selects **D** (Mood Episodes ↔ Mood Disorders), and selecting **B** automatically selects **C** (Psychotic Symptoms ↔ Psychotic Disorders Dx) — mirroring the backend pairing rules.
- **Clear selection** button to reset all chosen modules.
- When modules are selected, the session **skips the Overview page** and goes straight to the diagnostic interview at the first selected module. Otherwise the standard Overview flow runs.

The chosen codes are sent to the backend as `modules` on session creation and the session's `selected_module_codes` drives the interview routing.

### 2. Interview Results Page (`/interview/:id/results`)

- **Patient & clinician card** at the top showing patient name, clinician name, session id, session date, and the selected modules (or full interview).
- **View Overview link** to jump back to the patient's background/overview data.
- **Diagnostic results grid** — criteria cards with colored status dots, severity, and per-criterion symptom breakdown.
- **Capsule-style Q&A history** of the answered questions.

### 3. PDF Report Download

- **«Download PDF Report» button** on the results page for completed sessions.
- Download only happens **on click** — the report is generated lazily by the backend on the first request (no background generation).
- `src/utils/download.ts` fetches `GET /api/v1/interviews/sessions/{id}/pdf/` with the JWT, reads the filename from `Content-Disposition`, and saves the blob to disk.
- Errors (e.g., session not completed, permission denied) surface as a toast.

## Routes

| Route | Page | Description |
|-------|------|-------------|
| `/` | LandingPage | Marketing/home |
| `/login` | LoginPage | OTP-based login |
| `/complete-registration` | CompleteRegistrationPage | First-time profile |
| `/set-password` | SetPasswordPage | Password setup |
| `/dashboard` | DashboardPage | Summary with charts |
| `/patients` | PatientsPage | Patient list + detail |
| `/patients/new` | PatientFormPage | Create patient |
| `/patients/:id/edit` | PatientFormPage | Edit patient |
| `/interview` | NewInterviewPage | Create session (with optional module selection) |
| `/interview/:id/overview` | OverviewPage | Overview form |
| `/interview/:id` | InterviewSessionPage | Diagnostic interview |
| `/interview/:id/results` | InterviewResultsPage | Diagnostic results + PDF download |
| `/profile` | ProfilePage | User profile |
| `/sessions` | SessionsListPage | Session history |

## Getting Started

```bash
npm install
npm run dev
```

The app proxies API calls to the backend (see `vite.config.ts`); start the Django server first.

## Backend

See the `Smart-SCID-5-CV` repository for the Django REST API documentation.
