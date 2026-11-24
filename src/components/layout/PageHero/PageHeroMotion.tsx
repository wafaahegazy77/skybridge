"use client";

import { useRef, type ReactNode } from "react";
import { usePageHeroAnimation } from "./usePageHeroAnimation";

type PageHeroMotionProps = {
    labelledBy: string;
    children: ReactNode;
};

// Client wrapper: renders the <section> root and attaches the GSAP animations to it.
// Everything inside stays server-rendered (passed in as children).
export default function PageHeroMotion({ labelledBy, children }: PageHeroMotionProps) {
    const rootRef = useRef<HTMLElement>(null);

    usePageHeroAnimation(rootRef);

    return (
        <section ref={rootRef} className="page-hero" data-page-hero-state="pending" aria-labelledby={labelledBy}>
            {children}
        </section>
    );
}