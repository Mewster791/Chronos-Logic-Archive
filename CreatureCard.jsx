mport { Link } from "react-router-dom";
import { Image } from "@/components/ui/image";
import { ArrowUpRight } from "lucide-react";

export default function CreatureCard({ creature }) {
  return (
    <Link to={`/creature/${creature.id}`} className="group block">
      <div className="relative aspect-[4/3] overflow-hidden bg-secondary">
        {creature.image_url ? (
          <Image
            src={creature.image_url}
            alt={creature.name}
            className="h-full w-full transition-transform duration-700 group-hover:scale-105"
            fittingType="fill"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center font-mono-tag text-muted-foreground">
            No Specimen Imagery
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-transparent to-transparent" />
        <div className="absolute bottom-0 left-0 p-4">
          <span className="font-mono-tag text-white/80">
            {creature.period}
            {creature.diet ? ` · ${creature.diet}` : ""}
          </span>
        </div>
      </div>
      <div className="pt-3 flex items-start justify-between gap-2">
        <div>
          <h3 className="font-heading text-2xl leading-tight group-hover:text-accent transition-colors">
            {creature.name}
          </h3>
          <p className="font-mono-tag text-muted-foreground mt-1">
            {creature.scientific_name || creature.clade || "—"}
          </p>
        </div>
        <ArrowUpRight className="h-4 w-4 text-muted-foreground group-hover:text-accent mt-1 transition-colors shrink-0" strokeWidth={1.5} />
      </div>
    </Link>
  );
}
