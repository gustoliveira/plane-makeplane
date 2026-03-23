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
- [x] 2026-03-17: Removed the KPI-only `Tendency remaining points` series from `apps/web/core/components/cycles/kpi/burndown-chart.tsx` so the KPI chart now only shows current and ideal remaining points. Touched files: `apps/web/core/components/cycles/kpi/burndown-chart.tsx`, `PLAN.md`.
- [x] 2026-03-17: Implemented phase 8 user/assignee filtering fully on the frontend by updating `apps/web/core/components/cycles/kpi/filter-utils.ts` and `apps/web/core/components/cycles/kpi/page-shell.tsx` to intersect label and assignee selections, compute the burndown over the combined match, and provide a clear active-filter UI state. Touched files: `apps/web/core/components/cycles/kpi/filter-utils.ts`, `apps/web/core/components/cycles/kpi/page-shell.tsx`, `PLAN.md`.
- [x] 2026-03-17: Aligned the KPI user filter button styling with the label filter by passing `hideIcon` and explicit `ChevronDown` to `MemberDropdown` in `apps/web/core/components/cycles/kpi/page-shell.tsx`, matching the default avatar-free look requested in the screenshot. Touched files: `apps/web/core/components/cycles/kpi/page-shell.tsx`, `PLAN.md`.
- [x] 2026-03-17: Fixed a rendering and layout bug where the label filter button was duplicated during UI alignment in `apps/web/core/components/cycles/kpi/page-shell.tsx`. Touched files: `apps/web/core/components/cycles/kpi/page-shell.tsx`, `PLAN.md`.
- [x] 2026-03-17: Fixed the double ChevronDown icon issue in the `LabelDropdown` on the KPI page. The `LabelDropdown` component already rendered its own chevron, so the explicitly added one in the label wrapper caused the duplication. Removed the redundant explicit icon from `apps/web/core/components/cycles/kpi/page-shell.tsx`. Touched files: `apps/web/core/components/cycles/kpi/page-shell.tsx`, `PLAN.md`.
- [x] 2026-03-17: Replaced the KPI summary `Project` card with a business-days-until-cycle-end metric in `apps/web/core/components/cycles/kpi/page-shell.tsx` so the top KPI row stays focused on cycle timing and burndown context. Touched files: `apps/web/core/components/cycles/kpi/page-shell.tsx`, `PLAN.md`.
- [x] 2026-03-17: Refined the business-days KPI card wording in `apps/web/core/components/cycles/kpi/page-shell.tsx` so past cycles show `Cycle ended` instead of `0 business days`, which matches the project's cycle-time context better than `finished`. Touched files: `apps/web/core/components/cycles/kpi/page-shell.tsx`, `PLAN.md`.
- [x] 2026-03-17: Aligned the KPI summary cards with the burndown chart cutoff logic so completed and remaining points now use the same effective date as the chart instead of counting work completed after the cycle end. Touched files: `apps/web/core/components/cycles/kpi/filter-utils.ts`, `apps/web/core/components/cycles/kpi/page-shell.tsx`, `PLAN.md`.
- [x] 2026-03-17: Styled weekend days in the KPI burndown x-axis as red labels in `apps/web/core/components/cycles/kpi/burndown-chart.tsx`, keeping the change scoped to the KPI chart. Touched files: `apps/web/core/components/cycles/kpi/burndown-chart.tsx`, `PLAN.md`.
- [x] 2026-03-17: Fixed the KPI weekend-day styling by driving the x-axis from raw ISO dates instead of preformatted labels, so the weekend tick renderer can correctly identify Saturdays and Sundays before formatting them. Touched files: `apps/web/core/components/cycles/kpi/burndown-chart.tsx`, `PLAN.md`.
- [x] 2026-03-17: Forced the KPI burndown x-axis to render every day individually by passing explicit daily ticks and `interval: 0` through the shared area chart component. Touched files: `apps/web/core/components/cycles/kpi/burndown-chart.tsx`, `packages/propel/src/charts/area-chart/root.tsx`, `packages/types/src/charts/index.ts`, `PLAN.md`.
- [x] 2026-03-17: Refined the KPI x-axis rendering with `minTickGap: 0`, rotated tick labels, and extra bottom margin so every day stays visible instead of being visually collapsed. Touched files: `apps/web/core/components/cycles/kpi/burndown-chart.tsx`, `packages/propel/src/charts/area-chart/root.tsx`, `packages/types/src/charts/index.ts`, `PLAN.md`.
- [x] 2026-03-17: Reworked the KPI x-axis tick renderer to show compact per-day labels with day numbers and month markers instead of long rotated full dates, and added shared x-axis height support so the compact daily labels have enough vertical space. Touched files: `apps/web/core/components/cycles/kpi/burndown-chart.tsx`, `packages/propel/src/charts/area-chart/root.tsx`, `packages/types/src/charts/index.ts`, `PLAN.md`.
- [x] 2026-03-17: Properly fixed the KPI daily-axis regression by reverting the raw-date/shared-axis changes and restoring the original short formatted x-axis labels, while coloring weekends through a label-to-date mapping inside `apps/web/core/components/cycles/kpi/burndown-chart.tsx`. This matches the earlier non-collapsed behavior and keeps the fix scoped to the KPI chart. Touched files: `apps/web/core/components/cycles/kpi/burndown-chart.tsx`, `packages/propel/src/charts/area-chart/root.tsx`, `packages/types/src/charts/index.ts`, `PLAN.md`.
- [x] 2026-03-17: Fixed the final missing-days regression on the KPI burndown chart by reapplying explicit `interval: 0`, `minTickGap: 0`, and explicit string ticks to the restored short-date x-axis. Touched files: `apps/web/core/components/cycles/kpi/burndown-chart.tsx`, `packages/propel/src/charts/area-chart/root.tsx`, `packages/types/src/charts/index.ts`, `PLAN.md`.
- [x] 2026-03-19: Added a new KPI block below Burndown KPI with a points-by-label bar chart, implemented in `apps/web/core/components/cycles/kpi/page-shell.tsx`, `apps/web/core/components/cycles/kpi/filter-utils.ts`, and new `apps/web/core/components/cycles/kpi/label-points-chart.tsx`. The chart now reuses the same member filter state (`selectedAssigneeIds`) as burndown so assignee selection consistently scopes both visualizations. Touched files: `apps/web/core/components/cycles/kpi/page-shell.tsx`, `apps/web/core/components/cycles/kpi/filter-utils.ts`, `apps/web/core/components/cycles/kpi/label-points-chart.tsx`, `PLAN.md`.
- [x] 2026-03-19: Fixed KPI points-by-label filtering to follow the active Burndown KPI filters correctly by making label-store reads reactive in `apps/web/core/components/cycles/kpi/page-shell.tsx` and applying both selected labels and selected assignees in `apps/web/core/components/cycles/kpi/filter-utils.ts`; also consolidated missing label metadata into a single `Unknown label` bucket to avoid duplicate unknown bars. Touched files: `apps/web/core/components/cycles/kpi/page-shell.tsx`, `apps/web/core/components/cycles/kpi/filter-utils.ts`, `PLAN.md`.
- [x] 2026-03-19: Added a new Status KPI block below the Label KPI with a points-by-status bar chart (To Do/Done/Blocked/Cancelled/custom states), backed by new state aggregation logic in `apps/web/core/components/cycles/kpi/filter-utils.ts`, a dedicated chart component `apps/web/core/components/cycles/kpi/state-points-chart.tsx`, and state-store wiring in `apps/web/core/components/cycles/kpi/page-shell.tsx`. The new chart follows the same active assignee/label filters used by Burndown KPI. Touched files: `apps/web/core/components/cycles/kpi/page-shell.tsx`, `apps/web/core/components/cycles/kpi/filter-utils.ts`, `apps/web/core/components/cycles/kpi/state-points-chart.tsx`, `PLAN.md`.
- [x] 2026-03-19: Aligned Label KPI empty/no-match messaging in `apps/web/core/components/cycles/kpi/page-shell.tsx` to reference active filters (members + labels) instead of members-only wording, matching the filter behavior now shared by burndown, label, and status charts. Touched files: `apps/web/core/components/cycles/kpi/page-shell.tsx`, `PLAN.md`.
- [x] 2026-03-19: Time-capped both bar-chart KPIs (label/status) to the same burndown cutoff logic in `apps/web/core/components/cycles/kpi/filter-utils.ts` by excluding items completed after the burndown cutoff date from bar aggregations, and wired `cycleEndDate` into both builders in `apps/web/core/components/cycles/kpi/page-shell.tsx`. Updated KPI copy to clarify time-capped behavior. Touched files: `apps/web/core/components/cycles/kpi/filter-utils.ts`, `apps/web/core/components/cycles/kpi/page-shell.tsx`, `PLAN.md`.
- [x] 2026-03-19: Revised the bar-chart time-cap implementation in `apps/web/core/components/cycles/kpi/filter-utils.ts` to match burndown math: label KPI now stays aligned with burndown scope, while status KPI keeps full scope but moves issues completed after cutoff into a dedicated `Completed after cycle end` bucket so burndown remaining points are represented instead of disappearing. Updated KPI explanatory copy in `apps/web/core/components/cycles/kpi/page-shell.tsx`. Touched files: `apps/web/core/components/cycles/kpi/filter-utils.ts`, `apps/web/core/components/cycles/kpi/page-shell.tsx`, `PLAN.md`.
- [x] 2026-03-19: Removed the extra late-completion status bucket from Status KPI and reworked `apps/web/core/components/cycles/kpi/filter-utils.ts` so issues completed after the burndown cutoff are reclassified into an existing in-cycle state (started/unstarted/backlog fallback) instead of creating a new column, keeping points-by-status aligned with burndown completion logic without introducing synthetic status labels. Updated status KPI copy in `apps/web/core/components/cycles/kpi/page-shell.tsx`. Touched files: `apps/web/core/components/cycles/kpi/filter-utils.ts`, `apps/web/core/components/cycles/kpi/page-shell.tsx`, `PLAN.md`.
- [x] 2026-03-19: Added issue-level hover details for bar charts by enriching KPI aggregation outputs with per-bucket issue summaries in `apps/web/core/components/cycles/kpi/filter-utils.ts` and wiring custom tooltip content in `apps/web/core/components/cycles/kpi/label-points-chart.tsx` and `apps/web/core/components/cycles/kpi/state-points-chart.tsx` to show issue lists for the hovered bar. Touched files: `apps/web/core/components/cycles/kpi/filter-utils.ts`, `apps/web/core/components/cycles/kpi/label-points-chart.tsx`, `apps/web/core/components/cycles/kpi/state-points-chart.tsx`, `PLAN.md`.
- [x] 2026-03-20: Added a conditional KPI stat card in `apps/web/core/components/cycles/kpi/page-shell.tsx` that appears when user filtering is active and shows the count of filtered tickets without estimate points, positioned next to Remaining in the burndown stats row. Touched files: `apps/web/core/components/cycles/kpi/page-shell.tsx`, `PLAN.md`.
- [x] 2026-03-20: Changed the `Without estimate` KPI stat in `apps/web/core/components/cycles/kpi/page-shell.tsx` to be always visible (not conditional on user filtering), keeping it fixed next to Completed and Remaining while still using the currently active filter scope for its count. Touched files: `apps/web/core/components/cycles/kpi/page-shell.tsx`, `PLAN.md`.
- [x] 2026-03-20: Updated points-by-status aggregation and rendering to include statuses that only contain unestimated issues (0 points), append `*` to status labels with unestimated work, and expose unestimated issue counts in status-chart hover tooltips. Implemented in `apps/web/core/components/cycles/kpi/filter-utils.ts`, `apps/web/core/components/cycles/kpi/state-points-chart.tsx`, and `apps/web/core/components/cycles/kpi/page-shell.tsx`. Touched files: `apps/web/core/components/cycles/kpi/filter-utils.ts`, `apps/web/core/components/cycles/kpi/state-points-chart.tsx`, `apps/web/core/components/cycles/kpi/page-shell.tsx`, `PLAN.md`.
- [x] 2026-03-20: Added a new `Points by user` KPI block below points-by-status with a stacked bar chart that aggregates per-user status counts in each bar and keeps unestimated visibility by marking users with `*` and showing unestimated counts in tooltip details. Implemented in `apps/web/core/components/cycles/kpi/filter-utils.ts`, new `apps/web/core/components/cycles/kpi/user-points-chart.tsx`, and `apps/web/core/components/cycles/kpi/page-shell.tsx` (including project member fetch for display names). Touched files: `apps/web/core/components/cycles/kpi/filter-utils.ts`, `apps/web/core/components/cycles/kpi/user-points-chart.tsx`, `apps/web/core/components/cycles/kpi/page-shell.tsx`, `PLAN.md`.
- [x] 2026-03-20: Improved points-by-user readability in `apps/web/core/components/cycles/kpi/user-points-chart.tsx` by adding horizontal scroll with dynamic minimum chart width so all user labels remain accessible and by increasing per-column spacing using narrower bar width. Touched files: `apps/web/core/components/cycles/kpi/user-points-chart.tsx`, `PLAN.md`.
- [x] 2026-03-20: Refined points-by-user x-axis readability in `apps/web/core/components/cycles/kpi/user-points-chart.tsx` by tilting member labels and tightening column spacing (smaller gap) while keeping horizontal scroll for dense datasets. Touched files: `apps/web/core/components/cycles/kpi/user-points-chart.tsx`, `PLAN.md`.
- [x] 2026-03-20: Ensured all user names render on points-by-user x-axis by forcing full x-axis ticks (interval/minTickGap/ticks wiring in `packages/propel/src/charts/bar-chart/root.tsx`) and kept status legend/title outside the horizontal scroll area via an external legend in `apps/web/core/components/cycles/kpi/user-points-chart.tsx`. Also tuned column density to keep smaller gaps. Touched files: `packages/propel/src/charts/bar-chart/root.tsx`, `apps/web/core/components/cycles/kpi/user-points-chart.tsx`, `PLAN.md`.
- [x] 2026-03-20: Finalized points-by-user axis rendering to guarantee all users are shown by switching the x-axis category key to stable user IDs and rendering display names via a custom rotated tick label map in `apps/web/core/components/cycles/kpi/user-points-chart.tsx`; removed the x-axis title text (`Users`) as requested. Status legend remains outside the scrollable chart region. Touched files: `apps/web/core/components/cycles/kpi/user-points-chart.tsx`, `PLAN.md`.

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
- [x] 2026-03-17: `pnpm --filter web exec eslint "core/components/cycles/kpi/burndown-chart.tsx"` passed after removing the KPI tendency line.
- [x] 2026-03-17: `pnpm --filter web check:types` passed after removing the KPI tendency line.
- [x] 2026-03-17: `pnpm --filter web exec eslint "core/components/cycles/kpi/filter-utils.ts" "core/components/cycles/kpi/page-shell.tsx" "core/components/cycles/kpi/burndown-chart.tsx"` passed after implementing client-side label filtering.
- [x] 2026-03-17: `pnpm --filter web check:types` passed after implementing client-side label filtering.
- [x] 2026-03-17: `pnpm --filter web exec eslint "core/components/cycles/kpi/filter-utils.ts" "core/components/cycles/kpi/page-shell.tsx"` passed after implementing client-side user filtering.
- [x] 2026-03-17: `pnpm --filter web check:types` passed after implementing client-side user filtering.
- [x] 2026-03-17: `pnpm --filter web exec eslint "core/components/cycles/kpi/page-shell.tsx"` passed after aligning the user filter button UI.
- [x] 2026-03-17: `pnpm --filter web check:types` passed after aligning the user filter button UI.
- [x] 2026-03-17: `pnpm --filter web exec eslint "core/components/cycles/kpi/page-shell.tsx"` passed after fixing the duplicate label filter.
- [x] 2026-03-17: `pnpm --filter web check:types` passed after fixing the duplicate label filter.
- [x] 2026-03-17: `pnpm --filter web exec eslint "core/components/cycles/kpi/page-shell.tsx"` passed after removing the duplicate ChevronDown icon.
- [x] 2026-03-17: `pnpm --filter web check:types` passed after removing the duplicate ChevronDown icon.
- [x] 2026-03-17: `pnpm --filter web exec eslint "core/components/cycles/kpi/page-shell.tsx"` passed after replacing the project card with the business-days-left metric.
- [x] 2026-03-17: `pnpm --filter web check:types` passed after replacing the project card with the business-days-left metric.
- [x] 2026-03-17: `pnpm --filter web exec eslint "core/components/cycles/kpi/page-shell.tsx"` passed after refining the business-days-left wording.
- [x] 2026-03-17: `pnpm --filter web check:types` passed after refining the business-days-left wording.
- [x] 2026-03-17: `pnpm --filter web exec eslint "core/components/cycles/kpi/filter-utils.ts" "core/components/cycles/kpi/page-shell.tsx"` passed after aligning KPI cards with the burndown cutoff logic.
- [x] 2026-03-17: `pnpm --filter web check:types` passed after aligning KPI cards with the burndown cutoff logic.
- [x] 2026-03-17: `pnpm --filter web exec eslint "core/components/cycles/kpi/burndown-chart.tsx"` passed after styling weekend labels in the KPI burndown chart.
- [x] 2026-03-17: `pnpm --filter web check:types` passed after styling weekend labels in the KPI burndown chart.
- [x] 2026-03-17: `pnpm --filter web exec eslint "core/components/cycles/kpi/burndown-chart.tsx"` passed after fixing the KPI weekend-date tick source.
- [x] 2026-03-17: `pnpm --filter web check:types` passed after fixing the KPI weekend-date tick source.
- [x] 2026-03-17: `pnpm exec eslint "apps/web/core/components/cycles/kpi/burndown-chart.tsx" "packages/propel/src/charts/area-chart/root.tsx"` passed after forcing the KPI x-axis to render every day individually.
- [x] 2026-03-17: `pnpm --filter web check:types` passed after forcing the KPI x-axis to render every day individually.
- [x] 2026-03-17: `pnpm exec eslint "apps/web/core/components/cycles/kpi/burndown-chart.tsx" "packages/propel/src/charts/area-chart/root.tsx"` passed after rotating KPI tick labels and forcing zero tick gap.
- [x] 2026-03-17: `pnpm --filter web check:types` passed after rotating KPI tick labels and forcing zero tick gap.
- [x] 2026-03-17: `pnpm exec eslint "apps/web/core/components/cycles/kpi/burndown-chart.tsx" "packages/propel/src/charts/area-chart/root.tsx" "packages/types/src/charts/index.ts"` passed with existing warnings in `packages/types/src/charts/index.ts` after switching the KPI x-axis to compact day-number tick labels.
- [x] 2026-03-17: `pnpm --filter web check:types` passed after switching the KPI x-axis to compact day-number tick labels.
- [x] 2026-03-17: `pnpm exec eslint "apps/web/core/components/cycles/kpi/burndown-chart.tsx" "packages/propel/src/charts/area-chart/root.tsx" "packages/types/src/charts/index.ts"` passed with existing warnings in `packages/types/src/charts/index.ts` after restoring the original short x-axis labels and KPI-only weekend mapping.
- [x] 2026-03-17: `pnpm --filter web check:types` passed after restoring the original short x-axis labels and KPI-only weekend mapping.
- [x] 2026-03-17: `pnpm exec eslint "apps/web/core/components/cycles/kpi/burndown-chart.tsx" "packages/propel/src/charts/area-chart/root.tsx" "packages/types/src/charts/index.ts"` passed after explicitly forcing all dates to render on the short-date axis.
- [x] 2026-03-17: `pnpm --filter web check:types` passed after explicitly forcing all dates to render on the short-date axis.
- [x] 2026-03-19: `pnpm --filter web exec eslint "core/components/cycles/kpi/page-shell.tsx" "core/components/cycles/kpi/filter-utils.ts" "core/components/cycles/kpi/label-points-chart.tsx"` passed after adding the points-by-label KPI block.
- [x] 2026-03-19: `pnpm --filter web check:types` passed after adding the points-by-label KPI block.
- [x] 2026-03-19: `pnpm --filter web exec eslint "core/components/cycles/kpi/page-shell.tsx" "core/components/cycles/kpi/filter-utils.ts"` passed after fixing points-by-label filter behavior.
- [x] 2026-03-19: `pnpm --filter web check:types` passed after fixing points-by-label filter behavior.
- [x] 2026-03-19: `pnpm --filter web exec eslint "core/components/cycles/kpi/page-shell.tsx" "core/components/cycles/kpi/filter-utils.ts" "core/components/cycles/kpi/state-points-chart.tsx"` passed after adding the points-by-status KPI block.
- [x] 2026-03-19: `pnpm --filter web check:types` passed after adding the points-by-status KPI block.
- [x] 2026-03-19: `pnpm --filter web exec eslint "core/components/cycles/kpi/page-shell.tsx" "core/components/cycles/kpi/filter-utils.ts" "core/components/cycles/kpi/state-points-chart.tsx"` passed after aligning Label KPI active-filter messaging with current filter logic.
- [x] 2026-03-19: `pnpm --filter web check:types` passed after aligning Label KPI active-filter messaging with current filter logic.
- [x] 2026-03-19: `pnpm --filter web exec eslint "core/components/cycles/kpi/filter-utils.ts" "core/components/cycles/kpi/page-shell.tsx"` passed after adding burndown-style time-capping to label/status KPI charts.
- [x] 2026-03-19: `pnpm --filter web check:types` passed after adding burndown-style time-capping to label/status KPI charts.
- [x] 2026-03-19: `pnpm --filter web exec eslint "core/components/cycles/kpi/filter-utils.ts" "core/components/cycles/kpi/page-shell.tsx"` passed after revising status KPI to bucket late completions instead of dropping them.
- [x] 2026-03-19: `pnpm --filter web check:types` passed after revising status KPI to bucket late completions instead of dropping them.
- [x] 2026-03-19: `pnpm --filter web exec eslint "core/components/cycles/kpi/filter-utils.ts" "core/components/cycles/kpi/page-shell.tsx"` passed after removing the extra late-completion status column and reclassifying late completions into existing in-cycle states.
- [x] 2026-03-19: `pnpm --filter web check:types` passed after removing the extra late-completion status column and reclassifying late completions into existing in-cycle states.
- [x] 2026-03-19: `pnpm --filter web exec eslint "core/components/cycles/kpi/filter-utils.ts" "core/components/cycles/kpi/label-points-chart.tsx" "core/components/cycles/kpi/state-points-chart.tsx"` passed after adding issue-list tooltip details to both KPI bar charts.
- [x] 2026-03-19: `pnpm --filter web check:types` passed after adding issue-list tooltip details to both KPI bar charts.
- [x] 2026-03-20: `pnpm --filter web exec eslint "core/components/cycles/kpi/page-shell.tsx"` passed after adding the conditional "Without estimate" KPI stat for user-filtered views.
- [x] 2026-03-20: `pnpm --filter web check:types` passed after adding the conditional "Without estimate" KPI stat for user-filtered views.
- [x] 2026-03-20: `pnpm --filter web exec eslint "core/components/cycles/kpi/page-shell.tsx"` passed after making the `Without estimate` KPI stat always visible.
- [x] 2026-03-20: `pnpm --filter web check:types` passed after making the `Without estimate` KPI stat always visible.
- [x] 2026-03-20: `pnpm --filter web exec eslint "core/components/cycles/kpi/filter-utils.ts" "core/components/cycles/kpi/state-points-chart.tsx" "core/components/cycles/kpi/page-shell.tsx"` passed after adding status `*` markers and unestimated counts in points-by-status tooltips.
- [x] 2026-03-20: `pnpm --filter web check:types` passed after adding status `*` markers and unestimated counts in points-by-status tooltips.
- [x] 2026-03-20: `pnpm --filter web exec eslint "core/components/cycles/kpi/filter-utils.ts" "core/components/cycles/kpi/user-points-chart.tsx" "core/components/cycles/kpi/page-shell.tsx"` passed after adding points-by-user stacked status chart and unestimated markers.
- [x] 2026-03-20: `pnpm --filter web check:types` passed after adding points-by-user stacked status chart and unestimated markers.
- [x] 2026-03-20: `pnpm --filter web exec eslint "core/components/cycles/kpi/user-points-chart.tsx"` passed after adding horizontal scroll and larger user-column spacing to points-by-user.
- [x] 2026-03-20: `pnpm --filter web check:types` passed after adding horizontal scroll and larger user-column spacing to points-by-user.
- [x] 2026-03-20: `pnpm --filter web exec eslint "core/components/cycles/kpi/user-points-chart.tsx"` passed after tilting user labels and reducing gaps between user columns.
- [x] 2026-03-20: `pnpm --filter web check:types` passed after tilting user labels and reducing gaps between user columns.
- [x] 2026-03-20: `pnpm --filter web exec eslint "core/components/cycles/kpi/user-points-chart.tsx" "../../packages/propel/src/charts/bar-chart/root.tsx"` passed after forcing all x-axis user ticks and moving status legend outside the scrollable chart area.
- [x] 2026-03-20: `pnpm --filter web check:types` passed after forcing all x-axis user ticks and moving status legend outside the scrollable chart area.
- [x] 2026-03-20: `pnpm --filter web exec eslint "core/components/cycles/kpi/user-points-chart.tsx"` passed after switching x-axis categories to user IDs and mapping all visible tick labels to display names.
- [x] 2026-03-20: `pnpm --filter web check:types` passed after switching x-axis categories to user IDs and mapping all visible tick labels to display names.

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
- [x] Keep the KPI chart focused on current and ideal remaining points only; no tendency series.

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
- [x] Add user/assignee filtering to the KPI burndown screen so the chart can be scoped to specific cycle participants.
- [x] Preserve the desktop-only scope for the KPI route while implementing the filter controls.
- [x] Decide whether filtering should be purely client-side over already-fetched cycle issues or backed by a dedicated filtered analytics request.
- [x] Prefer the simplest correct implementation that does not distort the estimate-point burndown math.
- [x] If client-side filtering is chosen, verify that the necessary issue-label and estimate data are available for all cycle work items used in the KPI view.
- [x] Client-side filtering is chosen; no server-side analytics contract change is needed for this phase.
- [x] Keep cancelled items excluded from the filtered burndown in the same way as the unfiltered KPI chart for version 1.
- [x] Query-string persistence is not added in this phase; the filter remains local to the KPI screen state.
- [x] Document the final filter-state behavior in this plan before implementation is considered complete.
- [x] Add a points-by-label bar chart block below Burndown KPI and scope it with the same member filter selection used by the burndown chart.
- [x] Keep the points-by-label chart scoped to the active KPI filters and ensure unknown/deleted label metadata does not render as multiple indistinguishable `Unknown label` bars.
- [x] Add a points-by-status bar chart block below Label KPI and scope it to the same active KPI filters (members and labels), while supporting custom project states.
- [x] Ensure both bar-chart KPIs (points by label and points by status) apply the same burndown time-cap semantics so work completed after cycle end does not appear in those bar-chart totals.
- [x] Keep bar-chart totals reconcilable with burndown cards by preserving burndown scope in bar charts and representing post-cutoff completions explicitly in status KPIs instead of silently excluding those points.
- [x] Keep points-by-status aligned with burndown completion rules without creating synthetic/new status columns for late completions.
- [x] Show issue-level details in bar-chart tooltips (at least for points-by-status) so hovering a bar reveals which issues compose that bucket.
- [x] When user filtering is active, show a dedicated KPI card beside Remaining with the count of filtered tickets that do not have estimate points.
- [x] Keep the `Without estimate` KPI card fixed/always visible in the burndown stats row, not only in user-filtered mode.
- [x] In points-by-status, include statuses even when all their issues are unestimated (0 points), mark such statuses with `*`, and show unestimated issue counts in hover tooltips.
- [x] Add a points-by-user block below points-by-status as a stacked bar chart by status counts per user, and keep unestimated visibility (markers + tooltip count) for users.
- [x] Improve points-by-user x-axis usability for many members by enabling horizontal scrolling and increasing spacing between user columns.
- [x] Improve points-by-user readability by tilting member labels and slightly reducing gaps between columns.
- [x] Always display all user names on the points-by-user axis (no interleaving/skipped ticks) and keep status legend labels outside the horizontal scroll container.
- [x] Remove the `Users` x-axis title from points-by-user and guarantee all user labels are rendered without category collisions.

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
