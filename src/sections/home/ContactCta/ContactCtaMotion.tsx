"use client";

import { useRef, type ReactNode } from "react";
import { useContactCtaAnimation } from "./useContactCtaAnimation";

type ContactCtaMotionProps = {
    labelledBy: string;
    children: ReactNode;
};

// Client wrapper: renders the <section> root and attaches the entrance, the depth parallax and the
// button's magnetic pull to it. Everything inside stays server-rendered (passed in as children).
export default function ContactCtaMotion({ labelledBy, children }: ContactCtaMotionProps) {
    const rootRef = useRef<HTMLElement>(null);

    useContactCtaAnimation(rootRef);

    return (
        <section ref={rootRef} className="contact-cta" data-contact-state="pending" aria-labelledby={labelledBy}>
            {children}
        </section>
    );
}