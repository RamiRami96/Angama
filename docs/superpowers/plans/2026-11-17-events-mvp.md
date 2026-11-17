# Events MVP Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Turn the existing "speaking clubs" app into an events platform (Speaking Clubs + International Board Games) with profiles, preferences, discovery filters, participation approval, My Events and in-app notifications.

**Architecture:** Rename `Club`→`Event` and `Registration`→`EventParticipant` in place (same NestJS module layout, same FSD client layout). Category-specific fields live in a `details` JSONB column validated by a per-category Zod schema, with categories stored as rows so a new category is a seed row plus a schema. All state changes that touch capacity or notifications run in one Prisma transaction holding a `SELECT … FOR UPDATE` lock on the event row (the pattern `RegistrationsService.decide` already uses).

**Tech Stack:** Existing only: NestJS 11, Prisma 6 (Postgres), Zod 4, Jest; Expo 54, expo-router, TanStack Query, react-hook-form, NativeWind. No new dependencies.

**Spec:** The requirements brief pasted in the conversation on 2026-11-17, plus the decisions in "Global Constraints" below (confirmed by the user in the same conversation).

## Global Constraints

- User decisions: images are **URLs only** (`avatarUrl`, `coverImageUrl`), no upload/storage. Full rename Club→Event across server, API (`/events`) and client. **No existing data to preserve**: reset the dev DB and produce ONE fresh migration. `Language` is a seeded table (~20 languages). A user who has a participation row for an event (any status, including CANCELLED/REJECTED) can never request that event again → 409.
- No payments of any kind. `price` is optional and informational only.
- No new roles. Organizer = `event.organizerId === userId`; Participant = has an `EventParticipant` row.
- Statuses (exact): event `DRAFT | PUBLISHED | CANCELLED | COMPLETED`; participation `REQUESTED | APPROVED | REJECTED | CANCELLED | ATTENDED | NO_SHOW`; levels `A1 A2 B1 B2 C1 C2`; board-game experience `BEGINNER | INTERMEDIATE | ADVANCED`.
- Goals (codes): `PRACTICE_LANGUAGES, FIND_FRIENDS, MEET_INTERNATIONAL_PEOPLE, LEARN_SOMETHING_NEW, EXPAND_SOCIAL_CIRCLES`. Interests: `ENGLISH, OTHER_LANGUAGES, BOARD_GAMES, TRAVELING, SPORTS, TECHNOLOGY, CULTURE, EDUCATION`. Stored in separate `type` (GOAL/INTEREST) values, editable.
- Capacity counts "confirmed" = status in `APPROVED | ATTENDED | NO_SHOW`. `ATTENDED`/`NO_SHOW` exist in the enum only; **no endpoint sets them** (out of scope).
- Out of scope: email/push, payments, file upload, attendance marking, chat, ratings.
- Keep conventions: Zod contracts in `server/src/contracts/*` are the single source and are **copied byte-for-byte** to `client/src/shared/contracts/*` (they are identical today; keep them identical). UUID PKs. Errors via Nest exceptions (global filter maps Prisma P2002→409). Server tests are Jest unit specs with mocked `PrismaService` (see `registrations.service.spec.ts` for the style). Client tests are jest-expo unit tests next to the code.
- Verification commands — server: `cd server && npx jest <path>`, `npm run typecheck`, `npm run lint:check`. Client: `cd client && npx jest <path>`, `npm run typecheck`, `npm run lint`.

## Review Focus

1. Two users request the last spot simultaneously → exactly one gets in (lock held before count; also manual parallel check in Task 5).
2. `endsAt <= startsAt`, or `startsAt` in the past on create/publish, is rejected with 400/409 (Task 4).
3. Organizer lowers `maxParticipants` below the confirmed count → 409 (Task 4).
4. A `DRAFT` event is invisible to everyone but its organizer (list and by-id → 404) (Task 4).
5. Editing/cancelling/publishing an already CANCELLED or COMPLETED event → 409; cancelling twice does not send duplicate notifications (Task 4).
6. Re-requesting after cancel/reject, and requesting your own event, → 409/403 respectively (Task 5).

## File Structure

Server (`server/src`):
- `prisma/schema.prisma` — rewritten models (Task 1); `prisma/seed.ts` — catalog seed (Task 1).
- `contracts/{auth,users,events,catalog,notifications,index}.ts` — `clubs.ts` is replaced by `events.ts` (Task 2).
- `api/auth/*` — only `signUp` + public-user mapper change (Task 3).
- `api/users/*` — profile, preferences, languages, `me/events` (Tasks 3, 6).
- `api/catalog/{catalog.controller,catalog.module}.ts` — new (Task 3).
- `api/events/*` — replaces `api/clubs/*`: `events.controller.ts`, `events.service.ts` (CRUD/lifecycle/discovery), `events.mapper.ts`, `event-details.ts` (per-category Zod schemas), `participations.service.ts`, `participations.mapper.ts`, `events.module.ts` (Tasks 4–5).
- `api/notifications/*` — new module (Task 7).
- `shared/{const,type,util}/registration-status.*` — deleted (the public status label mapping goes away; API exposes real statuses).

