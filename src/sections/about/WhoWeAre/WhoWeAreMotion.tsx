"use client";

import { useRef, type ReactNode } from "react";
import { useWhoWeAreAnimation } from "./useWhoWeAreAnimation";

type WhoWeAreMotionProps = {
    labelledBy: string;
    children: ReactNode;
};

// Client wrapper: renders the <section> root and attaches the GSAP animations to it.
// Everything inside stays server-rendered (passed in as children).
export default function WhoWeAreMotion({ labelledBy, children }: WhoWeAreMotionProps) {
    const rootRef = useRef<HTMLElement>(null);

    useWhoWeAreAnimation(rootRef);

    return (
        <section ref={rootRef} className="who-we-are" data-who-state="pending" aria-labelledby={labelledBy}>
            {children}
        </section>
    );
}