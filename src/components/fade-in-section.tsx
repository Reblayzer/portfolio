"use client";

import { motion, useReducedMotion } from "framer-motion";
import type { ReactNode } from "react";

type Props = {
  children: ReactNode;
  className?: string;
  id?: string;
  as?: "section" | "div";
  delay?: number;
};

export function FadeInSection({ children, className, id, as = "section", delay = 0 }: Props) {
  const reduce = useReducedMotion();
  const Tag = as === "section" ? motion.section : motion.div;

  return (
    <Tag
      id={id}
      className={className}
      initial={reduce ? false : { opacity: 0, y: 8 }}
      whileInView={reduce ? undefined : { opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-10% 0px" }}
      transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1], delay }}
    >
      {children}
    </Tag>
  );
}