Client (`client/src`): `entities/club`→`entities/event`, `entities/application`→`entities/participation`, new `entities/notification`, `entities/catalog`, `entities/user` extended; features/widgets/pages renamed per task; routes under `client/app`.

---

### Task 1: Schema, migration and seed

**Files:**
- Modify: `server/prisma/schema.prisma`, `server/prisma.config.ts` (add `migrations.seed: "ts-node prisma/seed.ts"`), `server/package.json` (no new deps; `ts-node` already present)
- Create: `server/prisma/seed.ts`, `server/prisma/migrations/<ts>_init_events_mvp/` (generated)

**Interfaces — Produces** (Prisma models, used by all later tasks):
- `User` += `city String`, `about String?`; relations `organizedEvents Event[]`, `participations EventParticipant[]`, `preferences UserPreference[]`, `languages UserLanguage[]`, `notifications Notification[]`. Keep `avatarUrl`, `refreshTokens`.
- `Preference { id uuid, type PreferenceType, code String, label String, @@unique([type, code]) }`; `enum PreferenceType { GOAL INTEREST }`.
- `UserPreference { userId, preferenceId, @@id([userId, preferenceId]) }` (cascade on both).
- `Language { id uuid, code String @unique (ISO 639-1), name String }`.
- `UserLanguage { userId, languageId, level LanguageLevel, @@id([userId, languageId]) }`; `enum LanguageLevel { A1 A2 B1 B2 C1 C2 }`.
- `EventCategory { id uuid, code String @unique, name String }`.
- `Event { id uuid, name, description, categoryId→EventCategory, details Json @default("{}"), coverImageUrl String?, startsAt DateTime, endsAt DateTime, city String, address String, maxParticipants Int, price Decimal? @db.Decimal(10,2), languageId→Language, status EventStatus @default(DRAFT), organizerId→User (cascade), createdAt, updatedAt @updatedAt }` with indexes `[organizerId]`, `[status, startsAt]`, `[city]`, `[categoryId]`, `[languageId]`; `enum EventStatus { DRAFT PUBLISHED CANCELLED COMPLETED }`.
- `EventParticipant { id uuid, eventId, userId (both cascade), status ParticipationStatus @default(REQUESTED), createdAt, updatedAt, @@unique([userId, eventId]), @@index([eventId, status]) }`; `enum ParticipationStatus {…6 values…}`.
- `Notification { id uuid, userId (cascade), type NotificationType, eventId→Event (cascade), actorId String? →User (SetNull), readAt DateTime?, createdAt, @@index([userId, readAt]) }`; `enum NotificationType { PARTICIPATION_REQUESTED PARTICIPATION_APPROVED PARTICIPATION_REJECTED EVENT_CANCELLED }`.
- Seed exports nothing; it upserts: both `Preference` lists (labels human-readable), ~20 `Language` rows (en, es, fr, de, it, pt, ru, zh, ja, ko, ar, hi, tr, pl, nl, sv, uk, cs, el, he), and categories `SPEAKING_CLUB` ("Speaking Club"), `BOARD_GAMES` ("International Board Games").

- [ ] **Step 1:** Rewrite `schema.prisma` per the interfaces above (remove `Club`, `Registration`, `ClubStatus`, `RegistrationRole`, `RegistrationStatus`).
- [ ] **Step 2:** Write `seed.ts` using the generated client (`../generated/prisma/client`) with `upsert` on the unique keys (idempotent). Wire it in `prisma.config.ts`.
- [ ] **Step 3:** Reset dev DB and create the single migration. Run: `cd server && npx prisma migrate dev --name init_events_mvp` (accept the reset prompt) then `npx prisma db seed`. Expected: migration folder created, seed prints counts, `npx prisma generate` succeeds.
- [ ] **Step 4:** Verify seed idempotency: run `npx prisma db seed` twice; row counts unchanged (`npx prisma studio` or a psql `count(*)`).
- [ ] **Step 5:** Commit `git add server/prisma server/prisma.config.ts && git commit -m "feat(server): events schema, migration and catalog seed"`. (Server typecheck is expected to fail until Tasks 2–7 land; that is fine on this branch.)

---

### Task 2: Contracts

