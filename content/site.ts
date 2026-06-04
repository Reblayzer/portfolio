export type SocialLink = { label: string; href: string };

export const site = {
  name: "Alexandro Bolfa",
  initials: "AB",
  pitch: "Software engineer — frontend-focused, full-stack capable.",
  about: [
    "I'm a new-grad software engineer who cares about how software feels to use. I focus on the frontend — performance, accessibility, the details of a well-built interface — and I'm comfortable on the backend and in the build/deploy pipeline.",
    "Right now I'm looking for a first full-time role on a product team that ships often and treats the frontend as a craft.",
  ] as const,
  location: "Romania",
  email: "contact@alexandro-bolfa.com",
  resumeHref: "/resume.pdf",
  socials: [
    { label: "GitHub", href: "https://github.com/Reblayzer" },
    { label: "LinkedIn", href: "https://www.linkedin.com/in/alexandro-bolfa/" },
  ] satisfies SocialLink[],
} as const;
