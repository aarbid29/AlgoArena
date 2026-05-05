<div align="center">

<h1>AlgoArena</h1>

<p align="center">
  <strong>A real-time mock technical interview platform with live video, collaborative code editing, and structured candidate evaluation.</strong>
</p>

<p align="center">
  <a href="https://algo-arena-livid.vercel.app/">
    <img src="https://img.shields.io/badge/Live%20Demo-View%20App-6366f1?style=for-the-badge&logo=vercel&logoColor=white" alt="Live Demo"/>
  </a>
</p>

<br/>

<p align="center">
  <a href="https://nextjs.org"><img src="https://img.shields.io/badge/Next.js%2014-black?style=flat-square&logo=next.js&logoColor=white"/></a>
  <a href="https://www.typescriptlang.org"><img src="https://img.shields.io/badge/TypeScript-3178C6?style=flat-square&logo=typescript&logoColor=white"/></a>
  <a href="https://www.convex.dev"><img src="https://img.shields.io/badge/Convex-EE4B2B?style=flat-square&logo=convex&logoColor=white"/></a>
  <a href="https://clerk.com"><img src="https://img.shields.io/badge/Clerk-6C47FF?style=flat-square&logo=clerk&logoColor=white"/></a>
  <a href="https://getstream.io"><img src="https://img.shields.io/badge/GetStream.io-005FFF?style=flat-square&logo=stream&logoColor=white"/></a>
  <a href="https://tailwindcss.com"><img src="https://img.shields.io/badge/Tailwind%20CSS-06B6D4?style=flat-square&logo=tailwindcss&logoColor=white"/></a>
</p>

</div>

---

## Overview

AlgoArena is a full-stack interview platform designed for peer-to-peer and recruiter-led technical interviews. Interviewers schedule sessions, conduct live video calls with screen sharing and recording, collaborate on DSA problems in a shared code editor, and leave structured feedback with ratings. Candidates see their scheduled interviews in real time and can join when sessions go live.

The platform integrates three external services — Convex for the reactive database and serverless backend, Clerk for authentication, and GetStream.io for video infrastructure — with a single string (`streamCallId`) acting as the bridge between the data layer and the video layer.

---

## Features

**For Interviewers**

- Schedule interviews with a specific candidate, date, time, and multiple co-interviewers
- Start instant unscheduled calls directly from the dashboard
- Live video room with speaker and grid layout options, screen sharing, and recording
- Embedded Monaco code editor (VS Code engine) alongside the video feed
- End the call for all participants and mark the interview as complete
- Review completed interviews, mark candidates as passed or failed
- Leave rated written feedback per interview that all interviewers can read

**For Candidates**

- View scheduled upcoming interviews in real time — no page refresh needed
- Join interviews directly from the home page when the session goes live
- Access past session recordings

---

## Tech Stack

### Frontend
- **Next.js 14** — App Router, client components, server actions
- **TypeScript** — full type safety across frontend and backend
- **Tailwind CSS + shadcn/ui** — component library and utility styling
- **Monaco Editor** — embedded VS Code editor for live coding

### Backend
- **Convex** — serverless backend-as-a-service: typed queries, mutations, real-time reactivity, and HTTP webhook handler
- **GetStream.io** — video calling, screen sharing, recording, and call state management

### Auth
- **Clerk** — user authentication, JWT generation, and webhook-based user sync

### Infrastructure
- **Vercel** — deployment
- **Svix** — webhook signature verification for Clerk events

---

## Architecture

```
Browser
  |
  |-- Clerk (auth, JWT)
  |
  |-- Convex (real-time DB + serverless API)
  |     |
  |     |-- HTTP endpoint: /clerk-webhook
  |           Clerk fires user.created -> Svix verifies -> syncUser mutation
  |
  |-- GetStream.io (video calls, recordings)
        |
        |-- Stream token minted by Next.js Server Action
              using Clerk user ID
```

