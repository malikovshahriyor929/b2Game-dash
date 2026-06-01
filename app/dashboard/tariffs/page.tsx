import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { PageHeader } from "@/components/shared/page-header";
import { tariffs } from "@/lib/mock-data";
import { money } from "@/lib/format";

export default function TariffsPage() {
  return (
    <div>
      <PageHeader title="Tariflar" description="Time-based, package, promo, VIP, group, birthday, night and weekend pricing." />
      <div className="grid grid-cols-4 gap-3">{tariffs.map((item) => <Card key={item.id} className="p-4"><Badge variant={item.type === "VIP" ? "vip" : "muted"}>{item.type}</Badge><div className="mt-4 text-lg font-bold">{item.name}</div><div className="mt-2 text-xl font-black text-sky-200">{money(item.price)}</div></Card>)}</div>
    </div>
  );
}