**Files:**
- Create: `server/src/contracts/events.ts`, `catalog.ts`, `notifications.ts`; Delete `clubs.ts`; Modify `auth.ts`, `users.ts`, `index.ts`
- Test: `server/src/contracts/contracts.spec.ts`
- Mirror all of `server/src/contracts/*.ts` (except the spec) into `client/src/shared/contracts/`.

**Interfaces — Produces** (exact exports):
- `auth.ts`: `signUpSchema` gains `city: z.string().trim().min(1, 'City is required')`; `SignUpDto`.
- `users.ts`: `updateProfileSchema` = `{ name?, city?, about?: string.max(1000).nullable(), avatarUrl? }`; `updatePreferencesSchema = { goals: GoalCode[], interests: InterestCode[] }` (enums from the code lists in Global Constraints, deduped via `.transform` or `.refine`); `updateLanguagesSchema = { languages: { code: string, level: LanguageLevel }[] }` (max 20, unique codes); `myEventsQuerySchema = { role: z.enum(['organizer','participant']) }`; matching `*Dto` types; `GOAL_CODES`, `INTEREST_CODES`, `LANGUAGE_LEVELS` const arrays.
- `events.ts`: `speakingClubDetailsSchema = { level?: LanguageLevel, topic: string.min(1) }`; `boardGamesDetailsSchema = { game: string.min(1), experienceLevel: enum BEGINNER|INTERMEDIATE|ADVANCED }`; `eventBaseSchema` (name, description, `category: 'SPEAKING_CLUB'|'BOARD_GAMES'`, coverImageUrl?: http(s) url nullable, `startsAt`/`endsAt`: `z.iso.datetime`, city, address, `maxParticipants: int ≥1`, `price?: number ≥0 nullable`, `language: string` (language code), `status: enum DRAFT|PUBLISHED default PUBLISHED`); `createEventSchema` = discriminated union on `category` adding `details`; refinement `endsAt > startsAt`; `updateEventSchema` = partial of the base fields + optional `details` (category itself not editable), same refinement when both dates present; `listEventsQuerySchema = { q?, category?, language?, city?, date?: z.iso.date }`; `*Dto` types; `EVENT_CATEGORY_CODES`.
- `catalog.ts`: none needed server-side if `/catalog` returns plain data; skip this file (YAGNI) — client defines the response schema.
- `notifications.ts`: none (no request bodies). Skip.

