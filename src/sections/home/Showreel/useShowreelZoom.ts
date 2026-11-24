"use client";

import { useEffect, useLayoutEffect, type RefObject } from "react";
import { gsap } from "@/lib/gsap";
import { SHOWREEL_TRIANGLE } from "./triangle";

// Runs before paint on the client; falls back to useEffect during SSR (where it never runs).
const useIsomorphicLayoutEffect = typeof window !== "undefined" ? useLayoutEffect : useEffect;

// Scroll distance of the pinned sequence, in viewport heights. The pin lasts exactly as long as the
// zoom + reveal: it releases the moment the video fills the screen, so the next scroll already moves the
// page on (same zoom speed as before: these were 62% of the former 2.2 / 1.6 pin, whose last 38% was a
// pinned "hold" on the finished video). Shorter below desktop and on touch screens.
const PIN_LENGTH = { desktop: 1.36, compact: 1 };
const COMPACT_MEDIA = "(max-width: 1199.98px), (pointer: coarse)";
// Margin so the opening covers the corners with room to spare at the end of the zoom.
const COVER_MARGIN = 1.08;
// The video's triangle is drawn slightly larger than the opening so its edges stay under the glass rim.
const SHAPE_BLEED = 1.08;

type Geometry = {
    /** Layout position and size of the triangle inside the section. */
    left: number;
    top: number;
    size: number;
    /** Offset that brings the opening's centre to the centre of the screen. */
    dx: number;
    dy: number;
    /** Final scale: the opening's inscribed circle covers the whole screen. */
    scale: number;
};

/** Layout position of an element inside `root`, ignoring CSS transforms (offset chain). */
function getOffsetIn(element: HTMLElement, root: HTMLElement) {
    let left = 0;
    let top = 0;
    let node: HTMLElement | null = element;

    while (node && node !== root) {
        left += node.offsetLeft;
        top += node.offsetTop;
        node = node.offsetParent as HTMLElement | null;
    }

    return { left, top };
}

/**
 * Measures, from the real layout: where the triangle's see-through opening sits in the section,
 * how far it is from the screen centre, and how much the triangle must grow for the opening to
 * cover the whole screen (its inscribed circle ≥ half the screen diagonal). Nothing is hardcoded
 * per screen size; it is re-measured on every ScrollTrigger refresh (resize, orientation, fonts).
 */
function measure(root: HTMLElement, figure: HTMLElement): Geometry {
    const { left, top } = getOffsetIn(figure, root);
    const size = figure.offsetWidth;

    const holeX = left + size * SHOWREEL_TRIANGLE.holeX;
    const holeY = top + size * SHOWREEL_TRIANGLE.holeY;
    const holeRadius = size * SHOWREEL_TRIANGLE.holeRadius;

    const centerX = root.clientWidth / 2;
    const centerY = root.clientHeight / 2;
    const halfDiagonal = Math.hypot(centerX, centerY);

    return {
        left,
        top,
        size,
        dx: centerX - holeX,
        dy: centerY - holeY,
        scale: Math.max(1, (halfDiagonal / holeRadius) * COVER_MARGIN),
    };
}

/** True when point (x, y) lies inside the triangle a-b-c (same-side test). */
function insideTriangle(x: number, y: number, [a, b, c]: number[][]) {
    const side = (p: number[], q: number[]) => (q[0] - p[0]) * (y - p[1]) - (q[1] - p[1]) * (x - p[0]);
    const d1 = side(a, b);
    const d2 = side(b, c);
    const d3 = side(c, a);
    const hasNegative = d1 < 0 || d2 < 0 || d3 < 0;
    const hasPositive = d1 > 0 || d2 > 0 || d3 > 0;
    return !(hasNegative && hasPositive);
}

/**
 * Loads the video only when the section is close, plays it while the section is on screen and
 * pauses it otherwise. Playback failures (autoplay blocked, missing file) leave the poster frame.
 */
