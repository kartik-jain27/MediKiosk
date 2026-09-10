# MediKiosk

MediKiosk is a clinical intake and health-data orchestration prototype for the clinical first mile: the time between a patient's arrival and their consultation. It helps staff structure patient information, guide a controlled interview, surface urgent symptoms, process documents, and route a physician-reviewable summary to the assigned doctor.

It is **not an autonomous AI doctor**. A clinician reviews, edits, diagnoses, and approves the final record.

## Current Demo Workflow

1. A staff member registers or signs in.
2. Staff registers a patient and creates a short MediKiosk ID (`PT-XXXXXX`).
3. Staff looks up that ID and launches the patient into the existing consent, department, and interview flow.
4. The interview collects structured answers across nine stages, supporting General and AYUSH modes.
5. Red-flag responses open an urgent-alert screen before the interview continues.
6. The patient may upload a report or prescription; the document screen shows OCR processing status.
7. A structured summary is generated and becomes available for staff assignment.
8. Staff saves/selects an in-hospital doctor and sends the completed intake to that doctor's queue.
9. The doctor reviews the timeline and summary, edits sections, adds a diagnosis, optionally selects an attachment, and approves the record.

## Features

- Bilingual public information page: English and Hindi.
- Staff-only patient registration and intake launch.
- Staff, patient, and doctor readable IDs for the demo.
- Controlled interview state flow: chief complaint, HPI, medical/surgical history, medication, allergies, family/personal history, and review of systems.
- General Clinical and AYUSH department modes.
- Browser speech input and text-to-speech where the browser supports Web Speech APIs.
- Red-flag triage alert handling.
- Image/PDF document upload with OCR loading states.
- Medical timeline and editable doctor summary.
- Staff-to-doctor assignment, doctor queue, diagnosis, and approval state.
- Shared header/footer, role-aware routes, and leave-intake confirmation.

## Tech Stack

- React 18 + TypeScript
- Vite 6
- React Router 6
- Zustand with persistence
- Axios
- MSW for the local mock API
- i18next / react-i18next
- React Hook Form + Zod
- Framer Motion
- Tailwind CSS integration with project CSS

## Getting Started

### Requirements

- Node.js 20 or newer
- npm

### Install and run

```bash
npm install
cp .env.example .env.local
npm run dev
```

Open the URL printed by Vite, normally `http://localhost:5173/kiosk`.

### Validation

```bash
npm run build
npm run lint
npm test
```

## Routes

| Route | Access | Purpose |
|---|---|---|
| `/kiosk` | Public | Bilingual MediKiosk information page |
| `/staff/register` | Public | Create a staff demo profile |
| `/staff/login` | Public | Sign in using email and Staff ID |
| `/staff/dashboard` | Staff | Register patients, start intake, save doctors, assign summaries |
| `/kiosk/consent` | Active staff intake | Consent collection |
| `/kiosk/mode-select` | Active staff intake | Select General or AYUSH department |
| `/kiosk/interview` | Active staff intake | Controlled intake interview |
| `/kiosk/alert` | Active staff intake | Red-flag escalation screen |
| `/kiosk/documents` | Active staff intake | Document upload and OCR status |
| `/kiosk/complete` | Active staff intake | Completion state and summary reference |
| `/doctor/access` | Public | Choose doctor login or registration |
| `/doctor/register` | Public | Create a doctor demo profile |
| `/doctor/login` | Public | Sign in using email and Doctor ID |
| `/doctor/queue` | Doctor | Assigned intake queue |
| `/doctor/summary/:patientId` | Assigned doctor | Summary, timeline, diagnosis, approval |

## Frontend Structure

```text
src/
  apps/
    kiosk/        Patient-facing information and intake screens
    staff/        Staff registration, login, patient registry, handoff
    doctor/       Doctor access, queue, review, diagnosis, approval
    shared/       Site frame, role guards, doctor search
  hooks/          Browser voice input and text-to-speech
  lib/
    api/          Axios client and MSW mock handlers
    i18n/         English and Hindi translations
    stores/       Zustand session, auth, registry, directory, queue state
  types/          Shared API and role/domain TypeScript contracts
  App.tsx         Route definitions
  main.tsx        App bootstrap and optional MSW startup
```

