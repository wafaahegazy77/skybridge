"use client";

import { useEffect, useLayoutEffect, type RefObject } from "react";
import { gsap, ScrollTrigger } from "@/lib/gsap";

// Runs before paint on the client; falls back to useEffect during SSR (where it never runs).
const useIsomorphicLayoutEffect = typeof window !== "undefined" ? useLayoutEffect : useEffect;

type BlogsState = "pending" | "armed" | "static";

// Added to the title while its light band sweeps across it (gradient text, see _Blogs.scss).
const SWEEP_CLASS = "blogs__title-line--sweep";

/**
 * "Lights Up" entrance, played once when the section comes into view:
 * - the title is lit by a light band sweeping across it (same treatment as Portfolio);
 * - the cards switch on one after another, rising 24px from dim.
 * Only opacity, transform and background-position are animated; everything is cleared afterwards, so
 * nothing interferes with Swiper or the hover effects.
 */
function setupEntrance(root: HTMLElement) {
    const q = gsap.utils.selector(root);
    const titleLines = q(".blogs__title-line") as HTMLElement[];
    const cards = q(".blogs__card") as HTMLElement[];

    titleLines.forEach((line) => line.classList.add(SWEEP_CLASS));
    gsap.set(titleLines, { backgroundPosition: "100% 0%" });
    gsap.set(cards, { autoAlpha: 0, y: 24 });

    const reveal = gsap.timeline({
        paused: true,
        onComplete: () => {
            titleLines.forEach((line) => line.classList.remove(SWEEP_CLASS));
            gsap.set(titleLines, { clearProps: "backgroundPosition" });
            gsap.set(cards, { clearProps: "opacity,visibility,transform" });
        },
    });

    reveal.to(titleLines, { backgroundPosition: "0% 0%", duration: 1, ease: "power2.inOut" }, 0);
    reveal.to(cards, { autoAlpha: 1, y: 0, duration: 0.8, stagger: 0.12, ease: "power3.out" }, 0.2);

    ScrollTrigger.create({
        trigger: root,
        start: "top 75%",
        end: "max",
        once: true,
        onEnter: () => reveal.play(),
    });
}

export function useBlogsAnimation(rootRef: RefObject<HTMLElement | null>) {
    useIsomorphicLayoutEffect(() => {
        const root = rootRef.current;
        if (!root) return;

        const setState = (state: BlogsState) => {
            root.dataset.blogsState = state;
        };

        // Reduced motion: everything visible straight away, no entrance.
        if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
            setState("static");
            return;
        }

        const ctx = gsap.context(() => setupEntrance(root), root);
        setState("armed"); // initial GSAP states are applied; the CSS pre-hide can be lifted

        return () => {
            ctx.revert(); // kills the entrance and its ScrollTrigger; restores inline styles
            root.querySelectorAll(`.${SWEEP_CLASS}`).forEach((line) => line.classList.remove(SWEEP_CLASS));
            setState("pending");
        };
    }, [rootRef]);
}