import { describe, it, expect } from "vitest";
import { contactSchema } from "@/lib/contact-schema";

describe("contactSchema", () => {
  const valid = { name: "Ada Lovelace", email: "ada@example.com", message: "Hello, this is a long enough message.", website: "" };

  it("accepts a valid submission", () => {
    expect(contactSchema.safeParse(valid).success).toBe(true);
  });

  it("rejects missing name", () => {
    const result = contactSchema.safeParse({ ...valid, name: "" });
    expect(result.success).toBe(false);
  });

  it("rejects an invalid email", () => {
    const result = contactSchema.safeParse({ ...valid, email: "not-an-email" });
    expect(result.success).toBe(false);
  });

  it("rejects a too-short message", () => {
    const result = contactSchema.safeParse({ ...valid, message: "hi" });
    expect(result.success).toBe(false);
  });

  it("rejects a too-long message", () => {
    const result = contactSchema.safeParse({ ...valid, message: "a".repeat(5001) });
    expect(result.success).toBe(false);
  });

  it("rejects a filled honeypot (bot signal)", () => {
    const result = contactSchema.safeParse({ ...valid, website: "https://spam.example" });
    expect(result.success).toBe(false);
  });

  it("treats undefined honeypot as empty", () => {
    const withoutHoneypot = { name: valid.name, email: valid.email, message: valid.message };
    const result = contactSchema.safeParse(withoutHoneypot);
    expect(result.success).toBe(true);
  });
});
