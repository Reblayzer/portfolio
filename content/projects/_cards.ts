export type ProjectCard = {
  title: string;
  summary: string;
  stack: string[];
  links: { repo?: string; live?: string };
  cover?: string;
};

export const projectCards: ProjectCard[] = [
  {
    title: "NutriMind",
    summary:
      "An AI nutrition planning engine that reasons about nutrient interactions, bioavailability, and supplement timing, not just macros.",
    stack: ["Next.js 16", "Claude Agent SDK", "TypeScript", "SQLite"],
    links: {},
  },
  {
    title: "Real-Time CDC Pipeline",
    summary:
      "A production-shaped change-data-capture pipeline with a live storefront: place an order and watch it land in the analytics warehouse seconds later.",
    stack: ["FastAPI", "Debezium / Kafka", "PySpark", "ClickHouse"],
    links: { repo: "https://github.com/Reblayzer/realtime-cdc-pipeline" },
  },
];
