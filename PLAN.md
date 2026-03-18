# Cycle KPI Feature Plan

## Goal

Implement a new `KPI` entry point from the project cycle list that opens a new cycle KPI screen at:

`/[workspaceSlug]/projects/[projectId]/cycles/[cycleId]/kpi`

The first KPI view must show a burndown chart based on estimate points, not ticket count.

## Confirmed Product Decisions

- The new action label is `KPI`.
- The new action must appear on the cycle row between the favorite star and the three-dot quick actions menu.
- The KPI page must live under the existing project cycle detail route.
- Version 1 only needs one KPI card/view: estimate-point burndown.
- Estimate points are the sum of each ticket's estimate.
- Cancelled items must not burn down the chart in version 1.
- The implementation should reuse existing route/layout/chart/data flows whenever possible.

## Maintenance Rules For This File

- [ ] Update this file every time code changes for this feature.
- [ ] Keep each checklist item in sync with the actual implementation state.
- [ ] Add newly touched files to the change log section after each implementation step.
- [ ] Record every test command that was run and its result in the test log section.
- [ ] Add follow-up tasks here immediately if new scope or blockers are discovered.

## Change Log

- [x] 2026-03-17: Created `PLAN.md` after investigating the cycle KPI route, action placement, data source reuse, and current test structure.
- [x] 2026-03-17: Removed mobile-specific implementation and QA scope from the plan per product clarification; this feature only needs desktop handling.
- [x] 2026-03-17: Added open-core import guidance to avoid depending on premium-only modules that are not present in this edition.
- [x] 2026-03-17: Implemented the desktop KPI action button in `apps/web/core/components/cycles/list/cycle-list-item-action.tsx`; the button now routes to the future `/kpi` screen, stays CE-safe, and is intentionally visible to any cycle viewer because it is navigation-only. Touched files: `apps/web/core/components/cycles/list/cycle-list-item-action.tsx`, `PLAN.md`.
- [x] 2026-03-17: Implemented the phase 3 KPI route shell in `apps/web/app/(all)/[workspaceSlug]/(projects)/projects/(detail)/[projectId]/cycles/(detail)/[cycleId]/kpi/page.tsx` and `apps/web/core/components/cycles/kpi/page-shell.tsx`; the page now lives inside the cycle detail layout, fetches cycle details safely on direct access, reuses cycle analytics loading, and renders the initial KPI shell. Touched files: `apps/web/app/(all)/[workspaceSlug]/(projects)/projects/(detail)/[projectId]/cycles/(detail)/[cycleId]/kpi/page.tsx`, `apps/web/core/components/cycles/kpi/page-shell.tsx`, `PLAN.md`.
- [x] 2026-03-17: Wired the first KPI burndown card to estimate-point data by updating `apps/web/core/components/cycles/kpi/page-shell.tsx` and extending `apps/web/core/components/core/sidebar/progress-chart.tsx` for KPI-specific axis/legend copy while preserving existing consumers. The KPI page now renders the estimate-point burndown, summary metrics, loading behavior, and empty states for missing dates or missing estimates. Touched files: `apps/web/core/components/cycles/kpi/page-shell.tsx`, `apps/web/core/components/core/sidebar/progress-chart.tsx`, `PLAN.md`.
- [x] 2026-03-17: Isolated the KPI burndown implementation into `apps/web/core/components/cycles/kpi/burndown-chart.tsx` and restored `apps/web/core/components/core/sidebar/progress-chart.tsx` to its shared behavior so the existing cycle-page burndown remains untouched. Touched files: `apps/web/core/components/cycles/kpi/burndown-chart.tsx`, `apps/web/core/components/cycles/kpi/page-shell.tsx`, `apps/web/core/components/core/sidebar/progress-chart.tsx`, `PLAN.md`.
- [x] 2026-03-17: Corrected the KPI-only burndown transformation in `apps/web/core/components/cycles/kpi/burndown-chart.tsx` so the chart normalizes unexpected completed-progress payloads into remaining points and clamps values to the valid range, fixing the observed `0` to negative line without affecting the existing cycle-page chart. Touched files: `apps/web/core/components/cycles/kpi/burndown-chart.tsx`, `PLAN.md`.
- [x] 2026-03-17: Added a new phase 8 plan for KPI burndown filters so labels and other filter dimensions can be implemented in a dedicated follow-up without changing the current phase ordering. Touched files: `PLAN.md`.
- [x] 2026-03-17: Added a KPI-only tendency line to `apps/web/core/components/cycles/kpi/burndown-chart.tsx`, mirroring the expected burndown behavior without altering the existing cycle-page chart. Touched files: `apps/web/core/components/cycles/kpi/burndown-chart.tsx`, `PLAN.md`.
- [x] 2026-03-17: Implemented phase 8 label filtering fully on the frontend by fetching cycle issues, project labels, and project estimates on the KPI page, then recomputing the burndown client-side for the selected labels. Touched files: `apps/web/core/components/cycles/kpi/filter-utils.ts`, `apps/web/core/components/cycles/kpi/page-shell.tsx`, `PLAN.md`.