function setupPlayback(root: HTMLElement, video: HTMLVideoElement) {
    video.muted = true; // required for autoplay; React does not render the `muted` attribute on the server
    video.playsInline = true;

    let loaded = false;

    const play = () => {
        const attempt = video.play();
        if (attempt) attempt.catch(() => undefined); // blocked autoplay: the poster stays visible
    };

    const nearObserver = new IntersectionObserver(
        ([entry]) => {
            if (!entry.isIntersecting || loaded) return;
            loaded = true;
            video.preload = "auto";
            video.load(); // starts downloading the source picked for this screen size
        },
        { rootMargin: "100% 0px" },
    );

    const visibleObserver = new IntersectionObserver(([entry]) => {
        if (entry.isIntersecting) play();
        else video.pause();
    });

    nearObserver.observe(root);
    visibleObserver.observe(root);

    return () => {
        nearObserver.disconnect();
        visibleObserver.disconnect();
        video.pause();
    };
}

/**
 * Pinned "fly-through" into the showreel (GSAP pin + scrub + one timeline, so scrolling back
 * reverses everything exactly):
 * 1. Approach (0 → 1): the triangle scales around the centre of its see-through opening. Scale
 *    grows exponentially with progress (S^p), which reads as a constant forward speed — a camera
 *    moving towards the object — while the opening glides to the screen centre along a
 *    perspective-correct path (offset ∝ 1 − 1/scale). SHOW and REEL drift outwards and fade; a soft
 *    green light rises inside the triangle.
 * 2. Reveal (from 0.16): the full-screen video sits behind the triangle, cut to the exact shape of the
 *    opening as it currently appears on screen (a clip-path triangle that follows the zoom). It is
 *    first seen deep inside the opening, then grows with it — the triangle IS the reveal — while the
 *    footage itself settles from a slightly deeper zoom. When the opening covers the screen, the glass
 *    dissolves and the cut-out is removed: the video is full-bleed.
 * 3. Release: the timeline ends exactly there, so the pin releases as soon as the video fills the
 *    screen; the video then scrolls away naturally with the section as the next one comes in.
 * Per frame: transforms on the triangle and the video, plus the cut-out's three corner points.
 * The video plays only while the section is on screen.
 */
