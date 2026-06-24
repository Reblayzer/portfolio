import type { Metadata } from "next";
import styles from "./resume.module.css";
import { site } from "@content/site";
import { skillGroups } from "@content/skills";
import { education } from "@content/experience";
import {
  resumeTitle,
  resumeProfile,
  resumeContact,
  resumeExperience,
  resumeProjects,
  resumeFocusAreas,
  resumeLanguages,
} from "@content/resume";

export const metadata: Metadata = {
  title: "CV",
  robots: { index: false, follow: false },
};

export default function ResumePage() {
  return (
    <main className={styles.page}>
      <header className={styles.header}>
        <div className={styles.headerLeft}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/ab-logo.svg" alt="" className={styles.logo} />
          <h1 className={styles.name}>{site.name}</h1>
          <p className={styles.title}>{resumeTitle}</p>
          <ul className={styles.contact}>
            {resumeContact.map((c) => (
              <li key={c.label} className={styles.contactItem}>
                <span className={styles.contactLabel}>{c.label}</span>
                {c.href ? <a href={c.href}>{c.value}</a> : <span>{c.value}</span>}
              </li>
            ))}
          </ul>
        </div>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/headshot.jpg" alt={site.name} className={styles.photo} />
      </header>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Profile</h2>
        <div className={styles.profile}>
          {resumeProfile.map((p) => (
            <p key={p.slice(0, 24)}>{p}</p>
          ))}
        </div>
      </section>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Skills</h2>
        {skillGroups.map((g) => (
          <div key={g.title} className={styles.skillRow}>
            <span className={styles.skillLabel}>{g.title}</span>
            <span className={styles.skillItems}>{g.items.join(", ")}</span>
          </div>
        ))}
      </section>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Experience</h2>
        <div className={styles.entry}>
          <div className={styles.entryHead}>
            <span className={styles.entryRole}>
              {resumeExperience.role}, {resumeExperience.company}
            </span>
            <span className={styles.entryMeta}>
              {resumeExperience.start} – {resumeExperience.end}
            </span>
          </div>
          <div className={styles.entrySub}>{resumeExperience.location}</div>
          <ul className={styles.bullets}>
            {resumeExperience.bullets.map((b) => (
              <li key={b.slice(0, 24)}>{b}</li>
            ))}
          </ul>
        </div>
      </section>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Projects</h2>
        {resumeProjects.map((p) => (
          <div key={p.name} className={styles.project}>
            <div className={styles.entryHead}>
              <span className={styles.projectName}>{p.name}</span>
              {p.link ? (
                <a className={styles.projectLink} href={p.link.href}>
                  {p.link.label}
                </a>
              ) : null}
            </div>
            <div>
              {p.blurb} {p.detail}
            </div>
            <div className={styles.projectStack}>{p.stack.join(" · ")}</div>
          </div>
        ))}
        <p className={styles.focus}>
          Focus areas: {resumeFocusAreas.label}.{" "}
          <a href={resumeFocusAreas.href}>See the full project explorer.</a>
        </p>
      </section>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Education</h2>
        {education.map((e) => (
          <div key={e.degree} className={styles.entry}>
            <div className={styles.entryHead}>
              <span className={styles.entryRole}>
                {e.degree}, {e.school}
              </span>
              <span className={styles.entryMeta}>
                {e.start} – {e.end}
              </span>
            </div>
            {e.detail ? <div className={styles.entrySub}>{e.detail}</div> : null}
          </div>
        ))}
      </section>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Languages</h2>
        <div className={styles.langs}>
          {resumeLanguages.map((l) => (
            <span key={l.name}>
              {l.name} {l.level}
            </span>
          ))}
        </div>
      </section>
    </main>
  );
}
