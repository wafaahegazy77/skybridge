"use client";

import { useRef, type ReactNode } from "react";
import { useTickerAnimation } from "./useTickerAnimation";

type AboutTickerMotionProps = {
    children: ReactNode;
};

// Client wrapper: renders the band root and attaches the marquee to it.
// Everything inside stays server-rendered (passed in as children).
export default function AboutTickerMotion({ children }: AboutTickerMotionProps) {
    const rootRef = useRef<HTMLDivElement>(null);

    useTickerAnimation(rootRef);

    return (
        <div ref={rootRef} className="about-ticker" data-ticker-state="pending">
            {children}
        </div>
    );
}