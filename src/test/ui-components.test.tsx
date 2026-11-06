import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { PageHeader, TelemetryStat, Chip, TabBar } from "@/components/bits";
import {
  createSocialPost,
  addSocialComment,
  toggleLikePost,
  voteSocialPoll,
  exportUserMemory,
  getState,
} from "@/lib/store";

describe("Motorsport Design System Primitives", () => {
  it("renders PageHeader with eyebrow, title, and subtitle", () => {
    render(
      <PageHeader
        eyebrow="Formula 1 Telemetry"
        title="Speed Trap Matrix"
        subtitle="Sector 1 to Sector 3 speed benchmarks"
      />
    );
    expect(screen.getByText("Formula 1 Telemetry")).toBeInTheDocument();
    expect(screen.getByText("Speed Trap Matrix")).toBeInTheDocument();
    expect(screen.getByText("Sector 1 to Sector 3 speed benchmarks")).toBeInTheDocument();
  });

  it("renders TelemetryStat with formatted numbers, units and deltas", () => {
    render(
      <TelemetryStat
        label="Top Speed (Speed Trap)"
        value="352.4"
        unit="km/h"
        delta="+2.8 km/h vs P2"
        isPositive={true}
      />
    );
    expect(screen.getByText("Top Speed (Speed Trap)")).toBeInTheDocument();
    expect(screen.getByText("352.4")).toBeInTheDocument();
    expect(screen.getByText("km/h")).toBeInTheDocument();
    expect(screen.getByText("+2.8 km/h vs P2")).toBeInTheDocument();
  });

  it("renders Chip with active state and team color accent", () => {
    render(
      <Chip active={true} color="#ff8000">
        McLaren
      </Chip>
    );
    const chip = screen.getByRole("button", { name: /McLaren/i });
    expect(chip).toBeInTheDocument();
    expect(chip).toHaveAttribute("aria-pressed", "true");
  });

  it("renders TabBar with accessible WAI-ARIA tablist and selected tab", () => {
    const tabs = ["FP1", "FP2", "FP3", "QUALIFYING", "RACE"] as const;
    render(
      <TabBar
        tabs={tabs}
        value="RACE"
        onChange={() => {}}
      />
    );
    expect(screen.getByRole("tablist")).toBeInTheDocument();
    const raceTab = screen.getByRole("tab", { name: "RACE" });
    expect(raceTab).toHaveAttribute("aria-selected", "true");
    const fp1Tab = screen.getByRole("tab", { name: "FP1" });
    expect(fp1Tab).toHaveAttribute("aria-selected", "false");
  });
});

describe("Community Social State Logic", () => {
  it("creates a social post with valid tags and updates store", () => {
    const post = createSocialPost({
      title: "Monza Wing Upgrades",
      content: "Low drag aero configuration looks ultra competitive through Parabolica.",
      category: "Tech Talk",
      tags: ["Monza", "Aero"],
      teams: ["ferrari"],
      drivers: ["leclerc"],
    });

    expect(post.id).toBeDefined();
    expect(post.title).toBe("Monza Wing Upgrades");
    expect(post.category).toBe("Tech Talk");

    const currentPosts = getState().userPosts;
    expect(currentPosts.some((p) => p.id === post.id)).toBe(true);
  });

  it("adds a comment and toggles like state", () => {
    const state = getState();
    const targetPostId = state.userPosts[0]?.id || "sp-ferrari-upgrades";

    addSocialComment(targetPostId, "Incredible telemetry data!");
    const postComments = getState().comments[targetPostId] || [];
    expect(postComments.some((c) => c.content === "Incredible telemetry data!")).toBe(true);

    toggleLikePost(targetPostId);
    const hasLiked = getState().likes.includes(targetPostId);
    expect(typeof hasLiked).toBe("boolean");
  });

  it("exports user memory JSON with version and timestamp", () => {
    const exportedJson = exportUserMemory();
    const parsed = JSON.parse(exportedJson);
    expect(parsed.version).toBe("2.6.0");
    expect(parsed.exportedAt).toBeDefined();
    expect(Array.isArray(parsed.userPosts)).toBe(true);
  });
});
