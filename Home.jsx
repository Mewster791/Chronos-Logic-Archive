import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { Image } from "@/components/ui/image";
import { Input } from "@/components/ui/input";
import CreatureCard from "@/components/CreatureCard";
import { Loader2, ArrowDown, Search } from "lucide-react";

const PERIODS = ["All", "Triassic", "Jurassic", "Cretaceous"];
const HERO_IMG = "https://media.base44.com/images/public/6ab9b1bccbd731904064a43a/fc130a7ce_generated_42910477.jpg";

export default function Home() {
  const [searchParams, setSearchParams] = useSearchParams();
  const activePeriod = searchParams.get("period") || "All";
  const [creatures, setCreatures] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const q = {};
        if (activePeriod !== "All") q.period = activePeriod;
        if (query.trim()) q.name = { $regex: query.trim(), $options: "i" };
        const res = await base44.entities.Creature.filter(q, { sort: "name", limit: 60 });
        setCreatures(res?.items ?? []);
      } finally {
        setLoading(false);
      }
    })();
  }, [activePeriod, query]);

  const setPeriod = (p) => {
    if (p === "All") setSearchParams({});
    else setSearchParams({ period: p });
  };

  return (
    <div>
      {/* Hero */}
      <section className="relative h-[82vh] min-h-[520px] overflow-hidden">
        <Image src={HERO_IMG} alt="Prehistoric landscape" className="absolute inset-0 h-full w-full" fittingType="fill" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/45 via-black/25 to-background" />
        <div className="relative z-10 flex h-full flex-col items-center justify-end pb-20 px-6 text-center">
          <span className="font-mono-tag text-white/70 mb-5">A Digital Stratigraphy of Deep Time</span>
          <h1 className="font-heading text-white text-6xl md:text-8xl font-light tracking-tight text-balance max-w-4xl leading-[0.92]">
            The Chronos-Logic Archive
          </h1>
          <p className="mt-7 max-w-xl text-white/85 text-lg leading-relaxed">
            A living record of Earth's biological legacy — where fossil data becomes a tactile, community-verified portal into deep time.
          </p>
          <ArrowDown className="mt-10 h-5 w-5 text-white/50 animate-bounce" />
        </div>
      </section>

      {/* Latitudinal ruler */}
      <div className="border-y border-border">
        <div className="mx-auto max-w-7xl px-6 md:px-12 py-3 flex items-center justify-between">
          <span className="font-mono-tag text-muted-foreground">— Stratum 001 · Archive Index —</span>
          <span className="font-mono-tag text-muted-foreground hidden md:inline">541 MYA → Present</span>
        </div>
      </div>

      {/* Filter + Grid */}
      <section className="mx-auto max-w-7xl px-6 md:px-12 py-16">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
          <div>
            <h2 className="font-heading text-4xl md:text-5xl">The Specimen Index</h2>
            <p className="font-mono-tag text-muted-foreground mt-2">Browse by geological period</p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {PERIODS.map((p) => (
              <button
                key={p}
                onClick={() => setPeriod(p)}
                className={`font-mono-tag px-3.5 py-1.5 rounded-sm border transition-colors ${
                  activePeriod === p
                    ? "border-foreground bg-foreground text-background"
                    : "border-border text-muted-foreground hover:text-foreground hover:border-foreground/40"
                }`}
              >
                {p}
              </button>
            ))}
          </div>
        </div>

        <div className="relative max-w-md mb-10">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search specimens…"
            className="pl-9"
          />
        </div>

        {loading ? (
          <div className="flex justify-center py-24">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : creatures.length === 0 ? (
          <div className="text-center py-24 font-mono-tag text-muted-foreground">
            No specimens catalogued in this stratum yet.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-12">
            {creatures.map((c) => <CreatureCard key={c.id} creature={c} />)}
          </div>
        )}
      </section>
    </div>
  );
}
