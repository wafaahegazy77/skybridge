"use client";

import { useEffect, useLayoutEffect, type RefObject } from "react";
import { gsap, ScrollTrigger } from "@/lib/gsap";

// Runs before paint on the client; falls back to useEffect during SSR (where it never runs).
const useIsomorphicLayoutEffect = typeof window !== "undefined" ? useLayoutEffect : useEffect;

type ServicesState = "pending" | "armed" | "static";

/**
 * "Frames" entrance — the same aperture/contour language as the Hero and Intro, applied to a strip of film frames:
 * - The dark panel opens from its rounded left edge towards the screen edge it bleeds into
 *   (on its own empty background layer, so the reveal never repaints the content).
 * - The heading is drawn as a green contour and flooded with solid type; the subtitle wipes in.
 * - Each card opens as a frame from its horizontal center line while its photo settles from a deeper
 *   zoom (layered depth: card mask → photo scale); the card titles rise out of their own mask.
 * - The counter and the arrows open like the Hero buttons.
 * Scroll-linked: the triangle patterns drift slowly in opposite directions (scrubbed, so they only
 * move while the section is being scrolled, never on their own).
 * Only clip-path, transform and opacity are animated. Fast by design: everything lands in ~1.4s.
 */
function setupMotion(root: HTMLElement) {
    const q = gsap.utils.selector(root);

    const panel = q(".services__panel")[0];
    const panelBg = q(".services__panel-bg")[0];
    const outline = q(".services__title-outline");
    const title = q(".services__title");
    const subtitle = q(".services__subtitle");
    const cards = q(".services__card");
    const photos = q(".services__card-img");
    const cardTitles = q(".services__card-title");
    const counter = q(".services__counter");
    const navButtons = q(".services__nav-btn");
    const patternTop = q(".services__pattern--top");
    const patternBottom = q(".services__pattern--bottom");

    if (!panel || !panelBg) return;

    // ---------- Initial states ----------
    gsap.set(panelBg, { clipPath: "inset(0% 100% 0% 0% round 30px 0px 0px 30px)" });
    gsap.set(outline, { autoAlpha: 0, clipPath: "inset(0% 50% 0% 50%)", scale: 1.03 });
    gsap.set(title, { clipPath: "inset(0% 0% 100% 0%)" });
    gsap.set(subtitle, { clipPath: "inset(0% 100% 0% 0%)" });
    gsap.set(cards, { clipPath: "inset(50% 0% 50% 0% round 30px)" });
    gsap.set(photos, { scale: 1.3 });
    gsap.set(cardTitles, { clipPath: "inset(0% 0% 100% 0%)", yPercent: 18 });
    gsap.set([...counter, ...navButtons], { clipPath: "inset(50% 50% 50% 50%)" });

    const entrance = gsap.timeline({
        paused: true,
        defaults: { ease: "power3.inOut" },
        onComplete: () => {
            gsap.set([panelBg, ...title, ...subtitle, ...cards, ...counter, ...navButtons], { clearProps: "clipPath" });
            gsap.set(outline, { clearProps: "clipPath,transform" });
            gsap.set(photos, { clearProps: "transform" });
            gsap.set(cardTitles, { clearProps: "clipPath,transform" });
        },
    });

    entrance.to(panelBg, { clipPath: "inset(0% 0% 0% 0% round 30px 0px 0px 30px)", duration: 0.9 }, 0);

    entrance.set(outline, { autoAlpha: 1 }, 0.2);
    entrance.to(outline, { clipPath: "inset(0% 0% 0% 0%)", duration: 0.55 }, 0.2);
    entrance.to(outline, { scale: 1, duration: 0.85, ease: "power2.out" }, 0.2);
    entrance.to(title, { clipPath: "inset(0% 0% 0% 0%)", duration: 0.65, ease: "power2.inOut" }, 0.5);
    entrance.to(outline, { autoAlpha: 0, duration: 0.3, ease: "power1.out" }, 0.95);
    entrance.to(subtitle, { clipPath: "inset(0% 0% 0% 0%)", duration: 0.7, ease: "power3.out" }, 0.4);

    entrance.to(cards, { clipPath: "inset(0% 0% 0% 0% round 30px)", duration: 0.8, stagger: 0.08 }, 0.4);
    entrance.to(photos, { scale: 1, duration: 1.1, ease: "power3.out", stagger: 0.08 }, 0.4);
    entrance.to(cardTitles, { clipPath: "inset(0% 0% 0% 0%)", yPercent: 0, duration: 0.6, ease: "power3.out", stagger: 0.08 }, 0.75);

    entrance.to([...counter, ...navButtons], { clipPath: "inset(0% 0% 0% 0%)", duration: 0.5, stagger: 0.06 }, 0.55);

    ScrollTrigger.create({ trigger: panel, start: "top 75%", end: "max", once: true, onEnter: () => entrance.play() });

    // ---------- Triangle patterns: slow scrubbed drift in opposite directions ----------
    const drift = { trigger: root, start: "top bottom", end: "bottom top", scrub: 0.8 };
    if (patternTop.length) gsap.fromTo(patternTop, { y: -36, rotation: -4 }, { y: 36, rotation: 4, ease: "none", scrollTrigger: drift });
    if (patternBottom.length) gsap.fromTo(patternBottom, { y: 28, rotation: 3 }, { y: -28, rotation: -3, ease: "none", scrollTrigger: { ...drift } });
}

export function useServicesAnimation(rootRef: RefObject<HTMLElement | null>) {
    useIsomorphicLayoutEffect(() => {
        const root = rootRef.current;
        if (!root) return;

        const setState = (state: ServicesState) => {
            root.dataset.servicesState = state;
        };

        // Reduced motion: final Figma composition, no entrance and no drift.
        if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
            setState("static");
            return;
        }

        const ctx = gsap.context(() => setupMotion(root), root);
        setState("armed"); // initial GSAP states are applied; the CSS pre-hide can be lifted

        return () => {
            ctx.revert(); // kills the entrance, the drift tweens and their ScrollTriggers; restores inline styles
            setState("pending");
        };
    }, [rootRef]);
}