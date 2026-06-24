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
      "Shipped production features end to end on the EcoStruxure Power SaaS platform as a member of an empowered Scrum team inside a global release train of eight distributed teams across Europe, North America and Asia, owning tasks from refinement through implementation, unit tests, code review, CI/CD, and production support.",
      "Worked full-stack on a microservice, event-driven architecture: REST and gRPC services, the database query layer, and the UI on top, with Kafka Streams for event flows and both SQL (CockroachDB) and NoSQL (Cassandra, Elasticsearch) data stores.",
      "Built with Java and C#/.NET on the backend and React, Angular and TypeScript on the frontend, running on Docker, Kubernetes and Azure with Kibana for monitoring and CI/CD on Jenkins and GitHub Actions, and GitHub Copilot in every coding session.",
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
