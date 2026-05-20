import { FadeInSection } from "@/components/fade-in-section";
import { experience, education } from "@content/experience";

function formatRange(start: string, end: string) {
  return `${start} → ${end}`;
}

export function Experience() {
  return (
    <FadeInSection id="experience" className="mx-auto max-w-3xl px-6 py-24">
      <p className="mb-3 font-mono text-xs uppercase tracking-[0.18em] text-muted-foreground">
        Experience
      </p>
      <h2 className="font-mono text-2xl font-medium tracking-tight md:text-3xl">
        Where I've worked.
      </h2>
      <ol className="mt-10 space-y-10 border-l border-border pl-6">
        {experience.map((e, idx) => (
          <li key={`${e.company}-${idx}`} className="relative">
            <span
              className="absolute -left-[29px] top-2 size-2 rounded-full bg-accent"
              aria-hidden
            />
            <p className="font-mono text-xs uppercase tracking-[0.18em] text-muted-foreground">
              {formatRange(e.start, e.end)}
            </p>
            <p className="mt-1 text-base font-medium text-foreground">
              {e.role} · <span className="text-muted-foreground">{e.company}</span>
            </p>
            <ul className="mt-3 list-inside list-disc space-y-1 text-sm text-muted-foreground">
              {e.bullets.map((b, i) => <li key={i}>{b}</li>)}
            </ul>
          </li>
        ))}

        {education.map((ed) => (
          <li key={ed.school} className="relative">
            <span
              className="absolute -left-[29px] top-2 size-2 rounded-full border border-border bg-background"
              aria-hidden
            />
            <p className="font-mono text-xs uppercase tracking-[0.18em] text-muted-foreground">
              {formatRange(ed.start, ed.end)} · Education
            </p>
            <p className="mt-1 text-base font-medium text-foreground">
              {ed.degree} · <span className="text-muted-foreground">{ed.school}</span>
            </p>
            {ed.detail && (
              <p className="mt-2 text-sm text-muted-foreground">{ed.detail}</p>
            )}
          </li>
        ))}
      </ol>
    </FadeInSection>
  );
}
