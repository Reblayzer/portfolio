import fs from "node:fs/promises";
import path from "node:path";
import matter from "gray-matter";
import type { ProjectCategory } from "@/lib/projects";

export type FlagshipFrontmatter = {
  title: string;
  slug: string;
  summary: string;
  stack: string[];
  role: string;
  year: number;
  links: { live?: string; repo?: string };
  cover?: string;
  flagship: true;
  category: ProjectCategory;
  featured?: boolean;
  impact?: string;
};

export type FlagshipProject = FlagshipFrontmatter & { body: string };

const CONTENT_DIR = path.join(process.cwd(), "content", "projects");

async function readAllMdxFiles(): Promise<{ file: string; raw: string }[]> {
  const entries = await fs.readdir(CONTENT_DIR);
  const mdx = entries.filter((f) => f.endsWith(".mdx"));
  return Promise.all(
    mdx.map(async (file) => ({
      file,
      raw: await fs.readFile(path.join(CONTENT_DIR, file), "utf8"),
    })),
  );
}

function parse(file: string, raw: string): FlagshipProject {
  const { data, content } = matter(raw);
  const fm = data as Partial<FlagshipFrontmatter>;
  if (!fm.title || !fm.slug) {
    throw new Error(`MDX file ${file} is missing required frontmatter (title, slug)`);
  }
  return {
    title: fm.title,
    slug: fm.slug,
    summary: fm.summary ?? "",
    stack: fm.stack ?? [],
    role: fm.role ?? "",
    year: fm.year ?? new Date().getFullYear(),
    links: fm.links ?? {},
    cover: fm.cover,
    flagship: true,
    category: (fm.category as ProjectCategory) ?? "backend",
    featured: fm.featured ?? false,
    impact: fm.impact,
    body: content,
  };
}

export async function listFlagships(): Promise<FlagshipProject[]> {
  const files = await readAllMdxFiles();
  const projects = files
    .map(({ file, raw }) => parse(file, raw))
    .filter((p) => p.flagship)
    .sort((a, b) => b.year - a.year);
  return projects;
}

export async function getFlagshipBySlug(slug: string): Promise<FlagshipProject | null> {
  const all = await listFlagships();
  return all.find((p) => p.slug === slug) ?? null;
}
