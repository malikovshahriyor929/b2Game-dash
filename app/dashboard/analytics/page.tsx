import { FiActivity, FiClock, FiRepeat, FiTrendingUp } from "react-icons/fi";
import { PageHeader } from "@/components/shared/page-header";
import { ReportCard } from "@/components/reports/report-card";
import { RevenueChart } from "@/components/reports/revenue-chart";
import { Card } from "@/components/ui/card";

export default function AnalyticsPage() {
  const insights = ["Revenue per simulator", "Peak hours: 19:00 - 22:00", "Top simulator types: Racing, VIP", "Top products: Cola, Energy Drink", "Repeat customers: 42%", "Daily / weekly trend"];
  return <div><PageHeader title="Analitika" description="Management view for occupancy, average check and repeat customer behavior." /><div className="mb-4 grid grid-cols-4 gap-3"><ReportCard label="Occupancy rate" value={74} icon={FiActivity} /><ReportCard label="Average check" value={68000} icon={FiTrendingUp} /><ReportCard label="Peak hour revenue" value={260000} icon={FiClock} /><ReportCard label="Repeat customers" value={42} icon={FiRepeat} /></div><div className="grid grid-cols-[minmax(0,1fr)_360px] gap-4"><RevenueChart title="Daily / weekly revenue trend" /><Card className="space-y-3 p-4">{insights.map((item) => <div key={item} className="rounded-xl bg-slate-950 p-3 text-sm text-slate-300">{item}</div>)}</Card></div></div>;
}
