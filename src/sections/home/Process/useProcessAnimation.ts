"use client";

import { useEffect, useLayoutEffect, type RefObject } from "react";
import { gsap, ScrollTrigger } from "@/lib/gsap";

// Runs before paint on the client; falls back to useEffect during SSR (where it never runs).
const useIsomorphicLayoutEffect = typeof window !== "undefined" ? useLayoutEffect : useEffect;

type ProcessState = "pending" | "armed" | "static";

// Vine pins its 5 cards for 400% of the viewport: the first 15% fades the cards in, 80% moves the camera
// through the stack, the last 5% holds the last card. Per card that is: intro 0.6 viewport, 0.8 viewport
// per step, 0.2 viewport hold. The same rates are kept here for any number of steps.
const INTRO = 0.6;
const STEP = 0.8;
const OUTRO = 0.2;

// Distance between two cards along the depth axis. With the CSS perspective of 1000px, a card one step
// behind is drawn at 1000 / (1000 + 238) = 0.808 of its size: the Figma next card (475 / 588).
const DEPTH_STEP = 238;
// Vine: a card is sharp within ±3rem of the camera on a 15rem step (±0.2 step).
const FOCUS = 0.2;
// Vine: passed cards reach their full blur 20rem (1.33 steps) after leaving the focus.
const PASSED_SPAN = 4 / 3;
// Transform range actually applied (in steps): beyond it the card is fully transparent anyway, and
// clamping keeps faded cards from being scaled up to huge layers.
const MIN_DEPTH = -3;
const MAX_DEPTH = 1.2;
// Below these screen heights the pinned stage cannot show the header and the cards together: the cards
// stay a plain grid instead.
const MIN_HEIGHT = { desktop: 600, mobile: 500 };

type Mode = {
    /** Blur of a card one step behind the focus (px). */
    nextBlur: number;
    /** Maximum blur of a card that has passed the camera (px). */
    passedBlur: number;
    /** Fade the cards in (staggered, deepest first) at the start of the pin. */
    intro: boolean;
    /** Opacity of a card at a given distance from the focus (negative = still behind). */
    opacity: (distance: number) => number;
    /** Downward drift of a passed card per step (px). */
    drop: number;
};

const clamp = (min: number, max: number, value: number) => Math.min(max, Math.max(min, value));
const clamp01 = (value: number) => clamp(0, 1, value);

const MODES: Record<"desktop" | "mobile", Mode> = {
    // Vine desktop, adapted to the Figma composition: the next card is visible (Figma blur 4 ≈ CSS 2px)
    // and the one after it fades in while it approaches; a passed card blurs (to Vine's 20px) and fades
    // within one step (with the shallower Figma depth a passed card would otherwise stay on screen longer).
    desktop: {
        nextBlur: 2,
        passedBlur: 20,
        intro: true,
        opacity: (distance) =>
            distance < 0 ? clamp01(2 + distance) : 1 - clamp01((distance - FOCUS) / (1 - FOCUS)),
        drop: 0,
    },
    // Vine mobile (used below 992px): one card at a time; cards cross-fade within one step, passed cards
    // drift down, blur limited to 5px, no intro fade.
    mobile: {
        nextBlur: 5,
        passedBlur: 5,
        intro: false,
        opacity: (distance) => 1 - clamp01(Math.abs(distance)),
        drop: 200,
    },
};

/** Vine blur curve: sharp around the focus, then growing with the distance on either side. */
function blurAt(distance: number, mode: Mode) {
    const gap = Math.abs(distance) - FOCUS;
    if (gap <= 0) return 0;

    return distance < 0
        ? (gap / (1 - FOCUS)) * mode.nextBlur
        : Math.min(mode.passedBlur, (gap / PASSED_SPAN) * mode.passedBlur);
}

/**
 * Vine intro: the cards fade in one after another, deepest first (stagger 0.1, 0.5 each, power2.out),
 * over the first part of the pin.
 */
function introAt(progress: number, index: number, count: number) {
    const total = 0.5 + 0.1 * (count - 1);
    const delay = 0.1 * (count - 1 - index);
    const local = clamp01((progress * total - delay) / 0.5);

    return 1 - (1 - local) * (1 - local);
}

