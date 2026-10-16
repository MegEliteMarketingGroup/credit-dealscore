import {
  formatCurrency,
  formatPct,
  TERM_OPTIONS,
  CREDIT_TIERS,
  type DealSurvey,
} from "@/lib/deal-scoring";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Separator } from "@/components/ui/separator";
import { User, Car, Wallet, Calculator } from "lucide-react";

interface Props {
  survey: DealSurvey;
  onChange: (next: DealSurvey) => void;
}

interface FieldProps {
  label: string;
  htmlFor: string;
  children: React.ReactNode;
}

function Field({ label, htmlFor, children }: FieldProps) {
  return (
    <div className="flex flex-col gap-1.5">
      <Label
        htmlFor={htmlFor}
        className="text-xs font-semibold uppercase tracking-wide text-muted-foreground"
      >
        {label}
      </Label>
      {children}
    </div>
  );
}

function SectionHeader({
  icon: Icon,
  title,
  desc,
}: {
  icon: React.ElementType;
  title: string;
  desc: string;
}) {
  return (
    <div className="flex items-center gap-2.5 pb-3">
      <div className="grid h-8 w-8 place-items-center rounded-md bg-primary/10 text-primary">
        <Icon className="h-4 w-4" />
      </div>
      <div>
        <div className="text-sm font-semibold text-foreground">{title}</div>
        <div className="text-xs text-muted-foreground">{desc}</div>
      </div>
    </div>
  );
}

