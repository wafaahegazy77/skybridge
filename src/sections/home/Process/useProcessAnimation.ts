"use client";

import { useEffect, useLayoutEffect, type RefObject } from "react";
import { gsap, ScrollTrigger } from "@/lib/gsap";

// Runs before paint on the client; falls back to useEffect during SSR (where it never runs).
const useIsomorphicLayoutEffect = typeof window !== "undefined" ? useLayoutEffect : useEffect;

type ProcessState = "pending" | "armed" | "static";

// ---------------------------------------------------------------------------------------------
// Values taken from the Vine reference ("init3DScroll" on vine-final.webflow.io, checked live).
// Vine works in rem along the depth axis; the same units are kept here so its formulas apply as-is.
// ---------------------------------------------------------------------------------------------

// Vine pins its 5 cards for 400% of the viewport: 0.8 viewport per step through the stack and a 0.2
// viewport hold on the last card (same rates for any number of cards). Vine also spends 0.6 viewport
// on an intro before the camera moves; here the camera moves from the first scroll of the pin, and the
// cards behind fade in during the first INTRO of that movement instead (no scroll without motion).
const INTRO = 0.6;
const STEP = 0.8;
const OUTRO = 0.2;

const REM = 16;
const DEPTH_STEP = 15; // rem between two cards (Vine: 0, 15, 30, 45, 60rem)
const FOCUS = 3; // rem: a card is sharp within ±3rem of the camera
const PASSED_SPAN = 20; // rem: a passed card reaches its full blur 20rem after leaving the focus
// Effective perspective of the stage (CSS 192px = 12rem): a card that has moved this close is at the
// viewer's eye; beyond it the browser would draw it behind the viewer, so it is hidden from there on.
const EYE = 12;
const PERSPECTIVE = EYE * REM; // px (CSS perspective of .process__list)

// Figma resting composition (desktop frame "process", 1206px grid): the second card waits at the right,
// 674px from the grid's left edge and 211px lower than the first card, drawn at 475 × 261 (80.8% of the
// 588 × 323 card) with a layer blur of 4 (CSS 2px). The other cards are not shown.
const FIGMA_NEXT = { left: 674 / 1206, top: 211, scale: 475 / 588, blur: 2 };
const EDGE = 24; // px: the second card never comes closer than this to the right edge of the screen

// The second card's Figma size is a real depth in the stage: 80.8% is what the 192px perspective draws
// for a card 45.7px behind the first one. From there it moves forward through depth like every card,
// and it responds to the very first scroll:
// - it starts at NEXT_SPEED px of depth per rem of camera travel (its zoom then starts at about the rate
//   of a card approaching on the Vine path) and accelerates evenly until it travels at the camera speed
//   (16px/rem); from that point it is exactly on the Vine path, like the other cards (see nextCardZ);
// - its move from the Figma place into its lane is driven by the same depth progress, so it glides
//   into place while it zooms, settling with zero speed as it reaches the focus;
// - its blur and visibility follow its actual depth.
const FIGMA_DEPTH = -PERSPECTIVE * (1 / FIGMA_NEXT.scale - 1); // px (≈ −45.7)
const NEXT_SPEED = 3; // px of depth per rem of camera travel at the start
const CAMERA_SPEED = REM; // px of depth per rem of camera travel on the Vine path
// Camera position (rem) where the second card joins the Vine path: with its speed rising evenly from
// NEXT_SPEED to CAMERA_SPEED, it covers its own depth plus the camera's lead by then.
const JOIN = (DEPTH_STEP * CAMERA_SPEED + FIGMA_DEPTH) / ((CAMERA_SPEED - NEXT_SPEED) / 2); // ≈ 29.9rem

/** Depth (px) of the second card for a camera position (rem): moving at once, never decreasing, smooth. */
function nextCardZ(cameraZ: number) {
    if (cameraZ >= JOIN) return (cameraZ - DEPTH_STEP) * CAMERA_SPEED;
    return FIGMA_DEPTH + NEXT_SPEED * cameraZ + ((CAMERA_SPEED - NEXT_SPEED) / (2 * JOIN)) * cameraZ * cameraZ;
}

