"use client";

import { useRef, type ReactNode } from "react";
import "swiper/css";
import "swiper/css/a11y";
import { useServicesAnimation } from "./useServicesAnimation";
import { useServicesSlider } from "./useServicesSlider";

type ServicesMotionProps = {
    labelledBy: string;
    children: ReactNode;
};

// Client wrapper: renders the <section> root, starts the Swiper slider and the GSAP motion on it.
// All markup inside stays server-rendered (passed in as children).
export default function ServicesMotion({ labelledBy, children }: ServicesMotionProps) {
    const rootRef = useRef<HTMLElement>(null);

    useServicesSlider(rootRef);
    useServicesAnimation(rootRef);

    return (
        <section ref={rootRef} className="services" data-services-state="pending" aria-labelledby={labelledBy}>
            {children}
        </section>
    );
}