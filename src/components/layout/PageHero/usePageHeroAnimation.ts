"use client";

import { useEffect, useLayoutEffect, type RefObject } from "react";
import { gsap } from "@/lib/gsap";

// Runs before paint on the client; falls back to useEffect during SSR (where it never runs).
const useIsomorphicLayoutEffect = typeof window !== "undefined" ? useLayoutEffect : useEffect;

type PageHeroState = "pending" | "animating" | "ready" | "static";

const POINTER_MEDIA = "(min-width: 992px) and (hover: hover) and (pointer: fine)";
const GLOW_REACH = { x: 40, y: 24 }; // px: how far the glow leans toward the pointer

/**
 * Entrance (~1.4s), "focus pull": the page opens like a camera finding its subject.
 * - The wave photo settles back from a slightly closer framing while it fades up under the shade.
 * - The green glow blooms into place from a little lower and smaller.
 * - The title comes into focus: from a soft blur and a hair larger to sharp, as a lens pulls focus.
 * Only opacity, transform and one blur filter (on the title, removed at the end) are animated.
 */
function playEntrance(root: HTMLElement, onComplete: () => void) {
    const q = gsap.utils.selector(root);
    const image = q(".page-hero__image");
    const glow = q(".page-hero__glow");
    const title = q(".page-hero__title");

    gsap.set(image, { autoAlpha: 0, scale: 1.08 });
    gsap.set(glow, { autoAlpha: 0, scale: 0.8, yPercent: 8 });
    gsap.set(title, { autoAlpha: 0, scale: 1.04, filter: "blur(14px)" });

    root.dataset.pageHeroState = "animating" satisfies PageHeroState;

    const tl = gsap.timeline({
        onComplete: () => {
            gsap.set([...image, ...glow, ...title], { clearProps: "opacity,visibility,transform,filter" });
            onComplete();
        },
    });

    tl.to(image, { autoAlpha: 1, scale: 1, duration: 1.6, ease: "power2.out" }, 0);
    tl.to(glow, { autoAlpha: 1, scale: 1, yPercent: 0, duration: 1.5, ease: "power3.out" }, 0.1);
    tl.to(title, { autoAlpha: 1, scale: 1, filter: "blur(0px)", duration: 1.1, ease: "expo.out" }, 0.2);
}

/**
 * After the entrance:
 * - Scroll: the title recedes while the hero scrolls away (scrubbed: transform and opacity).
 * - Pointer (desktop, mouse): the glow leans gently toward the pointer and eases back when it leaves.
 * Returns a cleanup for the pointer listeners (the tweens and ScrollTrigger are reverted by the context).
 */
function setupInteractions(root: HTMLElement) {
    const content = root.querySelector<HTMLElement>(".page-hero__content");
    const glow = root.querySelector<HTMLElement>(".page-hero__glow");

    if (content) {
        gsap.to(content, {
            y: -40,
            autoAlpha: 0.35,
            ease: "none",
            scrollTrigger: { trigger: root, start: "top top", end: "bottom top", scrub: 0.5 },
        });
    }

    if (!glow) return () => {};

    const pointerOk = window.matchMedia(POINTER_MEDIA);
    const leanX = gsap.quickTo(glow, "x", { duration: 1.4, ease: "power3.out" });
    const leanY = gsap.quickTo(glow, "y", { duration: 1.4, ease: "power3.out" });

    const onMove = (event: PointerEvent) => {
        if (!pointerOk.matches || event.pointerType !== "mouse") return;
        const bounds = root.getBoundingClientRect();
        leanX(((event.clientX - bounds.left) / bounds.width - 0.5) * 2 * GLOW_REACH.x);
        leanY(((event.clientY - bounds.top) / bounds.height - 0.5) * 2 * GLOW_REACH.y);
    };
    const onLeave = () => {
        leanX(0);
        leanY(0);
    };

    root.addEventListener("pointermove", onMove, { passive: true });
    root.addEventListener("pointerleave", onLeave);

    return () => {
        root.removeEventListener("pointermove", onMove);
        root.removeEventListener("pointerleave", onLeave);
    };
}

export function usePageHeroAnimation(rootRef: RefObject<HTMLElement | null>) {
    useIsomorphicLayoutEffect(() => {
        const root = rootRef.current;
        if (!root) return;

        const setState = (state: PageHeroState) => {
            root.dataset.pageHeroState = state;
        };

        // Reduced motion: the final Figma composition immediately, no motion at all.
        if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
            setState("static");
            return;
        }

        let removeInteractions = () => {};
        const ctx = gsap.context(() => {
            playEntrance(root, () => {
                setState("ready");
                // Added once the entrance has finished, so they never fight its transforms.
                ctx.add(() => {
                    removeInteractions = setupInteractions(root);
                });
            });
        }, root);

        return () => {
            removeInteractions();
            ctx.revert(); // kills the timeline, the scroll tween and its ScrollTrigger; restores inline styles
            setState("pending");
        };
    }, [rootRef]);
}