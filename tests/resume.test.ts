import { describe, it, expect } from "vitest";
import * as resume from "@content/resume";

function collectStrings(value: unknown, acc: string[] = []): string[] {
  if (typeof value === "string") acc.push(value);
  else if (Array.isArray(value)) value.forEach((v) => collectStrings(v, acc));
  else if (value && typeof value === "object")
    Object.values(value).forEach((v) => collectStrings(v, acc));
  return acc;
}

const allText = collectStrings(resume).join("\n");

describe("resume content", () => {
  it("contains no em dashes", () => {
    expect(allText).not.toContain("—");
  });

  it("includes the mandatory Danish DU3 line", () => {
    expect(allText).toMatch(/DU3/);
  });

  it("includes an AI/LLM reference", () => {
    expect(allText).toMatch(/Claude Code|Copilot|LLM/);
  });

  it("does not leak private contact details", () => {
    for (const pii of ["50 21 00 57", "03/03/2003", "Bødkervej", "24 20 47 88"]) {
      expect(allText).not.toContain(pii);
    }
  });

  it("links Consentinel and not Niteshift", () => {
    const consentinel = resume.resumeProjects.find((p) => p.name === "Consentinel");
    const niteshift = resume.resumeProjects.find((p) => p.name === "Niteshift");
    expect(consentinel?.link?.href).toContain("github.com/Reblayzer/consentinel");
    expect(niteshift?.link).toBeUndefined();
  });
});
