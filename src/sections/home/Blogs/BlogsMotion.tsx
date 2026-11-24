"use client";

import { useRef, type ReactNode } from "react";
import "swiper/css";
import "swiper/css/a11y";
import { useBlogsAnimation } from "./useBlogsAnimation";
import { useBlogsSlider } from "./useBlogsSlider";

type BlogsMotionProps = {
    labelledBy: string;
    children: ReactNode;
};

// Client wrapper: renders the <section> root, starts the Swiper slider and the entrance on it.
// All markup inside stays server-rendered (passed in as children).
export default function BlogsMotion({ labelledBy, children }: BlogsMotionProps) {
    const rootRef = useRef<HTMLElement>(null);

    useBlogsSlider(rootRef);
    useBlogsAnimation(rootRef);

    return (
        <section ref={rootRef} className="blogs" data-blogs-state="pending" aria-labelledby={labelledBy}>
            {children}
        </section>
    );
}