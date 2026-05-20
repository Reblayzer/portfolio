import { site } from "@content/site";

const sourceRepo = "https://github.com/alexandro-bolfa/portfolio";

export function Footer() {
  return (
    <footer className="mt-32 border-t border-border">
      <div className="mx-auto flex max-w-5xl flex-col items-start justify-between gap-4 px-6 py-10 text-xs text-muted-foreground md:flex-row md:items-center">
        <p>© {new Date().getFullYear()} {site.name}. All rights reserved.</p>
        <p className="font-mono">
          Built with Next.js + Tailwind ·{" "}
          <a className="underline-offset-4 hover:text-foreground hover:underline" href={sourceRepo}>
            source
          </a>
        </p>
      </div>
    </footer>
  );
}
