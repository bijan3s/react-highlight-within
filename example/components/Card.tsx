import React, { type ReactNode } from "react";
import { Eyebrow } from "./Eyebrow";

interface CardProps {
  eyebrow: string;
  title?: string;
  span?: boolean;
  children: ReactNode;
}

export const Card = ({ eyebrow, title, span, children }: CardProps) => (
  <section className={`card${span ? " card--span" : ""}`}>
    <Eyebrow>{eyebrow}</Eyebrow>
    {title ? <h2>{title}</h2> : null}
    {children}
  </section>
);
