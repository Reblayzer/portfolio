import type { MDXComponents } from "mdx/types";
import { Architecture } from "@/components/architecture";

export const mdxComponents: MDXComponents = {
  Architecture,
  h2: ({ children }) => (
    <h2 className="mt-12 font-mono text-2xl font-medium tracking-tight text-foreground">
      {children}
    </h2>
  ),
  h3: ({ children }) => (
    <h3 className="mt-8 text-lg font-medium text-foreground">{children}</h3>
  ),
  p: ({ children }) => (
    <p className="mt-4 text-base leading-relaxed text-muted-foreground">{children}</p>
  ),
  ul: ({ children }) => (
    <ul className="mt-4 list-inside list-disc space-y-2 text-muted-foreground">{children}</ul>
  ),
  a: ({ href, children }) => (
    <a href={href} className="text-accent underline-offset-4 hover:underline">
      {children}
    </a>
  ),
  code: ({ children }) => (
    <code className="rounded bg-foreground/[0.06] px-1 py-0.5 font-mono text-[0.9em]">
      {children}
    </code>
  ),
};