// The Process mark (Figma "fav-lg 3") during the pinned sequence: the camera travels through the
// triangle, so it opens up around the cards (a little larger) and turns a few degrees, in step with the
// scroll. At rest (before the pin) it is exactly the Figma mark.
const MARK_TRAVEL = { scale: 0.16, rotation: -5 };

type Mode = {
    /** Vine "base" blur: blur of the cards waiting behind (px). */
    baseBlur: number;
    /** Vine "max" blur: blur reached by a card that has passed the camera (px). */
    maxBlur: number;
    /** Desktop: cards fade in at the start of the pin. Mobile: cards cross-fade one at a time. */
    crossFade: boolean;
    /**
     * Desktop: the section rests in the Figma composition (first card in focus, second card at its Figma
     * place) and only turns into the 3D stack once the pin starts. Mobile has no Figma: Vine's variant.
     */
    figmaStart: boolean;
};

// Vine: init3DScroll() on desktop, init3DScroll(true, 5, 0, 5) below 768px.
const MODES: Record<"desktop" | "mobile", Mode> = {
    desktop: { baseBlur: 20, maxBlur: 20, crossFade: false, figmaStart: true },
    mobile: { baseBlur: 5, maxBlur: 5, crossFade: true, figmaStart: false },
};

const clamp = (min: number, max: number, value: number) => Math.min(max, Math.max(min, value));
const clamp01 = (value: number) => clamp(0, 1, value);
const smooth = gsap.parseEase("sine.inOut");

/** Vine calculateBlur(currentZ, cardDepth): sharp at the focus, blurred before and after it. */
function blurAt(cameraZ: number, depth: number, mode: Mode) {
    if (Math.abs(cameraZ - depth) <= FOCUS) return 0;

    if (cameraZ < depth - FOCUS) {
        return mode.baseBlur - (cameraZ / (depth - FOCUS)) * mode.baseBlur;
    }

    return Math.min(((cameraZ - (depth + FOCUS)) / PASSED_SPAN) * mode.maxBlur, mode.maxBlur);
}

/** Vine calculateOpacity (mobile): a card is fully visible at the focus, gone one step before / after. */
function crossFadeAt(cameraZ: number, depth: number) {
    return 1 - clamp01(Math.abs(cameraZ - depth) / DEPTH_STEP);
}

/** Vine calculateYOffset (mobile): a passed card drifts down, 800px over 60rem (200px per card). */
function dropAt(cameraZ: number, depth: number) {
    return Math.max(0, (cameraZ - depth) / 60) * 800;
}

/**
 * Vine intro (desktop): the cards behind fade in one after another, deepest first (opacity 0 → 1,
 * 0.5 each, stagger 0.1, power2.out), here while the camera is already moving. The first two cards are
 * not part of it: they are visible from the start, as in Figma (on Vine the first card fades in last).
 */
function introAt(progress: number, index: number, count: number) {
    if (index <= 1) return 1;

    const behind = count - 1;
    const total = 0.5 + 0.1 * (behind - 1);
    const delay = 0.1 * (count - 1 - index);
    const local = clamp01((progress * total - delay) / 0.5);

    return 1 - (1 - local) * (1 - local);
}

/**
 * Vine "/Create a unified ecosystem" 3D scroll on the Skybridge cards:
 * - Desktop: until the pin starts, the section is the Figma composition (first card in focus on the left,
 *   the second one smaller and lightly blurred at its Figma place, no other card). From the first scroll
 *   of the pin the camera moves; the cards behind fade in during the first part of that movement.
 * - The section pins; the scroll moves the camera straight into a stack of cards placed 15rem apart.
 *   On desktop the second card comes forward from its Figma depth and joins the stack's path (see
 *   nextCardZ): it zooms and glides into its lane in one movement, never backward.
 * - The card in focus is sharp; the cards behind it are small (perspective) and blurred, and each one
 *   grows into focus in turn, at its own place (left / right on desktop);
 * - a card that has been read keeps growing past the camera, blurring out, and leaves the screen.
 * - Progress follows the scroll directly (Lenis smooths it, as on Vine), in both directions.
 */
