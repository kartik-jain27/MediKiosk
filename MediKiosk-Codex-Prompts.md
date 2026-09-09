# MediKiosk Frontend — Scoped Codex Prompt Sequence

Use these one at a time, in order. Read and skim what Codex generates before running the next prompt — each one builds on the last, and if you don't understand step 2 you won't be able to debug step 5. Paste each prompt as-is (or edit specifics like your patient identifiers if they differ).

---

## Prompt 1 — Project Skeleton + Mocking Setup
*(Day 1 morning)*

```
Set up a React + TypeScript + Vite project for a hospital kiosk system called MediKiosk.

Requirements:
- Tailwind CSS + shadcn/ui installed and configured
- React Router v6 with two top-level route groups: /kiosk/* (patient-facing) and /doctor/* (doctor review)
- Zustand for a sessionStore holding: sessionId, language, consentGiven, currentQuestion, interviewProgress
- TanStack Query configured for server state
- MSW (Mock Service Worker) set up with a mock handler for these endpoints, returning realistic fake data:
  - POST /api/interview/start -> { sessionId, question: { id, text, type, options? } }
  - POST /api/interview/:sessionId/answer -> { nextQuestion, redFlag?, progress }
  - POST /api/documents/upload -> { documentId, status, extractedData? }
  - GET /api/summary/:sessionId -> { summary: {...}, documents: [...] }
  - PATCH /api/summary/:sessionId
  - POST /api/summary/:sessionId/approve

Question type union: "free_text" | "multiple_choice" | "scale" | "yes_no"

Set up the folder structure:
src/apps/kiosk/screens/, src/apps/kiosk/components/, src/apps/doctor/screens/, src/apps/doctor/components/, src/lib/api/, src/lib/api/mocks/, src/lib/stores/, src/lib/i18n/, src/hooks/, src/types/

Create empty placeholder screen components for: LanguageSelect, Consent, Register, Interview, DocumentUpload, RedFlagAlert, Complete (kiosk) and Login, Queue, SummaryDetail (doctor), wired into the router but not yet implemented.

Do not implement any screen logic yet — just the skeleton, routing, mocking, and state setup working end to end (app should run and navigate between empty placeholder screens).
```

---

## Prompt 2 — Language, Consent, Register Screens
*(Day 1 afternoon)*

```
In this MediKiosk project, implement three kiosk screens: LanguageSelect, Consent, and Register.

LanguageSelect:
- Full-screen, large tap targets (min 56px height), minimum English and Hindi as options
- Selecting a language sets it in sessionStore and navigates to /kiosk/consent
- Use i18next + react-i18next; create en.json and hi.json translation files with keys for all UI text used across the kiosk app so far (not just this screen — set up the i18n scaffold properly)

Consent:
- Plain-language explanation of what data is collected: history collection, document processing, data sharing
- Checkboxes per consent type, not one blanket checkbox
- An expandable "what does this mean" section per item
- Store consent state (type, status, timestamp) in sessionStore
- Continue button disabled until required consents are checked
- Navigates to /kiosk/register

Register:
- Minimal fields: name, phone number (or a stub "Link ABHA ID" button that does nothing yet but is visually present)
- Large touch-friendly inputs, on-screen keyboard friendly (avoid tiny inputs)
- On submit, calls POST /api/interview/start (mocked) with patientId, language, mode: "general", stores sessionId and first question in sessionStore, navigates to /kiosk/interview

This is a public kiosk used by patients who may be elderly or low-literacy: large text (18px+ base), high contrast, no jargon in any copy.
```

---

## Prompt 3 — Interview Screen (Voice + Touch)
*(Day 2 — this is the most important screen in the whole project)*

```
Implement the Interview screen for MediKiosk. This is the core conversational clinical intake screen and needs to feel polished — it's the centerpiece of the demo.

Requirements:
- A single reusable QuestionRenderer component driven entirely by the `type` field on the current question object from sessionStore — do not hardcode per-question UI:
  - "multiple_choice" -> render tappable option buttons (from question.options)
  - "free_text" -> render a mic button + text input, either can produce the answer
  - "scale" -> render a numeric slider/picker (e.g. pain 1-10)
  - "yes_no" -> render two large Yes/No buttons
- Voice input: use the Web Speech API (SpeechRecognition), wrapped via a useVoiceInput hook. Tapping the mic button starts listening, transcribes speech to the free_text input or matches against multiple_choice options if close enough, and shows a listening indicator.
- Voice output (TTS): use window.speechSynthesis via a useTextToSpeech hook. Auto-read each new question aloud when it appears, with a manual "Replay" button.
- On answer submit, call POST /api/interview/:sessionId/answer (mocked), update sessionStore with nextQuestion and progress, and if redFlag.triggered is true, navigate to /kiosk/alert instead of the next question.
- Show a progress bar/indicator ("Step X of Y") using the progress field from the API response.
- If nextQuestion is null, navigate to /kiosk/document-upload.
- Smooth transition between questions using Framer Motion — one clean transition, not per-element animation.

Every question must be answerable by touch alone even when voice is available — voice is additive, never required.
```

