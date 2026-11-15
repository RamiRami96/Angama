# Client → Feature-Sliced Design (FSD)

Date: 2026-11-15 · Scope: `client/` (Expo / expo-router app). `server/` untouched.

## Intent
Reorganise the client into FSD v2.1 layers (https://feature-sliced.design/) so there is one
convention for where code lives and which direction imports may flow. The user pointed at
FSD as "a guide and example"; the stated reason for wanting it was not given beyond that.

## Goals
- Layers: `_app`, `_pages`, `widgets`, `features`, `entities`, `shared` (downward-only imports).
- Slices with segments (`ui`, `model`, `api`, `lib`, `config`) and an `index.ts` public API per slice.
- No behaviour or visual change. App builds and runs exactly as before.

## Non-goals / anti-goals
- No new features, no UI redesign, no server changes, no dependency changes.
- No `processes` layer (deprecated in FSD v2.1).
- No boundary linter (steiger / eslint-plugin-boundaries) in this change — can be a follow-up.
- Anti-goal: a half-migrated tree with both `modules/` and FSD layers.

## Approaches considered
- **A. Official recipe (chosen by user):** expo-router routes in root `client/app/` as one-line
  re-exports; FSD layers inside `src/`, with `app`/`pages` renamed `_app`/`_pages` (per the FSD
  Next.js guide). Cost: touch a few config paths.
- B. Keep routes in `src/app`, FSD app layer `src/_app`. Less config churn but `app` next to
  `_app` is confusing and departs from the guide. Rejected.

## Target structure
```
client/
  app/                         # expo-router routes (thin re-exports only)
    _layout.tsx                -> export { RootLayout as default } from '@/_app'
    index.tsx, sign-in.tsx, sign-up.tsx
    (main)/_layout.tsx, clubs.tsx, settings.tsx
    clubs/[id].tsx, clubs/create.tsx
  src/
    _app/        providers (QueryClientProvider, splash/auth bootstrap), root layout, styles/global.css
    _pages/      start, sign-in, sign-up, clubs, club-detail, create-club, settings   (ui, model)
    widgets/     clubs-list, club-details, applicants-list, my-applications, account-info, bottom-nav
    features/    sign-in, sign-up, sign-out, delete-account, create-club,
                 apply-to-club, delete-club, manage-applicants
    entities/    user, club, application   (api: service+queries, model: types, ui: e.g. ClubCard)
    shared/      ui (GradientButton, Input, ConfirmModal, DatePickerInput, ScreenLayout),
                 api (request client), lib (date utils), config (query keys if not per-entity)
```
Exact slice boundaries (e.g. whether `ClubCard` is entity UI or part of `clubs-list`, which
widgets own which hooks) are the builder's call, guided by the import rule.

## Mapping from today
- `shared/services/*` + `shared/queries/*` + `shared/models/*` → split by domain into
  `entities/{user,club,application}/{api,model}`; auth service/mutations → `features/*` and
  `entities/user` (current user query).
- `modules/<screen>/components|hooks|schemas|const` → the widget/feature/page that owns it.
- `modules/settings/hooks/useCurrentUser` (imported by club-detail — a cross-slice violation)
  → `entities/user`.
- `pages/*Page.tsx` → `_pages/<slice>/ui`; `modules/*/index.ts` removed.
- `shared/components/BottomNav` + `models/navigation.model` → `widgets/bottom-nav`.
- Cross-entity needs (e.g. `useHostedClubQuery` uses club query) → FSD `@x` notation or lift the
  composition into a feature/widget.

## Config changes required
- Routes dir moves to root `app/`; delete `src/app` (expo-router prefers `src/app` if present).
- `metro.config.js`: nativewind `input` → new location of `global.css` (`src/_app/styles/global.css`).
- `tailwind.config.js` `content`: add `./app/**/*.{ts,tsx}` alongside `./src/**`.
- Root layout's `../global.css` import path updated.
- `tsconfig` `@/*` → `./src/*` stays; `app/` files import via `@/…`.

## Cleanup (my calls, flagged)
- `shared/const/applications.store.ts`, `modules/clubs/const/mock-clubs.ts`,
  `modules/settings/const/mock-applicants.const.ts` have no importers → delete.
- Two status-style constants exist (`shared/const/status-styles.ts`,
  `modules/settings/const/status-style.const.ts`) → keep both unless trivially identical; no
  behaviour change.

## Verification
No test suite exists. Done = `npx tsc --noEmit` clean, `npx expo export --platform ios` (or
`expo start` bundle) succeeds, grep shows no imports of old paths and no upward/same-layer
slice imports, and a manual walk of start → sign-in → clubs → club detail → create → settings
where feasible. Report anything not verifiable.

## Left to the builder
Slice naming details, which segment a file lands in, order of migration (suggested: shared →
entities → features → widgets → pages → `_app`/routes, keeping the app compiling at each step),
commit granularity.
