export type SocialLink = { label: string; href: string };

export const site = {
  name: "Alexandro Bolfa",
  initials: "AB",
  pitch: "Software engineer. Frontend-focused, full-stack capable.",
  about: [
    "I'm a software engineer focused on the frontend, comfortable across the full stack. I spent two years shipping production features at Schneider Electric on the EcoStruxure Power SaaS platform, inside an empowered Scrum team in a global release train, then graduated from VIA University College in January 2026 with a B.Sc. in Software Technology Engineering.",
    "I care about how software feels to use: performance, accessibility, and the details of a well-built interface. AI tooling is part of how I build, not a side curiosity. I'm based in Horsens, Denmark and looking for my next full-time role on a product team that ships often.",
  ] as const,
  location: "Horsens, Denmark",
  email: "contact@alexandro-bolfa.com",
  resumeHref: "/resume.pdf",
  socials: [
    { label: "GitHub", href: "https://github.com/Reblayzer" },
    { label: "LinkedIn", href: "https://www.linkedin.com/in/alexandro-bolfa/" },
  ] satisfies SocialLink[],
} as const;
