"use client";

import { useRef, type ReactNode } from "react";
import { useHeroAnimation } from "./useHeroAnimation";

type HeroMotionProps = {
    labelledBy: string;
    children: ReactNode;
};

// Client wrapper: renders the <section> root and attaches the GSAP animations to it.
// Everything inside stays server-rendered (passed in as children).
export default function HeroMotion({ labelledBy, children }: HeroMotionProps) {
    const rootRef = useRef<HTMLElement>(null);

    useHeroAnimation(rootRef);

    return (
        <section ref={rootRef} className="hero" data-hero-state="pending" aria-labelledby={labelledBy}>
            {children}
        </section>
    );
}