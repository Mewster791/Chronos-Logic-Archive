import { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Lock, Check, X, Edit, Trash2, Plus } from "lucide-react";

const EMPTY = {
  name: "", scientific_name: "", period: "Cretaceous", era: "", clade: "",
  diet: "Carnivore", length_m: "", height_m: "", weight_kg: "", habitat: "",
  description: "", discovery_location: "", discovery_year: "", image_url: "", tagline: "",
};
const PERIODS = ["Cambrian","Ordovician","Silurian","Devonian","Carboniferous","Permian","Triassic","Jurassic","Cretaceous","Paleogene","Neogene","Quaternary"];
const DIETS = ["Carnivore","Herbivore","Omnivore","Piscivore","Filter Feeder"];

export default function Editor() {
  const [accessed, setAccessed] = useState(false);
  const [code, setCode] = useState("");
  const [checking, setChecking] = useState(false);
  const [error, setError] = useState("");
  const [tab, setTab] = useState("creatures");
  const [creatures, setCreatures] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);

  const checkCode = async () => {
    setChecking(true);
    setError("");
    try {
      const res = await base44.functions.invoke("validateEditorAccess", { code });
      if (res.data?.valid) setAccessed(true);
      else setError("Invalid access code.");
    } catch (e) {
      setError("Verification failed.");
    } finally {
      setChecking(false);
    }
  };

  const loadData = async () => {
    const [c, s] = await Promise.all([
      base44.entities.Creature.filter({}, { sort: "name", limit: 100 }),
      base44.entities.Suggestion.filter({ status: "pending" }, { sort: "-created_date", limit: 100 }),
    ]);
    setCreatures(c?.items ?? []);
    setSuggestions(s?.items ?? []);
  };

  useEffect(() => { if (accessed) loadData(); }, [accessed]);

  const startEdit = (c) => { setEditing(c.id); setForm({ ...EMPTY, ...c }); };
  const startNew = () => { setEditing("new"); setForm(EMPTY); };
  const cancel = () => { setEditing(null); setForm(EMPTY); };

  const save = async () => {
    setSaving(true);
    try {
      const payload = {
        ...form,
        length_m: form.length_m ? Number(form.length_m) : undefined,
        height_m: form.height_m ? Number(form.height_m) : undefined,
        weight_kg: form.weight_kg ? Number(form.weight_kg) : undefined,
        discovery_year: form.discovery_year ? Number(form.discovery_year) : undefined,
      };
      if (editing === "new") await base44.entities.Creature.create(payload);
      else await base44.entities.Creature.update(editing, payload);
      cancel();
      await loadData();
    } finally {
      setSaving(false);
    }
  };

  const remove = async (id) => {
    await base44.entities.Creature.delete(id);
    await loadData();
  };

  const approveSuggestion = async (s) => {
    const numFields = ["length_m", "height_m", "weight_kg", "discovery_year"];
    const val = numFields.includes(s.field) ? Number(s.suggested_value) : s.suggested_value;
    await base44.entities.Creature.update(s.creature_id, { [s.field]: val });
    await base44.entities.Suggestion.update(s.id, { status: "approved" });
    await loadData();
  };

  const rejectSuggestion = async (id) => {
    await base44.entities.Suggestion.update(id, { status: "rejected" });
    await loadData();
  };

  // Access gate
  if (!accessed) {
    return (
      <div className="min-h-[72vh] flex items-center justify-center px-6">
        <div className="w-full max-w-md">
          <div className="border border-border bg-card rounded-md p-10 text-center">
            <Lock className="h-8 w-8 text-accent mx-auto mb-6" strokeWidth={1.5} />
            <h1 className="font-heading text-4xl">Curator's Vault</h1>
            <p className="font-mono-tag text-muted-foreground mt-3">
              Enter the access code to edit the archive.
            </p>
            <input
              type="password"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && checkCode()}
              className="mt-8 w-full text-center font-mono text-2xl tracking-[0.3em] border border-border bg-background px-4 py-4 rounded-sm focus:outline-none focus:border-accent transition-colors"
              placeholder="••••••••"
              autoFocus
            />
            {error && <p className="text-destructive text-sm mt-3">{error}</p>}
            <Button
              onClick={checkCode}
              disabled={checking || !code}
              className="w-full mt-4 bg-foreground text-background hover:bg-foreground/90"
            >
              {checking ? <Loader2 className="h-4 w-4 animate-spin" /> : "Authenticate"}
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-6 md:px-12 py-10">
      <div className="flex items-center justify-between mb-10">
        <div>
          <span className="font-mono-tag text-accent">Authenticated Curator</span>
          <h1 className="font-heading text-5xl mt-1">Curator's Vault</h1>
        </div>
        <Button onClick={() => { setAccessed(false); setCode(""); }} variant="outline" className="font-mono-tag">
          Lock
        </Button>
      </div>

      <div className="flex gap-2 mb-8 border-b border-border">
        <button
          onClick={() => setTab("creatures")}
          className={`font-mono-tag px-4 py-3 border-b-2 transition-colors ${
            tab === "creatures" ? "border-accent text-foreground" : "border-transparent text-muted-foreground"
          }`}
        >
          Specimens ({creatures.length})
        </button>
        <button
          onClick={() => setTab("suggestions")}
          className={`font-mono-tag px-4 py-3 border-b-2 transition-colors ${
            tab === "suggestions" ? "border-accent text-foreground" : "border-transparent text-muted-foreground"
          }`}
        >
          Amendments ({suggestions.length})
        </button>
      </div>

      {tab === "creatures" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          <div className="lg:col-span-4 space-y-2">
            <Button onClick={startNew} variant="outline" className="w-full justify-start gap-2 mb-4">
              <Plus className="h-4 w-4" /> New Specimen
            </Button>
            {creatures.map((c) => (
              <div
                key={c.id}
                className={`flex items-center justify-between px-3 py-2.5 rounded-sm border cursor-pointer transition-colors ${
                  editing === c.id ? "border-accent bg-accent/5" : "border-border hover:border-foreground/30"
                }`}
                onClick={() => startEdit(c)}
              >
                <div>
                  <p className="text-sm font-medium">{c.name}</p>
                  <p className="font-mono-tag text-muted-foreground">{c.period}</p>
                </div>
                <div className="flex gap-1">
                  <button onClick={(e) => { e.stopPropagation(); startEdit(c); }} className="p-1.5 hover:text-accent">
                    <Edit className="h-3.5 w-3.5" />
                  </button>
                  <button onClick={(e) => { e.stopPropagation(); remove(c.id); }} className="p-1.5 hover:text-destructive">
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
          <div className="lg:col-span-8">
            {editing ? (
              <div className="border border-border rounded-md p-6 space-y-4">
                <h3 className="font-heading text-2xl">{editing === "new" ? "New Specimen" : "Edit Specimen"}</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Field label="Common Name" value={form.name} onChange={(v) => setForm({ ...form, name: v })} />
                  <Field label="Scientific Name" value={form.scientific_name} onChange={(v) => setForm({ ...form, scientific_name: v })} />
                  <SelectField label="Period" value={form.period} options={PERIODS} onChange={(v) => setForm({ ...form, period: v })} />
                  <Field label="Era" value={form.era} onChange={(v) => setForm({ ...form, era: v })} />
                  <Field label="Clade" value={form.clade} onChange={(v) => setForm({ ...form, clade: v })} />
                  <SelectField label="Diet" value={form.diet} options={DIETS} onChange={(v) => setForm({ ...form, diet: v })} />
                  <Field label="Length (m)" value={form.length_m} onChange={(v) => setForm({ ...form, length_m: v })} />
                  <Field label="Height (m)" value={form.height_m} onChange={(v) => setForm({ ...form, height_m: v })} />
                  <Field label="Weight (kg)" value={form.weight_kg} onChange={(v) => setForm({ ...form, weight_kg: v })} />
                  <Field label="Discovery Year" value={form.discovery_year} onChange={(v) => setForm({ ...form, discovery_year: v })} />
                  <Field label="Habitat" value={form.habitat} onChange={(v) => setForm({ ...form, habitat: v })} />
                  <Field label="Discovery Location" value={form.discovery_location} onChange={(v) => setForm({ ...form, discovery_location: v })} />
                  <Field label="Tagline" value={form.tagline} onChange={(v) => setForm({ ...form, tagline: v })} />
                  <Field label="Image URL" value={form.image_url} onChange={(v) => setForm({ ...form, image_url: v })} />
                </div>
                <Field label="Description" value={form.description} onChange={(v) => setForm({ ...form, description: v })} textarea />
                {form.image_url && (
                  <img src={form.image_url} alt="preview" className="w-full max-h-48 object-cover rounded-sm" />
                )}
                <div className="flex gap-3 pt-2">
                  <Button onClick={save} disabled={saving || !form.name} className="bg-foreground text-background hover:bg-foreground/90">
                    {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : "Save Specimen"}
                  </Button>
                  <Button onClick={cancel} variant="outline">Cancel</Button>
                </div>
              </div>
            ) : (
              <div className="border border-dashed border-border rounded-md h-full min-h-[300px] flex items-center justify-center">
                <p className="font-mono-tag text-muted-foreground">Select a specimen to edit, or create a new one.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {tab === "suggestions" && (
        <div className="space-y-4">
          {suggestions.length === 0 ? (
            <p className="font-mono-tag text-muted-foreground text-center py-20">
              No pending amendments awaiting review.
            </p>
          ) : (
            suggestions.map((s) => (
              <div key={s.id} className="border border-border rounded-md p-5 grid grid-cols-1 md:grid-cols-12 gap-4">
                <div className="md:col-span-3">
                  <p className="font-mono-tag text-accent">{s.field}</p>
                  <p className="text-sm font-medium mt-1">{s.creature_name}</p>
                  <p className="font-mono-tag text-muted-foreground mt-1">{s.submitter_name}</p>
                </div>
                <div className="md:col-span-7 text-sm leading-relaxed">
                  <p className="font-mono-tag text-muted-foreground mb-1">
                    Current: <span className="text-foreground/70">{s.current_value || "—"}</span>
                  </p>
                  <p>{s.suggested_value}</p>
                  {s.notes && <p className="font-mono-tag text-muted-foreground mt-2">Notes: {s.notes}</p>}
                </div>
                <div className="md:col-span-2 flex md:flex-col gap-2 justify-end">
                  <Button size="sm" onClick={() => approveSuggestion(s)} className="bg-accent text-white hover:bg-accent/90 gap-1">
                    <Check className="h-3.5 w-3.5" /> Approve
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => rejectSuggestion(s.id)} className="gap-1">
                    <X className="h-3.5 w-3.5" /> Reject
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}

function Field({ label, value, onChange, textarea }) {
  return (
    <div className="grid gap-1.5">
      <Label className="font-mono-tag text-muted-foreground">{label}</Label>
      {textarea ? (
        <Textarea value={value || ""} onChange={(e) => onChange(e.target.value)} rows={6} />
      ) : (
        <Input value={value ?? ""} onChange={(e) => onChange(e.target.value)} />
      )}
    </div>
  );
}

function SelectField({ label, value, options, onChange }) {
  return (
    <div className="grid gap-1.5">
      <Label className="font-mono-tag text-muted-foreground">{label}</Label>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger><SelectValue /></SelectTrigger>
        <SelectContent>
          {options.map((o) => <SelectItem key={o} value={o}>{o}</SelectItem>)}
        </SelectContent>
      </Select>
    </div>
  );
}
