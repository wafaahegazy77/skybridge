"use client";

import { useEffect, useLayoutEffect, type RefObject } from "react";
import { gsap, ScrollTrigger, SplitText } from "@/lib/gsap";

// Runs before paint on the client; falls back to useEffect during SSR (where it never runs).
const useIsomorphicLayoutEffect = typeof window !== "undefined" ? useLayoutEffect : useEffect;

type FeaturesState = "pending" | "armed" | "done" | "static";

const LEAD_DIM = "#c5c5c5"; // the lead words start in the grey of their sentence, then light up

/**
 * "Glass panes" entrance, once per card when it comes into view:
 * - the pane opens from its middle (top and bottom edges part) while it rises 40px into place;
 * - the photo is uncovered from the card's outer edge as it settles back from a closer framing;
 * - the title is wiped in line by line through a soft-edged mask; the copy rises line by line from
 *   its baselines; in the first card the lead words then light up from grey to white, one point
 *   after the other;
 * - each paragraph's list bullet pops in just before its first line rises;
 * - the contour rings appear from the inside out, each to its own Figma opacity.
 * The copy is split into lines only when its card plays (the web fonts are loaded by then, so the
 * lines match the final layout). Transforms, opacity, one colour and CSS variables only; the line
 * wrappers are removed and the inline styles cleared when the card has played.
 */
function setupCard(card: HTMLElement, ctx: gsap.Context, onDone: () => void) {
    const one = <T extends Element>(selector: string) => card.querySelector<T>(selector);
    const all = <T extends Element>(selector: string) => Array.from(card.querySelectorAll<T>(selector));

    const media = one<HTMLElement>(".about-feature__media");
    const mediaDepth = one<HTMLElement>(".about-feature__media-depth");
    const title = one<HTMLElement>(".about-feature__title");
    const texts = all<HTMLElement>(".about-feature__text");
    const leads = all<HTMLElement>(".about-feature__lead");
    const rings = all<SVGPathElement>(".about-feature__ring");
    const copy = [title, ...texts].filter((el): el is HTMLElement => Boolean(el));

    // ---------- Initial states (the copy stays hidden as a whole until the card splits it) ----------
    gsap.set(card, { "--card-open": "50%", y: 40 });
    if (media) gsap.set(media, { "--media-open": "100%" });
    if (mediaDepth) gsap.set(mediaDepth, { scale: 1.2 });
    gsap.set(copy, { autoAlpha: 0 });
    // Only the first card has rings and lead words (GSAP warns about empty targets).
    if (rings.length) gsap.set(rings, { opacity: 0 });

    ScrollTrigger.create({
        trigger: card,
        start: "top 80%",
        end: "max",
        once: true,
        // Added to the context: the timeline and the splits are reverted with it (e.g. on unmount).
        onEnter: () =>
            ctx.add(() => {
                const splits: SplitText[] = [];
                const split = (el: HTMLElement, masked: boolean) => {
                    const result = SplitText.create(el, {
                        type: "lines",
                        linesClass: masked ? "about-feature__line" : "about-feature__title-line",
                        aria: "auto",
                        ...(masked ? { mask: "lines" as const } : {}),
                    });
                    splits.push(result);
                    gsap.set(el, { autoAlpha: 1 });
                    return result.lines as HTMLElement[];
                };

                const titleLines = title ? split(title, false) : [];
                const textLines = texts.flatMap((el) => split(el, true));
                gsap.set(titleLines, { "--wipe": "0%", x: -18 });
                gsap.set(textLines, { yPercent: 100 });
                gsap.set(texts, { "--bullet": 0 });
                if (leads.length) gsap.set(leads, { color: LEAD_DIM });

                const tl = gsap.timeline({
                    defaults: { ease: "power3.out" },
                    onComplete: () => {
                        gsap.set(card, { clearProps: "--card-open,transform" });
                        if (media) gsap.set(media, { clearProps: "--media-open" });
                        // The photo keeps its transform: the scroll depth also moves it.
                        gsap.set(copy, { clearProps: "opacity,visibility" });
                        gsap.set(texts, { clearProps: "--bullet" });
                        if (leads.length) gsap.set(leads, { clearProps: "color" });
                        splits.forEach((s) => s.revert());
                        // The rings now hold their Figma opacities: the idle wave can take over from there.
                        if (rings.length) ctx.add(() => startWave(card, rings));
                        onDone();
                    },
                });

                tl.to(card, { "--card-open": "0%", duration: 1.1, ease: "expo.inOut" }, 0);
                tl.to(card, { y: 0, duration: 1.3, ease: "expo.out" }, 0);
                if (media) tl.to(media, { "--media-open": "0%", duration: 1.1, ease: "expo.inOut" }, 0.25);
                if (mediaDepth) tl.to(mediaDepth, { scale: 1, duration: 1.6, ease: "expo.out" }, 0.25);
                tl.to(titleLines, { "--wipe": "120%", x: 0, duration: 0.9, stagger: 0.12, ease: "power2.out" }, 0.45);
                tl.to(texts, { "--bullet": 1, duration: 0.45, stagger: 0.1, ease: "back.out(3)" }, 0.6);
                tl.to(textLines, { yPercent: 0, duration: 0.8, stagger: 0.05, ease: "expo.out" }, 0.65);
                if (leads.length) tl.to(leads, { color: "#fff", duration: 0.6, stagger: 0.15, ease: "power1.out" }, 1.1);
                if (rings.length) {
                    tl.to(
                        rings,
                        {
                            opacity: (_index: number, ring: SVGPathElement) => Number(ring.dataset.opacity ?? 1),
                            duration: 0.6,
                            stagger: 0.04,
                            ease: "power1.out",
                        },
                        0.5,
                    );
                }
            }),
    });
}

