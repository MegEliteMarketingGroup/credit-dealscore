// DEAL SCORE — pure underwriting scoring engine. No React, no I/O.
// Each factor maps survey inputs to a 0-100 "safety" value (higher = safer deal),
// then factors are weighted into an overall DEAL SCORE with a tiered grade.

export interface DealSurvey {
  applicantName: string;
  creditScore: number;
  monthsOnJob: number;
  monthlyIncome: number;
  vehicleYear: number;
  vehicleMake: string;
  vehicleModel: string;
  vehiclePrice: number;
  downPayment: number;
  tradeIn: number;
  loanTermMonths: number;
  apr: number;
}

export type NumericSurveyKey = {
  [K in keyof DealSurvey]: DealSurvey[K] extends number ? K : never;
}[keyof (keyof DealSurvey) extends never ? never : keyof DealSurvey];

export interface Tier {
  letter: string;
  label: string;
  key: "a" | "b" | "c" | "d" | "e";
}

export interface DealFactor {
  key: string;
  label: string;
  weight: number; // 0..1
  value: number; // 0..100
  status: string;
}

export interface DealMetrics {
  amountFinanced: number;
  monthlyPayment: number;
  pti: number; // fraction
  ltv: number; // fraction
  downPct: number; // fraction
  vehicleToIncome: number; // fraction
  term: number;
  apr: number;
}

export interface DealResult {
  score: number;
  tier: Tier;
  factors: DealFactor[];
  metrics: DealMetrics;
  recommendation: string;
}

export const TERM_OPTIONS = [24, 36, 48, 60, 72, 84] as const;

export const CREDIT_TIERS = [
  { label: "Deep subprime", range: "< 500", min: 300, max: 500 },
  { label: "Subprime", range: "500–560", min: 500, max: 560 },
  { label: "Near prime", range: "560–620", min: 560, max: 620 },
  { label: "Prime", range: "620–680", min: 620, max: 680 },
  { label: "Prime-plus", range: "680–720", min: 680, max: 720 },
  { label: "Super prime", range: "720–780", min: 720, max: 780 },
  { label: "Exceptional", range: "780+", min: 780, max: 851 },
] as const;

export function defaultSurvey(): DealSurvey {
  return {
    applicantName: "",
    creditScore: 680,
    monthsOnJob: 36,
    monthlyIncome: 5200,
    vehicleYear: 2024,
    vehicleMake: "",
    vehicleModel: "",
    vehiclePrice: 27500,
    downPayment: 4500,
    tradeIn: 0,
    loanTermMonths: 60,
    apr: 10.9,
  };
}

// ---- formatting helpers ----
export function formatCurrency(v: number): string {
  if (!Number.isFinite(v)) v = 0;
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(v);
}

export function formatPct(fraction: number, digits = 1): string {
  if (!Number.isFinite(fraction)) fraction = 0;
  return `${(fraction * 100).toFixed(digits)}%`;
}

// ---- piecewise-linear anchor interpolation ----
type Anchor = [number, number];

function band(value: number, anchors: Anchor[]): number {
  if (anchors.length === 0) return 0;
  const first = anchors[0]!;
  const last = anchors[anchors.length - 1]!;
  if (value <= first[0]) return first[1];
  if (value >= last[0]) return last[1];
  for (let i = 0; i < anchors.length - 1; i++) {
    const a = anchors[i]!;
    const b = anchors[i + 1]!;
    const [x0, y0] = a;
    const [x1, y1] = b;
    if (value >= x0 && value <= x1) {
      const t = (value - x0) / (x1 - x0);
      return y0 + t * (y1 - y0);
    }
  }
  return last[1];
}

const CREDIT_ANCHORS: Anchor[] = [
  [300, 2],
  [500, 8],
  [560, 20],
  [600, 34],
  [620, 42],
  [660, 56],
  [680, 66],
  [700, 74],
  [720, 82],
  [760, 92],
  [780, 96],
  [850, 100],
];

const EMPLOYMENT_ANCHORS: Anchor[] = [
  [0, 4],
  [3, 8],
  [6, 14],
  [12, 28],
  [24, 48],
  [36, 68],
  [60, 88],
  [84, 94],
  [120, 100],
];

// payment-to-income (fraction). Lower = safer.
const PTI_ANCHORS: Anchor[] = [
  [0, 100],
  [0.05, 95],
  [0.08, 86],
  [0.1, 78],
  [0.12, 66],
  [0.15, 52],
  [0.18, 40],
  [0.2, 30],
  [0.25, 14],
  [0.3, 6],
  [1, 1],
];

const TERM_ANCHORS: Anchor[] = [
  [24, 100],
  [36, 90],
  [48, 74],
  [60, 58],
  [72, 36],
  [84, 18],
];

// down payment as % of price. Higher = safer.
const DOWN_ANCHORS: Anchor[] = [
  [0, 4],
  [0.05, 26],
  [0.1, 48],
  [0.15, 64],
  [0.2, 78],
  [0.3, 92],
  [0.5, 100],
];

// vehicle price / annual income. Lower = safer deal economics.
const VTI_ANCHORS: Anchor[] = [
  [0.15, 100],
  [0.3, 92],
  [0.5, 78],
  [0.75, 58],
  [1.0, 42],
  [1.25, 28],
  [1.5, 18],
  [2.0, 8],
  [5, 2],
];

