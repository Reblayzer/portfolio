import Link from "next/link";
import Image from "next/image";
import { ThemeToggle } from "@/components/theme-toggle";
import { site } from "@content/site";

const links = [
  { href: "#about", label: "About" },
  { href: "#skills", label: "Skills" },
  { href: "#experience", label: "Experience" },
  { href: "#work", label: "Work" },
  { href: "#contact", label: "Contact" },
];

export function Nav() {
  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/80 backdrop-blur-md">
      <nav
        aria-label="Primary"
        className="mx-auto flex h-16 max-w-5xl items-center justify-between px-6"
      >
        <Link
          href="/"
          className="inline-flex items-center"
          aria-label={`${site.name}, home`}
        >
          <Image
            src="/ab-logo.svg"
            alt={site.name}
            width={36}
            height={36}
            priority
            unoptimized
            className="h-9 w-9"
          />
        </Link>
        <ul className="hidden items-center gap-8 text-sm md:flex">
          {links.map((l) => (
            <li key={l.href}>
              <Link
                href={l.href}
                className="text-muted-foreground transition-colors hover:text-foreground"
              >
                {l.label}
              </Link>
            </li>
          ))}
        </ul>
        <div className="flex items-center gap-2">
          <ThemeToggle />
        </div>
      </nav>
    </header>
  );
}
