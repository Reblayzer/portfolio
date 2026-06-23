import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { MDXRemote } from "next-mdx-remote/rsc";
import remarkGfm from "remark-gfm";
import rehypePrettyCode from "rehype-pretty-code";
import { getFlagshipBySlug, listFlagships } from "@/lib/mdx";
import { Nav } from "@/components/nav";
import { Footer } from "@/components/footer";
import { mdxComponents } from "@/components/mdx-components";
import { buildMetadata } from "@/lib/site-metadata";

export const dynamicParams = false;

export async function generateStaticParams() {
  const items = await listFlagships();
  return items.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const project = await getFlagshipBySlug(slug);
  if (!project) return {};
  return buildMetadata({
    title: project.title,
    description: project.summary,
    path: `/projects/${project.slug}`,
  });
}

export default async function CaseStudyPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const project = await getFlagshipBySlug(slug);
  if (!project) notFound();

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Article",
            headline: project.title,
            description: project.summary,
            datePublished: `${project.year}-01-01`,
            author: { "@type": "Person", name: "Alexandro Bolfa" },
          }),
        }}
      />
      <Nav />
      <main className="mx-auto max-w-3xl px-6 py-16">
        <Link
          href="/#work"
          className="mb-10 inline-block font-mono text-xs uppercase tracking-[0.18em] text-muted-foreground transition-colors hover:text-foreground"
        >
          ← Back to work
        </Link>
        <p className="font-mono text-xs uppercase tracking-[0.18em] text-muted-foreground">
          {project.role} · {project.year}
        </p>
        <h1 className="mt-2 font-mono text-4xl font-medium tracking-[-0.03em] md:text-5xl">
          {project.title}
        </h1>
        <p className="mt-4 text-lg text-muted-foreground">{project.summary}</p>

        {project.impact && (
          <p className="mt-4 max-w-2xl text-base text-foreground">{project.impact}</p>
        )}

        <ul className="mt-6 flex flex-wrap gap-1.5">
          {project.stack.map((t) => (
            <li
              key={t}
              className="rounded border border-border px-1.5 py-0.5 font-mono text-[10px] uppercase tracking-wider text-muted-foreground"
            >
              {t}
            </li>
          ))}
        </ul>

        <div className="mt-6 flex flex-wrap gap-3 text-sm">
          {project.links.live && (
            <a className="text-accent underline-offset-4 hover:underline" href={project.links.live}>
              Live site ↗
            </a>
          )}
          {project.links.repo && (
            <a className="text-accent underline-offset-4 hover:underline" href={project.links.repo}>
              Source ↗
            </a>
          )}
        </div>

        {project.cover && (
          <div className="relative mt-10 aspect-[16/9] overflow-hidden rounded-xl border border-border bg-foreground/[0.03]">
            <Image
              src={project.cover}
              alt={`Cover image for ${project.title}`}
              fill
              sizes="(min-width: 768px) 720px, 100vw"
              quality={100}
              priority
              className="object-cover"
            />
          </div>
        )}

        <article className="mt-10">
          <MDXRemote
            source={project.body}
            components={mdxComponents}
            options={{
              mdxOptions: {
                remarkPlugins: [remarkGfm],
                rehypePlugins: [[rehypePrettyCode, { theme: "github-dark" }]],
              },
            }}
          />
        </article>
      </main>
      <Footer />
    </>
  );
}
