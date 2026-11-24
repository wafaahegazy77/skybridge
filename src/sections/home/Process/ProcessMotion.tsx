"use client";

import { useRef, type ReactNode } from "react";
import { useProcessAnimation } from "./useProcessAnimation";

type ProcessMotionProps = {
    labelledBy: string;
    children: ReactNode;
};

// Client wrapper: renders the <section> root and attaches the scroll sequence to it.
// Everything inside stays server-rendered (passed in as children).
export default function ProcessMotion({ labelledBy, children }: ProcessMotionProps) {
    const rootRef = useRef<HTMLElement>(null);

    useProcessAnimation(rootRef);

    return (
        <section ref={rootRef} className="process" data-process-state="pending" aria-labelledby={labelledBy}>
            {children}
        </section>
    );
}