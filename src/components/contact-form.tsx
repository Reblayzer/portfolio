"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { contactSchema, type ContactInput } from "@/lib/contact-schema";

type Status = "idle" | "submitting" | "success" | "error";

export function ContactForm() {
  const [status, setStatus] = useState<Status>("idle");
  const [serverMessage, setServerMessage] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<ContactInput>({
    resolver: zodResolver(contactSchema),
    defaultValues: { name: "", email: "", message: "", website: "" },
  });

  const onSubmit = handleSubmit(async (values) => {
    setStatus("submitting");
    setServerMessage(null);
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) {
        setStatus("error");
        setServerMessage(body?.error ?? "Something went wrong. Please try again.");
        return;
      }
      setStatus("success");
      setServerMessage("Thanks — your message is on its way.");
      reset();
    } catch {
      setStatus("error");
      setServerMessage("Network error. Please try again.");
    }
  });

  return (
    <form onSubmit={onSubmit} noValidate className="mt-8 grid gap-4" aria-describedby="contact-status">
      {/* Honeypot — visually hidden from humans, ignored by them */}
      <div aria-hidden className="absolute -left-[10000px] h-0 w-0 overflow-hidden">
        <label htmlFor="website">Website</label>
        <input id="website" type="text" tabIndex={-1} autoComplete="off" {...register("website")} />
      </div>

      <div className="grid gap-2">
        <Label htmlFor="name">Name</Label>
        <Input id="name" autoComplete="name" {...register("name")} aria-invalid={!!errors.name} />
        {errors.name && <p className="text-xs text-red-500">{errors.name.message}</p>}
      </div>

      <div className="grid gap-2">
        <Label htmlFor="email">Email</Label>
        <Input id="email" type="email" autoComplete="email" {...register("email")} aria-invalid={!!errors.email} />
        {errors.email && <p className="text-xs text-red-500">{errors.email.message}</p>}
      </div>

      <div className="grid gap-2">
        <Label htmlFor="message">Message</Label>
        <Textarea id="message" rows={5} {...register("message")} aria-invalid={!!errors.message} />
        {errors.message && <p className="text-xs text-red-500">{errors.message.message}</p>}
      </div>

      <div className="flex items-center gap-4">
        <Button type="submit" disabled={status === "submitting"} className="bg-accent text-accent-foreground hover:opacity-90">
          {status === "submitting" ? "Sending…" : "Send message"}
        </Button>
        <p
          id="contact-status"
          role="status"
          className={`text-xs ${status === "error" ? "text-red-500" : "text-muted-foreground"}`}
        >
          {serverMessage}
        </p>
      </div>
    </form>
  );
}
