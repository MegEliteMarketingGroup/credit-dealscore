import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";

import {
  computeDealScore,
  defaultSurvey,
  dealLabel,
  formatCurrency,
  formatPct,
  type DealResult,
  type DealSurvey,
} from "@/lib/deal-scoring";
import { useDealStore } from "@/hooks/use-deal-store";
import { cn } from "@/lib/utils";

import { DealSurveyForm } from "@/components/deal-survey-form";
import { ScoreGauge, FactorBar, tierTokenClass } from "@/components/deal-score-gauge";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Save, FilePlus2, Copy, Trash2, ShieldCheck, ShieldAlert } from "lucide-react";

interface DeskCanvasProps {
  dealId?: string;
}

export function DeskCanvas({ dealId }: DeskCanvasProps) {
  const store = useDealStore();
  const navigate = useNavigate();

  const [survey, setSurvey] = useState<DealSurvey>(() => {
    if (dealId) {
      const found = store.getDeal(dealId);
      if (found) return { ...found.survey };
    }
    return defaultSurvey();
  });

  // If the dealId changes (navigating between saved deals), reload survey.
  useEffect(() => {
    if (!dealId) return;
    const found = store.getDeal(dealId);
    if (found) setSurvey({ ...found.survey });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dealId]);

  const result: DealResult = useMemo(() => computeDealScore(survey), [survey]);
  const label = dealLabel(survey);

  const isNew = !dealId || !store.getDeal(dealId);

  const handleSave = () => {
    const id = dealId && store.getDeal(dealId) ? dealId : store.newDealId();
    store.saveDeal(id, survey);
    toast.success(isNew ? "Deal saved" : "Deal updated", {
      description: label || "Untitled deal",
    });
    if (dealId !== id) {
      navigate({ to: "/deal/$dealId", params: { dealId: id } });
    }
  };

  const handleNew = () => {
    setSurvey(defaultSurvey());
    navigate({ to: "/" });
    toast("Started a new deal");
  };

  const handleDuplicate = () => {
    const created = store.duplicateDeal(survey);
    toast.success("Deal duplicated", { description: dealLabel(survey) });
    navigate({ to: "/deal/$dealId", params: { dealId: created.id } });
  };

  const handleDelete = () => {
    if (!dealId || !store.getDeal(dealId)) return;
    store.deleteDeal(dealId);
    toast("Deal deleted");
    navigate({ to: "/" });
    setSurvey(defaultSurvey());
  };

  return (
    <div className="flex min-h-screen flex-col bg-muted/30">
      {/* Top bar */}
      <header className="sticky top-0 z-10 border-b border-border bg-background/80 backdrop-blur">
        <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-3.5 lg:px-8">
          <div className="flex min-w-0 items-center gap-3">
            <div className="min-w-0">
              <div className="font-display text-lg font-bold leading-none tracking-tight text-foreground">
                {isNew ? "New deal" : "Deal review"}
              </div>
              <div className="mt-1 truncate text-sm text-muted-foreground">
                {label || "Enter applicant and vehicle details"}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={handleNew}>
              <FilePlus2 /> New
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleDuplicate}
              disabled={!survey.applicantName && !survey.vehicleMake}
            >
              <Copy /> Duplicate
            </Button>
            {!isNew && (
              <Button
                variant="outline"
                size="sm"
                className="text-destructive hover:text-destructive"
                onClick={handleDelete}
              >
                <Trash2 /> Delete
              </Button>
            )}
            <Button size="sm" onClick={handleSave}>
              <Save /> {isNew ? "Save deal" : "Save changes"}
            </Button>
          </div>
        </div>
      </header>

      {/* Body: form (left) + score panel (right) */}
      <div className="mx-auto grid w-full max-w-[1400px] flex-1 grid-cols-1 gap-6 px-5 py-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,420px)] lg:px-8">
        <div className="order-2 lg:order-1">
          <DealSurveyForm survey={survey} onChange={setSurvey} />
        </div>

        <aside className="order-1 lg:order-2">
          <div className="lg:sticky lg:top-[88px]">
            <ScorePanel result={result} />
          </div>
        </aside>
      </div>
    </div>
  );
}

function ScorePanel({ result }: { result: DealResult }) {
  const { score, tier, factors, metrics, recommendation } = result;

  return (
    <div className="flex flex-col gap-5">
      {/* Score card */}
      <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
        <div className="flex items-center justify-between pb-2">
          <span className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
            Overall DEAL SCORE
          </span>
          <Badge variant="outline" className={cn("border-transparent", tierTokenClass(tier.key))}>
            {tier.letter} · {tier.label}
          </Badge>
        </div>

        <div className="flex justify-center py-2">
          <ScoreGauge value={score} tier={tier} />
        </div>

        {/* Recommendation banner */}
        <div
          className={cn(
            "mt-2 flex items-start gap-2.5 rounded-lg border p-3 text-sm",
            score >= 70
              ? "border-emerald-3 bg-emerald-2 text-foreground"
              : score >= 55
                ? "border-amber-3 bg-amber-2 text-foreground"
                : "border-red-3 bg-red-2 text-foreground",
          )}
        >
          {score >= 70 ? (
            <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-emerald-7" />
          ) : (
            <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0 text-red-7" />
          )}
          <p className="leading-relaxed text-foreground/90">{recommendation}</p>
        </div>
      </div>

      {/* Factor breakdown */}
      <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
        <div className="flex items-center justify-between pb-4">
          <span className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
            Risk factor breakdown
          </span>
        </div>
        <div className="flex flex-col gap-4">
          {factors.map((f) => (
            <FactorBar
              key={f.key}
              label={f.label}
              weight={f.weight}
              value={f.value}
              status={f.status}
            />
          ))}
        </div>
      </div>

      {/* Loan economics */}
      <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
        <div className="pb-4 text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
          Loan economics
        </div>
        <div className="grid grid-cols-2 gap-px overflow-hidden rounded-lg border border-border bg-border">
          <EconCell label="Amount financed" value={formatCurrency(metrics.amountFinanced)} />
          <EconCell label="Monthly payment" value={formatCurrency(metrics.monthlyPayment)} accent />
          <EconCell label="Payment-to-income" value={formatPct(metrics.pti)} />
          <EconCell label="Loan-to-value" value={formatPct(metrics.ltv)} />
          <EconCell label="Down payment" value={formatPct(metrics.downPct)} />
          <EconCell label="Vehicle-to-income" value={formatPct(metrics.vehicleToIncome)} />
          <EconCell label="Term" value={`${metrics.term} mo`} />
          <EconCell label="APR" value={`${metrics.apr.toFixed(1)}%`} />
        </div>
      </div>

      <p className="px-1 text-[11px] leading-relaxed text-muted-foreground">
        DEAL SCORE weights credit (24%), payment-to-income (22%), employment (18%), down payment /
        LTV (13%), term (12%) and vehicle-to-income (11%). Indicative only — not a credit decision.
      </p>
    </div>
  );
}

function EconCell({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div className={cn("bg-card px-3.5 py-3", accent && "bg-primary/[0.03]")}>
      <div className="text-[10px] uppercase tracking-wide text-muted-foreground">{label}</div>
      <div
        className={cn(
          "mt-0.5 text-sm font-semibold tabular-nums",
          accent ? "text-foreground" : "text-foreground",
        )}
      >
        {value}
      </div>
    </div>
  );
}
