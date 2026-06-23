export type SocialLink = { label: string; href: string };

export const site = {
  name: "Alexandro Bolfa",
  initials: "AB",
  pitch: "Full-stack software engineer, from the database to the interface.",
  about: [
    "I'm a full-stack software engineer. I spent two years shipping production features at Schneider Electric on the EcoStruxure Power SaaS platform, inside an empowered Scrum team in a global release train, owning work from the REST endpoint and database query layer up to the view on top, then graduated from VIA University College in January 2026 with a B.Sc. in Software Technology Engineering.",
    "I care about building software that holds up end to end: clean APIs, sound data models, and interfaces that feel good to use. AI tooling is part of how I build, not a side curiosity. I'm based in Horsens, Denmark and looking for my next full-time role on a product team that ships often.",
  ] as const,
  location: "Horsens, Denmark",
  email: "contact@alexandro-bolfa.com",
  socials: [
    { label: "GitHub", href: "https://github.com/Reblayzer" },
    { label: "LinkedIn", href: "https://www.linkedin.com/in/alexandro-bolfa/" },
  ] satisfies SocialLink[],
} as const;
