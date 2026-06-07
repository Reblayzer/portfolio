export type SkillGroup = {
  title: string;
  items: string[];
};

export const skillGroups: SkillGroup[] = [
  {
    title: "Languages",
    items: ["Python", "TypeScript", "JavaScript", "Java", "C#", "Go", "SQL"],
  },
  {
    title: "Frontend",
    items: ["React", "Next.js", "Angular", "Tailwind CSS", "HTML & CSS"],
  },
  {
    title: "Backend & Data",
    items: [".NET / ASP.NET Core", "Spring Boot", "FastAPI", "Node.js", "REST", "PostgreSQL", "Elasticsearch", "Kafka"],
  },
  {
    title: "Cloud & DevOps",
    items: ["Azure", "Docker", "Kubernetes", "Terraform", "GitHub Actions", "CI/CD", "Linux"],
  },
  {
    title: "AI & Practices",
    items: [
      "Claude Code",
      "GitHub Copilot",
      "MCP",
      "Microservices",
      "Clean Architecture",
      "Unit testing",
      "Scrum",
      "Git",
    ],
  },
];
