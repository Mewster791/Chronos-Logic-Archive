import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { Image } from "@/components/ui/image";
import SuggestionForm from "@/components/SuggestionForm";
import ScaleMaster from "@/components/ScaleMaster";
import { Loader2, ArrowLeft } from "lucide-react";

export default function CreatureDetail() {
  const { id } = useParams();
  const [creature, setCreature] = useState(null);
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const c = await base44.entities.Creature.get(id);
        setCreature(c);
        const s = await base44.entities.Suggestion.filter(
          { creature_id: id, status: "pending" },
          { sort: "-created_date", limit: 20 }
        );
        setSuggestions(s?.items ?? []);
      } catch (e) {
        setCreature(null);
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  if (loading) {
    return (
      <div className="flex justify-center py-32">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!creature) {
    return (
      <div className="text-center py-32">
        <p className="font-mono-tag text-muted-foreground">Specimen not found in the archive.</p>
        <Link to="/" className="text-accent mt-4 inline-block font-mono-tag">← Return to archive</Link>
      </div>
    );
  }

  const dataSheet = [
    { label: "Scientific Name", value: creature.scientific_name },
    { label: "Clade", value: creature.clade },
    { label: "Period", value: creature.period },
    { label: "Era", value: creature.era },
    { label: "Diet", value: creature.diet },
    { label: "Length", value: creature.length_m ? `${creature.length_m} m` : null },
    { label: "Height", value: creature.height_m ? `${creature.height_m} m` : null },
    { label: "Weight", value: creature.weight_kg ? `${Number(creature.weight_kg).toLocaleString()} kg` : null },
    { label: "Habitat", value: creature.habitat },
    { label: "Discovery Location", value: creature.discovery_location },
    { label: "Discovery Year", value: creature.discovery_year },
  ].filter((d) => d.value);

  return (
    <div className="mx-auto max-w-7xl px-6 md:px-12 py-10">
      <Link to="/" className="inline-flex items-center gap-2 font-mono-tag text-muted-foreground hover:text-accent mb-8">
        <ArrowLeft className="h-3.5 w-3.5" /> Archive Index
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16">
        {/* Imagery */}
        <div className="lg:col-span-7">
          <div className="relative aspect-[4/3] overflow-hidden bg-secondary">
            {creature.image_url ? (
              <Image src={creature.image_url} alt={creature.name} className="h-full w-full" fittingType="fill" />
            ) : (
              <div className="flex h-full w-full items-center justify-center font-mono-tag text-muted-foreground">
                No specimen imagery
              </div>
            )}
          </div>
          {creature.tagline && (
            <p className="mt-4 font-heading text-2xl text-muted-foreground italic">"{creature.tagline}"</p>
          )}
        </div>

        {/* Data sheet */}
        <div className="lg:col-span-5">
          <span className="font-mono-tag text-accent">
            {creature.period}
            {creature.diet ? ` · ${creature.diet}` : ""}
          </span>
          <h1 className="font-heading text-5xl md:text-6xl mt-2 leading-[0.95]">{creature.name}</h1>
          {creature.scientific_name && (
            <p className="font-heading text-xl italic text-muted-foreground mt-2">{creature.scientific_name}</p>
          )}

          <div className="mt-8 border-t border-border">
            {dataSheet.map((d, i) => (
              <div
                key={d.label}
                className={`flex justify-between gap-4 py-3 ${i < dataSheet.length - 1 ? "border-b border-border" : ""}`}
              >
                <span className="font-mono-tag text-muted-foreground shrink-0">{d.label}</span>
                <span className="text-sm text-right font-medium">{d.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Field notes */}
      {creature.description && (
        <section className="mt-20 max-w-3xl">
          <span className="font-mono-tag text-muted-foreground">— Field Notes —</span>
          <div className="mt-4 text-lg leading-[1.7] text-foreground/90 whitespace-pre-line">
            {creature.description}
          </div>
        </section>
      )}

      {/* Community consensus + suggestion form */}
      <section className="mt-20 grid grid-cols-1 lg:grid-cols-2 gap-12">
        <div>
          <span className="font-mono-tag text-muted-foreground">— Community Consensus —</span>
          <h2 className="font-heading text-3xl mt-2">Pending Amendments</h2>
          {suggestions.length === 0 ? (
            <p className="mt-4 font-mono-tag text-muted-foreground">
              No pending amendments. The record is stable.
            </p>
          ) : (
            <div className="mt-6 space-y-4">
              {suggestions.map((s) => (
                <div key={s.id} className="border border-border rounded-md p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-mono-tag text-accent">{s.field}</span>
                    <span className="font-mono-tag text-muted-foreground">{s.votes} votes</span>
                  </div>
                  <p className="text-sm leading-relaxed">{s.suggested_value}</p>
                  <p className="font-mono-tag text-muted-foreground mt-3">— {s.submitter_name}</p>
                </div>
              ))}
            </div>
          )}
        </div>
        <div className="lg:border-l lg:border-border lg:pl-12">
          <SuggestionForm creature={creature} />
        </div>
      </section>

      <ScaleMaster length_m={creature.length_m} height_m={creature.height_m} name={creature.name} />
    </div>
  );
}
