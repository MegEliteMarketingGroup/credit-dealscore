import { useEffect } from "react";
import { Link, useLocation } from "@tanstack/react-router";
import { useDealStore } from "@/hooks/use-deal-store";
import { cn } from "@/lib/utils";

interface SidebarItem {
  id: string;
  label: string;
  score: number;
  href: string;
}

function statusColor(v: number): string {
  if (v >= 70) return "text-emerald-9 bg-emerald-3";
  if (v >= 55) return "text-amber-9 bg-amber-3";
  if (v >= 40) return "text-orange-9 bg-orange-3";
  return "text-red-9 bg-red-3";
}

export function Sidebar() {
  const { deals } = useDealStore();
  const location = useLocation();
  const active = location.pathname === "/" ? "desk" : location.pathname;

  // Build the two sections of the nav.
  const dealItems: SidebarItem[] = deals.map((d) => ({
    id: d.id,
    label: d.label || "Untitled deal",
    score: d.score,
    href: `/deal/${d.id}`,
  }));

  const sections: Array<{ key: string; items: SidebarItem[] }> = [
    {
      key: "desk",
      items: [{ id: "desk", label: "Underwriting desk", score: 0, href: "/" }],
    },
    { key: "deals", items: dealItems },
  ];

  // set --sidebar token via wrapper style; the nav block uses .sidebar-* tokens.
  return (
    <aside
      className="flex h-full w-full flex-col bg-sidebar text-sidebar-foreground"
      data-active={active}
    >
      <div className="flex items-center gap-3 px-5 pb-5 pt-6">
        <div className="grid h-9 w-9 place-items-center rounded-md bg-primary font-display text-base font-bold text-primary-foreground">
          D
        </div>
        <div className="min-w-0">
          <div className="font-display text-base font-bold leading-none tracking-tight">
            DEAL<span className="text-sidebar-primary">SCORE</span>
          </div>
          <div className="mt-1 text-[11px] uppercase tracking-[0.18em] text-sidebar-muted">
            Underwriting desk
          </div>
        </div>
      </div>

      <div className="mx-5 h-px bg-sidebar-border" />

      <nav className="flex flex-1 flex-col gap-1 overflow-y-auto px-3 py-4">
        {sections.map((section, i) => (
          <div key={section.key} className="flex flex-col gap-1">
            {i === 0 ? (
              <div className="px-3 pb-1 pt-2 text-[10px] font-semibold uppercase tracking-[0.16em] text-sidebar-muted">
                Workspace
              </div>
            ) : (
              <div className="px-3 pb-1 pt-3 text-[10px] font-semibold uppercase tracking-[0.16em] text-sidebar-muted">
                Saved deals {section.items.length > 0 ? `· ${section.items.length}` : ""}
              </div>
            )}
            {section.items.length === 0 && i === 1 ? (
              <div className="px-3 py-2 text-xs text-sidebar-muted/80">No saved deals yet.</div>
            ) : (
              section.items.map((item) => {
                const isActive = active === item.id;
                return (
                  <Link
                    key={item.id}
                    to={item.href}
                    className={cn(
                      "group flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors",
                      isActive
                        ? "bg-sidebar-accent text-sidebar-accent-foreground"
                        : "text-sidebar-foreground/90 hover:bg-sidebar-accent/60",
                    )}
                  >
                    <span
                      className={cn(
                        "grid h-7 w-7 shrink-0 place-items-center rounded-md text-[11px] font-bold tabular-nums",
                        item.id === "desk"
                          ? "bg-sidebar-accent text-sidebar-accent-foreground"
                          : statusColor(item.score),
                        !isActive && item.id === "desk" && "bg-transparent",
                      )}
                    >
                      {item.id === "desk" ? "●" : item.score}
                    </span>
                    <span className="truncate font-medium">{item.label}</span>
                  </Link>
                );
              })
            )}
          </div>
        ))}
      </nav>

      <div className="mx-5 h-px bg-sidebar-border" />
      <div className="px-5 py-4 text-[11px] leading-relaxed text-sidebar-muted">
        Scoring is indicative for desk use and does not constitute a credit decision or an offer of
        credit.
      </div>
    </aside>
  );
}