function setupSequence(root: HTMLElement, mode: Mode) {
    const cards = gsap.utils.toArray<HTMLElement>(".process__card", root);
    const count = cards.length;
    if (count < 2) return;

    const list = root.querySelector<HTMLElement>(".process__list");
    const mark = root.querySelector<HTMLElement>(".process__mark");
    const setters = cards.map((card) => ({
        x: gsap.quickSetter(card, "x", "px"),
        y: gsap.quickSetter(card, "y", "px"),
        z: gsap.quickSetter(card, "z", "px"),
        opacity: gsap.quickSetter(card, "opacity"),
        filter: gsap.quickSetter(card, "filter"),
    }));
    // GSAP's quickSetter has no shorthand "scale": both axes are set.
    const markScaleX = mark ? gsap.quickSetter(mark, "scaleX") : null;
    const markScaleY = mark ? gsap.quickSetter(mark, "scaleY") : null;
    const markRotation = mark ? gsap.quickSetter(mark, "rotation", "deg") : null;

    // Offset (px) that puts the second card at its Figma place while it rests at FIGMA_DEPTH: its top left
    // corner, drawn through the perspective (seen from the centre of the list), lands 674 / 1206 of the
    // grid from the left (never closer than 24px to the screen edge) and 211px lower than the first card.
    // Measured on every refresh (layout and screen size changes).
    const figma = { x: 0, y: 0 };
    const measure = () => {
        if (!mode.figmaStart || !list) return;
        const card = cards[1];
        const width = list.clientWidth;
        const originX = width / 2;
        const originY = list.clientHeight / 2;
        const maxLeft = window.innerWidth - list.getBoundingClientRect().left - EDGE - card.offsetWidth * FIGMA_NEXT.scale;
        const left = Math.min(width * FIGMA_NEXT.left, maxLeft);
        figma.x = originX + (left - originX) / FIGMA_NEXT.scale - card.offsetLeft;
        figma.y = originY + (FIGMA_NEXT.top - originY) / FIGMA_NEXT.scale - card.offsetTop;
    };

    // Pinned distance in viewport heights: the camera moves from the start of the pin to moveEnd; the
    // cards behind fade in during its first INTRO viewport.
    const length = STEP * (count - 1) + OUTRO;
    const introEnd = INTRO / length;
    const moveEnd = (STEP * (count - 1)) / length;
    const travel = DEPTH_STEP * (count - 1);

    const render = (progress: number) => {
        const intro = clamp01(progress / introEnd);
        const cameraZ = clamp01(progress / moveEnd) * travel;

        // The mark opens up and turns with the camera travel (identity before the pin).
        const travelled = smooth(cameraZ / travel);
        markScaleX?.(1 + MARK_TRAVEL.scale * travelled);
        markScaleY?.(1 + MARK_TRAVEL.scale * travelled);
        markRotation?.(MARK_TRAVEL.rotation * travelled);

        setters.forEach((set, index) => {
            const depth = index * DEPTH_STEP;
            const distance = cameraZ - depth; // rem; > 0: the card has passed the focus
            let beyondEye = distance >= EYE;

            let opacity = mode.crossFade ? crossFadeAt(cameraZ, depth) : introAt(intro, index, count);
            if (beyondEye) opacity = 0;

            let blur = opacity > 0.001 ? blurAt(cameraZ, depth, mode) : 0;
            let x = 0;
            let y = mode.crossFade && !beyondEye ? dropAt(cameraZ, depth) : 0;
            // A card past the eye is hidden and parked at the focus plane, so it is never kept as a huge
            // scaled-up layer; it comes back as soon as the scroll returns.
            let z = beyondEye ? 0 : distance * REM;

            // The second card (desktop): its own depth path from the Figma place (see nextCardZ). Its
            // place, blur and visibility all follow that depth, so it moves like the other cards.
            if (mode.figmaStart && index === 1 && cameraZ < JOIN) {
                z = nextCardZ(cameraZ);
                const near = z / REM; // rem from the focus (< 0: still behind it)
                beyondEye = near >= EYE;
                opacity = beyondEye ? 0 : 1;
                if (beyondEye) z = 0;
                const approach = clamp01((z - FIGMA_DEPTH) / -FIGMA_DEPTH); // 0 at the Figma place, 1 at the focus
                const slide = (1 - approach) * (1 - approach); // eases out: no speed left at the focus
                x = figma.x * slide;
                y = figma.y * slide;
                blur =
                    near < 0
                        ? FIGMA_NEXT.blur * (1 - clamp01(approach / 0.6))
                        : Math.min(Math.max(0, near - FOCUS) / PASSED_SPAN, 1) * mode.maxBlur;
            }

            if (mode.figmaStart && index === 1) set.x(x);
            set.y(y);
            set.z(z);
            set.opacity(Math.round(opacity * 1000) / 1000);
            set.filter(blur > 0.05 ? `blur(${blur.toFixed(2)}px)` : "none");
        });
    };

    // Where the pin starts.
    // - Desktop: when the section reaches the top of the screen, or a little later if the first card would
    //   not be fully in view yet (the section is as tall as the Figma frame: the space below the cards is
    //   for the second card's Figma place, and it may stay below the screen while pinned).
    // - Mobile: the section is at least one screen tall; when its content is taller, pin once its bottom
    //   (the cards) is fully in view.
    const start = () => {
        if (!mode.figmaStart || !list) {
            return root.offsetHeight > window.innerHeight + 1 ? "bottom bottom" : "top top";
        }
        const listBottom = list.getBoundingClientRect().bottom - root.getBoundingClientRect().top;
        return `top+=${Math.max(0, Math.round(listBottom + EDGE - window.innerHeight))} top`;
    };

    const trigger = ScrollTrigger.create({
        trigger: root,
        start,
        end: () => `+=${Math.round(window.innerHeight * length)}`,
        pin: true,
        pinSpacing: true,
        invalidateOnRefresh: true,
        onUpdate: (self) => render(self.progress),
        onRefresh: (self) => {
            measure();
            render(self.progress);
        },
    });

    measure();
    render(trigger.progress);

    return () => {
        trigger.kill();
        gsap.set(cards, { clearProps: "transform,opacity,filter" });
        if (mark) gsap.set(mark, { clearProps: "transform" });
    };
}

