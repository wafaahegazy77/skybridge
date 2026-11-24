"use client";

import { useRef, type ReactNode } from "react";
import { useMissionAnimation } from "./useMissionAnimation";

type MissionMotionProps = {
    labelledBy: string;
    children: ReactNode;
};

// Client wrapper: renders the <section> root and attaches the "Lights Up" motion to it.
// Everything inside stays server-rendered (passed in as children).
export default function MissionMotion({ labelledBy, children }: MissionMotionProps) {
    const rootRef = useRef<HTMLElement>(null);

    useMissionAnimation(rootRef);

    return (
        <section ref={rootRef} className="mission" data-mission-state="pending" aria-labelledby={labelledBy}>
            {children}
        </section>
    );
}