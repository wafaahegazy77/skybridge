"use client";

import { useRef, type ReactNode } from "react";
import { useShowreelZoom } from "./useShowreelZoom";

type ShowreelMotionProps = {
    labelledBy: string;
    children: ReactNode;
};

// Client wrapper: renders the <section> root and attaches the pinned scroll zoom to it.
// Everything inside stays server-rendered (passed in as children).
export default function ShowreelMotion({ labelledBy, children }: ShowreelMotionProps) {
    const rootRef = useRef<HTMLElement>(null);

    useShowreelZoom(rootRef);

    return (
        <section ref={rootRef} className="showreel" aria-labelledby={labelledBy}>
            {children}
        </section>
    );
}