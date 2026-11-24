"use client";

import { useEffect, useLayoutEffect, type RefObject } from "react";
import { gsap, ScrollTrigger, SplitText } from "@/lib/gsap";
import { setupSmoke } from "./smokeRenderer";

// Runs before paint on the client; falls back to useEffect during SSR (where it never runs).
const useIsomorphicLayoutEffect = typeof window !== "undefined" ? useLayoutEffect : useEffect;

type ServeState = "pending" | "armed" | "done" | "static";

// Desktop pointers only: the card light follows a mouse, never a finger.
const POINTER_MEDIA = "(hover: hover) and (pointer: fine)";

/**
 * "Sketch & light" entrance, once, when the section comes into view:
 * - the two lights bloom in (scale and opacity);
 * - the eyebrow rises from its baseline; the title follows letter by letter through a line mask;
 * - the cards rise one after the other, tilting up from a slight backward lean;
 * - in each card the icon draws itself stroke by stroke, then the title and the text rise in.
 * The title is split only when the entrance starts (the web fonts are loaded by then). Transforms,
 * opacity and stroke-dashoffset only; the split is reverted and the inline styles cleared at the end,
 * so the CSS hover owns the cards afterwards.
 */
function setupEntrance(root: HTMLElement, ctx: gsap.Context, onDone: () => void) {
    const q = gsap.utils.selector(root);

    const header = q(".who-we-serve__header")[0] as HTMLElement | undefined;
    const eyebrow = q(".who-we-serve__eyebrow")[0] as HTMLElement | undefined;
    const title = q(".who-we-serve__title")[0] as HTMLElement | undefined;
    const glows = q(".who-we-serve__glow") as HTMLElement[];
    const cards = q(".who-we-serve__card") as HTMLElement[];
    const shapes = Array.from(root.querySelectorAll<SVGElement>(".who-we-serve__shape"));
    const cardCopy = q(".who-we-serve__card-title, .who-we-serve__card-text") as HTMLElement[];

    // ---------- Initial states (the title stays hidden as a whole until it is split) ----------
    gsap.set(glows, { autoAlpha: 0, scale: 0.75 });
    if (eyebrow) gsap.set(eyebrow, { autoAlpha: 0, y: 16 });
    if (title) gsap.set(title, { autoAlpha: 0 });
    gsap.set(cards, { autoAlpha: 0, y: 70, rotationX: 14, transformPerspective: 900, transformOrigin: "50% 100%" });
    gsap.set(shapes, { strokeDasharray: "1 1.1", strokeDashoffset: 1.05 });
    gsap.set(cardCopy, { autoAlpha: 0, y: 14 });

    ScrollTrigger.create({
        trigger: header ?? root,
        start: "top 85%",
        end: "max",
        once: true,
        // Added to the context: the timeline and the split are reverted with it (e.g. on unmount).
        onEnter: () =>
            ctx.add(() => {
                let split: SplitText | null = null;
                let chars: HTMLElement[] = [];
                if (title) {
                    split = SplitText.create(title, { type: "lines,chars", mask: "lines", aria: "auto" });
                    chars = split.chars as HTMLElement[];
                    gsap.set(title, { autoAlpha: 1 });
                    gsap.set(chars, { yPercent: 110 });
                }

                const tl = gsap.timeline({
                    defaults: { ease: "expo.out" },
                    onComplete: () => {
                        split?.revert();
                        // The lights keep their transform: the scroll drift also moves them.
                        gsap.set(glows, { clearProps: "opacity,visibility" });
                        gsap.set([eyebrow, title].filter(Boolean), { clearProps: "opacity,visibility,transform" });
                        gsap.set(cards, { clearProps: "opacity,visibility,transform" });
                        gsap.set(shapes, { clearProps: "strokeDasharray,strokeDashoffset" });
                        gsap.set(cardCopy, { clearProps: "opacity,visibility,transform" });
                        onDone();
                    },
                });

                tl.to(glows, { autoAlpha: 1, scale: 1, duration: 1.4, stagger: 0.1, ease: "power2.out" }, 0);
                if (eyebrow) tl.to(eyebrow, { autoAlpha: 1, y: 0, duration: 0.7 }, 0);
                if (chars.length) tl.to(chars, { yPercent: 0, duration: 0.75, stagger: 0.022 }, 0.1);

                cards.forEach((card, index) => {
                    const at = 0.35 + index * 0.09;
                    const cardShapes = Array.from(card.querySelectorAll<SVGElement>(".who-we-serve__shape"));
                    const copy = Array.from(card.querySelectorAll<HTMLElement>(".who-we-serve__card-title, .who-we-serve__card-text"));

                    tl.to(card, { autoAlpha: 1, y: 0, rotationX: 0, duration: 0.95 }, at);
                    tl.to(cardShapes, { strokeDashoffset: 0, duration: 0.6, stagger: 0.05, ease: "power2.inOut" }, at + 0.25);
                    tl.to(copy, { autoAlpha: 1, y: 0, duration: 0.6, stagger: 0.07, ease: "power3.out" }, at + 0.3);
                });
            }),
    });
}

