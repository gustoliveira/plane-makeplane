"use client";

import { useEffect, useMemo, useState } from "react";
import { observer } from "mobx-react";
import { useParams } from "next/navigation";
// plane imports
import { Loader } from "@plane/ui";
// components
import { EmptyState } from "@/components/common/empty-state";
import { PageHead } from "@/components/core/page-title";
import useCyclesDetails from "@/components/cycles/active-cycle/use-cycles-details";
// hooks
import { useCycle } from "@/hooks/store/use-cycle";
import { useProject } from "@/hooks/store/use-project";
import { useAppRouter } from "@/hooks/use-app-router";
// assets
import emptyCycle from "@/public/empty-state/cycle.svg";

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

  const isAnalyticsReady = !!cycle.estimate_distribution;

  return (
    <>
      <PageHead title={pageTitle} />
      <div className="mx-auto flex h-full w-full max-w-5xl flex-col gap-6 py-6">
        <div className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-custom-primary-100">Cycle KPI</p>
          <div className="space-y-1">
            <h1 className="text-2xl font-semibold text-custom-text-100">{cycle.name}</h1>
            <p className="text-sm text-custom-text-300">
              This route now lives inside the cycle detail shell and prepares the KPI surface for cycle-level estimate
              burndown insights.
            </p>
          </div>
        </div>

        <section className="rounded-[10px] border border-custom-border-200 bg-custom-background-100 p-6">
          <div className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-custom-primary-100">Burndown KPI</p>
            <h2 className="text-lg font-semibold text-custom-text-100">Estimate-point burndown</h2>
            <p className="max-w-2xl text-sm text-custom-text-300">
              The KPI screen shell is ready. The next implementation step will render the burndown chart using the cycle
              estimate analytics already being fetched for this route.
            </p>
          </div>

          <div className="mt-6 rounded-[10px] border border-dashed border-custom-border-200 bg-custom-background-90 p-6">
            {isAnalyticsReady ? (
              <div className="space-y-3">
                <p className="text-sm font-medium text-custom-text-100">KPI data pipeline is ready for chart wiring.</p>
                <p className="text-sm text-custom-text-300">
                  This cycle already has estimate analytics in store, so the burndown chart can be connected in the next
                  phase without changing the route shell.
                </p>
              </div>
            ) : (
              <Loader className="space-y-3">
                <Loader.Item height="16px" width="220px" />
                <Loader.Item height="16px" width="100%" />
                <Loader.Item height="16px" width="75%" />
                <Loader.Item height="140px" width="100%" />
              </Loader>
            )}
          </div>
        </section>
      </div>
    </>
  );
});
