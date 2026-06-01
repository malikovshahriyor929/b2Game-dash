import { Badge } from "@/components/ui/badge";

export function PageHeader({ title, description, badge }: { title: string; description?: string; badge?: string }) {
  return (
    <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
      <div>
        <h1 className="text-xl font-bold text-slate-50">{title}</h1>
        {description ? <p className="mt-1 text-sm text-slate-400">{description}</p> : null}
      </div>
      {badge ? <Badge>{badge}</Badge> : null}
    </div>
  );
}
