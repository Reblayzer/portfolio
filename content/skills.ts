export type SkillGroup = {
  title: string;
  items: string[];
};

export const skillGroups: SkillGroup[] = [
  {
    title: "Frontend",
    items: ["TypeScript", "React", "Next.js", "Angular", "Vue", "HTML & CSS"],
  },
  {
    title: "Backend",
    items: ["C# / .NET", "Java / Spring Boot", "Node.js", "REST", "gRPC", "Kafka Streams"],
  },
  {
    title: "Data & DevOps",
    items: ["PostgreSQL", "SQL & NoSQL", "Docker", "Kubernetes", "Azure", "CI/CD"],
  },
  {
    title: "AI & Tools",
    items: ["Claude Code", "MCP", "GitHub Copilot", "Git", "Unit testing", "Scrum"],
  },
];
