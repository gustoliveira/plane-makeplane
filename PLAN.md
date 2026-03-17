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

## Test Log

- [ ] No implementation tests run yet. Update this section after each implementation step.

## Investigation Summary

### Frontend integration points already identified

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
- Because this feature adds frontend navigation and page rendering, implementation must include frontend automated test support before the feature can be considered fully covered.

## Implementation Checklist

### 1. Plan hygiene before and during implementation

- [ ] Before changing code, update this file to mark the next work items as in progress in the change log if useful.
- [ ] After each code change, update completed checkboxes in this file before ending the task.
- [ ] After each code change, append the touched file paths to the change log.
- [ ] After each code change, append test commands and results to the test log.

### 2. KPI action entry on the cycles list

- [ ] Update `apps/web/core/components/cycles/list/cycle-list-item-action.tsx`.
- [ ] Insert a new `KPI` action between `FavoriteStar` and `CycleQuickActions` in render order.
- [ ] Ensure clicking `KPI` does not trigger the parent row click behavior.
- [ ] Ensure clicking `KPI` does not toggle `peekCycle` accidentally.
- [ ] Route to `/${workspaceSlug}/projects/${projectId}/cycles/${cycleId}/kpi`.
- [ ] Keep the action styling visually consistent with the existing row actions.
- [ ] Verify layout when the favorite star is hidden (for example archived or permission-limited states).
- [ ] Verify layout when the quick action menu is hidden on smaller breakpoints.
- [ ] Decide and document whether `KPI` should be visible for read-only users; keep the final behavior explicit in code and tests.

### 3. New KPI route and page shell

- [ ] Create `apps/web/app/(all)/[workspaceSlug]/(projects)/projects/(detail)/[projectId]/cycles/(detail)/[cycleId]/kpi/page.tsx`.
- [ ] Reuse the existing cycle detail layout inherited from `apps/web/app/(all)/[workspaceSlug]/(projects)/projects/(detail)/[projectId]/cycles/(detail)/layout.tsx`.
- [ ] Reuse existing route params: `workspaceSlug`, `projectId`, and `cycleId`.
- [ ] Set an appropriate browser/page title if the page pattern supports it.
- [ ] Reuse `useCyclesDetails(...)` so the KPI page does not create duplicate fetch logic.
- [ ] Handle the case where the cycle is missing or has been deleted.
- [ ] Handle the case where analytics are still loading.
- [ ] Keep the first version focused on a single KPI view; do not add extra KPI tabs/cards unless required during implementation.

### 4. KPI page content

- [ ] Add a clear page heading for KPI content.
- [ ] Add supporting copy that explicitly says the chart uses estimate points.
- [ ] Render a single burndown card for version 1.
- [ ] Use cycle metadata already loaded by the store when helpful (cycle name, dates, project context).
- [ ] Add a loading state that does not flash broken chart markup.
- [ ] Add an empty state when the cycle has no estimate points.
- [ ] Add an empty state when the cycle has no valid start/end dates.
- [ ] Ensure the page remains readable on desktop and mobile widths.

### 5. Burndown data wiring

- [ ] Read chart data from `cycle.estimate_distribution.completion_chart`.
- [ ] Read total scope from `cycle.total_estimate_points`.
- [ ] Do not use `cycle.distribution.completion_chart` on the KPI page.
- [ ] Do not allow the KPI page to silently fall back to ticket-count burndown.
- [ ] Confirm the ideal line is calculated against total estimate points.
- [ ] Confirm future dates continue to render `null` values consistently with the existing API contract.
- [ ] Confirm version 1 behavior leaves cancelled issues out of the burndown reduction logic.
- [ ] Confirm estimate-less issues do not distort the points chart.

### 6. Chart component reuse or extension

- [ ] Decide whether `apps/web/core/components/core/sidebar/progress-chart.tsx` can be reused unchanged.
- [ ] If reuse is not sufficient, make the smallest backward-compatible extension possible.
- [ ] If extending the chart, support KPI-specific copy such as:
  - x-axis: `Time`
  - y-axis: `Remaining points`
- [ ] Keep existing chart consumers working without behavioral regressions.
- [ ] Keep legend labels aligned with estimate-point language instead of work-item language on the KPI page.

### 7. Backend production code changes (only if truly needed)

- [ ] Verify the existing `?type=points` analytics response is enough before changing backend production code.
- [ ] Only change backend production code if the current response cannot support the KPI page cleanly.
- [ ] Do not introduce cancelled-item burndown logic in version 1.
- [ ] Do not create a KPI-specific API endpoint unless reuse of the existing analytics endpoint becomes impossible.
- [ ] If backend production code changes are needed, keep them minimal and document exactly why in this file.

## Automated Test Checklist

### 8. Frontend automated test setup

- [ ] Add a frontend automated test runner for `apps/web`.
- [ ] Recommended approach: add Vitest + React Testing Library for route/component coverage with minimal setup cost.
- [ ] Add a `test` script to `apps/web/package.json`.
- [ ] Add supporting config/setup files for:
  - path aliases
  - jsdom environment
  - shared mocks for Next navigation/router hooks
  - shared assertions/setup utilities
- [ ] Ensure the new test setup can run in isolation without requiring the full app to boot.

### 9. Frontend automated tests for the KPI feature

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

### 10. Backend automated tests for the KPI feature

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

### 11. Manual verification checklist

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
- [ ] Confirm the layout still works on mobile.

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