Convex is the source of truth for all interview state. GetStream is the source of truth for all call and recording state. The `streamCallId` field on every interview record is the single reference that ties the two systems together.

---

## How It Works

### User Signup and Sync

When a user registers with Clerk, Clerk fires a `user.created` webhook to the Convex HTTP endpoint at `/clerk-webhook`. The handler verifies the request using Svix signature headers, extracts the user's name, email, and profile image, and runs the `syncUser` mutation to insert the user into the Convex `users` table with `role: "candidate"`. Role changes (to `"interviewer"`) are made manually in the Convex dashboard.

### Scheduling an Interview

When an interviewer submits the schedule form, two things happen atomically from the client's perspective:

1. A call is created on GetStream's servers via `client.call("default", uuid).getOrCreate()` with the scheduled start time.
2. The `createInterview` Convex mutation writes a record to the `interviews` table with the same UUID as the `streamCallId`.

From that moment, any client subscribed to `getMyInterviews` (filtered by `candidateId`) receives the new interview automatically — Convex pushes the update in real time with no polling.

### Joining and Running a Meeting

Navigating to `/meeting/[streamCallId]` loads the meeting page. The page queries GetStream for the call object by ID, then renders a setup screen (camera/mic check) before joining. Once joined, the meeting room renders two resizable panels: GetStream's video UI on the left and the Monaco code editor on the right.

The code editor holds state locally per participant. It is not synced between participants — this is an intentional scope limitation of the current implementation.

### Ending a Meeting and Post-Interview Review

Only the user who created the call (the meeting owner) sees the End Meeting button. Clicking it calls `call.endCall()` on GetStream to terminate the session for all participants, then runs `updateInterviewStatus` on Convex to set `status: "completed"` and record the `endTime`. The dashboard then groups interviews by status — upcoming, completed, succeeded, failed — and allows interviewers to pass or fail candidates and leave written comments with star ratings.

---

## Database Schema (Convex)

Three tables. No ORM — Convex uses its own typed schema definition.

```typescript
users: {
  clerkId:  string    // indexed — used as FK everywhere
  name:     string
  email:    string
  image:    string?
  role:     "candidate" | "interviewer"
}

interviews: {
  title:          string
  description:    string?
  startTime:      number   // Unix timestamp
  endTime:        number?  // set on completion
  status:         string   // "upcoming" | "completed" | "succeeded" | "failed"
  streamCallId:   string   // indexed — links to GetStream call
  candidateId:    string   // Clerk user ID, indexed
  interviewerIds: string[] // array of Clerk user IDs
}

comments: {
  interviewId:   Id<"interviews">  // indexed
  interviewerId: string            // Clerk user ID of commenter
  content:       string
  rating:        number            // 1–5
}
```

---

## Convex Backend Functions

| File | Function | Type | Description |
|---|---|---|---|
| `users.ts` | `syncUser` | mutation | Insert user on first login (idempotent) |
| `users.ts` | `getUsers` | query | Fetch all users (auth required) |
| `users.ts` | `getUserByClerkId` | query | Lookup user by Clerk ID via index |
| `interviews.ts` | `createInterview` | mutation | Create a new interview record |
| `interviews.ts` | `getAllInterviews` | query | Fetch all interviews (interviewers) |
| `interviews.ts` | `getMyInterviews` | query | Fetch interviews for current candidate |
| `interviews.ts` | `getInterviewByStreamCallId` | query | Lookup interview by Stream call ID |
| `interviews.ts` | `updateInterviewStatus` | mutation | Update status and set endTime |
| `comments.ts` | `addComment` | mutation | Add rating + feedback to an interview |
| `comments.ts` | `getComments` | query | Fetch all comments for an interview |
| `http.ts` | `/clerk-webhook` | HTTP action | Receive and verify Clerk user events |

---

## Project Structure

