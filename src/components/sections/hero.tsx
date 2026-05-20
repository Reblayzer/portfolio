import Link from "next/link";
import { site } from "@content/site";

export function Hero() {
  return (
    <section
      id="top"
      className="mx-auto flex min-h-[calc(100dvh-4rem)] max-w-3xl flex-col items-center justify-center px-6 text-center"
    >
      <p className="mb-6 font-mono text-xs uppercase tracking-[0.18em] text-muted-foreground">
        {site.location} · Available for new-grad roles
      </p>
      <h1 className="font-mono text-5xl font-medium tracking-[-0.04em] text-foreground md:text-6xl">
        {site.name}
      </h1>
      <p className="mt-5 max-w-xl text-base text-muted-foreground md:text-lg">{site.pitch}</p>
      <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
        <Link
          href="#work"
          className="inline-flex h-10 items-center rounded-md bg-accent px-5 text-sm font-medium text-accent-foreground transition-opacity hover:opacity-90"
        >
          See work →
        </Link>
        <Link
          href="#contact"
          className="inline-flex h-10 items-center rounded-md border border-border px-5 text-sm font-medium text-foreground transition-colors hover:bg-foreground/5"
        >
          Get in touch
        </Link>
      </div>
    </section>
  );
}
