"use client";

import { PageHeader } from "@/components/shared/page-header";
import { SimulatorMap } from "@/components/simulator/simulator-map";
import { useDashboardStore } from "@/components/providers/dashboard-store";
import { MapSkeleton } from "@/components/ui/skeletons";

export default function SimulatorsPage() {
  const { loading } = useDashboardStore();
  return (
    <div>
      <PageHeader title="Maket / Simulator Map" description="Dense room map with zones, status colors, and fast operator actions." />
      {loading ? <MapSkeleton count={16} /> : <SimulatorMap />}
    </div>
  );
}
