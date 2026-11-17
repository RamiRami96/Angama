<div align="center">

<img src="./screen.jpeg" alt="Angama app screenshot" width="280" />

# 🗣️ äñgämä - Events Platform

*Find and join local events: speaking clubs and international board game nights. Practice languages, host your own events, and meet people who share your interests.*

[![Expo](https://img.shields.io/badge/Expo-54-000020?style=for-the-badge&logo=expo)](https://expo.dev/)
[![React Native](https://img.shields.io/badge/React_Native-0.81-61DAFB?style=for-the-badge&logo=react)](https://reactnative.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-blue?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![NestJS](https://img.shields.io/badge/NestJS-11-E0234E?style=for-the-badge&logo=nestjs)](https://nestjs.com/)
[![Prisma](https://img.shields.io/badge/Prisma-6.19-2D3748?style=for-the-badge&logo=prisma)](https://www.prisma.io/)
[![NativeWind](https://img.shields.io/badge/NativeWind-4.2-38B2AC?style=for-the-badge&logo=tailwind-css)](https://www.nativewind.dev/)

</div>

> **🚧 Development Status**: This project is currently in active development. New features and improvements are being added regularly.

## ✨ Features

### 🔐 **Secure Authentication**
- JWT authentication: short-lived access token (kept on the device) + rotating refresh token in an HttpOnly, Secure, SameSite cookie
- Account deletion support (cascades to your events, participations and notifications)

### 👤 **Profiles & Preferences**
- Sign up with name, email, date of birth and city
- Profile editing (name, city, about, avatar URL)
- Goals and interests picked from a catalog, plus the languages you speak with a CEFR level (A1-C2)

### 🗓️ **Event Categories**
- **Speaking Clubs**: a topic and an optional language level
- **International Board Games**: a game and an experience level (beginner / intermediate / advanced)
- Categories are rows in the database; category-specific fields live in a JSONB `details` column, so new categories need no schema change

### 🔎 **Event Discovery**
- List of published events with server-side filters: text search by name, category, language, city and date
- Event details with organizer info, spots left and your own participation status

### 🎤 **Create & Host Events**
- Create an event as a draft or publish it right away, edit it, publish a draft, or cancel it
- Name, description, category details, language, city, address, start/end, participant cap, optional price and cover image URL

### 🙋 **Participation Requests with Organizer Approval**
- Request to join a published event; the organizer approves or rejects each request
- Approval is the confirmation and takes one of the event's spots
- Participants can cancel their request or confirmed spot

### 📋 **My Events**
- Events you organize (with participant and pending-request counts) and events you take part in

### 🔔 **In-app Notifications**
- Organizer: a new participation request
- Participant: request approved / rejected, event cancelled
- Unread counter, mark one as read, mark all as read

> **Note:** the event price is informational only (there are no payments), cover/avatar images are plain URLs (no upload), and there is no email or push delivery.

## 🚀 Tech Stack

| Technology | Purpose | Version |
|------------|---------|---------|
| **Expo / React Native** | Cross-platform mobile app (`expo-router` for navigation) | 54 / 0.81 |
| **TypeScript** | Type-safe development | 5.9 |
| **NativeWind** | Tailwind CSS for React Native | 4.2 |
| **TanStack Query** | Server state management | 5.101 |
| **React Hook Form + Zod** | Form handling and validation | - |
| **NestJS** | Full-stack API framework | 11 |
| **Prisma ORM** | Type-safe database access | 6.19 |
| **PostgreSQL** | Primary database | - |
| **@nestjs/jwt + bcrypt** | JWT auth & password hashing | - |

## 📁 Project Structure

```
Angama/
├── client/                  # Expo / React Native app
│   ├── app/                   # expo-router routes: thin re-exports of _pages (screens) and _app (layouts)
│   └── src/                   # Feature-Sliced Design layers (top to bottom)
│       ├── _app/              # App-wide setup: providers, root layout wiring
│       ├── _pages/            # One slice per screen (events, event-detail, create-event, my-events, notifications, ...)
│       ├── widgets/           # Large self-contained UI blocks (events-list, my-events, participants-list, ...)
│       ├── features/          # User actions (sign-in, create/edit/publish/cancel event, request-participation, manage-participants, ...)
│       ├── entities/          # Business entities (event, participation, notification, catalog, user)
│       └── shared/            # Reusable UI kit (ui), API client (api), contracts, helpers (lib); imported per segment, e.g. @/shared/ui
│
└── server/                  # NestJS API
    ├── prisma/                # Prisma schema, migrations and seed script
    └── src/
        ├── api/
        │   ├── auth/            # Sign up / sign in / sign out / refresh / account deletion / JWT guard
        │   ├── catalog/         # Public catalog: goals, interests, languages, event categories
        │   ├── events/          # Event CRUD, discovery filters, participation requests and decisions
        │   ├── notifications/   # In-app notifications
        │   └── users/           # Profile, preferences, languages, My Events
        ├── contracts/            # Zod schemas / DTO types for request validation
        ├── prisma/               # Prisma service/module
        └── shared/                # Shared utils/types
```

**Client architecture** follows [Feature-Sliced Design](https://feature-sliced.design/). A layer may import only from layers below it (`_app` > `_pages` > `widgets` > `features` > `entities` > `shared`), and slices in the same layer never import each other. Every slice exposes its public API through an `index.ts`; import from the slice root (e.g. `@/features/sign-in`), never from its internals. `_app` and `_pages` are underscore-prefixed so they don't clash with expo-router's `app` folder.

## 🗃️ Data Model

Prisma entities:

| Entity | Purpose |
|--------|---------|
| `User` | Account with name, email, date of birth, city, about, avatar URL |
| `RefreshToken` | Hashed rotating refresh tokens |
| `Preference` / `UserPreference` | Catalog of goals and interests (`GOAL` / `INTEREST`) and a user's picks |
| `Language` / `UserLanguage` | Language catalog and a user's languages with a level (`A1`-`C2`) |
| `EventCategory` | Event categories as rows: `SPEAKING_CLUB`, `BOARD_GAMES` |
| `Event` | An event with an organizer, category, language, schedule, location, capacity, optional price and a JSONB `details` for category-specific fields |
| `EventParticipant` | A user's participation in an event; unique per `(userId, eventId)` |
| `Notification` | In-app notification for a recipient about an event, with an optional actor and a `readAt` timestamp |

**Event status:** `DRAFT` -> `PUBLISHED` -> `COMPLETED`, or `CANCELLED` (from `DRAFT` / `PUBLISHED`). Drafts are visible to the organizer only.

**Participation status:** `REQUESTED`, `APPROVED`, `REJECTED`, `CANCELLED`, `ATTENDED`, `NO_SHOW`. A participation is *confirmed* (occupies a spot) when it is `APPROVED`, `ATTENDED` or `NO_SHOW`.

**Notification types:** `PARTICIPATION_REQUESTED`, `PARTICIPATION_APPROVED`, `PARTICIPATION_REJECTED`, `EVENT_CANCELLED`.

**Category `details` (JSONB):**
- `SPEAKING_CLUB`: `{ topic: string, level?: A1..C2 }`
- `BOARD_GAMES`: `{ game: string, experienceLevel: BEGINNER | INTERMEDIATE | ADVANCED }`

## 🔌 API Overview

"Auth" legend: **required** = needs `Authorization: Bearer <accessToken>`; **optional** = works anonymously, personalised when signed in; **public** = no token.

| Method | Path | Auth | Purpose |
|--------|------|------|---------|
| POST | `/auth/sign-up` | public | Create an account (name, email, password, dateOfBirth, city); returns user + access token and sets the refresh cookie |
| POST | `/auth/sign-in` | public | Sign in; returns user + access token and sets the refresh cookie |
| POST | `/auth/refresh` | public (refresh cookie) | Rotate the refresh token and return a new access token |
| POST | `/auth/sign-out` | public (refresh cookie) | Revoke the refresh token and clear the cookie |
| GET | `/auth/me` | required | Current user |
| DELETE | `/auth/account` | required | Delete the account and everything it owns |
| GET | `/catalog` | optional | Goals, interests, languages and event categories |
| PATCH | `/users/me` | required | Update name, city, about, avatar URL |
| GET | `/users/me/preferences` | required | Current goals, interests and languages |
| PUT | `/users/me/preferences` | required | Replace goals and interests |
| PUT | `/users/me/languages` | required | Replace spoken languages with levels |
| GET | `/users/me/events?role=organizer\|participant` | required | My Events: hosted events (with participant / pending counts) or events I joined |
| GET | `/events` | optional | Published events; filters `q`, `category`, `language`, `city`, `date` (`YYYY-MM-DD`) |
| GET | `/events/:id` | optional | Event details (a draft is visible to its organizer only, otherwise 404) |
| POST | `/events` | required | Create an event (`status`: `DRAFT` or `PUBLISHED`, default `PUBLISHED`) |
| PATCH | `/events/:id` | required (organizer) | Edit a draft or published event |
| POST | `/events/:id/publish` | required (organizer) | Publish a draft |
| POST | `/events/:id/cancel` | required (organizer) | Cancel the event and notify pending / approved participants |
| POST | `/events/:id/participation` | required | Request to join the event |
| POST | `/events/:id/participation/cancel` | required | Cancel my request or confirmed spot |
| GET | `/events/:id/participants?status=` | required (organizer) | List participation requests (cancelled ones are hidden unless filtered by `status`) |
| PATCH | `/events/:id/participants/:userId/approve` | required (organizer) | Approve a request |
| PATCH | `/events/:id/participants/:userId/reject` | required (organizer) | Reject a request |
| GET | `/notifications` | required | My notifications |
| GET | `/notifications/unread-count` | required | Number of unread notifications |
| POST | `/notifications/read-all` | required | Mark all notifications as read |
| PATCH | `/notifications/:id/read` | required | Mark one notification as read |

## 📏 Business Rules

- You cannot join your own event (403).
- One participation row per user and event: requesting again is rejected (409), including after cancelling or being rejected.
- Only `PUBLISHED` events that have not started accept requests; full, cancelled and completed events are closed (409). Someone else's draft is reported as not found (404).
- Capacity is counted on confirmed participations and enforced under a row lock on the event, so concurrent approvals and edits cannot overbook it. `maxParticipants` cannot be lowered below the confirmed count.
- Approval is the confirmation: a `REQUESTED` participation becomes `APPROVED` and takes a spot. Approving or rejecting twice is idempotent.
- The organizer can decide on pending requests until the event ends.
- Cancelling an event notifies everyone with a `REQUESTED` or `APPROVED` participation.
- Cancelled and completed events cannot be edited, published or cancelled again (409).
- `COMPLETED` is applied lazily: published events whose end time has passed are marked completed on event list reads, My Events and event detail reads. Editing, publishing or cancelling an event whose end time has passed is rejected (409) even before it is marked completed.

## 🛠️ Getting Started

### Prerequisites
- Node.js 20+
- A PostgreSQL database
- [Expo Go](https://expo.dev/go) or an iOS/Android simulator

### 1. Clone the Repository
```bash
git clone <repository-url>
cd Angama
```

### 2. Install Dependencies
```bash
# Install server dependencies
cd server
npm install

# Install client dependencies
cd ../client
npm install
```

### 3. Environment Setup
Copy `server/.env.example` to `server/.env` and fill it in:

```env
DATABASE_URL="postgresql://username:password@localhost:5432/angama"
DIRECT_URL="postgresql://username:password@localhost:5432/angama"
JWT_ACCESS_SECRET="long-random-string"
JWT_REFRESH_SECRET="another-long-random-string"
# Optional: PORT (default 3000).
# Optional: COOKIE_SAMESITE=lax|strict|none (default lax). The refresh cookie is
# Secure only when NODE_ENV=production.
# Production only: CORS_ORIGINS="https://your-web-app.com" (comma-separated).
# Native apps don't need CORS; dev allows any origin.
```

### 4. Database Setup
```bash
cd server
npx prisma migrate dev   # apply migrations
npx prisma db seed       # seed goals, interests, languages and event categories
```

### 5. Run the Application
```bash
# Terminal 1: Start the NestJS API
cd server
npm run start:dev

# Terminal 2: Start the Expo app
cd client
npx expo start
```

Open the app in a development build, simulator, or Expo Go.

### 6. Run the Tests
```bash
cd server && npm test
cd client && npm test
```

## 🎯 Usage

### Creating an Account
1. Sign up with your details, including your city
2. Pick your goals, interests and languages in your profile
3. Sign in; the app keeps the access token and refreshes it automatically

### Finding an Event
1. Browse published events and filter by search text, category, language, city or date
2. Open an event to see the organizer, spots left and details
3. Request to join; you get a notification when the organizer approves or rejects

### Hosting an Event
1. Create an event (Speaking Club or International Board Games) as a draft or publish it right away
2. Review incoming requests on the event and approve or reject them
3. Cancel the event if plans change; pending and approved participants are notified

## ⚠️ Known Limitations / Not Implemented

- **Image upload**: cover and avatar images are URLs only.
- **Email and push notifications**: notifications are in-app only.
- **Attendance marking**: the `ATTENDED` and `NO_SHOW` statuses exist but have no endpoints yet.
- **Payments**: `price` is informational only.
- **Speaking-club level cannot be cleared** once set (an edit can change it, not remove it).
- **Date filter is a UTC day**: `date=YYYY-MM-DD` matches events starting within that UTC day, regardless of the event's city time zone.
- Event lists are capped at 100 results (no paging yet).
- **Deleting an account deletes the events it organized** (participants are not notified).

## 🎯 Future Plans

- Attendance marking by organizers
- Image upload
- Email and push notifications
- In-app messaging between organizers and participants
