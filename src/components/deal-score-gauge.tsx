import { cn } from "@/lib/utils";
import type { Tier } from "@/lib/deal-scoring";

export function scoreColorClass(value: number): string {
  if (value >= 80) return "text-emerald-4";
  if (value >= 70) return "text-emerald-7";
  if (value >= 55) return "text-amber-6";
  if (value >= 40) return "text-orange-6";
  return "text-red-6";
}

export function tierTokenClass(tier: Tier["key"]): string {
  switch (tier) {
    case "a":
      return "text-emerald-4 bg-emerald-3";
    case "b":
      return "text-emerald-7 bg-emerald-2";
    case "c":
      return "text-amber-7 bg-amber-2";
    case "d":
      return "text-orange-8 bg-orange-3";
    default:
      return "text-red-7 bg-red-3";
  }
}

export function trackColorClass(value: number): string {
  if (value >= 80) return "var(--score-good)";
  if (value >= 55) return "var(--score-warn)";
  return "var(--score-bad)";
}

interface ScoreGaugeProps {
  value: number;
  tier: Tier;
  className?: string;
}

/**
 * Semicircular gauge (0–100) rendered as an SVG arc with a needle.
 * Color follows the score band; the large readout uses the display font.
 */
export function ScoreGauge({ value, tier, className }: ScoreGaugeProps) {
  const v = Math.max(0, Math.min(100, value));
  const size = 260;
  const cx = size / 2;
  const cy = size * 0.78;
  const radius = size * 0.42;

  const startAngle = 180;
  const endAngle = 0;
  const angle = startAngle - (v / 100) * (startAngle - endAngle);
  const rad = (a: number) => (a * Math.PI) / 180;

  const arc = (from: number, to: number) => {
    const x1 = cx + radius * Math.cos(rad(from));
    const y1 = cy + radius * Math.sin(rad(from));
    const x2 = cx + radius * Math.cos(rad(to));
    const y2 = cy + radius * Math.sin(rad(to));
    const large = Math.abs(from - to) > 180 ? 1 : 0;
    return `M ${x1} ${y1} A ${radius} ${radius} ${large} 1 ${x2} ${y2}`;
  };

  const needleX = cx + (radius - 8) * Math.cos(rad(angle));
  const needleY = cy + (radius - 8) * Math.sin(rad(angle));
  const fill = trackColorClass(v);

  return (
    <div className={cn("relative flex flex-col items-center", className)}>
      <svg viewBox={`0 0 ${size} ${size * 0.82}`} className="w-full max-w-[260px]">
        <path
          d={arc(startAngle, endAngle)}
          stroke="var(--score-track)"
          strokeWidth={14}
          fill="none"
          strokeLinecap="round"
        />
        <path
          d={arc(startAngle, angle)}
          stroke={fill}
          strokeWidth={14}
          fill="none"
          strokeLinecap="round"
        />
        <line
          x1={cx}
          y1={cy}
          x2={needleX}
          y2={needleY}
          stroke={fill}
          strokeWidth={3}
          strokeLinecap="round"
        />
        <circle cx={cx} cy={cy} r={7} fill={fill} />
        <circle cx={cx} cy={cy} r={3} fill="var(--background)" />
        {/* band ticks */}
        {[80, 55, 40].map((t) => {
          const ta = startAngle - (t / 100) * (startAngle - endAngle);
          const ix = cx + (radius + 9) * Math.cos(rad(ta));
          const iy = cy + (radius + 9) * Math.sin(rad(ta));
          return <circle key={t} cx={ix} cy={iy} r={1.6} fill="var(--muted-foreground)" />;
        })}
      </svg>

      <div className="pointer-events-none -mt-[140px] flex flex-col items-center">
        <div
          className={cn(
            "font-display text-7xl font-extrabold leading-none tabular-nums",
            scoreColorClass(v),
          )}
          style={{ fontVariantNumeric: "tabular-nums" }}
        >
          {v}
        </div>
        <div className="mt-1 text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
          DEAL SCORE
        </div>
      </div>

      <div
        className={cn(
          "mt-4 inline-flex items-center gap-2 rounded-md px-3 py-1.5 text-sm font-semibold",
          tierTokenClass(tier.key),
        )}
      >
        <span className="font-display text-lg leading-none">{tier.letter}</span>
        <span>· {tier.label}</span>
      </div>
    </div>
  );
}

interface FactorBarProps {
  label: string;
  weight: number;
  value: number;
  status: string;
}

export function FactorBar({ label, weight, value, status }: FactorBarProps) {
  const v = Math.max(0, Math.min(100, value));
  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-baseline justify-between gap-2">
        <span className="text-sm font-medium text-foreground">{label}</span>
        <span className={cn("text-xs font-semibold", scoreColorClass(v))}>{status}</span>
      </div>
      <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
        <div
          className="h-full rounded-full transition-all"
          style={{ width: `${v}%`, background: trackColorClass(v) }}
        />
      </div>
      <div className="flex items-center justify-between text-[11px] text-muted-foreground">
        <span>{Math.round(weight * 100)}% weight</span>
        <span className="tabular-nums font-medium text-foreground">{v}/100</span>
      </div>
    </div>
  );
}
