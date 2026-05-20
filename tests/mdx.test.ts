import { describe, it, expect } from "vitest";
import { getFlagshipBySlug, listFlagships } from "@/lib/mdx";

describe("mdx loader", () => {
  it("lists at least one flagship project", async () => {
    const items = await listFlagships();
    expect(items.length).toBeGreaterThanOrEqual(1);
    expect(items[0]).toMatchObject({
      slug: expect.any(String),
      title: expect.any(String),
    });
  });

  it("loads the portfolio-site flagship by slug with frontmatter and content", async () => {
    const project = await getFlagshipBySlug("portfolio-site");
    expect(project).not.toBeNull();
    expect(project!.title).toBe("Portfolio Site");
    expect(project!.flagship).toBe(true);
    expect(project!.body.length).toBeGreaterThan(50);
  });

  it("returns null for unknown slug", async () => {
    expect(await getFlagshipBySlug("does-not-exist")).toBeNull();
  });
});