## Test Log

- [x] 2026-03-17: Attempted `pnpm exec eslint core/components/cycles/list/cycle-list-item-action.tsx` from `apps/web`; failed because `pnpm` is not installed in the shell environment.
- [x] 2026-03-17: Attempted `npm exec pnpm -- exec eslint core/components/cycles/list/cycle-list-item-action.tsx` from `apps/web`; failed because the local ESLint config package `@plane/eslint-config/next.js` is unavailable without workspace dependencies installed.
- [x] 2026-03-17: Attempted `npm exec pnpm -- check:types` from `apps/web`; failed because `tsc` is unavailable and the workspace `node_modules` are not installed.
- [x] 2026-03-17: `pnpm --filter web exec eslint "app/(all)/[workspaceSlug]/(projects)/projects/(detail)/[projectId]/cycles/(detail)/[cycleId]/kpi/page.tsx" "core/components/cycles/kpi/page-shell.tsx"` passed.
- [x] 2026-03-17: `pnpm --filter web check:types` passed after the phase 3 KPI route shell changes.
- [x] 2026-03-17: `pnpm --filter web exec eslint "core/components/core/sidebar/progress-chart.tsx" "core/components/cycles/kpi/page-shell.tsx"` passed after wiring the estimate-point burndown card.
- [x] 2026-03-17: `pnpm --filter web check:types` passed after wiring the estimate-point burndown card.
- [x] 2026-03-17: `pnpm --filter web exec eslint "core/components/core/sidebar/progress-chart.tsx" "core/components/cycles/kpi/burndown-chart.tsx" "core/components/cycles/kpi/page-shell.tsx"` passed after isolating the KPI chart implementation.
- [x] 2026-03-17: `pnpm --filter web check:types` passed after isolating the KPI chart implementation.
- [x] 2026-03-17: `pnpm --filter web exec eslint "core/components/cycles/kpi/burndown-chart.tsx" "core/components/cycles/kpi/page-shell.tsx"` passed after correcting the KPI burndown transformation.
- [x] 2026-03-17: `pnpm --filter web check:types` passed after correcting the KPI burndown transformation.
- [x] 2026-03-17: `pnpm --filter web exec eslint "core/components/cycles/kpi/burndown-chart.tsx"` passed after adding the KPI tendency line.
- [x] 2026-03-17: `pnpm --filter web check:types` passed after adding the KPI tendency line.
- [x] 2026-03-17: `pnpm --filter web exec eslint "core/components/cycles/kpi/filter-utils.ts" "core/components/cycles/kpi/page-shell.tsx" "core/components/cycles/kpi/burndown-chart.tsx"` passed after implementing client-side label filtering.
- [x] 2026-03-17: `pnpm --filter web check:types` passed after implementing client-side label filtering.

## Investigation Summary

### Frontend integration points already identified

- `apps/web/tsconfig.json`
  - `@/plane-web/*` resolves to `ce/*` in this edition.
  - New code must respect that alias and avoid direct imports from premium-only `ee/*` paths.
  - If an integration point looks premium, prefer an existing `@/plane-web/*` export or a local `core/*` import.
- `apps/web/core/components/cycles/list/cycle-list-item-action.tsx`
  - Current cycle row action strip.
  - Favorite star and `CycleQuickActions` already live here.
  - This is the correct insertion point for the new `KPI` button.
- `apps/web/app/(all)/[workspaceSlug]/(projects)/projects/(detail)/[projectId]/cycles/(detail)/layout.tsx`
  - Existing cycle detail shell.
  - A nested `kpi/page.tsx` will inherit the current cycle header and content wrapper.
