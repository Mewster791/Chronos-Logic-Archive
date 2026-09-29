import { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Send, Loader2, CheckCircle2 } from "lucide-react";

const FIELDS = [
  "description", "diet", "length_m", "weight_kg", "habitat",
  "discovery_location", "clade", "period", "tagline", "scientific_name",
];

export default function SuggestionForm({ creature }) {
  const [field, setField] = useState("description");
  const [suggestedValue, setSuggestedValue] = useState("");
  const [submitterName, setSubmitterName] = useState("");
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  const handleSubmit = async () => {
    if (!suggestedValue.trim()) return;
    setSubmitting(true);
    try {
      await base44.entities.Suggestion.create({
        creature_id: creature.id,
        creature_name: creature.name,
        field,
        current_value: String(creature[field] ?? ""),
        suggested_value: suggestedValue,
        submitter_name: submitterName.trim() || "Anonymous",
        notes: notes.trim(),
        status: "pending",
        votes: 0,
      });
      setDone(true);
      setSuggestedValue("");
      setNotes("");
      setSubmitterName("");
      setTimeout(() => setDone(false), 5000);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-5">
      <div>
        <span className="font-mono-tag text-muted-foreground">— Submit Amendment —</span>
        <h3 className="font-heading text-3xl mt-2">Suggest Amendment</h3>
        <p className="font-mono-tag text-muted-foreground mt-2">
          Submissions enter community review before reaching the curator.
        </p>
      </div>

      {done && (
        <div className="flex items-center gap-2 rounded-md bg-accent/10 border border-accent/30 px-4 py-3 text-sm text-accent">
          <CheckCircle2 className="h-4 w-4" /> Amendment submitted for scientific consensus review.
        </div>
      )}

      <div className="grid gap-4">
        <div className="grid gap-2">
          <Label className="font-mono-tag text-muted-foreground">Field to Amend</Label>
          <Select value={field} onValueChange={setField}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {FIELDS.map((f) => <SelectItem key={f} value={f}>{f}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div className="grid gap-2">
          <Label className="font-mono-tag text-muted-foreground">Suggested Value</Label>
          <Textarea
            value={suggestedValue}
            onChange={(e) => setSuggestedValue(e.target.value)}
            rows={4}
            placeholder="Enter the corrected or new information…"
          />
        </div>
        <div className="grid gap-2">
          <Label className="font-mono-tag text-muted-foreground">Your Name (optional)</Label>
          <Input value={submitterName} onChange={(e) => setSubmitterName(e.target.value)} placeholder="Anonymous" />
        </div>
        <div className="grid gap-2">
          <Label className="font-mono-tag text-muted-foreground">Supporting Notes</Label>
          <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={2} placeholder="Cite a source or reasoning…" />
        </div>
        <Button
          onClick={handleSubmit}
          disabled={submitting || !suggestedValue.trim()}
          className="w-full bg-foreground text-background hover:bg-foreground/90"
        >
          {submitting ? (
            <><Loader2 className="h-4 w-4 animate-spin" /> Submitting…</>
          ) : (
            <><Send className="h-4 w-4" /> Submit Amendment</>
          )}
        </Button>
      </div>
    </div>
  );
}
