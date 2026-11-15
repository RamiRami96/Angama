# Client → FSD Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Reorganise `client/` into Feature-Sliced Design v2.1 layers with no behaviour or visual change.

**Architecture:** expo-router routes live in a root `client/app/` as one-line re-exports; `client/src/` holds only FSD layers (`_app`, `_pages`, `widgets`, `features`, `entities`, `shared`). Migration runs bottom-up (shared → entities → features → widgets → pages → app/routes) so `tsc` is clean after every task.

**Tech Stack:** Expo 54 / expo-router 6 (typedRoutes on), React Native 0.81, NativeWind 4, TanStack Query 5, react-hook-form + zod, TypeScript 5.9.

**Spec:** `docs/superpowers/specs/2026-11-15-client-fsd-design.md`

## Global Constraints

- Pure move/rewire. No dependency changes, no UI/behaviour changes, no `server/` changes.
- Layers (downward imports only): `_app` > `_pages` > `widgets` > `features` > `entities` > `shared`. No `processes` layer.
- No slice imports another slice on the same layer. No upward imports.
- Every slice has an `index.ts` public API; other slices import only `@/<layer>/<slice>` (never a deep path). Inside a slice use relative imports. `shared` has per-segment barrels: `@/shared/ui`, `@/shared/api`, `@/shared/lib`.
- Segments used: `ui`, `model`, `api`, `lib`, `config`. Keep existing exported component/hook names; rename files only when the move requires it.
- Route files in `client/app/` contain only re-exports. `client/src/app` and `client/src/pages` and `client/src/modules` must not exist at the end.
- Query keys stay in one place: `src/shared/api/query-keys.ts` (so entities/features never import each other for keys).
- Use `git mv` for moves so history follows. Commit after each task; commit messages end with the line `Co-Authored-By: Claude Sonnet 5.5 <noreply@anthropic.com>`.
- Work on branch `refactor/client-fsd` (create from `main` in Task 1). All commands run from `/Users/ramiramira/Documents/Spiko/client` unless stated.
- Verification = `npx tsc --noEmit` (clean at baseline) + Expo bundle. There is no test suite; do not add one.
- The client `AGENTS.md` says to consult Expo docs before coding; for expo-router root-`app/` behaviour check the docs for the installed SDK (54) if anything in Task 7 behaves unexpectedly.

## Review Focus

1. **NativeWind styles silently vanish** if tailwind `content` omits `./app/**` or metro `input` points at the old `global.css` path — screens render unstyled with no error. Pinned in Task 7 (config grep + bundle).
2. **Both `src/app` and `app/` exist** → expo-router prefers `src/app` and the new routes are ignored. Pinned in Task 7 (`src/app` deleted; route list printed from the bundle).
3. **typedRoutes breaks**: `router.replace("/(main)/clubs")`, `router.push(...)` in moved code fail `tsc` until `.expo/types/router.d.ts` regenerates from the new `app/` folder. Pinned in Task 7 (regenerate types, `tsc` clean).
4. **Circular imports via barrels** (e.g. `entities/club/index.ts` → ui → another entity barrel). Pinned in Task 8 (layer/slice check script + bundle).
5. **Auth bootstrap and splash**: `RootLayout` must still call `SplashScreen.preventAutoHideAsync()` at module load and run the `fetchQuery(auth.me)` redirect to `/(main)/clubs`; and `clubs/[id]` must still read `id` from route params. Pinned in Task 7 (diff review of moved logic against old `_layout.tsx` / `[id].tsx`).

---

### Task 1: Branch, baseline, dead-code removal

**Files:**
- Delete: `src/shared/const/applications.store.ts`, `src/modules/clubs/const/mock-clubs.ts`, `src/modules/settings/const/mock-applicants.const.ts`, `src/shared/models/registration.model.ts`, `src/modules/club-detail/const/club-registration.const.ts`

**Interfaces:** Produces: clean branch `refactor/client-fsd` with baseline recorded.

