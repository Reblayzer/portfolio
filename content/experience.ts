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
    role: "Software Engineering Intern",
    company: "Example Company",
    start: "2025-06",
    end: "2025-09",
    bullets: [
      "Replace this with a real bullet describing impact in a measurable way.",
      "Replace this with a real bullet describing the technical decisions you made.",
    ],
  },
];

export const education: EducationEntry[] = [
  {
    degree: "B.Sc. Computer Science",
    school: "Example University",
    start: "2022",
    end: "2026",
    detail: "Focus on web systems and human-computer interaction.",
  },
];
