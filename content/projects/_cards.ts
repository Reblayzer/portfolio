import type { ProjectCategory } from "@/lib/projects";

export type ProjectCard = {
  title: string;
  summary: string;
  stack: string[];
  category: ProjectCategory;
  links: { repo?: string; live?: string };
  cover?: string;
};

// Work-in-progress projects: scoped, build-in-progress ideas with a brief and a
// target stack, shown as cards. Completed builds live as flagship case studies
// in content/projects/*.mdx.
export const projectCards: ProjectCard[] = [
  {
    title: "Aegis",
    summary:
      "A .NET/C# command-line tool that provisions, releases, rolls back, and health-monitors an Azure-hosted web service.",
    stack: ["C#/.NET", "Azure", "Bicep", "GitHub Actions", "Application Insights"],
    category: "cloud-devops",
    links: {},
  },
  {
    title: "AgentGuard",
    summary:
      "An MCP server that checks agent-written code diffs against compliance guardrails, gates risky changes for review, and keeps an append-only audit trail.",
    stack: ["Python", "FastMCP", "SQLite", "GitHub Actions", "pytest"],
    category: "ai-llm",
    links: {},
  },
  {
    title: "Ansible Fleet Baseline",
    summary:
      "An Ansible project that takes a mixed Ubuntu and RHEL-family Linux fleet from bare install to a hardened baseline via reusable roles and per-environment inventories.",
    stack: ["Ansible", "Bash", "Python", "Molecule", "Docker"],
    category: "cloud-devops",
    links: {},
  },
  {
    title: "AskDocs",
    summary:
      "A RAG assistant that ingests documentation, retrieves relevant passages, and answers natural-language questions with cited sources through an embeddable React widget.",
    stack: ["Python", "FastAPI", "React", "pgvector", "Claude API"],
    category: "ai-llm",
    links: {},
  },
  {
    title: "Azure Secure Landing Zone",
    summary:
      "A reproducible secure Azure landing zone defined in Terraform. The networking layer is built and validating in CI: hub-and-spoke VNets with Azure Firewall, a VPN gateway, and forced-tunnel egress. Entra ID identity and Intune endpoint baselines are in progress.",
    stack: ["Azure", "Terraform", "Azure Firewall", "Entra ID", "Intune"],
    category: "cloud-devops",
    links: { repo: "https://github.com/Reblayzer/azure-secure-landing-zone" },
  },
  {
    title: "BunkerFlow",
    summary:
      "An event-driven integration gateway that ingests batch and Kafka data, routes it through Azure Service Bus, normalizes it, and lands it in a lakehouse store over a REST API.",
    stack: [".NET 8", "Azure Service Bus", "Kafka", "Terraform", "PostgreSQL"],
    category: "backend",
    links: {},
  },
  {
    title: "BunkerStream",
    summary:
      "A medallion-architecture ingestion platform that lands REST, flat-file, and Kafka sources into layered bronze/silver/gold Delta Lake tables, gated by CI data-quality checks.",
    stack: ["Python", "Delta Lake", "Kafka", "Terraform", "GitHub Actions"],
    category: "data-eng",
    links: {},
  },
  {
    title: "CampaignFlow",
    summary:
      "A Python ELT pipeline that ingests raw marketing-campaign exports, conforms and de-duplicates them, and models them into a queryable star schema for spend, reach, and conversion.",
    stack: ["Python", "SQL", "PySpark", "Terraform", "PostgreSQL"],
    category: "data-eng",
    links: {},
  },
  {
    title: "Citera",
    summary:
      "A self-hostable document Q&A assistant that answers questions over your own corpus with inline citations using a retrieval-augmented pipeline.",
    stack: ["Python", "FastAPI", "PostgreSQL", "pgvector", "Next.js"],
    category: "ai-llm",
    links: {},
  },
  {
    title: "CityCatalog",
    summary:
      "A sharded, in-memory distributed catalog service that serves low-latency lookups and real-time updates with optimistic-concurrency consistency.",
    stack: ["Go", "gRPC", "REST", "Prometheus", "Grafana"],
    category: "backend",
    links: {},
  },
  {
    title: "Coalesce",
    summary:
      "An event-driven mini customer data platform that ingests customer events, unifies them into per-customer profiles, and activates segments downstream.",
    stack: ["C#/.NET", "Kafka", "MongoDB", "Azure Service Bus", "Kubernetes"],
    category: "data-eng",
    links: {},
  },
  {
    title: "DeltaPilot",
    summary:
      "A Lakehouse accelerator that ingests raw files into a medallion architecture, then turns plain-English questions into Spark SQL over the gold tables.",
    stack: ["Databricks", "PySpark", "Delta Lake", "FastAPI", "Next.js"],
    category: "data-eng",
    links: {},
  },
  {
    title: "Deskhand",
    summary:
      "An internal AI agent that answers questions over company documents via RAG and decides on its own whether to retrieve, call an API tool, or hand off.",
    stack: ["Python", "FastAPI", "pgvector", "PostgreSQL", "Next.js"],
    category: "ai-llm",
    links: {},
  },
  {
    title: "FieldBridge",
    summary:
      "A Spring Boot gateway that connects to industrial equipment over Modbus TCP and exposes its live data, recent history, and alarms through a REST API.",
    stack: ["Java 21", "Spring Boot 3", "j2mod", "JUnit 5", "Docker"],
    category: "backend",
    links: {},
  },
  {
    title: "Fundament",
    summary:
      "A self-service landing-zone platform where committing one config file runs a pipeline that provisions a governed, policy-guarded cloud landing zone.",
    stack: ["Azure", "Terraform", "Azure Policy", "OPA/conftest", "Log Analytics"],
    category: "cloud-devops",
    links: {},
  },
  {
    title: "HarborWatch",
    summary:
      "A WPF desktop app that plots live ship positions on a map in real time so an operator can watch vessels move, filter by type, and inspect them.",
    stack: [".NET 8", "C#", "WPF", "CommunityToolkit.Mvvm", "ArcGIS Maps SDK"],
    category: "frontend",
    links: {},
  },
  {
    title: "HostStack",
    summary:
      "Provisions a reproducible AlmaLinux shared-hosting node (nginx, Varnish, PHP-FPM, PostgreSQL, MySQL, Redis) and load-balances two app nodes behind HAProxy.",
    stack: ["AlmaLinux", "nginx", "Varnish", "HAProxy", "Puppet"],
    category: "cloud-devops",
    links: {},
  },
  {
    title: "Keystone",
    summary:
      "A reusable Spring Boot starter that gives microservices a shared cross-cutting backbone, with an AI check that flags drift from the standard and suggests fixes.",
    stack: ["Java 17", "Spring Boot", "Kafka", "Docker", "Kubernetes"],
    category: "backend",
    links: {},
  },
  {
    title: "MediaVault",
    summary:
      "A PHP/Symfony service that ingests photos and videos, extracts their metadata, and exposes a tagged, searchable catalog via a web UI and a REST API.",
    stack: ["PHP 8", "Symfony", "Doctrine ORM", "MySQL", "REST API"],
    category: "backend",
    links: {},
  },
  {
    title: "MeterFleet",
    summary:
      "Runs a simulated fleet of connected meters as a service on Azure AKS, with observability, SLIs/SLOs, alerting, multi-region failover, and runbooks, all as code.",
    stack: ["Azure AKS", "Terraform", "FastAPI", "Dynatrace", "PostgreSQL"],
    category: "cloud-devops",
    links: {},
  },
  {
    title: "MixPilot",
    summary:
      "A process-control web app for a concrete batching plant: define a mix recipe, run a simulated dosing cycle, and watch the batch live with tolerance alarms.",
    stack: ["Java", "Tomcat", "MySQL", "JSP", "Vue"],
    category: "backend",
    links: {},
  },
  {
    title: "NoticeBridge",
    summary:
      "A procurement slice where a Vue 3 UI drafts a notice, an ASP.NET Web API validates it, and an async function publishes it as eForms/TED XML to a mock portal.",
    stack: ["Vue 3", "ASP.NET Web API", "EF Core", "PostgreSQL", "Azure Functions"],
    category: "backend",
    links: {},
  },
  {
    title: "PipeForge",
    summary:
      "A self-hosted container-based DevOps toolchain that runs a full CI/CD pipeline for a sample Java service: build, test, SonarQube gate, Nexus publish, and Grafana metrics.",
    stack: ["Docker Compose", "GitHub Actions", "Nexus", "SonarQube", "Grafana"],
    category: "cloud-devops",
    links: {},
  },
  {
    title: "ProcessBridge",
    summary:
      "An ERP integration service that runs one end-to-end flow: a PLM design item becomes a project, then syncs into an ERP-shaped store with idempotent mapping and audit.",
    stack: ["C#", "ASP.NET Core", "Oracle Database", "PL/SQL", "PostgreSQL"],
    category: "backend",
    links: {},
  },
  {
    title: "ShipBoard",
    summary:
      "A release-tracking board that pulls release status from third-party services into one timeline of in-progress, in-review, and live work.",
    stack: ["Go", "React", "TypeScript", "SQLite", "Vitest"],
    category: "frontend",
    links: {},
  },
  {
    title: "SitRep",
    summary:
      "A situational command-and-control dashboard that tracks units, assets, and incidents and renders them live on a map with status filtering.",
    stack: ["C#", "ASP.NET Core", "JavaScript", "Leaflet", "EF Core"],
    category: "frontend",
    links: {},
  },
  {
    title: "Stockpile",
    summary:
      "A retail stock and inventory back end modelling products, variants, suppliers, and purchase orders with low-stock reorder logic and an append-only audit trail.",
    stack: ["ASP.NET Core", "C#", "Entity Framework Core", "Blazor", "xUnit"],
    category: "backend",
    links: {},
  },
  {
    title: "Stocktide",
    summary:
      "A streaming merchandising data pipeline that turns raw sales and inventory events into brand-scoped analytics exposed as a versioned data product API.",
    stack: ["Python", "Kafka", "DuckDB", "FastAPI", "Terraform"],
    category: "data-eng",
    links: {},
  },
  {
    title: "Threadline",
    summary:
      "A menswear e-commerce storefront with server-side-rendered catalog pages, a client-only cart, and a headless CMS backend for products and editorial content.",
    stack: ["Nuxt 3", "TypeScript", "SASS", "Payload CMS", "Playwright"],
    category: "frontend",
    links: {},
  },
  {
    title: "Throughline",
    summary:
      "A B2B support tool that unifies messages from several channels into one threaded inbox and uses an AI layer to classify, prioritise, and draft replies.",
    stack: ["Next.js", "TypeScript", "Node", "PostgreSQL", "Claude API"],
    category: "ai-llm",
    links: {},
  },
  {
    title: "TradePort",
    summary:
      "A B2B webshop where customers browse a catalogue, place orders, and file claims that move through a status workflow, enriched by an external pricing service.",
    stack: ["Vue 3", ".NET 8", "SQL Server", "EF Core", "Azure"],
    category: "frontend",
    links: {},
  },
];
