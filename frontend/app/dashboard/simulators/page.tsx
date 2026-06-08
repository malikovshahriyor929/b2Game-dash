"use client";

import { PageHeader } from "@/components/shared/page-header";
import { SimulatorMap } from "@/components/simulator/simulator-map";

export default function SimulatorsPage() {
  return (
    <div>
      <PageHeader title="Maket / Simulator Map" description="Dense room map with zones, status colors, and fast operator actions." />
      <SimulatorMap />
    </div>
  );
}
