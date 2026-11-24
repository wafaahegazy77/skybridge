"use client";

import { useEffect, useLayoutEffect, type RefObject } from "react";
import { gsap, ScrollTrigger } from "@/lib/gsap";

// Runs before paint on the client; falls back to useEffect during SSR (where it never runs).
const useIsomorphicLayoutEffect = typeof window !== "undefined" ? useLayoutEffect : useEffect;

type PortfolioState = "pending" | "armed" | "static";

// Stacking runs where Mivon runs it (above 991px), and only with motion allowed.
const STACK_MEDIA = "(min-width: 992px)";
// Figma: the covered card ("Group 20", 1098 × 528) is 1098 / 1206 of the front card's width and its top
// shows 104px above the front card; Figma blur 10 ≈ CSS blur(5px).
const BACK_SCALE = 1098 / 1206;
const BACK_PEEK = 104;
const BACK_BLUR = 5;
// Space kept between the peeking card and the top of the screen when the stack is short of room.
const MIN_TOP_GAP = 24;
// Added to a title while its light band sweeps across it (gradient text, see _Portfolio.scss).
const SWEEP_CLASS = "portfolio__title-line--sweep";

/**
 * Light band across a title: the text is painted with a gradient three times its width (class added
 * here) and the gradient slides from 100% to 0%. Returns the tween vars; the class is removed when the
 * tween completes.
 */
function prepareSweep(lines: HTMLElement[]): gsap.TweenVars {
    lines.forEach((line) => line.classList.add(SWEEP_CLASS));
    gsap.set(lines, { backgroundPosition: "100% 0%" });

    return {
        backgroundPosition: "0% 0%",
        duration: 1,
        ease: "power2.inOut",
        onComplete: () => {
            lines.forEach((line) => line.classList.remove(SWEEP_CLASS));
            gsap.set(lines, { clearProps: "backgroundPosition" });
        },
    };
}

/**
 * Secondary "Lights Up" entrance (all breakpoints), played once per element group:
 * - Header: the eyebrow lights up, a light band sweeps across the title.
 * - Each card, as it comes into view: the image opens from a vertical slit while settling from 1.12×,
 *   a light band sweeps across the title, the subtitle and the description switch on from dim,
 *   and the button opens from its centre. Only clip-path, transform, opacity and background-position.
 */
function setupEntrance(root: HTMLElement) {
    const q = gsap.utils.selector(root);

    const header = q(".portfolio__header")[0];
    const eyebrow = q(".portfolio__eyebrow");
    const headerLines = q(".portfolio__header .portfolio__title-line") as HTMLElement[];

    if (header) {
        gsap.set(eyebrow, { autoAlpha: 0.15 });
        const sweep = gsap.to(headerLines, { ...prepareSweep(headerLines), paused: true });
        const lightUp = gsap.to(eyebrow, {
            autoAlpha: 1,
            duration: 0.7,
            ease: "power1.out",
            paused: true,
            onComplete: () => gsap.set(eyebrow, { clearProps: "opacity,visibility" }),
        });

        ScrollTrigger.create({
            trigger: header,
            start: "top 85%",
            end: "max",
            once: true,
            onEnter: () => {
                lightUp.play();
                sweep.play();
            },
        });
    }

    (q(".portfolio__card") as HTMLElement[]).forEach((card) => {
        const cq = gsap.utils.selector(card);
        const media = cq(".portfolio__card-media");
        const photo = cq(".portfolio__card-img");
        const titleLines = cq(".portfolio__title-line") as HTMLElement[];
        const copy = cq(".portfolio__card-subtitle, .portfolio__card-description");
        const button = cq(".portfolio__button");

        gsap.set(media, { clipPath: "inset(0% 50% 0% 50% round 15px)" });
        gsap.set(photo, { scale: 1.12 });
        gsap.set(copy, { autoAlpha: 0.12 });
        gsap.set(button, { clipPath: "inset(0% 50% 0% 50% round 30px)" });
        const sweepVars = prepareSweep(titleLines);

        const reveal = gsap.timeline({
            paused: true,
            defaults: { ease: "power3.inOut" },
            onComplete: () => {
                gsap.set([...media, ...button], { clearProps: "clipPath" });
                gsap.set(photo, { clearProps: "transform" });
                gsap.set(copy, { clearProps: "opacity,visibility" });
            },
        });

        reveal.to(media, { clipPath: "inset(0% 0% 0% 0% round 15px)", duration: 0.9 }, 0);
        reveal.to(photo, { scale: 1, duration: 1.3, ease: "power2.out" }, 0);
        reveal.to(titleLines, sweepVars, 0.1);
        reveal.to(copy, { autoAlpha: 1, duration: 0.6, stagger: 0.14, ease: "power1.out" }, 0.35);
        reveal.to(button, { clipPath: "inset(0% 0% 0% 0% round 30px)", duration: 0.6 }, 0.6);

        ScrollTrigger.create({ trigger: card, start: "top 80%", end: "max", once: true, onEnter: () => reveal.play() });
    });
}