/**
 * The mark appears as the section comes into view (once): it is uncovered from the heart of the triangle
 * outward through a soft-edged circular mask, like a light being switched on behind the cards. Ends on
 * the Figma mark (the mask is removed). Only a CSS mask position is animated.
 */
function setupMarkReveal(root: HTMLElement) {
    const mark = root.querySelector<HTMLElement>(".process__mark");
    if (!mark) return () => {};

    mark.classList.add("is-revealing");
    gsap.set(mark, { "--mark-reveal": "0%" });

    const reveal = gsap.to(mark, {
        "--mark-reveal": "130%",
        duration: 1.6,
        ease: "power2.out",
        paused: true,
        onComplete: () => {
            mark.classList.remove("is-revealing");
            gsap.set(mark, { clearProps: "--mark-reveal" });
        },
    });

    const trigger = ScrollTrigger.create({
        trigger: root,
        start: "top 85%",
        end: "max", // also plays when the page is loaded below the section
        once: true,
        onEnter: () => reveal.play(),
    });

    return () => {
        trigger.kill();
        reveal.kill();
        mark.classList.remove("is-revealing");
        gsap.set(mark, { clearProps: "--mark-reveal" });
    };
}

// Below these screen heights the pinned stage cannot show the header and the cards together: the cards
// stay a plain grid instead.
const MIN_HEIGHT = { desktop: 600, mobile: 500 };

export function useProcessAnimation(rootRef: RefObject<HTMLElement | null>) {
    useIsomorphicLayoutEffect(() => {
        const root = rootRef.current;
        if (!root) return;

        const setState = (state: ProcessState) => {
            root.dataset.processState = state;
        };

        // gsap.matchMedia rebuilds the sequence when the width crosses 768px (Vine's breakpoint), the
        // screen gets too short for a full-screen stage, or the reduced-motion setting changes. When no
        // condition matches (very short screens, e.g. phones held sideways), the plain grid stays.
        const mm = gsap.matchMedia(root);

        mm.add(
            {
                desktop: `(min-width: 768px) and (min-height: ${MIN_HEIGHT.desktop}px) and (prefers-reduced-motion: no-preference)`,
                mobile: `(max-width: 767.98px) and (min-height: ${MIN_HEIGHT.mobile}px) and (prefers-reduced-motion: no-preference)`,
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
                const cleanupMark = setupMarkReveal(root);

                return () => {
                    cleanupMark();
                    cleanup?.();
                    setState("pending");
                };
            },
        );

        return () => mm.revert();
    }, [rootRef]);
}