- [ ] **Step 1:** Write `contracts.spec.ts` with these cases: sign-up without `city` fails; sign-up with city passes; `createEventSchema` accepts a valid speaking club (`details: {topic:'Travel'}`), rejects speaking club without `topic`, accepts a valid board-games event, rejects board-games with `experienceLevel:'EXPERT'`; rejects `endsAt` equal to `startsAt`; `updateEventSchema` rejects a `category` key being changed (unknown key stripped — assert parsed output has no `category`); `updatePreferencesSchema` rejects goal code `SPORTS` (it's an interest); `updateLanguagesSchema` rejects duplicate codes and level `D1`; `listEventsQuerySchema` rejects `date: '12/05/2026'`.
- [ ] **Step 2:** Run `cd server && npx jest src/contracts` → FAIL.
- [ ] **Step 3:** Implement the contract files per the interfaces; update `index.ts` exports; delete `clubs.ts`.
- [ ] **Step 4:** Run `npx jest src/contracts` → PASS. (The existing `zod-validation`/contract specs elsewhere may reference `clubs`; fix imports.)
- [ ] **Step 5:** Copy contracts to the client: `cp server/src/contracts/{auth,users,events,index}.ts client/src/shared/contracts/ && rm client/src/shared/contracts/clubs.ts`. Commit `feat: events, preferences and city contracts`.

---

### Task 3: Auth city, profile, preferences, languages, catalog

**Files:**
- Modify: `server/src/api/auth/auth.service.ts` (+spec), `server/src/shared/mapper/user.mapper.ts`, `server/src/api/users/users.service.ts` (+spec), `users.controller.ts`
- Create: `server/src/api/catalog/catalog.controller.ts`, `catalog.module.ts`; register in `app.module.ts`

**Interfaces — Produces:**
- `toPublicUser(user)` now also returns `city: string`, `about: string | null`.
- `AuthService.signUp(data: SignUpDto)` persists `city`.
- `UsersService.updateProfile(userId, data: UpdateProfileDto)` (existing, now accepts `city`, `about`).
- `UsersService.getPreferences(userId): Promise<{ goals: string[]; interests: string[]; languages: { code: string; level: LanguageLevel }[] }>`
- `UsersService.setPreferences(userId, dto: UpdatePreferencesDto)` and `setLanguages(userId, dto: UpdateLanguagesDto)` — replace-all inside `$transaction` (deleteMany then createMany); unknown codes → `BadRequestException`; both return the same shape as `getPreferences`.
- Routes: `GET /users/me/preferences`, `PUT /users/me/preferences`, `PUT /users/me/languages`, `@OptionalAuth() GET /catalog` → `{ goals: {code,label}[], interests: {code,label}[], languages: {code,name}[], categories: {code,name}[] }`.
- `UsersService.getMyApplications` is removed here (replaced in Task 6).

- [ ] **Step 1:** Update `auth.service.spec.ts`: sign-up passes `city` through to `user.create`; add `users.service.spec.ts` cases: `setPreferences` runs `deleteMany` then `createMany` in a transaction and resolves codes via `preference.findMany`; unknown code → `BadRequestException`; `setLanguages` with unknown language code → `BadRequestException`; `getPreferences` groups goals vs interests by `type`.
- [ ] **Step 2:** Run `npx jest src/api/auth src/api/users` → FAIL.
- [ ] **Step 3:** Implement service/controller/mapper changes and `CatalogController` (reads the four tables, ordered by label/name).
- [ ] **Step 4:** Run the same command → PASS.
- [ ] **Step 5:** Commit `feat(server): city, profile, preferences, languages and catalog`.

---

### Task 4: Events — CRUD, lifecycle, discovery

**Files:**
- Create: `server/src/api/events/{events.controller,events.service,events.mapper,event-details,events.module}.ts` and specs `events.service.spec.ts`, `events.mapper.spec.ts`, `event-details.spec.ts`
- Delete: `server/src/api/clubs/*` after moving what is reused (`clubs.service.ts`→`events.service.ts`, `clubs.mapper.ts`→`events.mapper.ts`, its specs adapted); update `app.module.ts`.

**Interfaces — Produces:**
- `event-details.ts`: `parseEventDetails(category: EventCategoryCode, details: unknown): Record<string, unknown>` — validates with the matching schema from Task 2, throws `BadRequestException` on failure. This is the single extension point for new categories.
- `events.mapper.ts`: `EVENT_INCLUDE` (organizer `{id,name,avatarUrl}`, category, language, and `participants` filtered to status `REQUESTED` + `CONFIRMED_STATUSES`, selecting `{userId,status}`, as the existing `CLUB_INCLUDE` does; `participantCount` and `myParticipation` are derived from it — a viewer whose row is CANCELLED/REJECTED gets `myParticipation` from a second small `findMany` on `(eventId in ids, userId)` in the service); `toEventDto(row, viewerId?)` returning: `id, name, description, category:{code,name}, details, coverImageUrl|null, startsAt, endsAt, city, address, maxParticipants, participantCount, spotsLeft, price:number|null, language:{code,name}, status, organizer:{id,name,avatarUrl?}, myParticipation: ParticipationStatus|null, createdAt`. `CONFIRMED_STATUSES` exported from here.
- `EventsService`:
  - `list(viewerId: string | undefined, q: ListEventsQuery): Promise<EventDto[]>` — first calls `completeFinished()`; `where`: `status = PUBLISHED`, `name contains q (insensitive)`, `category.code`, `language.code`, `city equals (insensitive)`, `startsAt` within the UTC day of `date`; ordered `startsAt asc`, `take 100`.
  - `getOne(id, viewerId?)` — DRAFT visible only to organizer (404 otherwise).
  - `create(organizerId, dto: CreateEventDto)` — resolves category/language rows (unknown language → 400), `parseEventDetails`, rejects `startsAt <= now` with `BadRequestException`. No one-upcoming-event limit (removed).
  - `update(id, organizerId, dto: UpdateEventDto)` — organizer only (403), status must be DRAFT or PUBLISHED else 409, reject `maxParticipants < confirmedCount` (409), validate `details` against the stored category, re-check `endsAt > startsAt` using merged values.
  - `publish(id, organizerId)` — DRAFT→PUBLISHED only (409 otherwise), start must be in the future.
  - `cancel(id, organizerId)` — in a transaction with the event row locked: DRAFT/PUBLISHED→CANCELLED else 409; creates one `EVENT_CANCELLED` notification for each participant whose status is `REQUESTED` or `APPROVED`.
  - `completeFinished(): Promise<void>` — `updateMany` PUBLISHED events with `endsAt < now` → COMPLETED.
  - `assertOrganizer(eventId, userId)` (kept from `assertHost`, renamed).
- Routes: `@OptionalAuth GET /events`, `@OptionalAuth GET /events/:id`, `POST /events`, `PATCH /events/:id`, `POST /events/:id/publish`, `POST /events/:id/cancel` (all `@HttpCode(200)` except create). `DELETE /events/:id` is removed.

- [ ] **Step 1:** Write failing specs (mocked prisma, style of `clubs.service.spec.ts`): list `where` contains `status:'PUBLISHED'` and each filter when provided; a `date` filter produces `gte`/`lt` bounds of that UTC day; create does not query for an existing upcoming event; create with `startsAt` in the past rejects; create with unknown language code rejects; update by non-organizer → `ForbiddenException`; update on CANCELLED → `ConflictException`; update lowering `maxParticipants` to 1 with 2 confirmed → `ConflictException`; getOne on a DRAFT as another user → `NotFoundException`, as organizer → returns; publish on PUBLISHED → `ConflictException`; cancel creates `notification.createMany` with exactly the REQUESTED/APPROVED users and `type:'EVENT_CANCELLED'`; cancel on already-CANCELLED → `ConflictException` and no `createMany`; `completeFinished` calls `updateMany` with `endsAt:{lt: now}`; mapper: `spotsLeft = max - confirmed`, `price` null when absent, `myParticipation` reflects viewer. `event-details.spec.ts`: valid/invalid details per category.
- [ ] **Step 2:** Run `npx jest src/api/events` → FAIL.
- [ ] **Step 3:** Implement the service, mapper, details module, controller and module; update `app.module.ts` (`EventsModule` replaces `ClubsModule`). Reuse the existing `FOR UPDATE` raw-query line for the cancel transaction (table is now `"Event"`).
- [ ] **Step 4:** Run `npx jest src/api/events` → PASS.
- [ ] **Step 5:** Commit `feat(server): events CRUD, lifecycle and discovery filters`.

---

### Task 5: Participation

**Files:**
- Create: `server/src/api/events/participations.service.ts`, `participations.mapper.ts`, `participations.service.spec.ts` (adapted from `registrations.service.spec.ts`, which is then deleted); Modify `events.controller.ts`, `events.module.ts`.

**Interfaces — Consumes:** `EventsService.assertOrganizer`, `CONFIRMED_STATUSES`. **Produces:**
- `toParticipationDto(p): { userId, eventId, status: ParticipationStatus, createdAt: string }`; list variant adds `user: { id, name, avatarUrl? }`.
- `ParticipationsService`:
  - `request(eventId, userId)` — one transaction, event row locked first. Order of checks: event exists (404) → `organizerId === userId` → `ForbiddenException('You cannot join your own event')` → status not PUBLISHED → `ConflictException('Event is not open')` → `startsAt <= now` → 409 → existing row for `(userId,eventId)` → `ConflictException('Already requested')` → confirmed count ≥ `maxParticipants` → `ConflictException('Event is full')` → create `REQUESTED` + `notification` `PARTICIPATION_REQUESTED` to organizer (`actorId = userId`). A concurrent duplicate hitting the unique index surfaces as 409 via the global filter.
  - `approve(eventId, userId, organizerId)` / `reject(...)` — via private `decide` (keep the existing structure): organizer check, lock, row must be `REQUESTED` (idempotent when already at target; other status → 409 'Request is no longer pending'), approve rechecks capacity, writes notification `PARTICIPATION_APPROVED`/`PARTICIPATION_REJECTED` to the participant in the same transaction. Event must be PUBLISHED (else 409).
  - `cancel(eventId, userId)` — own row only (404 if none); `REQUESTED|APPROVED`→`CANCELLED`, otherwise 409; event COMPLETED → 409. (No notification: not in the required list.)
  - `list(eventId, organizerId, status?: ParticipationStatus)` — organizer only; returns participants with `user`; default all statuses except CANCELLED.
- Routes: `POST /events/:id/participation` (200), `POST /events/:id/participation/cancel` (200), `GET /events/:id/participants?status=`, `PATCH /events/:id/participants/:userId/approve`, `.../reject` (200). Old `apply`/`applicants/accept` routes are removed.

- [ ] **Step 1:** Port the existing spec cases and add: own event → `ForbiddenException`; cancelled event, completed event, DRAFT event → rejects; duplicate (any existing status, including CANCELLED and REJECTED) → `ConflictException`; full event → `ConflictException`, nothing created; request success creates participation and exactly one `PARTICIPATION_REQUESTED` notification addressed to the organizer; the `$queryRaw` lock call happens **before** `participant.count` (assert call order via `mock.invocationCallOrder`); approve at capacity → `ConflictException`; approve creates `PARTICIPATION_APPROVED` notification; reject creates `PARTICIPATION_REJECTED`; approve by non-organizer → `ForbiddenException`; cancel from REJECTED → 409; cancel from APPROVED → CANCELLED; list by non-organizer → 403.
- [ ] **Step 2:** Run `npx jest src/api/events/participations` → FAIL.
- [ ] **Step 3:** Implement per the interface; wire controller routes.
- [ ] **Step 4:** Run `npx jest src/api/events` → PASS. Then manual concurrency check (documented in the commit body): with the dev DB seeded and an event with `maxParticipants: 1`, run a `Promise.all` of two `request` calls from different users via a throwaway script or `curl &`; expect exactly one 201/200 and one 409 and `count(APPROVED)` unchanged ≤ 1 after approving both (second approval 409).
- [ ] **Step 5:** Commit `feat(server): participation requests, decisions and cancellation`.

---

### Task 6: My Events

**Files:** Modify `server/src/api/users/users.service.ts`, `users.controller.ts`, `users.service.spec.ts`.

**Interfaces — Consumes:** `EVENT_INCLUDE`, `toEventDto`. **Produces:**
- `UsersService.getMyEvents(userId, role: 'organizer'|'participant')`:
  - `organizer` → `{ event: EventDto, participantCount: number, pendingCount: number }[]` for all events with `organizerId = userId` (every status incl. DRAFT), newest `startsAt` first; `pendingCount` = REQUESTED rows.
  - `participant` → `{ event: EventDto, participationStatus: ParticipationStatus }[]` for events the user has a participation row in, newest first. Includes CANCELLED/REJECTED rows so the user sees their status.
- Route: `GET /users/me/events?role=` validated with `myEventsQuerySchema`. `GET /users/me/applications` is removed.

- [ ] **Step 1:** Failing spec: organizer branch queries `where:{organizerId}` and returns counts computed from grouped participations (REQUESTED vs confirmed); participant branch returns `participationStatus` per row; both call `completeFinished` first (inject `EventsService`; export it from `EventsModule`).
- [ ] **Step 2:** Run `npx jest src/api/users` → FAIL. **Step 3:** Implement. **Step 4:** PASS.
- [ ] **Step 5:** Commit `feat(server): my events endpoint`.

---

### Task 7: Notifications

**Files:** Create `server/src/api/notifications/{notifications.controller,notifications.service,notifications.module,notifications.service.spec}.ts`; register in `app.module.ts`.

**Interfaces — Produces:**
- `NotificationsService.list(userId): Promise<NotificationDto[]>` newest first, `take 50`; `NotificationDto = { id, type: NotificationType, eventId, eventName, actorName: string | null, read: boolean, createdAt: string }` (include event `name` and actor `name`).
- `NotificationsService.unreadCount(userId): Promise<{ count: number }>`.
- `markRead(userId, id)` — only own notifications (404 otherwise), idempotent; `markAllRead(userId)`.
- Routes: `GET /notifications`, `GET /notifications/unread-count`, `PATCH /notifications/:id/read`, `POST /notifications/read-all` (all 200).

- [ ] **Step 1:** Failing spec: `list` filters by `userId` and maps `readAt` → `read`; `markRead` of another user's notification → `NotFoundException` and no update; `markAllRead` updates only `{userId, readAt:null}`; `unreadCount` counts `readAt:null`.
- [ ] **Step 2–4:** run `npx jest src/api/notifications` (FAIL→implement→PASS).
- [ ] **Step 5:** Run the full server suite: `npm run typecheck && npm run lint:check && npx jest` → all pass (this is the first point the server compiles end to end). Commit `feat(server): in-app notifications`.

---

### Task 8: Client foundation (entities, query keys, navigation)

**Files:**
- Rename (git mv, then edit): `entities/club`→`entities/event`, `entities/application`→`entities/participation`; `features/{create-club,delete-club,apply-to-club,manage-applicants}` → `create-event`, `cancel-event`, `request-participation`, `manage-participants` (bodies filled in Tasks 10–11); `widgets/{club-details,clubs-list,my-applications,applicants-list}` → `event-details`, `events-list`, `my-events`, `participants-list`; `_pages/{clubs,club-detail,create-club}` → `events`, `event-detail`, `create-event`; routes `app/(main)/clubs.tsx`→`events.tsx`, `app/clubs/*`→`app/events/*` (`[id]/index.tsx`, `[id]/edit.tsx`, `create.tsx`).
- Create: `entities/notification/{api,model,index}`, `entities/catalog/{api,model,index}`
- Modify: `shared/api/query-keys.ts`, `widgets/bottom-nav/model/navigation.ts`, `entities/user/model/user.model.ts`, `_app/ui/MainLayout.tsx`.

**Interfaces — Produces** (zod schemas mirror the server DTOs exactly; `avatarUrl` keeps the `nullish().transform` idiom):
- `entities/event/model/event.model.ts`: `eventSchema`, `eventListSchema`, `type Event`, `eventStatusSchema`.
- `entities/participation/model/participation.model.ts`: `participationStatusSchema` (6 values), `participantSchema` (`userId, eventId, status, createdAt, user`), `myOrganizedEventSchema` (`event, participantCount, pendingCount`), `myParticipationSchema` (`event, participationStatus`); style helper `participation-status-style.ts` (replaces `application-status-style.ts`, covers all 6 statuses).
- `entities/notification/model/notification.model.ts`: `notificationSchema`, `notificationListSchema`; `notificationText(n): string` — human text per type (e.g. `"{actor} requested to join {event}"`, `"Your request for {event} was approved"`, `"…was rejected"`, `"{event} was cancelled"`); `useNotifications`, `useUnreadCount` in `notification.queries.ts`.
- `entities/catalog`: `catalogSchema`, `useCatalog()` (long `staleTime`).
- `user.model.ts`: `userSchema` += `city: string`, `about: string|null→undefined`.
- `queryKeys`: `events.{all, list(filters), detail(id), participants(id)}`, `users.{preferences, myEvents(role)}`, `notifications.{all, unreadCount}`, `catalog`.
- Tabs: `events` (Events), `my-events` (My Events), `notifications` (Alerts, shows unread badge), `settings` (Profile). Add the new tab route files as thin re-exports like the existing ones.

- [ ] **Step 1:** Write failing tests: `notification.model.test.ts` (text for each of the 4 types; unread → `read:false` parse), `event.model.test.ts` (parses a server-shaped payload, `price:null` and missing `avatarUrl` accepted), `participation-status-style.test.ts` (every status has a style entry).
- [ ] **Step 2:** `cd client && npx jest src/entities` → FAIL.
- [ ] **Step 3:** Do the renames with `git mv`, then implement the new model/query/service files; update all imports (`@/entities/club`→`@/entities/event` etc.) so `npm run typecheck` is green again with temporary stubs only where later tasks fill UI.
- [ ] **Step 4:** `npx jest src/entities && npm run typecheck` → PASS.
- [ ] **Step 5:** Commit `refactor(client): rename club to event and add notification/catalog entities`.

---

### Task 9: Client auth, profile and preferences

**Files:**
- Modify: `features/sign-up/{model/sign-up.schema.ts,ui/SignUpForm.tsx,api/sign-up.ts}` (add City), `widgets/account-info/ui/AccountInfo.tsx` (show city), `_pages/settings/ui/{Settings,SettingsPage}.tsx` (remove hosted-club/applicant/applications sections; keep account info, sign out, delete account, add "Edit profile" link)
- Create: `features/edit-profile/{api,model,ui,index}` (name, city, about, avatar URL), `features/edit-preferences/{api,model,ui,index}` (goal chips, interest chips, languages with level picker A1–C2, all driven by `useCatalog`), `_pages/edit-profile` + route `app/profile/edit.tsx`.

**Interfaces — Consumes:** `useCatalog`, contracts `updateProfileSchema`, `updatePreferencesSchema`, `updateLanguagesSchema`. **Produces:** `useUpdateProfileMutation`, `useUpdatePreferencesMutation`, `useUpdateLanguagesMutation` (each invalidates `queryKeys.auth.me` / `queryKeys.users.preferences`); `toggleCode(list: string[], code: string): string[]` in `edit-preferences/model/toggle-code.ts`.

- [ ] **Step 1:** Failing tests: `sign-up.schema.test.ts` — empty city fails with "City is required", valid payload passes; `toggle-code.test.ts` — adds a missing code, removes a present one, never duplicates; `edit-profile.schema.test.ts` — `about` over 1000 chars fails, empty `about` becomes `null`.
- [ ] **Step 2:** `npx jest src/features` → FAIL. **Step 3:** Implement. **Step 4:** `npx jest src/features && npm run typecheck` → PASS.
- [ ] **Step 5:** Commit `feat(client): city on sign-up, profile and preferences editing`.

---

### Task 10: Client discovery, event detail, create/edit

**Files:**
- Modify: `entities/event/ui/EventCard.tsx` (cover image via `expo-image`, name, category, date/time, address+city, organizer, `spotsLeft/maxParticipants`), `widgets/events-list/*` (filters + search), `widgets/event-details/*`, `features/create-event/*` (category selector, dynamic category fields, city, address, language picker, start/end date-time, price, cover URL, draft/publish), `_pages/event-detail`, `_pages/create-event`.
- Create: `widgets/events-list/model/useEventFilters.ts`, `features/edit-event/*` (reuses the create form with initial values; PATCH), `features/cancel-event/*` (replaces delete-club; confirm modal then `POST /events/:id/cancel`), `features/publish-event/*`.

**Interfaces — Produces:**
- `buildEventsQuery(filters: EventFilters): string` in `entities/event/api/event.service.ts` — returns `/events?...` including only set filters, URL-encoded; `EventFilters = { q?, category?, language?, city?, date? }`. `eventsService.getAll(filters)`.
- `useEventFilters()` — debounced `q` (≈300 ms) + setters; filters sent to the server (replaces the local-only name filter in `useClubSearch`).
- `createEventFormSchema` in `features/create-event/model/create-event.model.ts`: form strings → `CreateEventDto` (`maxParticipants` numeric string, `price` optional string→number, dates → ISO, category-specific `details` built by `buildDetails(category, fields)`).
- `event-status.ts` (in `widgets/event-details/model`, replacing `club-status.ts`): `getEventAction(event, viewerId): 'edit' | 'request' | 'cancel-request' | 'pending' | 'full' | 'closed' | 'none'`.

- [ ] **Step 1:** Failing tests: `buildEventsQuery` (empty → `/events`; `{q:'chess club', city:'Berlin'}` → properly encoded; omits blank values); `buildDetails` for both categories (speaking club omits empty level; board games requires game); `createEventFormSchema` rejects end before start and non-numeric capacity; `getEventAction` table — organizer→`edit`; stranger on PUBLISHED with room→`request`; own `REQUESTED`→`pending`; `APPROVED`→`cancel-request`; full→`full`; CANCELLED/COMPLETED→`closed`; `REJECTED`/`CANCELLED` participation→`none` (cannot re-request).
- [ ] **Step 2:** `npx jest src/entities src/widgets src/features` → FAIL. **Step 3:** Implement UI and logic; event detail shows category details, price (labelled informational), and for organizers Edit / Publish (drafts) / Cancel actions. **Step 4:** PASS + `npm run typecheck && npm run lint`.
- [ ] **Step 5:** Commit `feat(client): event discovery filters, details and create/edit`.

---

### Task 11: Client participation, My Events, notifications

**Files:**
- Modify: `features/request-participation/*` (request + "cancel my participation" mutations, replaces apply flow; keep the success/already-applied modals only if still used — otherwise delete), `features/manage-participants/*` (approve/reject), `widgets/participants-list/*` (requested vs confirmed sections, used on the organizer's event detail), `widgets/my-events/*`, `_pages/my-events` + `_pages/notifications` + their routes.
- Create: `features/mark-notification-read/*` (single + all).

**Interfaces — Consumes:** Task 8 entities and query keys. **Produces:**
- `MyEvents` widget with two sections ("Organized by Me": status badge, `participantCount/maxParticipants`, pending-requests count, actions View/Edit/Cancel; "Participating": participation-status badge, date, address). Section selection state local to the widget.
- Mutations invalidate: `events.detail(id)`, `events.all`, `users.myEvents('organizer'|'participant')`, `events.participants(id)`, `notifications.unreadCount`, as applicable.
- Notifications screen lists `notificationText`, unread dot, tap → mark read and open the event; "Mark all read" button; tab badge via `useUnreadCount` (refetch interval 30 s and on focus — no websockets).

- [ ] **Step 1:** Failing tests: `participation-status-style` already covered; add `my-events.model.test.ts` for `describeOrganizedEvent(item): { statusLabel, capacityLabel: '3/10', pendingLabel: '2 pending' | null }` and `notification-nav.test.ts` for `notificationHref(n): '/events/{id}'`.
- [ ] **Step 2:** `npx jest src/widgets src/features src/entities` → FAIL. **Step 3:** Implement screens and mutations. **Step 4:** PASS.
- [ ] **Step 5:** `npm run typecheck && npm run lint && npx jest` → all green. Commit `feat(client): participation flow, my events and notifications`.

---

### Task 12: Docs and end-to-end verification

**Files:** Modify `README.md` (replace clubs wording with events; features, structure, schema list, statuses, API table, setup incl. `prisma migrate dev` and `prisma db seed`), `client/.env.example`/`server/.env.example` only if needed.

- [ ] **Step 1:** Update README sections: Features, Project Structure (`api/events`, `api/notifications`, `api/catalog`), new "API overview" table of all routes in this plan, "Getting started" with migrate + seed commands.
- [ ] **Step 2:** Run everything: `cd server && npm run typecheck && npm run lint:check && npx jest` and `cd client && npm run typecheck && npm run lint && npx jest`. Expected: all pass.
- [ ] **Step 3:** Smoke test against the real server (`npm run start:dev`, DB migrated+seeded) with curl or the app: sign up two users (with city) → set preferences/languages → user A creates a published Speaking Club and a draft Board Games event → user B sees only the published one via `GET /events?category=SPEAKING_CLUB&city=…&q=…` → B requests (A gets a notification) → A approves (B gets a notification) → B cancels participation → A cancels the event (B gets none for CANCELLED row, a REQUESTED/APPROVED one does) → verify each business rule from the spec returns the expected 4xx.
- [ ] **Step 4:** Commit `docs: events platform README` and report remaining work (attendance marking, image upload, email) to the user.