/**
 * Vine "/Create a unified ecosystem" 3D scroll, on the Skybridge cards:
 * - The section pins; scrolling moves the camera through a stack of cards placed one behind the other
 *   (alternating left / right on desktop, one column below 992px).
 * - The card in focus is sharp; the cards behind are smaller and blurred, and come forward one at a time;
 *   a card that has been read moves past the camera, blurring and fading out.
 * - Progress follows the scroll directly (Lenis already smooths it, as on Vine), in both directions.
 */
function setupSequence(root: HTMLElement, mode: Mode) {
    const cards = gsap.utils.toArray<HTMLElement>(".process__card", root);
    const count = cards.length;
    if (count < 2) return;

    const setters = cards.map((card) => ({
        z: gsap.quickSetter(card, "z", "px"),
        y: gsap.quickSetter(card, "y", "px"),
        opacity: gsap.quickSetter(card, "opacity"),
        filter: gsap.quickSetter(card, "filter"),
    }));

    // Pinned distance in viewport heights, and where the camera move starts and ends within it.
    const length = INTRO + STEP * (count - 1) + OUTRO;
    const moveStart = INTRO / length;
    const moveEnd = (INTRO + STEP * (count - 1)) / length;

    const render = (progress: number) => {
        const intro = mode.intro ? clamp01(progress / moveStart) : 1;
        // Camera position in steps: 0 = first card in focus, count - 1 = last card in focus.
        const camera = clamp01((progress - moveStart) / (moveEnd - moveStart)) * (count - 1);

        setters.forEach((set, index) => {
            const distance = camera - index; // > 0: the card has passed the camera
            const depth = clamp(MIN_DEPTH, MAX_DEPTH, distance);
            const opacity = mode.opacity(distance) * (mode.intro ? introAt(intro, index, count) : 1);
            // No filter on transparent cards: nothing to see, and a blur layer is not free.
            const blur = opacity > 0.001 ? blurAt(distance, mode) : 0;

            set.z(depth * DEPTH_STEP);
            set.y(Math.max(0, depth) * mode.drop);
            set.opacity(Math.round(opacity * 1000) / 1000);
            set.filter(blur > 0.05 ? `blur(${blur.toFixed(2)}px)` : "none");
        });
    };

    const trigger = ScrollTrigger.create({
        trigger: root,
        // The section is at least one screen tall; when its content is taller, pin once its bottom (the
        // cards) is fully in view.
        start: () => (root.offsetHeight > window.innerHeight + 1 ? "bottom bottom" : "top top"),
        end: () => `+=${Math.round(window.innerHeight * length)}`,
        pin: true,
        pinSpacing: true,
        invalidateOnRefresh: true,
        onUpdate: (self) => render(self.progress),
        onRefresh: (self) => render(self.progress),
    });

    render(trigger.progress);

    return () => {
        trigger.kill();
        gsap.set(cards, { clearProps: "transform,opacity,filter" });
    };
}

export function useProcessAnimation(rootRef: RefObject<HTMLElement | null>) {
    useIsomorphicLayoutEffect(() => {
        const root = rootRef.current;
        if (!root) return;

        const setState = (state: ProcessState) => {
            root.dataset.processState = state;
        };

        // gsap.matchMedia rebuilds the sequence when the width crosses 992px, the screen gets too short for
        // a full-screen stage, or the reduced-motion setting changes. When no condition matches (very short
        // screens, e.g. phones held sideways), the plain grid stays.
        // Vine switches to its one-column variant below 768px; here it is used below 992px, where two
        // Figma-size cards no longer fit side by side.
        const mm = gsap.matchMedia(root);

        mm.add(
            {
                desktop: `(min-width: 992px) and (min-height: ${MIN_HEIGHT.desktop}px) and (prefers-reduced-motion: no-preference)`,
                mobile: `(max-width: 991.98px) and (min-height: ${MIN_HEIGHT.mobile}px) and (prefers-reduced-motion: no-preference)`,
                reduce: "(prefers-reduced-motion: reduce)",
            },
            (context) => {
                const { desktop, reduce } = context.conditions ?? {};

                // Reduced motion: the Figma cards as a plain grid, no pin.
                if (reduce) {
                    setState("static");
                    return () => setState("pending");
                }

                // The 3D layout must be in place before the pin measures the section.
                setState("armed");
                const cleanup = setupSequence(root, desktop ? MODES.desktop : MODES.mobile);

                return () => {
                    cleanup?.();
                    setState("pending");
                };
            },
        );

        return () => mm.revert();
    }, [rootRef]);
}