import { Outlet, Link, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import { Menu, X, Layers, Lock } from "lucide-react";
import SiteStatsTicker from "@/components/SiteStatsTicker";

const NAV_LINKS = [
  { label: "Archive", to: "/" },
  { label: "Triassic", to: "/?period=Triassic" },
  { label: "Jurassic", to: "/?period=Jurassic" },
  { label: "Cretaceous", to: "/?period=Cretaceous" },
];

export default function Layout() {
  const [open, setOpen] = useState(false);
  const location = useLocation();

  useEffect(() => { setOpen(false); }, [location.pathname, location.search]);

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <header className="sticky top-0 z-50 border-b border-border bg-background/85 backdrop-blur-md">
        <div className="mx-auto flex h-16 items-center justify-between px-6 md:px-12">
          <Link to="/" className="flex items-center gap-2.5">
            <Layers className="h-5 w-5 text-accent" strokeWidth={1.5} />
            <span className="font-heading text-xl font-medium tracking-tight">Chronos-Logic</span>
            <span className="font-mono-tag text-muted-foreground hidden sm:inline">Archive</span>
          </Link>
          <nav className="hidden md:flex items-center gap-8">
            {NAV_LINKS.map((l) => (
              <Link key={l.label} to={l.to} className="font-mono-tag text-muted-foreground hover:text-foreground transition-colors">
                {l.label}
              </Link>
            ))}
            <Link to="/editor" className="flex items-center gap-1.5 font-mono-tag text-muted-foreground hover:text-accent transition-colors">
              <Lock className="h-3 w-3" /> Curator
            </Link>
          </nav>
          <button className="md:hidden" onClick={() => setOpen(!open)} aria-label="Toggle menu">
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
        {open && (
          <div className="md:hidden border-t border-border bg-background px-6 py-4 flex flex-col gap-4">
            {NAV_LINKS.map((l) => (
              <Link key={l.label} to={l.to} className="font-mono-tag text-muted-foreground">{l.label}</Link>
            ))}
            <Link to="/editor" className="font-mono-tag text-accent">Curator Vault</Link>
          </div>
        )}
      </header>
      <main className="flex-1">
        <Outlet />
      </main>
      <SiteStatsTicker />
    </div>
  );
}
