import Link from "next/link";
import { FadeInSection } from "@/components/fade-in-section";
import { skillGroups } from "@content/skills";
import { getAllProjects } from "@/lib/projects.server";
import { normalizeTag } from "@/lib/projects";

export async function Skills() {
  const projects = await getAllProjects();
  const tagSet = new Set(projects.flatMap((p) => p.tags.map(normalizeTag)));

  return (
    <FadeInSection id="skills" className="mx-auto max-w-3xl px-6 py-24">
      <p className="mb-3 font-mono text-xs uppercase tracking-[0.18em] text-muted-foreground">
        Skills
      </p>
      <h2 className="font-mono text-2xl font-medium tracking-tight md:text-3xl">
        The stack I reach for.
      </h2>
      <dl className="mt-8 grid gap-x-10 gap-y-8 sm:grid-cols-2">
        {skillGroups.map((group) => (
          <div key={group.title}>
            <dt className="mb-3 font-mono text-xs uppercase tracking-[0.18em] text-muted-foreground">
              {group.title}
            </dt>
            <dd>
              <ul className="flex flex-wrap gap-1.5">
                {group.items.map((item) => {
                  const linkable = tagSet.has(normalizeTag(item));
                  const className =
                    "rounded-md border border-border bg-foreground/[0.02] px-2.5 py-1 font-mono text-xs text-foreground";
                  return (
                    <li key={item}>
                      {linkable ? (
                        <Link href={`/projects?tag=${encodeURIComponent(item)}`} className={`${className} transition-colors hover:border-foreground/30`}>
                          {item}
                        </Link>
                      ) : (
                        <span className={className}>{item}</span>
                      )}
                    </li>
                  );
                })}
              </ul>
            </dd>
          </div>
        ))}
      </dl>
    </FadeInSection>
  );
}
