export type SkillGroup = {
  title: string;
  items: string[];
};

export const skillGroups: SkillGroup[] = [
  {
    title: "Frontend",
    items: ["TypeScript", "React", "Next.js", "Tailwind CSS", "shadcn/ui", "Framer Motion"],
  },
  {
    title: "Backend",
    items: ["Node.js", "Python", "PostgreSQL", "REST", "GraphQL"],
  },
  {
    title: "DevOps",
    items: ["Docker", "GitHub Actions", "Vercel", "AWS basics", "Linux"],
  },
  {
    title: "Tools",
    items: ["Git", "VS Code", "Figma", "Vitest", "Playwright"],
  },
];
