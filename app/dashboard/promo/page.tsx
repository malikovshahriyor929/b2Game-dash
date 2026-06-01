import { FiGift } from "react-icons/fi";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PageHeader } from "@/components/shared/page-header";

export default function PromoPage() {
  return <div><PageHeader title="Promo" description="Promo codes, packages, birthday and night offers." /><div className="grid grid-cols-3 gap-3">{["Racing 2+1", "Birthday Pack", "Night Pack", "Weekend VIP", "Student Hour", "Combo Snack"].map((item) => <Card key={item} className="p-4"><FiGift className="mb-4 text-2xl text-amber-300" /><div className="font-bold">{item}</div><Badge className="mt-3" variant="warning">Active</Badge></Card>)}</div></div>;
}
