import { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import { Activity, Hourglass, FileEdit } from "lucide-react";

export default function SiteStatsTicker() {
  const [stats, setStats] = useState({ species: "—", pending: "—", lastEdit: "—" });

  useEffect(() => {
    (async () => {
      try {
        const [species, pending] = await Promise.all([
          base44.entities.Creature.count(),
          base44.entities.Suggestion.count({ status: "pending" }),
        ]);
        const latest = await base44.entities.Creature.filter(
          {},
          { sort: "-updated_date", limit: 1, fields: ["updated_date"] }
        );
        const last = latest?.items?.[0]?.updated_date;
        setStats({
          species: species ?? 0,
          pending: pending ?? 0,
          lastEdit: last
            ? new Date(last).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })
            : "—",
        });
      } catch (e) {
        /* app may be public/unauthenticated — keep placeholder */
      }
    })();
  }, []);

  const items = [
    { icon: Activity, label: "Species Logged", value: stats.species },
    { icon: Hourglass, label: "Amendments Pending", value: stats.pending },
    { icon: FileEdit, label: "Last Edit", value: stats.lastEdit },
  ];

  return (
    <footer className="border-t border-border bg-secondary/40">
      <div className="mx-auto max-w-7xl px-6 md:px-12 py-3 overflow-hidden">
        <div className="flex items-center gap-8 md:gap-16 overflow-x-auto whitespace-nowrap">
          {items.map((it, idx) => (
            <div key={it.label} className="flex items-center gap-2.5 shrink-0">
              <it.icon className="h-3.5 w-3.5 text-accent" strokeWidth={1.5} />
              <span className="font-mono-tag text-muted-foreground">{it.label}</span>
              <span className="font-mono text-sm font-semibold text-foreground">{it.value}</span>
              {idx < items.length - 1 && <span className="text-border ml-4">|</span>}
            </div>
          ))}
        </div>
      </div>
      <div className="border-t border-border">
        <div className="mx-auto max-w-7xl px-6 md:px-12 py-5 flex flex-col md:flex-row items-center justify-between gap-3">
          <p className="font-mono-tag text-muted-foreground">Chronos-Logic Archive — A Digital Stratigraphy of Deep Time</p>
          <p className="font-mono-tag text-muted-foreground">Community-verified · Curator-gated</p>
        </div>
      </div>
    </footer>
  );
}
