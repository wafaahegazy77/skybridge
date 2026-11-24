"use client";

import { useEffect, useLayoutEffect, type RefObject } from "react";
import { gsap, ScrollTrigger } from "@/lib/gsap";
import { createHeroStencil } from "./heroStencil";

// Runs before paint on the client; falls back to useEffect during SSR (where it never runs).
const useIsomorphicLayoutEffect = typeof window !== "undefined" ? useLayoutEffect : useEffect;

const FONT_TIMEOUT_MS = 800; // never keep the Hero hidden longer than this waiting for web fonts
const RECEDE_MEDIA = "(min-width: 1200px)"; // the content "recede" on scroll is desktop-only
const TRAVEL_CLASS = "is-wordmark-travel"; // hides the Intro's static wordmark while the Hero one travels

type HeroState = "pending" | "animating" | "ready" | "static";

/** Resolves when web fonts are ready (or after a short timeout), so text is revealed in its final font. */
function waitForFonts(): Promise<void> {
    if (!("fonts" in document)) return Promise.resolve();

    return Promise.race([
        document.fonts.ready.then(() => undefined),
        new Promise<void>((resolve) => window.setTimeout(resolve, FONT_TIMEOUT_MS)),
    ]);
}

/** Document position and size of an element, ignoring CSS transforms (offset chain). */
function getLayoutRect(element: HTMLElement) {
    let left = 0;
    let top = 0;
    let node: HTMLElement | null = element;

    while (node) {
        left += node.offsetLeft;
        top += node.offsetTop;
        node = node.offsetParent as HTMLElement | null;
    }

    return { left, top, width: element.offsetWidth, height: element.offsetHeight };
}

// ---------------------------------------------------------------------------------------------
// Entrance: "Stencil and lighting gels"
// ---------------------------------------------------------------------------------------------

/**
 * Entrance (~3.5s, the headline is final at ~2.2s). The headline is cut out of a matte sheet and lit
 * from behind, like stage lighting (see heroStencil.ts for the layers):
 * - the cut-out letters emerge as recessed shapes, the sheet casting a shadow into them;
 * - a coloured gel slides in behind each line (green, then purple), light spilling around the letters;
 * - a white plate rises behind the whole headline: the letters turn white;
 * - the sheet settles flat (no more shadow), the real headline takes over at the exact same position
 *   and the sheet fades away, revealing the Figma glows and lines;
 * - the label, the buttons and the wordmark come in last.
 * Only clip-paths, opacity, transforms and one small drop-shadow filter are animated; the stencil
 * layers exist only during the entrance.
 */
function playEntrance(root: HTMLElement, onComplete: () => void) {
    const q = gsap.utils.selector(root);

    const title = root.querySelector<HTMLElement>(".hero__title");
    const eyebrow = q(".hero__eyebrow");
    const actions = q(".hero__actions");
    const wordmarkMask = q(".hero__wordmark-mask");

    // The stencil is measured from the rendered headline, so it is only built while the Hero is at the
    // top of the page (no scroll-linked transform on the content yet).
    const stencil = title && root.getBoundingClientRect().top > -1 ? createHeroStencil(root, title) : null;

    // ---------- Initial states (applied before the section becomes visible) ----------
    gsap.set(eyebrow, { autoAlpha: 0, y: 12 });
    gsap.set(actions, { autoAlpha: 0, y: 20 });
    gsap.set(wordmarkMask, { clipPath: "inset(100% 0% 0% 0%)", y: 30 });
    if (title) gsap.set(title, { autoAlpha: 0 });

    root.dataset.heroState = "animating" satisfies HeroState;

    const tl = gsap.timeline({
        onComplete: () => {
            window.removeEventListener("resize", onResize);
            stencil?.dispose();
            gsap.set([...eyebrow, ...actions, ...wordmarkMask], { clearProps: "opacity,visibility,transform,clipPath" });
            if (title) gsap.set(title, { clearProps: "opacity,visibility" });
            onComplete();
        },
    });

    // Time at which the real headline takes over from the stencil.
    let handoff = 0.4;

    if (stencil && title) {
        const { lightBox, gels, plate, sheet, spill, depth, applyDepth } = stencil;

        // The cut-outs emerge: the light box darkens behind the (still unlit) letters.
        tl.fromTo(lightBox, { backgroundColor: "#1a1a1a" }, { backgroundColor: "#0c0c0c", duration: 0.35, ease: "power1.out" }, 0);

        // One gel per line, alternating sides, light spilling around the letters.
        gels.forEach((gel, index) => {
            const fromLeft = index % 2 === 0;
            gsap.set(gel, { clipPath: fromLeft ? "inset(0% 100% 0% 0%)" : "inset(0% 0% 0% 100%)" });
            tl.to(gel, { clipPath: "inset(0% 0% 0% 0%)", duration: 0.55, ease: "expo.inOut" }, 0.4 + index * 0.22);
        });
        tl.to(spill, { opacity: 0.55, duration: 0.5, ease: "power1.out" }, 0.55);

        // The white plate rises behind the whole headline.
        const plateAt = 0.4 + (gels.length - 1) * 0.22 + 0.63;
        gsap.set(plate, { clipPath: "inset(100% 0% 0% 0%)" });
        tl.to(plate, { clipPath: "inset(0% 0% 0% 0%)", duration: 0.6, ease: "expo.inOut" }, plateAt);
        tl.to(spill, { opacity: 0.18, duration: 0.5 }, plateAt + 0.1);
        tl.to(spill, { opacity: 0, duration: 0.6 }, plateAt + 0.55);

        // The sheet settles flat: its shadow disappears.
        tl.to(depth, { value: 0, duration: 0.7, ease: "power2.inOut", onUpdate: applyDepth }, plateAt + 0.35);

        // Hand-over: the real headline (identical position) replaces the lit cut-outs, the sheet fades away.
        handoff = plateAt + 0.95;
        tl.set(title, { autoAlpha: 1 }, handoff);
        tl.set(lightBox, { autoAlpha: 0 }, handoff + 0.01);
        tl.to(sheet, { autoAlpha: 0, duration: 0.7, ease: "power1.inOut" }, handoff + 0.02);
    } else if (title) {
        // No stencil (page not at the top, or nothing measurable): a plain fade.
        tl.to(title, { autoAlpha: 1, duration: 0.6, ease: "power1.out" }, 0);
    }

    // Label, buttons and wordmark come in last.
    tl.to(eyebrow, { autoAlpha: 1, y: 0, duration: 0.7, ease: "expo.out" }, handoff + 0.1);
    tl.to(actions, { autoAlpha: 1, y: 0, duration: 0.8, ease: "expo.out" }, handoff + 0.25);
    tl.to(wordmarkMask, { clipPath: "inset(0% 0% 0% 0%)", y: 0, duration: 1.1, ease: "expo.out" }, handoff + 0.37);

    // If the headline moves during the entrance (real resize, not just a scrollbar appearing), the
    // stencil would be misaligned: jump straight to the final state.
    const measured = title?.getBoundingClientRect();
    const onResize = () => {
        const now = title?.getBoundingClientRect();
        if (!measured || !now) return;
        const moved = Math.abs(now.left - measured.left) > 1 || Math.abs(now.top - measured.top) > 1 || Math.abs(now.width - measured.width) > 1;
        if (moved) tl.progress(1);
    };
    window.addEventListener("resize", onResize);

    return () => {
        window.removeEventListener("resize", onResize);
        stencil?.dispose();
    };
}

