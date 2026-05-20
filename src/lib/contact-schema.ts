import { z } from "zod";

export const contactSchema = z.object({
  name: z.string().trim().min(1, "Please enter your name.").max(100),
  email: z.string().trim().email("Please enter a valid email address.").max(200),
  message: z
    .string()
    .trim()
    .min(10, "Message should be at least 10 characters.")
    .max(5000, "Message is too long."),
  // Honeypot — humans see/fill nothing; bots autofill anything.
  website: z.string().max(0, "Spam detected.").optional(),
});

export type ContactInput = z.infer<typeof contactSchema>;
