import { RiGamepadLine } from "react-icons/ri";
import { Card } from "@/components/ui/card";
import { PageHeader } from "@/components/shared/page-header";

const games = ["Gran Turismo 7", "Forza Motorsport", "Beat Saber", "EA FC 26", "Mortal Kombat", "Tekken 8", "F1 Arcade Pack", "Assetto Corsa"];

export default function GamesPage() {
  return <div><PageHeader title="O'yinlar" description="Game library by simulator type and device group." /><div className="grid grid-cols-4 gap-3">{games.map((game) => <Card key={game} className="flex items-center gap-3 p-4"><RiGamepadLine className="text-2xl text-sky-300" /><div><div className="font-semibold">{game}</div><div className="text-xs text-slate-500">Installed / ready</div></div></Card>)}</div></div>;
}