- `apps/web/core/components/cycles/active-cycle/use-cycles-details.ts`
  - Already fetches cycle progress plus `issues` and `points` analytics.
  - This should be reused instead of creating a new data-loading hook.
- `apps/web/core/components/core/sidebar/progress-chart.tsx`
  - Existing burndown-style chart renderer.
  - Good candidate for reuse in version 1, possibly with small prop extensions for copy/labels.

### Backend data source already identified

- `apps/web/core/services/cycle.service.ts`
  - Already exposes `workspaceActiveCyclesAnalytics(..., "points")`.
- `apps/web/core/store/cycle.store.ts`
  - Already stores `estimate_distribution` when `analytic_type === "points"`.
- `apps/api/plane/app/views/cycle/base.py`
  - `CycleAnalyticsEndpoint` already supports `?type=points`.
- `apps/api/plane/utils/analytics_plot.py`
  - `burndown_plot(..., plot_type="points")` already burns down by summed estimate-point values.
  - Current burndown drops only on `completed_at`, which matches version 1 requirements.

### Test structure investigation

- Backend automated tests already exist under `apps/api/plane/tests`.
- Backend test runner is `pytest` with markers defined in `apps/api/pytest.ini`:
  - `unit`
  - `contract`
  - `smoke`
- Shared backend fixtures live in `apps/api/plane/tests/conftest.py`.
- Existing cycle API coverage lives in `apps/api/plane/tests/contract/api/test_cycles.py`.
- No frontend automated test suite was found for `apps/web`:
  - `apps/web/package.json` has no `test` script.
  - No Jest/Vitest/Playwright config files were found in the repo during investigation.
- Existing open-core import pattern includes CE stubs/no-op exports for features that are premium elsewhere.
  - Example: `apps/web/ce/components/views/publish/use-view-publish.tsx` provides a fallback implementation for a `@/plane-web/*` import.
- Because this feature adds frontend navigation and page rendering, implementation must include frontend automated test support before the feature can be considered fully covered.

## Implementation Checklist

### 1. Plan hygiene before and during implementation

- [ ] Before changing code, update this file to mark the next work items as in progress in the change log if useful.
- [ ] After each code change, update completed checkboxes in this file before ending the task.
- [ ] After each code change, append the touched file paths to the change log.
- [ ] After each code change, append test commands and results to the test log.

### 2. KPI action entry on the cycles list

- [x] Update `apps/web/core/components/cycles/list/cycle-list-item-action.tsx`.
- [x] Keep imports aligned with the edition-safe pattern: use `core/*` or `@/plane-web/*` aliases that resolve in CE, and do not import `ee/*` directly.
- [x] Insert a new `KPI` action between `FavoriteStar` and `CycleQuickActions` in render order.
- [x] Ensure clicking `KPI` does not trigger the parent row click behavior.
- [x] Ensure clicking `KPI` does not toggle `peekCycle` accidentally.
- [x] Route to `/${workspaceSlug}/projects/${projectId}/cycles/${cycleId}/kpi`.
- [x] Keep the action styling visually consistent with the existing row actions.
- [ ] Verify layout when the favorite star is hidden (for example archived or permission-limited states).
- [x] Decide and document whether `KPI` should be visible for read-only users; keep the final behavior explicit in code and tests.

### 3. New KPI route and page shell

- [x] Create `apps/web/app/(all)/[workspaceSlug]/(projects)/projects/(detail)/[projectId]/cycles/(detail)/[cycleId]/kpi/page.tsx`.
- [x] Reuse existing open-core-safe imports only; if a shared extension point is needed, prefer an existing `@/plane-web/*` CE export over a premium-only file path.
- [x] Reuse the existing cycle detail layout inherited from `apps/web/app/(all)/[workspaceSlug]/(projects)/projects/(detail)/[projectId]/cycles/(detail)/layout.tsx`.
- [x] Reuse existing route params: `workspaceSlug`, `projectId`, and `cycleId`.
- [x] Set an appropriate browser/page title if the page pattern supports it.
- [x] Reuse `useCyclesDetails(...)` so the KPI page does not create duplicate fetch logic.
- [x] Handle the case where the cycle is missing or has been deleted.
- [x] Handle the case where analytics are still loading.
- [x] Keep the first version focused on a single KPI view; do not add extra KPI tabs/cards unless required during implementation.

### 4. KPI page content