export function DealSurveyForm({ survey, onChange }: Props) {
  const set = <K extends keyof DealSurvey>(key: K, value: DealSurvey[K]) =>
    onChange({ ...survey, [key]: value });

  const setNum = (key: keyof DealSurvey, raw: string) => {
    const n = raw === "" ? 0 : Number(raw);
    set(key, (Number.isFinite(n) ? n : 0) as DealSurvey[typeof key]);
  };

  const creditCategory = (() => {
    for (const t of CREDIT_TIERS) {
      if (survey.creditScore >= t.min && survey.creditScore < t.max) return t;
    }
    return CREDIT_TIERS[CREDIT_TIERS.length - 1]!;
  })();

  return (
    <div className="flex flex-col gap-6">
      {/* Applicant */}
      <section className="flex flex-col gap-4 rounded-xl border border-border bg-card p-5">
        <SectionHeader icon={User} title="Applicant" desc="Borrower profile and capacity" />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="Applicant name" htmlFor="applicantName">
            <Input
              id="applicantName"
              value={survey.applicantName}
              onChange={(e) => set("applicantName", e.target.value)}
              placeholder="Jane Doe"
            />
          </Field>
          <Field label="Monthly gross income" htmlFor="monthlyIncome">
            <Input
              id="monthlyIncome"
              type="number"
              inputMode="numeric"
              min={0}
              value={survey.monthlyIncome || ""}
              onChange={(e) => setNum("monthlyIncome", e.target.value)}
            />
          </Field>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-[1.4fr_1fr]">
          <Field label="Employment tenure" htmlFor="monthsOnJobSlider">
            <div className="flex items-center gap-3">
              <Slider
                id="monthsOnJobSlider"
                min={0}
                max={120}
                step={1}
                value={[survey.monthsOnJob]}
                onValueChange={(v) => set("monthsOnJob", v[0] ?? 0)}
                className="flex-1"
              />
              <span className="w-20 shrink-0 rounded-md bg-muted px-2 py-1 text-center text-xs font-medium tabular-nums text-foreground">
                {survey.monthsOnJob} mo
              </span>
            </div>
          </Field>
          <Field label="Credit score" htmlFor="creditScore">
            <div className="flex items-center gap-3">
              <Input
                id="creditScore"
                type="number"
                inputMode="numeric"
                min={300}
                max={850}
                value={survey.creditScore}
                onChange={(e) => setNum("creditScore", e.target.value)}
                className="w-24 tabular-nums"
              />
              <span
                className={cn("rounded-md px-2 py-1 text-[11px] font-semibold", "text-foreground")}
              >
                {creditCategory.label}
              </span>
            </div>
          </Field>
        </div>
      </section>

      {/* Vehicle */}
      <section className="flex flex-col gap-4 rounded-xl border border-border bg-card p-5">
        <SectionHeader icon={Car} title="Vehicle" desc="Collateral detail" />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <Field label="Year" htmlFor="vehicleYear">
            <Input
              id="vehicleYear"
              type="number"
              inputMode="numeric"
              min={1990}
              max={2030}
              value={survey.vehicleYear}
              onChange={(e) => setNum("vehicleYear", e.target.value)}
            />
          </Field>
          <Field label="Make" htmlFor="vehicleMake">
            <Input
              id="vehicleMake"
              value={survey.vehicleMake}
              onChange={(e) => set("vehicleMake", e.target.value)}
              placeholder="Toyota"
            />
          </Field>
          <Field label="Model" htmlFor="vehicleModel">
            <Input
              id="vehicleModel"
              value={survey.vehicleModel}
              onChange={(e) => set("vehicleModel", e.target.value)}
              placeholder="Camry"
            />
          </Field>
        </div>
        <Field label="Vehicle price" htmlFor="vehiclePrice">
          <Input
            id="vehiclePrice"
            type="number"
            inputMode="numeric"
            min={0}
            value={survey.vehiclePrice || ""}
            onChange={(e) => setNum("vehiclePrice", e.target.value)}
          />
        </Field>
      </section>

      {/* Structure */}
      <section className="flex flex-col gap-4 rounded-xl border border-border bg-card p-5">
        <SectionHeader icon={Wallet} title="Loan structure" desc="Down payment, term and rate" />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <Field label="Down payment" htmlFor="downPayment">
            <Input
              id="downPayment"
              type="number"
              inputMode="numeric"
              min={0}
              value={survey.downPayment || ""}
              onChange={(e) => setNum("downPayment", e.target.value)}
            />
          </Field>
          <Field label="Trade-in value" htmlFor="tradeIn">
            <Input
              id="tradeIn"
              type="number"
              inputMode="numeric"
              min={0}
              value={survey.tradeIn || ""}
              onChange={(e) => setNum("tradeIn", e.target.value)}
            />
          </Field>
          <Field label="Term (months)" htmlFor="loanTermMonths">
            <Select
              value={String(survey.loanTermMonths)}
              onValueChange={(v) => set("loanTermMonths", Number(v))}
            >
              <SelectTrigger id="loanTermMonths">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {TERM_OPTIONS.map((t) => (
                  <SelectItem key={t} value={String(t)}>
                    {t} months
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-[1fr_auto]">
          <Field label="APR" htmlFor="aprSlider">
            <div className="flex items-center gap-3">
              <Slider
                id="aprSlider"
                min={0}
                max={30}
                step={0.1}
                value={[survey.apr]}
                onValueChange={(v) => set("apr", v[0] ?? 0)}
                className="flex-1"
              />
              <span className="w-20 shrink-0 rounded-md bg-muted px-2 py-1 text-center text-xs font-medium tabular-nums text-foreground">
                {survey.apr.toFixed(1)}%
              </span>
            </div>
          </Field>
        </div>
      </section>

      <Separator />

      <section className="flex flex-col gap-4 rounded-xl border border-primary/20 bg-primary/[0.03] p-5">
        <SectionHeader
          icon={Calculator}
          title="Derived metrics"
          desc="Computed live from the inputs above"
        />
        <DerivedMetrics survey={survey} />
      </section>
    </div>
  );
}

function DerivedMetrics({ survey }: { survey: DealSurvey }) {
  // Re-derive using the same helpers the engine uses.
  const price = Number(survey.vehiclePrice) || 0;
  const down = Number(survey.downPayment) || 0;
  const trade = Number(survey.tradeIn) || 0;
  const income = Number(survey.monthlyIncome) || 0;
  const apr = Number(survey.apr) || 0;
  const term = survey.loanTermMonths || 60;

  const amountFinanced = Math.max(0, price - down - trade);
  const r = apr / 100 / 12;
  const monthlyPayment =
    amountFinanced <= 0
      ? 0
      : r === 0
        ? amountFinanced / term
        : (amountFinanced * r * Math.pow(1 + r, term)) / (Math.pow(1 + r, term) - 1);

  const pti = income > 0 ? monthlyPayment / income : 0;
  const ltv = price > 0 ? amountFinanced / price : 0;
  const downPct = price > 0 ? (down + trade) / price : 0;
  const vti = income > 0 ? price / (income * 12) : 0;

  const rows: Array<{ label: string; value: string; hint?: string }> = [
    { label: "Amount financed", value: formatCurrency(amountFinanced) },
    { label: "Est. monthly payment", value: formatCurrency(monthlyPayment), hint: "amortized" },
    { label: "Payment-to-income", value: formatPct(pti), hint: "lower is safer" },
    { label: "Loan-to-value (LTV)", value: formatPct(ltv), hint: "lower is safer" },
    { label: "Down payment", value: formatPct(downPct), hint: "of price" },
    { label: "Vehicle-to-income", value: formatPct(vti), hint: "annual basis" },
  ];

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
      {rows.map((row) => (
        <div key={row.label} className="rounded-lg bg-background/60 px-3 py-2.5">
          <div className="text-[11px] uppercase tracking-wide text-muted-foreground">
            {row.label}
          </div>
          <div className="mt-1 text-base font-semibold tabular-nums text-foreground">
            {row.value}
          </div>
          {row.hint && <div className="text-[10px] text-muted-foreground/80">{row.hint}</div>}
        </div>
      ))}
    </div>
  );
}