---

## Prompt 4 — Red Flag Alert Screen
*(Day 2, right after Interview)*

```
Implement the RedFlagAlert screen for MediKiosk.

This is a full-screen interrupt shown when the interview API returns redFlag.triggered = true (e.g. patient reports chest pain + difficulty breathing).

Requirements:
- Full-screen, high-contrast (not relying on color alone — use icon + bold text + color)
- Show the redFlag.message and severity ("high" | "critical") clearly
- Clear instruction copy: e.g. "Please proceed to the priority desk immediately" — plain language, no jargon, not written like a system log
- A "Continue" button that still allows the interview to be resumed/completed afterward if appropriate (don't dead-end the flow — confirm this UX choice makes sense once you see the real backend behavior, but build it as resumable for now)
- This screen should feel serious but not panic-inducing — steady, clear, actionable tone

Keep this screen decoupled from the Interview screen's internals — it should just read redFlag data passed via sessionStore or route state.
```

---

## Prompt 5 — Document Upload Screen
*(Day 3)*

```
Implement the DocumentUpload screen for MediKiosk.

Requirements:
- Two input methods: camera capture (react-webcam or <input type="file" capture="environment">) and file upload from device
- Support uploading a printed lab report or prescription image
- On upload, call POST /api/documents/upload (mocked, multipart) and show a processing state while status is "processing", then show extractedData once status is "done" (poll or use the mocked response directly for demo purposes)
- Let the patient skip this step if they have no documents ("Continue without documents" button)
- Show a simple before/after: uploaded image thumbnail alongside extracted text/fields once processing completes
- On continue, navigate to /kiosk/complete

Keep this screen simple — this is explicitly a secondary feature in our plan, not the centerpiece. Don't over-build document annotation or editing here.
```

---

## Prompt 6 — Doctor Review App (Queue + Summary)
*(Day 3–4)*

```
Implement the Doctor Review app for MediKiosk: Login, Queue, and SummaryDetail screens. This is a desktop-oriented app, not kiosk-styled — normal density, standard input sizes, no kiosk large-touch-target styling.

Login:
- Simple email/password form, no real auth needed for the demo — accept any input and set a doctor session flag, navigate to /doctor/queue

Queue:
- List of completed interview sessions awaiting review (mocked list), each showing patient name, chief complaint, timestamp, and a red-flag indicator badge if that session had one
- Clicking a row navigates to /doctor/summary/:id

SummaryDetail:
- Fetch GET /api/summary/:sessionId (mocked)
- Render the structured summary in clearly labeled sections: Chief Complaint, HPI, Past Medical History, Past Surgical History, Medications, Allergies, Family History, Personal History, Review of Systems, Prior Investigations
- Show a red flag banner at the top if this session had one triggered
- Show attached documents (from the earlier OCR step) with extracted text shown side-by-side with the original image thumbnail
- Every section is inline-editable; unreviewed sections show an "AI-generated, please verify" badge that disappears once edited or approved
- Edits call PATCH /api/summary/:sessionId per section (debounced, not on every keystroke)
- An "Approve" button calls POST /api/summary/:sessionId/approve, locks the summary from further editing, and shows a confirmation state

This screen is the payoff of the whole system for the doctor's perspective — it should look and feel like a clinical document, not a chat log.
```

---

## Prompt 7 — Integration Polish + Accessibility Pass
*(Day 4, after wiring to the real backend)*

```
Do a pass across the whole MediKiosk frontend (kiosk + doctor apps) for the following, without changing core functionality:

1. Replace the MSW base URL with a real API base URL from an environment variable (VITE_API_BASE_URL), keeping MSW available behind a flag for offline demo fallback in case the live backend has issues during presentation
2. Accessibility: verify color contrast meets WCAG AA on all kiosk screens, all interactive elements have visible keyboard focus states, all buttons have accessible labels (important for the mic button and icon-only buttons)
3. Responsive check: kiosk app should look correct on the actual kiosk screen resolution (tell me if you don't know it, I'll provide it), doctor app should work on a standard laptop screen
4. Add a graceful error/loading state to every screen that calls the API (network failure, slow response) — don't leave any screen with no feedback while waiting
5. Add a simple session timeout: if no interaction on /kiosk/interview for 90 seconds, show a "Are you still there?" prompt before resetting to /kiosk/language

Don't add any new features beyond what's listed above.
```

---

## Notes for you, not for Codex

- After Prompts 1–2, you should be able to click through the whole kiosk flow with mocked data even with zero backend integration — demo this to your team early so everyone's confident the flow works before backend endpoints are even ready.
- Prompt 3 (Interview screen) is the one worth actually reading line-by-line — it's the centerpiece a judge is most likely to ask you to explain.
- Swap MSW for real endpoints incrementally, not all at once — confirm each endpoint against your teammate's actual response shape as it becomes available, since the mocked contract in Prompt 1 is a draft, not gospel.
- AYUSH mode and ABDM adapter UI were marked P1/P2 in the backend plan — there's no prompt for them here on purpose. Only add them after Prompts 1–7 are solid and demo-ready, and only if time remains.
