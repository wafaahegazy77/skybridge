"use client";

import { useRef, type ReactNode } from "react";
import { usePortfolioAnimation } from "./usePortfolioAnimation";

type PortfolioMotionProps = {
    labelledBy: string;
    children: ReactNode;
};

// Client wrapper: renders the <section> root and attaches the stacking cards and their entrance to it.
// Everything inside stays server-rendered (passed in as children).
export default function PortfolioMotion({ labelledBy, children }: PortfolioMotionProps) {
    const rootRef = useRef<HTMLElement>(null);

    usePortfolioAnimation(rootRef);

    return (
        <section ref={rootRef} className="portfolio" data-portfolio-state="pending" aria-labelledby={labelledBy}>
            {children}
        </section>
    );
}