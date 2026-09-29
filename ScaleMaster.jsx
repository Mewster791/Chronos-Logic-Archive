export default function ScaleMaster({ length_m, height_m, name }) {
  const humanH = 1.7;
  const creatureH = height_m || length_m || 5;
  const maxH = Math.max(humanH, creatureH);
  const humanPct = (humanH / maxH) * 100;
  const creaturePct = (creatureH / maxH) * 100;

  return (
    <div className="fixed bottom-6 right-6 z-40 hidden lg:block">
      <div className="bg-background/92 backdrop-blur-md border border-border rounded-md p-4 shadow-xl w-52">
        <p className="font-mono-tag text-muted-foreground mb-3">Scale Reference</p>
        <div className="flex items-end justify-around gap-4 h-32">
          <div className="flex flex-col items-center gap-1.5">
            <div
              className="w-7 bg-foreground/60 rounded-t-sm"
              style={{ height: `${humanPct}%`, minHeight: "10px" }}
            />
            <span className="font-mono-tag text-muted-foreground">{humanH}m</span>
            <span className="font-mono-tag text-muted-foreground text-[0.6rem]">Human</span>
          </div>
          <div className="flex flex-col items-center gap-1.5">
            <div
              className="w-12 bg-accent rounded-t-sm"
              style={{ height: `${creaturePct}%`, minHeight: "10px" }}
            />
            <span className="font-mono-tag text-accent">{creatureH}m</span>
            <span className="font-mono-tag text-muted-foreground text-[0.6rem] truncate max-w-[6rem]">{name}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
