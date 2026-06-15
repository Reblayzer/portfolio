export type ProjectCard = {
  title: string;
  summary: string;
  stack: string[];
  links: { repo?: string; live?: string };
  cover?: string;
};

// All projects are now flagship case studies (see content/projects/*.mdx).
// Lighter, one-line projects would go here as cards.
export const projectCards: ProjectCard[] = [];
