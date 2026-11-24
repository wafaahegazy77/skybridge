"use client";

import { useRef, type ReactNode } from "react";
import { useIntroAnimation } from "./useIntroAnimation";

type IntroMotionProps = {
    labelledBy: string;
    children: ReactNode;
};

// Client wrapper: renders the <section> root and attaches the GSAP animations to it.
// Everything inside stays server-rendered (passed in as children).
export default function IntroMotion({ labelledBy, children }: IntroMotionProps) {
    const rootRef = useRef<HTMLElement>(null);

    useIntroAnimation(rootRef);

    return (
        <section ref={rootRef} className="intro" data-intro-state="pending" aria-labelledby={labelledBy}>
            {children}
        </section>
    );
}