/**
 * Stacking cards, Mivon interaction adapted to the Skybridge Figma:
 * - Every card pins when it reaches the stacking position and stays pinned until the last card arrives;
 *   then the whole stack scrolls away together (pinSpacing off, as in Mivon).
 * - When a card arrives, the card it covers moves back into the Figma "behind" position: 91% wide, its
 *   top 104px above the front card, blurred. Cards further back fade out behind it. Like Mivon, this is
 *   a short timed transition (played on arrival, reversed when scrolling back), not scrubbed.
 * - The stacking position centres the composition (front card + the 104px peek) in the viewport.
 * The move is applied to the inner card element, so it never conflicts with the pin transforms.
 */
function setupStack(root: HTMLElement) {
    const cards = gsap.utils.toArray<HTMLElement>(".portfolio__card", root);
    if (cards.length < 2) return;

    const inners = cards.map((card) => card.querySelector<HTMLElement>(".portfolio__card-inner")).filter(Boolean) as HTMLElement[];
    if (inners.length !== cards.length) return;

    // Card top while stacked: the peek + front card are centred vertically, never closer than MIN_TOP_GAP.
    const stackTop = () => {
        const cardHeight = cards[0].offsetHeight;
        return Math.max(BACK_PEEK + MIN_TOP_GAP, Math.round((window.innerHeight - cardHeight - BACK_PEEK) / 2 + BACK_PEEK));
    };
    const start = () => `top ${stackTop()}px`;

    gsap.set(inners, { transformOrigin: "50% 0%" });

    const showFront = (frontIndex: number) => {
        inners.forEach((inner, index) => {
            const depth = frontIndex - index;

            gsap.to(inner, {
                scale: depth > 0 ? BACK_SCALE : 1,
                y: depth > 0 ? -BACK_PEEK : 0,
                filter: depth > 0 ? `blur(${BACK_BLUR}px)` : "blur(0px)",
                autoAlpha: depth > 1 ? 0 : 1,
                duration: 0.6,
                ease: "power3.out",
                overwrite: "auto",
            });
        });
    };

    // Created first, so its start is known when the pins below compute their end.
    const lastCard = ScrollTrigger.create({ trigger: cards[cards.length - 1], start, invalidateOnRefresh: true });

    cards.forEach((card, index) => {
        ScrollTrigger.create({
            trigger: card,
            start,
            end: () => lastCard.start,
            pin: true,
            pinSpacing: false,
            invalidateOnRefresh: true,
        });

        if (index > 0) {
            ScrollTrigger.create({
                trigger: card,
                start,
                invalidateOnRefresh: true,
                onEnter: () => showFront(index),
                onLeaveBack: () => showFront(index - 1),
            });
        }
    });

    return () => {
        gsap.killTweensOf(inners);
        gsap.set(inners, { clearProps: "transform,transformOrigin,filter,opacity,visibility" });
    };
}

export function usePortfolioAnimation(rootRef: RefObject<HTMLElement | null>) {
    useIsomorphicLayoutEffect(() => {
        const root = rootRef.current;
        if (!root) return;

        const setState = (state: PortfolioState) => {
            root.dataset.portfolioState = state;
        };

        // Reduced motion: the Figma cards as a plain list, no pinning and no entrance.
        if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
            setState("static");
            return;
        }

        const ctx = gsap.context(() => setupEntrance(root), root);
        // Stacking only on wide screens; gsap.matchMedia builds it up / tears it down when the width
        // crosses 992px (Mivon only checks the width once, on load).
        const mm = gsap.matchMedia(root);
        mm.add(STACK_MEDIA, () => setupStack(root));

        setState("armed"); // initial GSAP states are applied; the CSS pre-hide can be lifted

        return () => {
            mm.revert(); // kills the pins and the stacking tweens, removes the pin spacers
            ctx.revert(); // kills the entrance tweens and ScrollTriggers; restores inline styles
            root.querySelectorAll(`.${SWEEP_CLASS}`).forEach((line) => line.classList.remove(SWEEP_CLASS));
            setState("pending");
        };
    }, [rootRef]);
}