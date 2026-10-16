import { createFileRoute } from "@tanstack/react-router";
import { Sidebar } from "@/components/deal-score-sidebar";
import { DeskCanvas } from "@/components/desk-canvas";

export const Route = createFileRoute("/deal/$dealId")({
  head: () => ({
    meta: [
      { title: "Deal review — DEAL SCORE" },
      {
        name: "description",
        content:
          "Underwriting review of a saved auto-loan deal with live DEAL SCORE and risk factor breakdown.",
      },
      { property: "og:title", content: "Deal review — DEAL SCORE" },
      {
        property: "og:description",
        content:
          "Underwriting review of a saved auto-loan deal with live DEAL SCORE and risk factor breakdown.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: DealReview,
});

function DealReview() {
  const { dealId } = Route.useParams();
  return (
    <div className="grid min-h-screen grid-cols-1 bg-background text-foreground lg:grid-cols-[280px_1fr]">
      <div className="hidden lg:block">
        <div className="sticky top-0 h-screen">
          <Sidebar />
        </div>
      </div>
      <DeskCanvas dealId={dealId} />
    </div>
  );
}