/**
 * Scroll-linked behavior (motion allowed):
 * - Desktop: Hero content recedes slightly while scrolling away.
 * - All sizes: the wordmark scales and travels onto the Intro slot marked with [data-wordmark-target].
 *   Both elements stay in normal document flow, so once landed it scrolls on with the Intro (no pinning).
 *   Until the Intro exists, no target is found and the wordmark simply stays in place.
 */
function setupScroll(root: HTMLElement, mm: gsap.MatchMedia) {
    mm.add(
        { isDesktop: RECEDE_MEDIA, motionOk: "(prefers-reduced-motion: no-preference)" },
        (context) => {
            const { isDesktop, motionOk } = context.conditions as { isDesktop: boolean; motionOk: boolean };
            if (!motionOk) return;

            const content = root.querySelector<HTMLElement>(".hero__content");
            if (content && isDesktop) {
                gsap.to(content, {
                    y: -60,
                    opacity: 0.4,
                    ease: "none",
                    scrollTrigger: { trigger: root, start: "top top", end: "bottom top", scrub: 0.5 },
                });
            }

            const source = root.querySelector<HTMLElement>("[data-wordmark-source]");
            const target = document.querySelector<HTMLElement>("[data-wordmark-target]");
            if (!source || !target) return;

            // Center-to-center offset and scale between the Hero wordmark and the Intro slot.
            const getDelta = () => {
                const from = getLayoutRect(source);
                const to = getLayoutRect(target);

                return {
                    x: to.left + to.width / 2 - (from.left + from.width / 2),
                    y: to.top + to.height / 2 - (from.top + from.height / 2),
                    scale: to.width / from.width,
                };
            };

            document.documentElement.classList.add(TRAVEL_CLASS);

            gsap.to(source, {
                x: () => getDelta().x,
                y: () => getDelta().y,
                scale: () => getDelta().scale,
                transformOrigin: "50% 50%",
                ease: "power1.inOut",
                scrollTrigger: {
                    trigger: root,
                    start: "top top",
                    endTrigger: target,
                    end: "center 45%",
                    scrub: 0.8,
                    invalidateOnRefresh: true,
                },
            });

            return () => document.documentElement.classList.remove(TRAVEL_CLASS);
        },
    );
}

export function useHeroAnimation(rootRef: RefObject<HTMLElement | null>) {
    useIsomorphicLayoutEffect(() => {
        const root = rootRef.current;
        if (!root) return;

        const setState = (state: HeroState) => {
            root.dataset.heroState = state;
        };

        // Reduced motion: show the final Figma composition immediately, no motion at all.
        if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
            setState("static");
            return;
        }

        const ctx = gsap.context(() => {}, root);
        const mm = gsap.matchMedia();
        let cancelled = false;

        waitForFonts().then(() => {
            if (cancelled) return;

            ctx.add(() => playEntrance(root, () => setState("ready"))); // cleanup runs on ctx.revert()
            setupScroll(root, mm);
            ScrollTrigger.refresh();
        });

        return () => {
            cancelled = true;
            ctx.revert(); // kills the entrance, removes the stencil layers and restores inline styles
            mm.revert(); // kills the scroll-linked tweens and their ScrollTriggers
            document.documentElement.classList.remove(TRAVEL_CLASS);
        };
    }, [rootRef]);
}