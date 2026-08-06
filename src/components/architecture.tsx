import fs from "node:fs";
import path from "node:path";
import Image from "next/image";

/**
 * An architecture diagram from public/.
 *
 * A diagram that opts in is inlined into the page; everything else is loaded
 * with <img> as before.
 *
 * Inlining is what makes a diagram theme-aware. An <img> loads the file as a
 * separate document, and a separate document cannot see the `.dark` class
 * next-themes sets on <html> — so a diagram loaded that way is stuck in
 * whichever palette it was drawn with, on a page that may be the opposite one.
 * Inlined, the file's `var(--color-…)` fills resolve against the page and the
 * diagram follows the theme, manual toggle included.
 *
 * It is opt-in rather than automatic because inlining also exposes the SVG to
 * the page's own inherited styles. Mermaid output is the case that matters:
 * it measures label text at generation time and sizes each box to fit, so
 * inheriting a different font-family from the page overflows every one of
 * those boxes and clips the labels. Diagrams built by the scripts in this repo
 * set their own fonts and carry the opt-in marker; generated ones do not, and
 * keep rendering exactly as they always have.
 */
export function Architecture({ src, caption }: { src: string; caption?: string }) {
  const inlined = readSvg(src);

  return (
    <figure className="my-8">
      <div className="border-border bg-foreground/[0.02] overflow-x-auto rounded-xl border p-4">
        {inlined ? (
          <div
            className="[&>svg]:h-auto [&>svg]:w-full"
            // Build-time read of a file we author and ship ourselves; there is
            // no user input anywhere on this path.
            dangerouslySetInnerHTML={{ __html: inlined }}
          />
        ) : (
          <Image
            src={src}
            alt={caption ?? "Architecture diagram"}
            width={1200}
            height={500}
            className="h-auto w-full"
            unoptimized
          />
        )}
      </div>
      {caption && (
        <figcaption className="text-muted-foreground mt-2 text-center text-xs">
          {caption}
        </figcaption>
      )}
    </figure>
  );
}

/**
 * Returns the file's markup if it opts into inlining, else null to use <img>.
 * Null is also the answer for a file that cannot be read — a diagram that has
 * moved should not take the whole page down with it.
 *
 * `width`/`height` are dropped so the SVG scales to its container; the viewBox
 * carries the aspect ratio.
 */
function readSvg(src: string): string | null {
  if (!src.startsWith("/") || !src.endsWith(".svg")) return null;

  const publicDir = path.join(process.cwd(), "public");
  const file = path.join(publicDir, src.slice(1));
  if (!file.startsWith(publicDir)) return null;

  let markup: string;
  try {
    markup = fs.readFileSync(file, "utf8");
  } catch {
    return null;
  }

  if (!markup.includes('data-inline="true"')) return null;

  return markup.replace(
    /<svg([^>]*)>/,
    (_tag, attrs: string) => `<svg${attrs.replace(/\s(width|height)="[^"]*"/g, "")}>`,
  );
}