function statusLabel(v: number): string {
  if (v >= 80) return "Low risk";
  if (v >= 60) return "Moderate";
  if (v >= 40) return "Elevated";
  return "High risk";
}

export function tierKeyFromValue(v: number): Tier["key"] {
  if (v >= 85) return "a";
  if (v >= 70) return "b";
  if (v >= 55) return "c";
  if (v >= 40) return "d";
  return "e";
}

export function tierFromScore(score: number): Tier {
  const key = tierKeyFromValue(score);
  switch (key) {
    case "a":
      return { letter: "A", label: "Strong deal", key };
    case "b":
      return { letter: "B", label: "Good deal", key };
    case "c":
      return { letter: "C", label: "Marginal", key };
    case "d":
      return { letter: "D", label: "High risk", key };
    default:
      return { letter: "E", label: "Severe risk", key };
  }
}

const RECOMMENDATIONS: Record<Tier["key"], string> = {
  a: "Approve with confidence. Strong borrower profile and loan structure — this deal clears desk guidelines with room to spare.",
  b: "Solid deal. Meets guidelines with manageable risk; verify income docs and proceed to funding.",
  c: "Marginal. Tight on affordability or structure — consider a shorter term, higher down payment, or a co-applicant.",
  d: "High risk. Payment-to-income or credit flags this deal; restructure before approval or add conditions.",
  e: "Severe risk. Decline, or escalate to a senior underwriter with explicit conditions.",
};

function num(v: unknown): number {
  return typeof v === "number" && Number.isFinite(v) ? v : 0;
}

export function computeDealScore(survey: DealSurvey): DealResult {
  const price = num(survey.vehiclePrice);
  const down = num(survey.downPayment);
  const trade = num(survey.tradeIn);
  const income = num(survey.monthlyIncome);
  const apr = num(survey.apr);
  const term = survey.loanTermMonths || 60;

  const amountFinanced = Math.max(0, price - down - trade);
  const r = apr / 100 / 12;
  const monthlyPayment =
    amountFinanced <= 0
      ? 0
      : r === 0
        ? amountFinanced / term
        : (amountFinanced * r * Math.pow(1 + r, term)) / (Math.pow(1 + r, term) - 1);

  const pti = income > 0 ? monthlyPayment / income : 1;
  const downPct = price > 0 ? (down + trade) / price : 0;
  const ltv = price > 0 ? amountFinanced / price : 1;
  const vehicleToIncome = income > 0 ? price / (income * 12) : 99;

  const creditValue = band(survey.creditScore, CREDIT_ANCHORS);
  const employmentValue = band(survey.monthsOnJob, EMPLOYMENT_ANCHORS);
  const ptiValue = band(pti, PTI_ANCHORS);
  const termValue = band(term, TERM_ANCHORS);
  const downValue = downPct < 0 ? 4 : band(Math.max(0, downPct), DOWN_ANCHORS);
  const vtiValue = band(vehicleToIncome, VTI_ANCHORS);

  const WEIGHTS = {
    credit: 0.24,
    employment: 0.18,
    pti: 0.22,
    term: 0.12,
    down: 0.13,
    vti: 0.11,
  };

  const factors: DealFactor[] = [
    {
      key: "credit",
      label: "Credit profile",
      weight: WEIGHTS.credit,
      value: creditValue,
      status: statusLabel(creditValue),
    },
    {
      key: "pti",
      label: "Payment-to-income",
      weight: WEIGHTS.pti,
      value: ptiValue,
      status: statusLabel(ptiValue),
    },
    {
      key: "employment",
      label: "Employment stability",
      weight: WEIGHTS.employment,
      value: employmentValue,
      status: statusLabel(employmentValue),
    },
    {
      key: "down",
      label: "Down payment / LTV",
      weight: WEIGHTS.down,
      value: downValue,
      status: statusLabel(downValue),
    },
    {
      key: "term",
      label: "Loan term",
      weight: WEIGHTS.term,
      value: termValue,
      status: statusLabel(termValue),
    },
    {
      key: "vti",
      label: "Vehicle-to-income",
      weight: WEIGHTS.vti,
      value: vtiValue,
      status: statusLabel(vtiValue),
    },
  ];

  const score =
    creditValue * WEIGHTS.credit +
    employmentValue * WEIGHTS.employment +
    ptiValue * WEIGHTS.pti +
    termValue * WEIGHTS.term +
    downValue * WEIGHTS.down +
    vtiValue * WEIGHTS.vti;

  const rounded = Math.round(score);
  const tier = tierFromScore(score);

  const metrics: DealMetrics = {
    amountFinanced,
    monthlyPayment,
    pti,
    ltv,
    downPct,
    vehicleToIncome,
    term,
    apr,
  };

  return {
    score: rounded,
    tier,
    factors,
    metrics,
    recommendation: RECOMMENDATIONS[tier.key],
  };
}

export function dealLabel(s: DealSurvey): string {
  const veh = [String(s.vehicleYear || ""), s.vehicleMake, s.vehicleModel]
    .filter(Boolean)
    .join(" ")
    .trim();
  const who = s.applicantName?.trim();
  if (who && veh) return `${who} — ${veh}`;
  if (veh) return veh;
  if (who) return who;
  return "Untitled deal";
}