function setupSequence(root: HTMLElement, isCompact: boolean) {
    const figure = root.querySelector<HTMLElement>(".showreel__figure");
    const triangle = root.querySelector<HTMLElement>(".showreel__triangle");
    const glow = root.querySelector<HTMLElement>(".showreel__glow");
    const screen = root.querySelector<HTMLElement>(".showreel__screen");
    const video = root.querySelector<HTMLVideoElement>(".showreel__video");
    const wordStart = root.querySelector<HTMLElement>(".showreel__word--start");
    const wordEnd = root.querySelector<HTMLElement>(".showreel__word--end");
    if (!figure || !triangle) return;

    let geometry = measure(root, figure);
    const zoom = { progress: 0 };
    let cutOut = false;

    gsap.set(figure, {
        transformOrigin: `${SHOWREEL_TRIANGLE.holeX * 100}% ${SHOWREEL_TRIANGLE.holeY * 100}%`,
        force3D: true,
    });
    // One fast setter for the three transform values (no new tween per scroll update).
    const setTransform = gsap.quickSetter(figure, "css") as (values: gsap.TweenVars) => void;

    /** Cuts the video layer to the opening as it currently appears on screen. */
    const cutVideo = (currentScale: number, offsetX: number, offsetY: number) => {
        if (!screen) return;

        const { left, top, size } = geometry;
        const originX = left + size * SHOWREEL_TRIANGLE.holeX;
        const originY = top + size * SHOWREEL_TRIANGLE.holeY;

        // Opening corners → screen space (same transform as the triangle: scale around the origin, then offset).
        const points = SHOWREEL_TRIANGLE.holeShape.map(([fx, fy]) => [
            originX + (left + size * fx - originX) * currentScale + offsetX,
            originY + (top + size * fy - originY) * currentScale + offsetY,
        ]);
        const centerX = (points[0][0] + points[1][0] + points[2][0]) / 3;
        const centerY = (points[0][1] + points[1][1] + points[2][1]) / 3;
        // Slightly enlarged around its centre, so the edges stay hidden under the glass rim.
        const shape = points.map(([x, y]) => [
            centerX + (x - centerX) * SHAPE_BLEED,
            centerY + (y - centerY) * SHAPE_BLEED,
        ]);

        // Once the opening contains all four screen corners the cut-out is invisible: drop it
        // (one-time change) so the full-screen video needs no clipping for the rest of the sequence.
        const width = root.clientWidth;
        const height = root.clientHeight;
        const coversScreen = [
            [0, 0],
            [width, 0],
            [0, height],
            [width, height],
        ].every(([x, y]) => insideTriangle(x, y, shape));

        if (coversScreen) {
            if (cutOut) {
                screen.style.clipPath = "none";
                cutOut = false;
            }
            return;
        }

        screen.style.clipPath = `polygon(${shape.map(([x, y]) => `${x}px ${y}px`).join(", ")})`;
        cutOut = true;
    };

    const render = () => {
        const { dx, dy, scale } = geometry;
        const current = Math.pow(scale, zoom.progress); // exponential: constant perceived speed
        const travel = scale > 1 ? (1 - 1 / current) / (1 - 1 / scale) : 0; // perspective-correct aim
        const offsetX = dx * travel;
        const offsetY = dy * travel;

        setTransform({ x: offsetX, y: offsetY, scale: current });
        cutVideo(current, offsetX, offsetY);
    };

    const words = [wordStart, wordEnd].filter(Boolean) as HTMLElement[];

    const timeline = gsap.timeline({
        defaults: { ease: "none" },
        scrollTrigger: {
            trigger: root,
            start: "top top",
            end: () => `+=${Math.round(window.innerHeight * (isCompact ? PIN_LENGTH.compact : PIN_LENGTH.desktop))}`,
            pin: true,
            scrub: 0.6,
            anticipatePin: 1,
            invalidateOnRefresh: true,
            onRefresh: () => {
                geometry = measure(root, figure);
                render();
            },
        },
    });

    // 1. Approach.
    timeline.to(zoom, { progress: 1, duration: 1, onUpdate: render }, 0);

    if (words.length) {
        timeline.to(
            words,
            {
                xPercent: (index: number) => (index === 0 ? -28 : 28),
                scale: 1.12,
                autoAlpha: 0,
                duration: 0.45,
                ease: "power2.in",
            },
            0.03,
        );
    }

    if (glow) {
        timeline.fromTo(glow, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.32, ease: "power1.in" }, 0.05);
        timeline.to(glow, { autoAlpha: 0, duration: 0.23, ease: "power1.out" }, 0.39);
    }

    // 2. Reveal: the video appears deep inside the opening and settles as the opening grows.
    if (screen) timeline.fromTo(screen, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.1 }, 0.16);
    if (video) timeline.fromTo(video, { scale: 1.35 }, { scale: 1, duration: 0.84, ease: "power1.out" }, 0.16);

    // Passing through the opening: the glass dissolves as it leaves the screen.
    // The timeline ends here (1), so the pin releases right after.
    timeline.to(triangle, { autoAlpha: 0, duration: 0.13, ease: "power1.in" }, 0.87);

    render();

    const stopPlayback = video ? setupPlayback(root, video) : undefined;

    return () => {
        stopPlayback?.();
        if (screen) screen.style.removeProperty("clip-path");
    };
}

export function useShowreelZoom(rootRef: RefObject<HTMLElement | null>) {
    useIsomorphicLayoutEffect(() => {
        const root = rootRef.current;
        if (!root) return;

        const mm = gsap.matchMedia(root);

        // Reduced motion: no pin, no zoom and no autoplaying video — the static Figma composition.
        mm.add(
            { motionOk: "(prefers-reduced-motion: no-preference)", isCompact: COMPACT_MEDIA },
            (context) => {
                const { motionOk, isCompact } = context.conditions as { motionOk: boolean; isCompact: boolean };
                if (!motionOk) return;
                return setupSequence(root, isCompact);
            },
        );

        return () => {
            mm.revert(); // kills the timeline and its pinned ScrollTrigger (the pin spacer is removed)
            // Reverted tweens leave their start values inline (opacity, translate): clear them.
            gsap.set(
                root.querySelectorAll(
                    ".showreel__word, .showreel__triangle, .showreel__glow, .showreel__figure, .showreel__screen, .showreel__video",
                ),
                { clearProps: "transform,transformOrigin,opacity,visibility" },
            );
        };
    }, [rootRef]);
}