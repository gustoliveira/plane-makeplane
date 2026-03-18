"use client";

import type { FC } from "react";
import { useEffect, useMemo, useState } from "react";
import { observer } from "mobx-react";
import { useParams } from "next/navigation";
// plane imports
import { Loader } from "@plane/ui";
import { getDate, renderFormattedDateWithoutYear } from "@plane/utils";
// components
import { EmptyState } from "@/components/common/empty-state";
import { PageHead } from "@/components/core/page-title";
import ProgressChart from "@/components/core/sidebar/progress-chart";
import useCyclesDetails from "@/components/cycles/active-cycle/use-cycles-details";
// hooks
import { useCycle } from "@/hooks/store/use-cycle";
import { useProject } from "@/hooks/store/use-project";
import { useAppRouter } from "@/hooks/use-app-router";
// assets
import emptyCycle from "@/public/empty-state/cycle.svg";

const KpiStat: FC<{ label: string; value: string }> = ({ label, value }) => (
  <div className="rounded-[10px] border border-custom-border-200 bg-custom-background-90 px-4 py-3">
    <p className="text-xs font-semibold uppercase tracking-[0.08em] text-custom-text-300">{label}</p>
    <p className="mt-1 text-lg font-semibold text-custom-text-100">{value}</p>
  </div>
);

