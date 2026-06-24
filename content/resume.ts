import { site } from "@content/site";

export type ResumeContact = { label: string; value: string; href?: string };
export type ResumeExperience = {
  role: string;
  company: string;
  location: string;
  start: string;
  end: string;
  bullets: string[];
};
export type ResumeProject = {
  name: string;
  blurb: string;
  detail: string;
  stack: string[];
  link?: { label: string; href: string };
};
export type ResumeLanguage = { name: string; level: string };

export const resumeTitle = "Full-stack Software Engineer";

export const resumeProfile: string[] = [
  "Full-stack software engineer with two years shipping production features at Schneider Electric on the EcoStruxure Power SaaS platform, owning work from the REST endpoint and database query layer up to the view on top. B.Sc. in Software Technology Engineering from VIA University College, January 2026.",
  "I build software that holds up end to end: clean APIs, sound data models, and interfaces that feel good to use. LLM-guided development is part of how I work, with GitHub Copilot daily at Schneider and Claude Code plus custom skills and MCP servers on personal projects.",
  "Currently studying Danish (DU3 Module 3) and motivated to reach professional fluency.",
];

export const resumeContact: ResumeContact[] = [
  { label: "Location", value: site.location },
  { label: "Email", value: site.email, href: `mailto:${site.email}` },
  { label: "Site", value: "alexandro-bolfa.com", href: "https://alexandro-bolfa.com" },
  { label: "GitHub", value: "Reblayzer", href: "https://github.com/Reblayzer" },
  {
    label: "LinkedIn",
    value: "alexandro-bolfa",
    href: "https://www.linkedin.com/in/alexandro-bolfa/",
  },
];

export const resumeExperience: ResumeExperience = {
  role: "Software Developer (Intern & Student Assistant)",
  company: "Schneider Electric, Digital Energy",
  location: "Kolding, Denmark",
  start: "Jan 2024",
  end: "Jan 2026",
  bullets: [
    "Shipped features end to end on the EcoStruxure Power SaaS platform as a member of an empowered Scrum team inside a global release train of eight distributed teams across Europe, North America and Asia (around 60 engineers).",
    "Delivered a full-stack feature owning the REST endpoint, the database query layer, and the Angular view: a new tab listing generated scheduled reports for UPS assets, with custom data-heavy table components and cell renderers.",
    "Ramped fast onto a second international release on a C#/.NET and React micro-frontend architecture, integrating a custom date-range picker into the in-house Quartz design system and becoming a reference person for teammates joining the same stack.",
    "Owned tasks through refinement, implementation, unit tests (xUnit, JUnit), code review, CI/CD (Jenkins, GitHub Actions), and production support; worked across Java and C#/.NET on a microservice, event-driven architecture with Kafka Streams and gRPC, SQL (CockroachDB) and NoSQL (Cassandra, Elasticsearch) stores, and Docker, Kubernetes and Azure, with GitHub Copilot in every coding session.",
  ],
};

export const resumeProjects: ResumeProject[] = [
  {
    name: "Consentinel",
    blurb: "Full-stack data-governance and compliance portal, built solo end to end.",
    detail:
      "Owners register dataset manifests, an API auto-classifies every column for personal data, and data subjects file right-to-be-forgotten requests through a stewarded approval workflow with an append-only audit trail. The dependency-free PII classifier combines value patterns with multilingual column-name hints, including the Danish CPR format.",
    stack: ["Python", "FastAPI", "PostgreSQL", "Next.js", "TypeScript", "Terraform", "Docker"],
    link: {
      label: "github.com/Reblayzer/consentinel",
      href: "https://github.com/Reblayzer/consentinel",
    },
  },
  {
    name: "Niteshift",
    blurb: "Blockchain incremental game, built with two collaborators over a year and counting.",
    detail:
      "I own the entire Unity and C# frontend: gameplay UI, HUD, the asset pipeline, and a building-and-street auto-connection system that detects neighbouring tiles, picks the right road variant, and rerenders dynamically as the player builds. Developed with Claude Code, custom skills, and MCP integrations.",
    stack: ["Unity", "C#", "Game state management"],
  },
];

export const resumeFocusAreas: { label: string; href: string } = {
  label: "Backend, Data Engineering, AI/LLM, Cloud/DevOps, Frontend",
  href: "https://alexandro-bolfa.com/projects",
};

export const resumeLanguages: ResumeLanguage[] = [
  { name: "English", level: "C1" },
  { name: "Italian", level: "C1" },
  { name: "Romanian", level: "B2" },
  { name: "German", level: "B2" },
  { name: "Danish", level: "A2 (studying DU3.M3)" },
];
