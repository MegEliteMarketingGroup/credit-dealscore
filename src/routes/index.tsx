import { createFileRoute } from "@tanstack/react-router";
import { Sidebar } from "@/components/deal-score-sidebar";
import { DeskCanvas } from "@/components/desk-canvas";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "DEAL SCORE — Underwriting desk" },
      {
        name: "description",
        content:
          "Score auto-loan deals by applicant, vehicle and loan structure. Internal underwriting desk with live DEAL SCORE and risk factor breakdown.",
      },
      { property: "og:title", content: "DEAL SCORE — Underwriting desk" },
      {
        property: "og:description",
        content:
          "Score auto-loan deals by applicant, vehicle and loan structure. Live DEAL SCORE and risk factor breakdown.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

function Index() {
  return (
    <div className="grid min-h-screen grid-cols-1 bg-background text-foreground lg:grid-cols-[280px_1fr]">
      <div className="hidden lg:block">
        <div className="sticky top-0 h-screen">
          <Sidebar />
        </div>
      </div>
      <DeskCanvas />
    </div>
  );
}