```
algoarena/
├── convex/
│   ├── schema.ts          # Database table and index definitions
│   ├── users.ts           # User queries and mutations
│   ├── interviews.ts      # Interview CRUD
│   ├── comments.ts        # Comment CRUD
│   ├── http.ts            # Clerk webhook HTTP handler
│   └── auth.config.ts     # Clerk JWT domain configuration
├── src/
│   ├── app/
│   │   ├── (root)/
│   │   │   ├── (home)/page.tsx         # Role-split home page
│   │   │   ├── meeting/[id]/page.tsx   # Live meeting room
│   │   │   ├── schedule/               # Interview scheduling (interviewers only)
│   │   │   └── recordings/             # Past call recordings
│   │   ├── (admin)/
│   │   │   └── dashboard/page.tsx      # Interviewer review dashboard
│   │   └── layout.tsx                  # Root layout with providers
│   ├── components/
│   │   ├── MeetingRoom.tsx             # Video + code editor layout
│   │   ├── MeetingSetup.tsx            # Pre-join camera/mic check
│   │   ├── CodeEditor.tsx              # Monaco editor with DSA questions
│   │   ├── EndCallButton.tsx           # Owner-only call termination
│   │   ├── CommentDialog.tsx           # Rating and feedback modal
│   │   ├── MeetingCard.tsx             # Interview card with status badge
│   │   ├── providers/
│   │   │   ├── ConvexClerkProvider.tsx # Wraps app with auth + DB providers
│   │   │   └── StreamClientProvider.tsx # Initializes Stream video client
│   │   └── ...
│   ├── hooks/
│   │   ├── useUserRole.ts              # Derives interviewer/candidate from Convex
│   │   ├── useGetCallById.ts           # Fetches single Stream call
│   │   ├── useGetCalls.ts              # Fetches all calls for current user
│   │   └── useMeetingActions.ts        # Create and join meeting helpers
│   ├── actions/
│   │   └── stream.actions.ts           # Server action: mint Stream token
│   ├── constants/index.ts              # DSA questions, time slots, categories
│   ├── lib/utils.ts                    # groupInterviews, getMeetingStatus, etc.
│   └── middleware.ts                   # Clerk middleware — route protection
```

---

## Getting Started

### Prerequisites

- Node.js 18+
- Convex account
- Clerk account
- GetStream.io account

### Environment Variables

```env
# Convex
NEXT_PUBLIC_CONVEX_URL=https://your-deployment.convex.cloud

# Clerk
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_...
CLERK_SECRET_KEY=sk_...
CLERK_WEBHOOK_SECRET=whsec_...
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up

# GetStream.io
NEXT_PUBLIC_STREAM_API_KEY=your_api_key
STREAM_SECRET_KEY=your_secret_key
```

### Installation

```bash
git clone https://github.com/aarbid29/AlgoArena.git
cd AlgoArena
npm install

# Start the Convex dev server (separate terminal)
npx convex dev

# Start Next.js
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Clerk Webhook Setup

In the Clerk dashboard, create a webhook pointing to:

```
https://your-convex-deployment.convex.site/clerk-webhook
```

Enable the `user.created` event. Copy the signing secret into `CLERK_WEBHOOK_SECRET` in your Convex environment variables (not `.env.local` — Convex reads its own env).

---

## Role Management

All users default to `"candidate"` on signup. To grant interviewer access, update the `role` field directly in the Convex dashboard. There is no self-serve role change in the UI by design — interviewers are provisioned manually.

---

## Coding Questions

The code editor ships with three built-in DSA problems:

- Find the Duplicate Number
- House Robber
- Maximum Depth of Binary Tree

Each question includes a problem description, examples, constraints, and starter code in JavaScript, Python, and Java. Code is held in local React state only — it is not persisted or synced between participants.

---

## License

MIT © [aarbid29](https://github.com/aarbid29)

---

<div align="center">
  <p>Built with Next.js · Convex · Clerk · GetStream.io</p>
  <a href="https://github.com/aarbid29/AlgoArena">Star this repo if you found it useful</a>
</div>