/**
 * Idle wave (continuous, only while the card is on screen; started once the rings have appeared): a
 * slow wave runs outward through the contour rings, each ring dimming to 45% of its Figma opacity and
 * back, one after the other, like a signal travelling through the card. Opacity only.
 */
function startWave(card: HTMLElement, rings: SVGPathElement[]) {
    const wave = gsap.timeline({ paused: true });
    wave.to(rings, {
        opacity: (_index: number, ring: SVGPathElement) => Number(ring.dataset.opacity ?? 1) * 0.45,
        duration: 1.4,
        ease: "sine.inOut",
        stagger: { each: 0.18, repeat: -1, yoyo: true },
    });

    const visibility = ScrollTrigger.create({
        trigger: card,
        start: "top bottom",
        end: "bottom top",
        onToggle: (self) => (self.isActive ? wave.play() : wave.pause()),
    });
    if (visibility.isActive) wave.play();
}

/**
 * Scroll depth (scrubbed): each photo moves a little inside its frame (it is 12% taller than the
 * frame, so its edges never show).
 */
function setupDepth(root: HTMLElement) {
    gsap.utils.toArray<HTMLElement>(".about-feature__media", root).forEach((media) => {
        const depth = media.querySelector(".about-feature__media-depth");
        if (!depth) return;
        gsap.fromTo(
            depth,
            { yPercent: -5 },
            { yPercent: 5, ease: "none", scrollTrigger: { trigger: media, start: "top bottom", end: "bottom top", scrub: 0.6 } },
        );
    });
}

export function useFeaturesAnimation(rootRef: RefObject<HTMLElement | null>) {
    useIsomorphicLayoutEffect(() => {
        const root = rootRef.current;
        if (!root) return;

        const setState = (state: FeaturesState) => {
            root.dataset.featuresState = state;
        };

        // Reduced motion: the Figma cards straight away: no entrance, no idle or scroll motion.
        if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
            setState("static");
            return;
        }

        const cards = gsap.utils.toArray<HTMLElement>(".about-feature", root);
        let remaining = cards.length;

        const ctx = gsap.context(() => {}, root);
        ctx.add(() => {
            setupDepth(root);
            cards.forEach((card) =>
                setupCard(card, ctx, () => {
                    remaining -= 1;
                    if (remaining === 0) setState("done");
                }),
            );
        });
        setState("armed"); // initial states are applied; the CSS pre-hide is lifted (clips on while revealing)

        return () => {
            ctx.revert(); // kills the entrances, the wave, the scroll depth and their ScrollTriggers; reverts splits and inline styles
            setState("pending");
        };
    }, [rootRef]);
}