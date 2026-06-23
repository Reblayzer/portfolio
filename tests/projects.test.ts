import { describe, it, expect } from "vitest";
import {
  filterProjects,
  techTagOptions,
  CATEGORY_LABELS,
  type Project,
} from "@/lib/projects";
import { getAllProjects, getFeaturedProjects } from "@/lib/projects.server";

const sample: Project[] = [
  { title: "Alpha", summary: "Kafka streaming pipeline", category: "data-eng", tags: ["Kafka", "Python"], status: "shipped", year: 2026, links: {} },
  { title: "Bravo", summary: "React storefront", category: "frontend", tags: ["React", "TypeScript"], status: "in-progress", links: {} },
  { title: "Charlie", summary: "Kafka gateway", category: "backend", tags: ["Kafka", ".NET 8"], status: "in-progress", links: {} },
];

describe("filterProjects", () => {
  it("returns all when no filters", () => {
    expect(filterProjects(sample, {})).toHaveLength(3);
  });
  it("filters by category", () => {
    const r = filterProjects(sample, { category: "frontend" });
    expect(r.map((p) => p.title)).toEqual(["Bravo"]);
  });
  it("filters by tag with OR semantics", () => {
    const r = filterProjects(sample, { tags: ["kafka"] });
    expect(r.map((p) => p.title).sort()).toEqual(["Alpha", "Charlie"]);
  });
  it("matches search across title, summary, category label, and tags", () => {
    expect(filterProjects(sample, { q: "storefront" }).map((p) => p.title)).toEqual(["Bravo"]);
    expect(filterProjects(sample, { q: "data engineering" }).map((p) => p.title)).toEqual(["Alpha"]);
    expect(filterProjects(sample, { q: "typescript" }).map((p) => p.title)).toEqual(["Bravo"]);
  });
  it("combines filters", () => {
    expect(filterProjects(sample, { category: "backend", tags: ["kafka"], q: "gateway" }).map((p) => p.title)).toEqual(["Charlie"]);
  });
  it("returns empty when nothing matches", () => {
    expect(filterProjects(sample, { q: "nope" })).toHaveLength(0);
  });
});

describe("techTagOptions", () => {
  it("returns only tags used by 2 or more projects", () => {
    expect(techTagOptions(sample)).toEqual(["Kafka"]);
  });
});

describe("getAllProjects (real data)", () => {
  it("merges flagships and cards with valid taxonomy", async () => {
    const all = await getAllProjects();
    expect(all.length).toBeGreaterThan(30);
    for (const p of all) {
      expect(CATEGORY_LABELS[p.category]).toBeTruthy();
      expect(["shipped", "in-progress"]).toContain(p.status);
      expect(p.tags.length).toBeGreaterThan(0);
    }
  });
  it("shipped projects sort before in-progress", async () => {
    const all = await getAllProjects();
    const firstWip = all.findIndex((p) => p.status === "in-progress");
    const lastShipped = all.map((p) => p.status).lastIndexOf("shipped");
    expect(lastShipped).toBeLessThan(firstWip);
  });
});

describe("getFeaturedProjects", () => {
  it("returns only featured flagships", async () => {
    const featured = await getFeaturedProjects();
    expect(featured.length).toBeGreaterThan(0);
    expect(featured.every((p) => p.featured && p.status === "shipped")).toBe(true);
  });
});
