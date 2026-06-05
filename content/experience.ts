export type ExperienceEntry = {
  role: string;
  company: string;
  start: string;
  end: string;
  bullets: string[];
};

export type EducationEntry = {
  degree: string;
  school: string;
  start: string;
  end: string;
  detail?: string;
};

export const experience: ExperienceEntry[] = [
  {
    role: "Software Developer (Intern & Student Assistant)",
    company: "Schneider Electric",
    start: "2024-01",
    end: "2026-01",
    bullets: [
      "Shipped frontend features end to end on the EcoStruxure Power SaaS platform as a member of an empowered Scrum team inside a global release train of distributed teams across Europe, North America and Asia.",
      "Built custom UI components for data-heavy tables and dashboards, and delivered a full-stack feature where I owned the REST endpoint, the database query layer, and the Angular view on top of it.",
      "Worked across React, Angular, TypeScript, C#/.NET, Java/Spring Boot, REST and gRPC, Kafka Streams, and CI/CD on Jenkins and GitHub Actions, with GitHub Copilot in every coding session.",
    ],
  },
];

export const education: EducationEntry[] = [
  {
    degree: "B.Sc. Software Technology Engineering",
    school: "VIA University College",
    start: "2022",
    end: "2026",
    detail:
      "Horsens, Denmark. Bachelor's project: Storage Connector, a cross-platform .NET app unifying OneDrive and Google Drive with OAuth, async sync, and rate-limit handling.",
  },
];
