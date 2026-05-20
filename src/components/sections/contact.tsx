import { FadeInSection } from "@/components/fade-in-section";
import { ContactForm } from "@/components/contact-form";
import { site } from "@content/site";

export function Contact() {
  return (
    <FadeInSection id="contact" className="mx-auto max-w-3xl px-6 py-24">
      <p className="mb-3 font-mono text-xs uppercase tracking-[0.18em] text-muted-foreground">
        Contact
      </p>
      <h2 className="font-mono text-2xl font-medium tracking-tight md:text-3xl">
        Let&apos;s talk.
      </h2>
      <p className="mt-4 text-base text-muted-foreground">
        Open to new-grad full-time roles. The fastest way to reach me is{" "}
        <a className="text-accent underline-offset-4 hover:underline" href={`mailto:${site.email}`}>
          {site.email}
        </a>{" "}
        — or use the form below.
      </p>

      <div className="mt-6 flex flex-wrap items-center gap-4 text-sm">
        {site.socials.map((s) => (
          <a
            key={s.href}
            href={s.href}
            className="text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
          >
            {s.label}
          </a>
        ))}
        <a
          href={site.resumeHref}
          className="ml-auto inline-flex h-9 items-center rounded-full bg-accent px-4 text-xs font-medium text-accent-foreground transition-opacity hover:opacity-90"
        >
          Download résumé
        </a>
      </div>

      <ContactForm />
    </FadeInSection>
  );
}