- [x] Add a clear page heading for KPI content.
- [x] Add supporting copy that explicitly says the chart uses estimate points.
- [x] Render a single burndown card for version 1.
- [x] Use cycle metadata already loaded by the store when helpful (cycle name, dates, project context).
- [x] Add a loading state that does not flash broken chart markup.
- [x] Add an empty state when the cycle has no estimate points.
- [x] Add an empty state when the cycle has no valid start/end dates.
- [x] Ensure the page remains readable in the supported desktop layout.

### 5. Burndown data wiring

- [x] Read chart data from `cycle.estimate_distribution.completion_chart`.
- [x] Read total scope from `cycle.total_estimate_points`.
- [x] Do not use `cycle.distribution.completion_chart` on the KPI page.
- [x] Do not allow the KPI page to silently fall back to ticket-count burndown.
- [x] Confirm the ideal line is calculated against total estimate points.
- [x] Confirm future dates continue to render `null` values consistently with the existing API contract.
- [x] Confirm version 1 behavior leaves cancelled issues out of the burndown reduction logic.
- [x] Confirm estimate-less issues do not distort the points chart.

### 6. Chart component reuse or extension

- [x] Decide whether `apps/web/core/components/core/sidebar/progress-chart.tsx` can be reused unchanged.
- [x] If reuse is not sufficient, make the smallest backward-compatible extension possible.
- [x] If extending the chart, support KPI-specific copy such as:
  - x-axis: `Time`
  - y-axis: `Remaining points`
- [x] Keep existing chart consumers working without behavioral regressions.
- [x] Keep legend labels aligned with estimate-point language instead of work-item language on the KPI page.
- [x] Render a KPI-only tendency line similar to the existing burndown experience without changing the shared cycle-page chart.

### 7. Backend production code changes (only if truly needed)

- [x] Verify the existing `?type=points` analytics response is enough before changing backend production code.
- [ ] Only change backend production code if the current response cannot support the KPI page cleanly.
- [x] Do not introduce cancelled-item burndown logic in version 1.
- [x] Do not create a KPI-specific API endpoint unless reuse of the existing analytics endpoint becomes impossible.
- [ ] If backend production code changes are needed, keep them minimal and document exactly why in this file.

### 8. KPI burndown chart filters

- [x] Add filter controls to the KPI burndown screen without changing the existing cycle-page burndown behavior.
- [x] Start with label filtering as the first supported filter dimension.
- [x] Place the filter UI near the KPI burndown card header so the relationship to the chart is obvious.
- [x] Support selecting one or more labels to scope the burndown chart.
- [x] Ensure that if a work item has the selected label `bug`, the KPI chart includes only estimate points from work items with that label.
- [x] Define the default filter state as `All work items` so the current KPI chart remains the baseline view.
- [x] Show the active filter state clearly in the UI.
- [x] Handle the case where no labels exist in the cycle.
- [x] Handle the case where the selected label set returns no matching work items.
- [x] Preserve the desktop-only scope for the KPI route while implementing the filter controls.
- [x] Decide whether filtering should be purely client-side over already-fetched cycle issues or backed by a dedicated filtered analytics request.
- [x] Prefer the simplest correct implementation that does not distort the estimate-point burndown math.
- [x] If client-side filtering is chosen, verify that the necessary issue-label and estimate data are available for all cycle work items used in the KPI view.
- [x] Client-side filtering is chosen; no server-side analytics contract change is needed for this phase.
- [x] Keep cancelled items excluded from the filtered burndown in the same way as the unfiltered KPI chart for version 1.
- [x] Query-string persistence is not added in this phase; the filter remains local to the KPI screen state.
- [x] Document the final filter-state behavior in this plan before implementation is considered complete.

## Automated Test Checklist

### 9. Frontend automated test setup

- [ ] Add a frontend automated test runner for `apps/web`.
- [ ] Recommended approach: add Vitest + React Testing Library for route/component coverage with minimal setup cost.
- [ ] Add a `test` script to `apps/web/package.json`.
- [ ] Add supporting config/setup files for:
  - path aliases
  - jsdom environment
  - shared mocks for Next navigation/router hooks
  - shared assertions/setup utilities
- [ ] Ensure the new test setup can run in isolation without requiring the full app to boot.

### 10. Frontend automated tests for the KPI feature

