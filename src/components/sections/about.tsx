import { FadeInSection } from "@/components/fade-in-section";
import { site } from "@content/site";

export function About() {
  return (
    <FadeInSection id="about" className="mx-auto max-w-3xl px-6 py-24">
      <p className="mb-3 font-mono text-xs uppercase tracking-[0.18em] text-muted-foreground">
        About
      </p>
      <h2 className="font-mono text-2xl font-medium tracking-tight md:text-3xl">
        What I do, briefly.
      </h2>
      <div className="mt-6 space-y-4 text-base leading-relaxed text-muted-foreground">
        {site.about.map((para, i) => (
          <p key={i}>{para}</p>
        ))}
      </div>
    </FadeInSection>
  );
}