- [ ] **Step 1:** `git checkout -b refactor/client-fsd`. Commit the untracked `docs/` folder (spec + this plan) on it.
- [ ] **Step 2:** Run `npx tsc --noEmit`; expected: no output (baseline is clean).
- [ ] **Step 3:** Baseline bundle: `npx expo export --platform ios --output-dir <scratchpad>/baseline-export`. Expected: exits 0. If it cannot run in this environment (network/native), record that and use `npx expo export --platform web` instead; if neither works, say so in the final report and rely on `tsc`.
- [ ] **Step 4:** For each file in the Delete list, confirm no importers: `grep -rnE "applications\.store|mock-clubs|mock-applicants|registration\.model|club-registration" src` returns only the files themselves/none. Delete those with no importers. (The last two are an addition to the spec's cleanup list under the same no-importers rule — note it in the final report.)
- [ ] **Step 5:** `npx tsc --noEmit` clean; commit `chore: remove unused mocks and stores`.

---

### Task 2: `shared` layer

**Files (git mv, then fix importers across `src/`):**

| From | To |
|---|---|
| `shared/services/api.ts` | `shared/api/client.ts` |
| `shared/queries/query-keys.ts` | `shared/api/query-keys.ts` |
| `shared/components/{GradientButton,Input,ConfirmModal,DatePickerInput,ScreenLayout}.tsx` | `shared/ui/` (same names) |
| `shared/utils/date.utils.ts` | `shared/lib/date.ts` |

- Create: `shared/api/index.ts` exporting `API, getSid, storeSid, clearSid, request` (from `./client`) and `queryKeys`; `shared/ui/index.ts` exporting `ConfirmModal, DatePickerInput, GradientButton, Input, ScreenLayout`; `shared/lib/index.ts` exporting `formatDate, formatTime`.
- Not moved yet (later tasks): `BottomNav.tsx`, `navigation.model.ts`, all other `shared/{services,queries,models,const}` files.
- Delete: `shared/index.ts`, `shared/components/index.ts`.

**Interfaces:**
- Consumes: nothing.
- Produces: `@/shared/api` (`request<T>(path, options?)`, `getSid`, `storeSid`, `clearSid`, `API`, `queryKeys`), `@/shared/ui` (the five components), `@/shared/lib` (`formatDate`, `formatTime`). `BottomNav` is temporarily imported by `(main)/_layout.tsx` via its current path `@/shared/components/BottomNav`.

- [ ] **Step 1:** Do the `git mv`s and create the three barrels. `shared/services/*.service.ts` and `queries/*.queries.ts` now import `request`/`queryKeys` from `@/shared/api`.
- [ ] **Step 2:** Rewrite all importers: `@/shared/components` → `@/shared/ui`, `@/shared/utils/date.utils` → `@/shared/lib`, `@/shared/services` (only for `request`) → `@/shared/api`, `@/shared/queries/query-keys` / `./query-keys` → `@/shared/api`.
- [ ] **Step 3:** `npx tsc --noEmit` clean; `grep -rn "shared/components\|shared/utils" src` returns only BottomNav's own import of `navigation.model` and the `_layout` BottomNav import.
- [ ] **Step 4:** Commit `refactor(client): FSD shared layer`.

---

### Task 3: `entities` layer (user, club, application)

**Files (create; move code from the listed sources, then delete the sources):**

| New file | Source |
|---|---|
| `entities/user/model/user.model.ts` | `shared/models/user.model.ts` |
| `entities/user/api/user.service.ts` | `authService.getCurrentUser` (auth.service.ts) + `usersService.getHostedClub` (users.service.ts) |
| `entities/user/api/user.queries.ts` | `useCurrentUserQuery` (auth.queries.ts) + hosted-club ref query (users.queries.ts) |
| `entities/user/model/useCurrentUser.ts` | `modules/settings/hooks/useCurrentUser.ts` |
| `entities/club/model/club.model.ts` | `shared/models/club.model.ts` |
| `entities/club/model/status-styles.ts` | `shared/const/status-styles.ts` |
| `entities/club/api/club.service.ts` | `clubsService.getAll`, `getOne` only |
| `entities/club/api/club.queries.ts` | `useClubsQuery`, `useClubQuery` |
| `entities/club/ui/ClubCard.tsx` | `modules/clubs/components/ClubCard.tsx` |
| `entities/application/model/application.model.ts` | `shared/models/application.model.ts` |
| `entities/application/model/status-style.ts` | `modules/settings/const/status-style.const.ts` (`STATUS_STYLE`) |
| `entities/application/api/application.service.ts` | `applicationsService.getApplicants`, `getMyApplications` + types `Applicant`, `MyApplication` |
| `entities/application/api/application.queries.ts` | `useApplicantsQuery`, `useMyApplicationsQuery` |
| `entities/application/ui/ApplicationRow.tsx` | `modules/settings/components/ApplicationRow.tsx` |

Each slice gets an `index.ts`.

**Interfaces — Produces (public API):**
- `@/entities/user`: `type User`, `userService: { getCurrentUser(): Promise<User | null>; getHostedClub(): Promise<{ id: string } | null> }`, `useCurrentUserQuery()`, `useCurrentUser(): User | null`, `useHostedClubRefQuery(userId: string | undefined)` (the raw `useQuery` result for `{ id: string } | null`, `enabled: !!userId`, key `queryKeys.users.hostedClub`). `getCurrentUser` keeps its catch → `clearSid()` → `null` behaviour.
- `@/entities/club`: `type Club`, `STATUS_STYLES`, `clubsService: { getAll; getOne }`, `useClubsQuery()`, `useClubQuery(id: string)` (keeps its `initialData`/`initialDataUpdatedAt` from the `clubs.all` cache), `ClubCard`.
- `@/entities/application`: `type Application`, `type ApplicationStatus`, `STATUS_STYLE`, `type Applicant`, `type MyApplication`, `applicationsService: { getApplicants; getMyApplications }`, `useApplicantsQuery(clubId: string | undefined)`, `useMyApplicationsQuery(enabled: boolean)`, `ApplicationRow`.
- No entity imports another entity. `useHostedClubQuery` (which composed user + club) is **not** recreated here; Task 6 composes it in the settings page.
- Remaining mutations/services (auth sign-in/up/out/delete, club create/remove/apply, accept/reject) are still in the old `shared/services` / `shared/queries` files until Task 4; trim those files so nothing is duplicated, and repoint the old importers (`modules/*`, `pages/*`, `app/_layout`) to the new entity paths.

- [ ] **Step 1:** Create the three slices per the table (`git mv` where a file moves whole; split by copy+delete where noted). Every `request`/`queryKeys` import comes from `@/shared/api`.
- [ ] **Step 2:** Replace `useHostedClubQuery` users: temporarily keep the old `shared/queries/users.queries.ts` composing `useHostedClubRefQuery` + `useClubQuery` so `modules/settings` still compiles (it is deleted in Task 6).
- [ ] **Step 3:** Repoint every importer of moved symbols. `npx tsc --noEmit` clean.
- [ ] **Step 4:** Check: `grep -rn "@/entities/" src/entities` shows no cross-entity imports. Commit `refactor(client): FSD entities layer`.

---

### Task 4: `features` layer

**Files (create; sources are the old `shared/services|queries` pieces and `modules/*`):**

| Slice | Files |
|---|---|
| `features/sign-in` | `api/sign-in.ts` (`signIn(email: string, password: string): Promise<User>`, stores sid), `model/useSignInMutation.ts` (sets `queryKeys.auth.me`), `model/sign-in.schema.ts` (`signInSchema`, `SignInFormData`), `ui/SignIn.tsx`, `ui/SignInForm.tsx` |
| `features/sign-up` | `api/sign-up.ts` (`signUp(data: { name; email; password; dateOfBirth }): Promise<User>`), `model/useSignUpMutation.ts`, `model/sign-up.schema.ts`, `ui/SignUp.tsx`, `ui/SignUpForm.tsx` |
| `features/sign-out` | `api/sign-out.ts` (`signOut(): Promise<void>`, swallow request error, `clearSid`), `model/useSignOutMutation.ts` (clears query cache), `model/useSignOut.ts` |
| `features/delete-account` | `api/delete-account.ts`, `model/useDeleteAccountMutation.ts` (clears cache), `model/useDeleteAccount.ts` |
| `features/create-club` | `api/create-club.ts` (`createClub(data: CreateClubData)`), `model/useCreateClubMutation.ts`, `model/create-club.model.ts` (`CreateClubFields`, `CreateClubData`), `config/create-club.const.ts` (`EMPTY_CLUB_FIELDS`), `ui/{CreateClub,CreateClubContainer,Field,DateTimePickerField}.tsx` |
| `features/apply-to-club` | `api/apply-to-club.ts`, `model/useApplyToClubMutation.ts`, `ui/{ApplySuccessModal,AlreadyAppliedModal}.tsx` |
| `features/delete-club` | `api/delete-club.ts`, `model/useDeleteClubMutation.ts`, `ui/DeleteClubModal.tsx` |
| `features/manage-applicants` | `api/manage-applicants.ts` (`acceptApplicant(clubId, userId)`, `rejectApplicant(clubId, userId)`), `model/applicant-mutations.ts` (`useAcceptApplicantMutation`, `useRejectApplicantMutation`), `ui/ApplicantRow.tsx` |

**Interfaces:**
- Consumes: `@/shared/api` (`request`, `storeSid`, `clearSid`, `queryKeys`), `@/shared/ui`, `@/entities/user` (`User`), `@/entities/club` (`Club`, `useClubQuery` if needed).
- Produces (`index.ts` of each slice): `SignInForm`; `SignUpForm`; `useSignOut`; `useDeleteAccount`; `CreateClubContainer`; `useApplyToClubMutation`, `ApplySuccessModal`, `AlreadyAppliedModal`; `useDeleteClubMutation`, `DeleteClubModal`; `useAcceptApplicantMutation`, `useRejectApplicantMutation`, `ApplicantRow`. Mutation invalidation keys and `onSuccess` bodies are copied unchanged from the old query files.
- `modules/*` still exist after this task and import these via the barrels; no feature imports another feature.

- [ ] **Step 1:** Create each slice; move/split code from the old `auth.service/auth.queries`, `clubs.service/clubs.queries` (create/remove/apply), `applications.service/queries` (accept/reject) and the `modules/{sign-in,sign-up,create-club,club-detail,settings}` files named above. Delete the old service/queries files once empty (`shared/services`, `shared/queries`, `shared/models` should be gone or empty except `navigation.model.ts`, `shared/const` empty).
- [ ] **Step 2:** Repoint importers in remaining `modules/*`/`pages/*`. `npx tsc --noEmit` clean.
- [ ] **Step 3:** Check no cross-feature imports: `grep -rn "@/features/" src/features` returns nothing. Commit `refactor(client): FSD features layer`.

---

### Task 5: `widgets` layer

**Files:**

| Slice | Files (source) |
|---|---|
| `widgets/bottom-nav` | `ui/BottomNav.tsx` (`shared/components/BottomNav.tsx`), `model/navigation.ts` (`Route`, `TabConfig`, `TABS` from `shared/models/navigation.model.ts`) |
| `widgets/clubs-list` | `ui/Clubs.tsx`, `ui/ClubsList.tsx`, `ui/SearchBar.tsx`, `model/useClubs.ts` (from `modules/clubs`) |
| `widgets/club-details` | `ui/ClubDetail.tsx`, `ui/ClubDetailContainer.tsx`, `model/{useClubDetailModals,useClubMembers,useClubStatus,useClubUserRelation}.ts` (from `modules/club-detail`) |
| `widgets/account-info` | `ui/AccountInfo.tsx`, `ui/Row.tsx` |
| `widgets/applicants-list` | `ui/ApplicantsList.tsx` (uses `ApplicantRow` from `@/features/manage-applicants`) |
| `widgets/my-applications` | `ui/UserApplicationsList.tsx` (uses `ApplicationRow` from `@/entities/application`) |

**Interfaces:**
- Consumes: entities/features barrels from Tasks 3–4; `@/entities/user` `useCurrentUser` replaces the old cross-module `@/modules/settings/hooks/useCurrentUser` import in `ClubDetailContainer`; `ClubCard` from `@/entities/club` inside `Clubs.tsx`.
- Produces: `BottomNav`, `ClubsList`, `ClubDetailContainer`, `AccountInfo`, `ApplicantsList`, `UserApplicationsList` (from `widgets/my-applications`). `TABS` stays internal to bottom-nav.

- [ ] **Step 1:** Move files, create `index.ts` per slice exporting the names above, rewrite imports to barrels/relative.
- [ ] **Step 2:** Update remaining consumers (`modules/settings`, `app/(main)/_layout.tsx`). `npx tsc --noEmit` clean.
- [ ] **Step 3:** Check no cross-widget imports: `grep -rn "@/widgets/" src/widgets` returns nothing. Commit `refactor(client): FSD widgets layer`.

---

### Task 6: `_pages` layer

**Files:**

| Slice | Files |
|---|---|
| `_pages/start` | `ui/{StartPage,Start,StartScreen,FloatingLetter,FloatingLetters}.tsx`, `model/{useStartAnimation,useParticleAnimation}.ts`, `config/particles.const.ts` (from `modules/start`; `StartPage` renders `<StartScreen />`) |
| `_pages/sign-in` | `ui/SignInPage.tsx` → renders `<SignInForm />` |
| `_pages/sign-up` | `ui/SignUpPage.tsx` → renders `<SignUpForm />` |
| `_pages/clubs` | `ui/ClubsPage.tsx` → renders `<ClubsList />` |
| `_pages/create-club` | `ui/CreateClubPage.tsx` → renders `<CreateClubContainer />` |
| `_pages/club-detail` | `ui/ClubDetailPage.tsx` |
| `_pages/settings` | `ui/{SettingsPage,SettingsForm,Settings}.tsx`, `model/useApplicants.ts`, `model/useHostedClub.ts` |

**Interfaces:**
- Produces: each `index.ts` exports `<Name>Page` (`StartPage`, `SignInPage`, `SignUpPage`, `ClubsPage`, `CreateClubPage`, `ClubDetailPage`, `SettingsPage`), all with no props.
- `ClubDetailPage(): JSX.Element` now reads `const { id } = useLocalSearchParams<{ id: string }>()` and uses `useRouter().back()` for `onBack` (logic moved verbatim from `app/clubs/[id].tsx`), then renders `<ClubDetailContainer id={id} onBack={...} />`.
- `useHostedClub(user: User | null): Club | null` composes `useHostedClubRefQuery(user?.id)` and `useClubQuery(ref.data?.id ?? "")` and returns `ref.data ? (club.data ?? null) : null` (identical semantics to the deleted `useHostedClubQuery`).
- `Settings`/`SettingsForm` use `AccountInfo`, `ApplicantsList`, `UserApplicationsList` from widgets, `useSignOut`/`useDeleteAccount` from features, `useCurrentUser` from `@/entities/user`; `useApplicants` imports the queries from `@/entities/application` and the mutations from `@/features/manage-applicants`.

- [ ] **Step 1:** Move files and create the page barrels. Delete the old `shared/queries/users.queries.ts` stopgap from Task 3.
- [ ] **Step 2:** Repoint `src/app/*` route files to `@/_pages/<slice>` (they still live in `src/app` until Task 7; `[id].tsx` becomes a plain re-export now). `npx tsc --noEmit` clean.
- [ ] **Step 3:** `src/modules`, `src/pages` should now be empty — delete them. Check no cross-page imports: `grep -rn "@/_pages/" src/_pages` returns nothing. Commit `refactor(client): FSD pages layer`.

---

### Task 7: `_app` layer, root `app/` routes, config

**Files:**
- Create: `src/_app/model/query-client.ts` (exports `queryClient`, same `defaultOptions`: `staleTime: 30_000`, `retry: 1`), `src/_app/ui/RootLayout.tsx`, `src/_app/ui/MainLayout.tsx`, `src/_app/index.ts` (exports `RootLayout`, `MainLayout`), `src/_app/styles/global.css` (git mv from `src/global.css`).
- Create (root `client/app/`, re-exports only): `_layout.tsx`, `index.tsx`, `sign-in.tsx`, `sign-up.tsx`, `(main)/_layout.tsx`, `(main)/clubs.tsx`, `(main)/settings.tsx`, `clubs/[id].tsx`, `clubs/create.tsx`.
- Delete: `src/app/` (whole folder).
- Modify: `metro.config.js` (`withNativeWind(config, { input: "./src/_app/styles/global.css" })`), `tailwind.config.js` (`content: ["./app/**/*.{js,jsx,ts,tsx}", "./src/**/*.{js,jsx,ts,tsx}"]`).

**Interfaces:**
- `RootLayout` = old `src/app/_layout.tsx` body moved verbatim: module-level `SplashScreen.preventAutoHideAsync().catch(() => {})`, the `useEffect` that `queryClient.fetchQuery({ queryKey: queryKeys.auth.me, queryFn: userService.getCurrentUser })` then `router.replace("/(main)/clubs")` if a user, `finally` hide splash; renders `QueryClientProvider` + `<Stack screenOptions={{ headerShown: false }} />`. Imports `../styles/global.css`.
- `MainLayout` = old `src/app/(main)/_layout.tsx` body (gradient + `Tabs` with `tabBar` → `BottomNav` from `@/widgets/bottom-nav`).
- Route files, e.g. `app/_layout.tsx`: `export { RootLayout as default } from "@/_app";`; `app/(main)/clubs.tsx`: `export { ClubsPage as default } from "@/_pages/clubs";` and so on per page (`index` → `StartPage`, `clubs/create` → `CreateClubPage`, `clubs/[id]` → `ClubDetailPage`).

- [ ] **Step 1:** Create `_app` slice files by moving logic from `src/app/_layout.tsx` and `src/app/(main)/_layout.tsx`; move `global.css`.
- [ ] **Step 2:** Create root `app/` routes, `git rm -r src/app`, update `metro.config.js` and `tailwind.config.js`.
- [ ] **Step 3:** Regenerate typed routes (`npx expo customize tsconfig.json` is not needed; run `npx expo export --platform ios --output-dir <scratchpad>/fsd-export` which regenerates `.expo/types`). `npx tsc --noEmit` clean.
- [ ] **Step 4:** Confirm routes were picked up: the export output lists the same route set as the baseline from Task 1 (start, sign-in, sign-up, (main)/clubs, (main)/settings, clubs/[id], clubs/create). Confirm styling pipeline: `grep -n "global.css" metro.config.js src/_app/ui/RootLayout.tsx` and `grep -n "./app" tailwind.config.js`.
- [ ] **Step 5:** Diff-review `RootLayout` and `ClubDetailPage` against the old `_layout.tsx` and `[id].tsx` (`git show main:client/src/app/_layout.tsx`) to confirm the bootstrap/splash/params logic is unchanged.
- [ ] **Step 6:** Commit `refactor(client): FSD app layer and root routes`.

---

### Task 8: Final sweep, boundary check, docs

**Files:**
- Modify: `README.md` (the "Project Structure" section) and, if it describes structure, `client/AGENTS.md`/`CLAUDE.md` — add a short FSD layout + import rule.
- Verify: whole `client/` tree.

**Interfaces:** none produced.

- [ ] **Step 1:** Confirm removed dirs: `test ! -e src/modules && test ! -e src/pages && test ! -e src/app && test ! -e src/shared/services && test ! -e src/shared/queries && test ! -e src/shared/models`.
- [ ] **Step 2:** Upward-import check (each command must print nothing), run from `client/src`:
  - `grep -rnE "@/(_app|_pages|widgets|features|entities)" shared`
  - `grep -rnE "@/(_app|_pages|widgets|features)" entities`
  - `grep -rnE "@/(_app|_pages|widgets)" features`
  - `grep -rnE "@/(_app|_pages)" widgets`
  - `grep -rn "@/_app" _pages`
- [ ] **Step 3:** Same-layer and deep-import check. For each layer `L` in `entities features widgets _pages`, `grep -rn "@/L/" L` must print nothing (slices in the same layer never import each other, and a slice uses relative imports for itself). Also `grep -rnE "@/(entities|features|widgets|_pages)/[^/\"']+/[^\"']+" . ../app` must print nothing (no deep imports into slices).
- [ ] **Step 4:** Old paths gone: `grep -rnE "@/(modules|pages|shared/(components|services|queries|models|const|utils))" . ../app` prints nothing.
- [ ] **Step 5:** Final `npx tsc --noEmit` clean and a fresh `npx expo export --platform ios --output-dir <scratchpad>/final-export` exits 0 (or the same fallback used for the baseline).
- [ ] **Step 6:** Update the README structure section, commit `docs: describe FSD structure`. Report: what was verified, what could not be (e.g. no manual device walk), and the two extra deleted files from Task 1.