/**
 * Scroll drift (scrubbed): the green light sinks and the purple light rises while the section passes,
 * so the panel's lighting shifts slightly with the scroll. Transforms only.
 */
function setupDrift(root: HTMLElement) {
    const scrub = { trigger: root, start: "top bottom", end: "bottom top", scrub: 0.8 };
    gsap.fromTo(".who-we-serve__glow--green", { y: -60 }, { y: 60, ease: "none", scrollTrigger: scrub });
    gsap.fromTo(".who-we-serve__glow--purple", { y: 60 }, { y: -60, ease: "none", scrollTrigger: { ...scrub } });
}

/**
 * Pointer light (desktop only, not defined in Figma): a soft light inside the hovered card follows
 * the cursor, as if the glass caught it. Two CSS variables per card; nothing runs while the pointer
 * is elsewhere.
 */
function setupPointerLight(root: HTMLElement) {
    const cleanups = gsap.utils.toArray<HTMLElement>(".who-we-serve__card", root).map((card) => {
        const setX = gsap.quickSetter(card, "--light-x", "px");
        const setY = gsap.quickSetter(card, "--light-y", "px");
        const onMove = (event: PointerEvent) => {
            const rect = card.getBoundingClientRect();
            setX(event.clientX - rect.left);
            setY(event.clientY - rect.top);
        };
        card.addEventListener("pointermove", onMove);
        return () => card.removeEventListener("pointermove", onMove);
    });

    return () => cleanups.forEach((cleanup) => cleanup());
}

export function useWhoWeServeAnimation(rootRef: RefObject<HTMLElement | null>) {
    useIsomorphicLayoutEffect(() => {
        const root = rootRef.current;
        if (!root) return;

        const setState = (state: ServeState) => {
            root.dataset.serveState = state;
        };

        // Reduced motion: the Figma layout straight away (with the still smoke texture): no entrance, no
        // moving smoke, no drift, no pointer light.
        if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
            setState("static");
            return;
        }

        const smoke = root.querySelector<HTMLCanvasElement>(".who-we-serve__smoke");
        let stopSmoke = () => {};

        const ctx = gsap.context(() => {}, root);
        ctx.add(() => {
            // The canvas takes over from the still texture once its first frame is drawn (CSS cross-fade).
            if (smoke) stopSmoke = setupSmoke(smoke, root, () => (root.dataset.smoke = "on"));
            setupDrift(root);
            setupEntrance(root, ctx, () => setState("done"));
        });
        setState("armed"); // initial states are applied; the CSS pre-hide is lifted

        const mm = gsap.matchMedia();
        mm.add(POINTER_MEDIA, () => setupPointerLight(root));

        return () => {
            mm.revert();
            stopSmoke();
            delete root.dataset.smoke;
            ctx.revert(); // kills the entrance, the drift and their ScrollTriggers; reverts the split and inline styles
            setState("pending");
        };
    }, [rootRef]);
}