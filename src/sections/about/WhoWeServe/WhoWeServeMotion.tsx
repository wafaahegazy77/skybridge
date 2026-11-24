"use client";

import { useRef, type ReactNode } from "react";
import { useWhoWeServeAnimation } from "./useWhoWeServeAnimation";

type WhoWeServeMotionProps = {
    labelledBy: string;
    children: ReactNode;
};

// Client wrapper: renders the section and attaches the GSAP animations to it.
// Everything inside stays server-rendered (passed in as children).
export default function WhoWeServeMotion({ labelledBy, children }: WhoWeServeMotionProps) {
    const rootRef = useRef<HTMLElement>(null);

    useWhoWeServeAnimation(rootRef);

    return (
        <section ref={rootRef} className="who-we-serve" aria-labelledby={labelledBy} data-serve-state="pending">
            {children}
        </section>
    );
}