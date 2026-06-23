import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

type Props = {
  slug: string;
  title: string;
  summary: string;
  stack: readonly string[];
  cover?: string;
};

export function FlagshipProjectCard({ slug, title, summary, stack, cover }: Props) {
  return (
    <Link
      href={`/projects/${slug}`}
      className="group block overflow-hidden rounded-xl border border-border bg-foreground/[0.01] transition-all hover:-translate-y-0.5 hover:border-foreground/20"
    >
      {cover && (
        <div className="relative aspect-[16/9] overflow-hidden border-b border-border bg-foreground/[0.03]">
          <Image
            src={cover}
            alt=""
            fill
            sizes="(min-width: 768px) 720px, 100vw"
            quality={100}
            className="object-cover transition-transform duration-500 group-hover:scale-[1.02]"
          />
        </div>
      )}
      <div className="p-6">
        <div className="flex items-start justify-between gap-4">
          <h3 className="text-xl font-medium text-foreground">{title}</h3>
          <ArrowUpRight className="size-5 shrink-0 text-muted-foreground transition-colors group-hover:text-accent" />
        </div>
        <p className="mt-2 text-sm text-muted-foreground">{summary}</p>
        <p className="mt-4 font-mono text-xs uppercase tracking-[0.18em] text-muted-foreground">
          Read case study →
        </p>
        <ul className="mt-4 flex flex-wrap gap-1.5">
          {stack.map((t) => (
            <li
              key={t}
              className="rounded border border-border px-1.5 py-0.5 font-mono text-[10px] uppercase tracking-wider text-muted-foreground"
            >
              {t}
            </li>
          ))}
        </ul>
      </div>
    </Link>
  );
}