export const CycleKpiPageShell = observer(() => {
  const router = useAppRouter();
  const { workspaceSlug, projectId, cycleId } = useParams() as {
    workspaceSlug: string;
    projectId: string;
    cycleId: string;
  };

  const { getCycleById, fetchCycleDetails } = useCycle();
  const { getProjectById } = useProject();

  const cycle = cycleId ? getCycleById(cycleId) : null;
  const project = projectId ? getProjectById(projectId) : null;

  const [isCycleLoading, setIsCycleLoading] = useState(() => !!cycleId && !cycle);
  const [didCycleFetchFail, setDidCycleFetchFail] = useState(false);

  useCyclesDetails({
    workspaceSlug,
    projectId,
    cycleId,
  });

  useEffect(() => {
    if (!workspaceSlug || !projectId || !cycleId || cycle) return;

    let isMounted = true;
    setIsCycleLoading(true);
    setDidCycleFetchFail(false);

    fetchCycleDetails(workspaceSlug, projectId, cycleId)
      .catch(() => {
        if (isMounted) setDidCycleFetchFail(true);
      })
      .finally(() => {
        if (isMounted) setIsCycleLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [workspaceSlug, projectId, cycleId, cycle, fetchCycleDetails]);

  const pageTitle = useMemo(() => {
    if (project?.name && cycle?.name) return `${project.name} - ${cycle.name} KPI`;
    if (cycle?.name) return `${cycle.name} KPI`;
    return "Cycle KPI";
  }, [project?.name, cycle?.name]);

  const totalEstimatePoints = cycle?.progress_snapshot?.total_estimate_points ?? cycle?.total_estimate_points ?? 0;
  const completedEstimatePoints =
    cycle?.progress_snapshot?.completed_estimate_points ?? cycle?.completed_estimate_points ?? 0;
  const pendingEstimatePoints =
    (cycle?.progress_snapshot?.backlog_estimate_points ?? cycle?.backlog_estimate_points ?? 0) +
    (cycle?.progress_snapshot?.unstarted_estimate_points ?? cycle?.unstarted_estimate_points ?? 0) +
    (cycle?.progress_snapshot?.started_estimate_points ?? cycle?.started_estimate_points ?? 0);
  const burndownDistribution = cycle?.estimate_distribution?.completion_chart;
  const hasBurndownDistribution = !!burndownDistribution && Object.keys(burndownDistribution).length > 0;
  const cycleStartDate = getDate(cycle?.start_date);
  const cycleEndDate = getDate(cycle?.end_date);
  const hasValidCycleDates = !!cycleStartDate && !!cycleEndDate && cycleEndDate >= cycleStartDate;
  const hasEstimatePoints = totalEstimatePoints > 0;
  const dateRangeLabel =
    cycle?.start_date && cycle?.end_date
      ? `${renderFormattedDateWithoutYear(cycle.start_date)} - ${renderFormattedDateWithoutYear(cycle.end_date)}`
      : "Dates not configured";

  if (!cycle && isCycleLoading) {
    return (
      <>
        <PageHead title={pageTitle} />
        <div className="mx-auto flex h-full w-full max-w-5xl flex-col gap-6 py-6">
          <Loader className="space-y-3">
            <Loader.Item height="14px" width="96px" />
            <Loader.Item height="28px" width="260px" />
            <Loader.Item height="16px" width="420px" />
          </Loader>
          <Loader className="rounded-[10px] border border-custom-border-200 bg-custom-background-100 p-6 space-y-4">
            <Loader.Item height="16px" width="120px" />
            <Loader.Item height="24px" width="240px" />
            <Loader.Item height="16px" width="100%" />
            <Loader.Item height="16px" width="85%" />
            <Loader.Item height="180px" width="100%" />
          </Loader>
        </div>
      </>
    );
  }

  if (!cycle && didCycleFetchFail) {
    return (
      <>
        <PageHead title={pageTitle} />
        <EmptyState
          image={emptyCycle}
          title="Cycle does not exist"
          description="The cycle KPI page could not be opened because the cycle does not exist or has been deleted."
          primaryButton={{
            text: "View other cycles",
            onClick: () => router.push(`/${workspaceSlug}/projects/${projectId}/cycles`),
          }}
        />
      </>
    );
  }

  if (!cycle) return null;

  return (
    <>
      <PageHead title={pageTitle} />
      <div className="mx-auto flex h-full w-full max-w-5xl flex-col gap-6 py-6">
        <div className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-custom-primary-100">Cycle KPI</p>
          <div className="space-y-1">
            <h1 className="text-2xl font-semibold text-custom-text-100">{cycle.name}</h1>
            <p className="text-sm text-custom-text-300">
              The first KPI view shows a burndown chart based on estimate points, using the existing cycle analytics
              pipeline already available in the project cycle detail flow.
            </p>
          </div>
        </div>

        <section className="rounded-[10px] border border-custom-border-200 bg-custom-background-100 p-6">
          <div className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-custom-primary-100">Burndown KPI</p>
            <h2 className="text-lg font-semibold text-custom-text-100">Estimate-point burndown</h2>
            <p className="max-w-2xl text-sm text-custom-text-300">
              Remaining points are calculated from the sum of work-item estimates. In this first version, cancelled work
              items do not burn down the chart.
            </p>
          </div>

          <div className="mt-6 grid grid-cols-3 gap-3">
            <KpiStat label="Project" value={project?.name ?? "Project"} />
            <KpiStat label="Cycle dates" value={dateRangeLabel} />
            <KpiStat label="Estimate scope" value={`${totalEstimatePoints} points`} />
          </div>

          <div className="mt-3 grid grid-cols-2 gap-3">
            <KpiStat label="Completed" value={`${completedEstimatePoints} points`} />
            <KpiStat label="Remaining" value={`${pendingEstimatePoints} points`} />
          </div>

          <div className="mt-6 rounded-[10px] border border-dashed border-custom-border-200 bg-custom-background-90 p-6">
            {!hasValidCycleDates ? (
              <div className="space-y-3">
                <p className="text-sm font-medium text-custom-text-100">Cycle dates are required for burndown.</p>
                <p className="text-sm text-custom-text-300">
                  The KPI route is available, but this cycle needs valid start and end dates before the estimate-point
                  burndown can be rendered.
                </p>
              </div>
            ) : !hasBurndownDistribution ? (
              <Loader className="space-y-3">
                <Loader.Item height="16px" width="220px" />
                <Loader.Item height="16px" width="100%" />
                <Loader.Item height="16px" width="75%" />
                <Loader.Item height="140px" width="100%" />
              </Loader>
            ) : !hasEstimatePoints ? (
              <div className="space-y-3">
                <p className="text-sm font-medium text-custom-text-100">No estimate points available yet.</p>
                <p className="text-sm text-custom-text-300">
                  Add estimates to the cycle work items to generate the first burndown view for this KPI screen.
                </p>
              </div>
            ) : burndownDistribution ? (
              <div className="space-y-4">
                <div>
                  <p className="text-sm font-medium text-custom-text-100">Burndown chart</p>
                  <p className="text-sm text-custom-text-300">
                    Based only on estimate points from completed work items for this release.
                  </p>
                </div>
                <ProgressChart
                  distribution={burndownDistribution}
                  totalIssues={totalEstimatePoints}
                  plotTitle="remaining estimate points"
                  xAxisLabel="Time"
                  yAxisLabel="Remaining points"
                  className="min-h-[370px]"
                />
              </div>
            ) : (
              <div className="space-y-3">
                <p className="text-sm font-medium text-custom-text-100">Burndown data is not available.</p>
                <p className="text-sm text-custom-text-300">
                  The KPI route loaded successfully, but the estimate-point burndown payload could not be rendered for
                  this cycle.
                </p>
              </div>
            )}
          </div>
        </section>
      </div>
    </>
  );
});
