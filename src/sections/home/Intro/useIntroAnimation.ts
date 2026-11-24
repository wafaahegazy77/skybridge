"use client";

import { useEffect, useLayoutEffect, type RefObject } from "react";
import { gsap, ScrollTrigger } from "@/lib/gsap";

// Runs before paint on the client; falls back to useEffect during SSR (where it never runs).
const useIsomorphicLayoutEffect = typeof window !== "undefined" ? useLayoutEffect : useEffect;

type IntroState = "pending" | "armed" | "static";

// Where each corner mark starts, relative to its final place: slightly outside the frame,
// so the four marks close in on the content like a viewfinder finding focus.
const CORNER_OFFSET = { x: 56, y: 40 };
const CORNER_FROM: Record<string, { x: number; y: number }> = {
    "top-left": { x: -CORNER_OFFSET.x, y: -CORNER_OFFSET.y },
    "top-right": { x: CORNER_OFFSET.x, y: -CORNER_OFFSET.y },
    "bottom-right": { x: CORNER_OFFSET.x, y: CORNER_OFFSET.y },
    "bottom-left": { x: -CORNER_OFFSET.x, y: CORNER_OFFSET.y },
};

/**
 * "Focus" motion concept, continuing the Hero's contour language:
 * - While the Hero wordmark travels down into this section (see useHeroAnimation), the four
 *   corner marks close in on the frame, scrubbed by scroll — the frame "focuses" on the wordmark.
 * - The heading is drawn as a green contour, then the solid type pours in from the top (as in the Hero).
 * - The paragraph lights up word by word as it is read (scrubbed, 30% → full), so the text is never hidden.
 * - The button opens like an aperture from its center.
 * Only transform, opacity and clip-path are animated; there is no continuous animation.
 */
function setupMotion(root: HTMLElement) {
    const q = gsap.utils.selector(root);

    const frame = q(".intro__frame")[0];
    const corners = q(".intro__corner");
    const titleWrap = q(".intro__title-wrap")[0];
    const outline = q(".intro__title-outline");
    const title = q(".intro__title");
    const text = q(".intro__text")[0];
    const words = q(".intro__word");
    const actionWrap = q(".intro__action-wrap")[0];
    const action = q(".intro__action");

    // ---------- Corner marks: scrubbed "viewfinder" close-in ----------
    if (frame && corners.length) {
        const focus = gsap.timeline({
            defaults: { ease: "power2.out" },
            scrollTrigger: { trigger: frame, start: "top 90%", end: "center 55%", scrub: 0.6 },
        });

        corners.forEach((corner: Element) => {
            const position = Array.from(corner.classList).find((c) => c.startsWith("intro__corner--"))?.split("--")[1] ?? "";
            const from = CORNER_FROM[position] ?? { x: 0, y: 0 };

            focus.fromTo(corner, { x: from.x, y: from.y, autoAlpha: 0 }, { x: 0, y: 0, autoAlpha: 1, duration: 1 }, 0);
        });
    }

    // ---------- Heading: contour → solid ----------
    if (titleWrap) {
        gsap.set(outline, { autoAlpha: 0, clipPath: "inset(0% 50% 0% 50%)", scale: 1.03 });
        gsap.set(title, { clipPath: "inset(0% 0% 100% 0%)" });

        const heading = gsap.timeline({
            paused: true,
            defaults: { ease: "power3.inOut" },
            onComplete: () => {
                gsap.set(title, { clearProps: "clipPath" });
                gsap.set(outline, { clearProps: "clipPath,transform" });
            },
        });

        heading.set(outline, { autoAlpha: 1 }, 0);
        heading.to(outline, { clipPath: "inset(0% 0% 0% 0%)", duration: 0.6 }, 0);
        heading.to(outline, { scale: 1, duration: 0.9, ease: "power2.out" }, 0);
        heading.to(title, { clipPath: "inset(0% 0% 0% 0%)", duration: 0.75, ease: "power2.inOut" }, 0.35);
        heading.to(outline, { autoAlpha: 0, duration: 0.35, ease: "power1.out" }, 0.9);

        ScrollTrigger.create({ trigger: titleWrap, start: "top 85%", end: "max", once: true, onEnter: () => heading.play() });
    }

    // ---------- Paragraph: reading highlight, scrubbed ----------
    if (text && words.length) {
        gsap.fromTo(
            words,
            { opacity: 0.3 },
            {
                opacity: 1,
                ease: "none",
                stagger: 0.1,
                scrollTrigger: { trigger: text, start: "top 85%", end: "bottom 75%", scrub: 0.5 },
            },
        );
    }

    // ---------- Button: aperture ----------
    if (actionWrap && action.length) {
        gsap.set(action, { clipPath: "inset(0% 50% 0% 50% round 30px)" });

        const open = gsap.to(action, {
            clipPath: "inset(0% 0% 0% 0% round 30px)",
            duration: 0.6,
            ease: "power3.inOut",
            paused: true,
            onComplete: () => gsap.set(action, { clearProps: "clipPath" }),
        });

        ScrollTrigger.create({ trigger: actionWrap, start: "top 92%", end: "max", once: true, onEnter: () => open.play() });
    }
}

export function useIntroAnimation(rootRef: RefObject<HTMLElement | null>) {
    useIsomorphicLayoutEffect(() => {
        const root = rootRef.current;
        if (!root) return;

        const setState = (state: IntroState) => {
            root.dataset.introState = state;
        };

        // Reduced motion: final Figma composition, no motion at all.
        if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
            setState("static");
            return;
        }

        const ctx = gsap.context(() => setupMotion(root), root);
        setState("armed"); // initial GSAP states are applied; the CSS pre-hide can be lifted

        return () => {
            ctx.revert(); // kills every tween, timeline and ScrollTrigger created above; restores inline styles
            setState("pending");
        };
    }, [rootRef]);
}