## Environment

Copy `.env.example` to `.env.local`.

```env
VITE_API_BASE_URL=/api
VITE_ENABLE_MSW=true
VITE_DEMO_MODE=true
VITE_INSTITUTE_NAME=All India Institute of Ayurveda (AIIA)
VITE_TERMINAL_LABEL=Smart OPD Kiosk Terminal #03
```

For a real backend:

```env
VITE_API_BASE_URL=http://localhost:YOUR_BACKEND_PORT/api
VITE_ENABLE_MSW=false
VITE_DEMO_MODE=false
```

Restart Vite after changing environment variables.

## API Integration

All current HTTP calls are centralised in `src/lib/api/client.ts`. The mock implementation in `src/lib/api/mocks/handlers.ts` is the current frontend contract.

| Method | Endpoint | Frontend use |
|---|---|---|
| `POST` | `/patients` | Create an intake patient |
| `GET` | `/patients/:id` | Read patient details |
| `POST` | `/patients/:id/consent` | Grant a consent type |
| `PATCH` | `/consent/:id/revoke` | Revoke consent |
| `POST` | `/interviews` | Start the backend interview state machine |
| `GET` | `/interviews/:id/next-question` | Retrieve current question |
| `POST` | `/interviews/:id/answer` | Submit answer, receive next question/red flag |
| `GET` | `/triage/alerts` | Retrieve active alerts |
| `POST` | `/triage/alerts/:id/acknowledge` | Acknowledge an alert |
| `POST` | `/documents/upload` | Upload image/PDF |
| `GET` | `/documents/:id/status` | Poll OCR/document processing status |
| `GET` | `/patients/:id/timeline` | Read patient timeline |
| `POST` | `/summaries/generate` | Generate structured summary |
| `GET` | `/staff/assignments` | Completed intakes awaiting staff assignment |
| `GET` | `/doctor/patients/:patientId/summary` | Load summary for doctor review |
| `PATCH` | `/summary/:id` | Persist an edited summary section |
| `POST` | `/summary/:id/approve` | Approve and lock summary |

Shared request and response interfaces are in `src/types/api.ts` and `src/types/rbac.ts`. Keep these types and backend DTOs aligned.

## Mock Mode Boundaries

The UI is ready for integration, but the following are intentionally simulated:

- MSW intercepts `/api/*` while `VITE_ENABLE_MSW=true`.
- OTP, Aadhaar, license, SMS, and email verification are bypassed in test mode.
- Staff/doctor/patient demo IDs are generated in the browser.
- Auth, patient registry, saved doctors, queue assignments, and diagnosis use persisted browser storage.
- The red-flag detector is a small keyword rule for the demo, not clinical intelligence.
- OCR returns a mock processing result after polling.
- Diagnosis attachment selection displays a filename only; no file storage occurs.
- Browser speech support depends on device, browser, microphone permission, and available speech-recognition implementation.

## Backend Handover Checklist

1. Add real role-based authentication and send access tokens/cookies from `api/client.ts`.
2. Replace browser-stored profiles, directory, patient registry, and queue state with backend APIs.
3. Add server-side MediKiosk IDs for patients and public IDs for staff/doctors.
4. Implement secure OTP delivery/verification, expiry, retry limits, and audit logging.
5. Persist the interview state machine, answers, red flags, timelines, summaries, and approvals.
6. Integrate document object storage and an OCR provider.
7. Add doctor-queue assignment and diagnosis/attachment endpoints.
8. Enforce authorization on the backend for every patient, summary, queue, and approval action.
9. Never store Aadhaar, clinical records, or authentication state in browser storage in production.

## Important Notes

- The frontend route guards improve the experience but are not backend security. The backend must enforce role and patient-record access.
- The app is designed as workflow support for clinicians, not a diagnostic or prescription system.
- The current test suite covers interview progression, red-flag detection, and readable ID generation. Add backend integration and end-to-end browser tests when real APIs are connected.

## License

This project currently has no declared license. Add one before public distribution.