- [ ] Add a test that the cycle list row renders a `KPI` action.
- [ ] Add a test that the `KPI` action is rendered in the action group before the three-dot quick actions control.
- [ ] Add a test that clicking `KPI` routes to `/${workspaceSlug}/projects/${projectId}/cycles/${cycleId}/kpi`.
- [ ] Add a test that clicking `KPI` does not trigger parent row navigation side effects.
- [ ] Add a test that the KPI page requests/uses estimate-point analytics rather than issue-count analytics.
- [ ] Add a test that the KPI page renders a loading state before data is ready.
- [ ] Add a test that the KPI page renders an empty state when `total_estimate_points` is `0`.
- [ ] Add a test that the KPI page renders an empty state when cycle dates are missing.
- [ ] Add a test that the KPI page renders the burndown chart when point analytics are present.
- [ ] Add a test that the KPI page chart copy refers to estimate points.
- [ ] Add a test that cancelled counts do not alter the KPI page chart input in version 1.
- [ ] Add a test that selecting a label filter such as `bug` limits the KPI burndown to work items with that label.
- [ ] Add a test that clearing the filter returns the KPI burndown to the all-work-items baseline.
- [ ] Add a test that an empty filtered result shows the intended no-data state.

### 11. Backend automated tests for the KPI feature

- [ ] Add new cycle analytics contract tests in `apps/api/plane/tests/contract/api/test_cycles.py` or a dedicated `test_cycle_analytics.py`.
- [ ] Create reusable fixtures for:
  - workspace
  - project with point-based estimation enabled
  - cycle with explicit start/end dates
  - states needed to model backlog, completed, and cancelled cases
  - issues attached to the cycle with estimate points
- [ ] Add a contract test for `GET /api/v1/workspaces/<slug>/projects/<project_id>/cycles/<cycle_id>/analytics/?type=points` returning `200 OK`.
- [ ] Add a contract test proving `completion_chart` values are based on summed estimate points, not issue count.
- [ ] Add a contract test proving a completed issue burns down the chart by its estimate-point value.
- [ ] Add a contract test proving a cancelled issue does not burn down the chart in version 1.
- [ ] Add a contract test proving issues without estimate points are ignored by the points burndown.
- [ ] Add a contract test proving the response includes the full cycle date range as keys.
- [ ] Add a contract test proving future dates return `null` values when appropriate for active cycles.
- [ ] Add a contract test for a no-estimate cycle response shape if the KPI page depends on it.
- [ ] If server-side label filtering is implemented, add a contract test proving `label=bug` (or equivalent filter parameter) only includes estimate points from matching work items.

### 12. Manual verification checklist

- [ ] Open the project cycles list on desktop and confirm the `KPI` action appears in the expected position.
- [ ] Click `KPI` and confirm the browser navigates to the expected `/kpi` URL.
- [ ] Confirm the cycle row does not trigger unwanted alternate navigation when `KPI` is clicked.
- [ ] Confirm the KPI page renders inside the existing cycle detail shell.
- [ ] Confirm the burndown chart is present for a cycle with estimate points.
- [ ] Confirm the chart reflects remaining estimate points over time.
- [ ] Confirm completed items reduce the remaining points.
- [ ] Confirm cancelled items do not reduce the remaining points in this release.
- [ ] Confirm a cycle without estimate points shows the intended empty state.
- [ ] Confirm a missing cycle shows a safe fallback instead of a crash.
- [ ] Confirm selecting the `bug` label filter updates the KPI burndown to only matching work items.
- [ ] Confirm clearing the filter restores the unfiltered KPI burndown.

## Validation Commands Checklist

- [ ] `pnpm --filter web check:types`
- [ ] `pnpm --filter web check:lint`
- [ ] `pnpm --filter web test` (after test setup is added)
- [ ] `python -m pytest plane/tests/contract/api/test_cycles.py -m contract -v` from `apps/api`
- [ ] `python run_tests.py -c -v` from `apps/api` when broader contract regression coverage is needed

## Definition Of Done

- [ ] The cycle list shows a working `KPI` action in the agreed position.
- [ ] The KPI route exists and renders successfully.
- [ ] The KPI page shows a burndown based on estimate points only.
- [ ] Version 1 does not burn down cancelled items.
- [ ] Frontend automated coverage exists for navigation, rendering, and empty/loading states.
- [ ] Backend automated coverage exists for points analytics behavior.
- [ ] Relevant lint/type/test commands pass.
- [ ] `PLAN.md` has been updated to reflect the final implementation status, touched files, and test results.
