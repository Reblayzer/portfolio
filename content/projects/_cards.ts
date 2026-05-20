export type ProjectCard = {
  title: string;
  summary: string;
  stack: string[];
  links: { repo?: string; live?: string };
  cover?: string;
};

export const projectCards: ProjectCard[] = [
  {
    title: "Example Project",
    summary: "Replace with a real one-liner about what this project does.",
    stack: ["Next.js", "TypeScript"],
    links: { repo: "https://github.com/alexandro-bolfa/example", live: "https://example.com" },
  },
];
