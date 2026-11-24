"use client";

import { useRef, type ReactNode } from "react";
import { useFeaturesAnimation } from "./useFeaturesAnimation";

type AboutFeaturesMotionProps = {
    children: ReactNode;
};

// Client wrapper: renders the root and attaches the GSAP animations to it.
// Everything inside stays server-rendered (passed in as children).
export default function AboutFeaturesMotion({ children }: AboutFeaturesMotionProps) {
    const rootRef = useRef<HTMLDivElement>(null);

    useFeaturesAnimation(rootRef);

    return (
        <div ref={rootRef} className="about-features" data-features-state="pending">
            {children}
        </div>
    );
}