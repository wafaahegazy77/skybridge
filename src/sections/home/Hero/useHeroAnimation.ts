"use client";

import { useEffect, useLayoutEffect, type RefObject } from "react";
import { gsap, ScrollTrigger } from "@/lib/gsap";

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

/**
 * "Contour" entrance (~1.5s). The headline is first drawn as a thin green contour — the same
 * language as the contour lines behind it — then the solid white type pours in from the top
 * and the contour dissolves. Everything else opens like an aperture from its own center:
 * the label pill, the buttons and the wordmark. Depth comes from layers settling from a
 * slightly larger scale. Only clip-path, transform, opacity and stroke offsets are animated.
 */
function playEntrance(root: HTMLElement, onComplete: () => void) {
    const q = gsap.utils.selector(root);

    const glows = q(".hero__glows");
    const linesField = q(".hero__lines");
    const lines = q(".hero__line");
    const eyebrow = q(".hero__eyebrow");
    const eyebrowText = q(".hero__eyebrow-text");
    const outline = q(".hero__title-outline");
    const title = q(".hero__title");
    const actions = q(".hero__action");
    const wordmarkMask = q(".hero__wordmark-mask");
    const wordmarkImage = q(".hero__wordmark-img");

    // ---------- Initial states (applied before the section becomes visible) ----------
    gsap.set(glows, { autoAlpha: 0, scale: 0.92, willChange: "opacity, transform" });
    gsap.set(linesField, { scale: 1.04 });
    gsap.set(lines, { strokeDasharray: 1, strokeDashoffset: 1 });
    gsap.set(eyebrow, { clipPath: "inset(0% 50% 0% 50% round 40px)" });
    gsap.set(eyebrowText, { clipPath: "inset(0% 50% 0% 50%)" });
    gsap.set(outline, { clipPath: "inset(0% 50% 0% 50%)", scale: 1.03 });
    gsap.set(title, { clipPath: "inset(0% 0% 100% 0%)" });
    gsap.set(actions, { clipPath: "inset(0% 50% 0% 50% round 30px)" });
    gsap.set(wordmarkMask, { clipPath: "inset(50% 0% 50% 0%)" });
    gsap.set(wordmarkImage, { scale: 1.06 });

    root.dataset.heroState = "animating" satisfies HeroState;

    const tl = gsap.timeline({
        defaults: { ease: "power3.inOut" },
        onComplete: () => {
            gsap.set([...eyebrow, ...eyebrowText, ...title, ...actions, ...wordmarkMask], { clearProps: "clipPath" });
            gsap.set([...outline, ...wordmarkImage], { clearProps: "all" });
            gsap.set(lines, { clearProps: "strokeDasharray,strokeDashoffset" });
            gsap.set(glows, { clearProps: "opacity,visibility,transform,willChange" });
            gsap.set(linesField, { clearProps: "transform" });
            onComplete(); // state "ready" hides the outline copy entirely
        },
    });

    // Atmosphere: glows rise, the contour field draws outward from its center line and settles back in depth.
    tl.to(glows, { autoAlpha: 1, scale: 1, duration: 1.2, ease: "power2.out" }, 0);
    tl.to(lines, { strokeDashoffset: 0, duration: 1.1, ease: "power2.out", stagger: { each: 0.008, from: "center" } }, 0);
    tl.to(linesField, { scale: 1, duration: 1.4, ease: "power2.out" }, 0);

    // Label: the pill opens from its center, its text follows a beat later.
    tl.to(eyebrow, { clipPath: "inset(0% 0% 0% 0% round 40px)", duration: 0.55 }, 0.05);
    tl.to(eyebrowText, { clipPath: "inset(0% 0% 0% 0%)", duration: 0.5 }, 0.15);

    // Headline: the green contour opens from the center and settles into place…
    tl.to(outline, { clipPath: "inset(0% 0% 0% 0%)", duration: 0.6 }, 0.2);
    tl.to(outline, { scale: 1, duration: 0.9, ease: "power2.out" }, 0.2);
    // …then the solid type pours in from the top, and the contour dissolves underneath it.
    tl.to(title, { clipPath: "inset(0% 0% 0% 0%)", duration: 0.75, ease: "power2.inOut" }, 0.55);
    tl.to(outline, { opacity: 0, duration: 0.35, ease: "power1.out" }, 1.1);

    // Actions open from their centers.
    tl.to(actions, { clipPath: "inset(0% 0% 0% 0% round 30px)", duration: 0.5, stagger: 0.08 }, 0.75);

    // Wordmark: a horizontal aperture opens across it while it settles back in depth.
    tl.to(wordmarkMask, { clipPath: "inset(0% 0% 0% 0%)", duration: 0.8 }, 0.7);
    tl.to(wordmarkImage, { scale: 1, duration: 1, ease: "power2.out" }, 0.7);
}

/**
 * Ambient life for the contour field. Only the "drift" layer (every other line) moves; the
 * "base" layer stays still, so neighbouring lines slowly slide past each other like a wave.
 * y, x and a hair of rotation run on separate sine cycles whose periods never line up, so
 * the motion never visibly repeats (rotation also makes the left and right ends move in
 * opposite directions, which reads as an undulation rather than a block sliding).
 *
 * Cost control:
 * - Transform-only on one composited layer: no repaint, no filters, no per-line DOM work.
 * - The motion is so slow (< 3px/s) that a step is ~0.1px at 20Hz, which is invisible, so the
 *   timeline is advanced at AMBIENT_FPS instead of every frame. The browser then composites
 *   a new frame only 20 times a second while idle, leaving the rest of the frames free.
 * - Starts only after the entrance, and stops whenever the Hero is off screen.
 * Returns start() for the entrance to hand over to, and dispose() for cleanup.
 */
const AMBIENT_FPS = 20;

function setupAmbient(root: HTMLElement) {
    const layer = root.querySelector<SVGSVGElement>(".hero__lines-layer--drift");
    if (!layer) return { start: () => {}, dispose: () => {} };

    const loop = { ease: "sine.inOut", yoyo: true, repeat: -1 } as const;
    const motion = gsap.timeline({ paused: true });
    motion.to(layer, { y: 12, duration: 6.5, ...loop }, 0); // 13s cycle
    motion.to(layer, { x: 18, duration: 9.5, ...loop }, 0); // 19s cycle
    motion.to(layer, { rotation: 0.35, transformOrigin: "50% 50%", duration: 14.5, ...loop }, 0); // 29s cycle

    let started = false;
    let visible = true;
    let elapsed = 0;
    let lastStep = 0;

    const step = (time: number, deltaTime: number) => {
        if (!started || !visible) return;
        elapsed += Math.min(deltaTime, 100) / 1000; // ignore long gaps (background tab, resume)
        if (time - lastStep < 1 / AMBIENT_FPS) return;
        lastStep = time;
        motion.totalTime(elapsed);
    };

    gsap.ticker.add(step);

    const trigger = ScrollTrigger.create({
        trigger: root,
        start: "top bottom",
        end: "bottom top",
        onToggle: (self) => (visible = self.isActive),
        onRefresh: (self) => (visible = self.isActive),
    });

    return {
        start: () => {
            started = true;
        },
        dispose: () => {
            gsap.ticker.remove(step);
            trigger.kill();
        },
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

            ctx.add(() => {
                const ambient = setupAmbient(root);
                playEntrance(root, () => {
                    setState("ready");
                    ambient.start(); // the contour field starts breathing once the entrance has settled
                });
                return ambient.dispose; // called by ctx.revert()
            });
            setupScroll(root, mm);
            ScrollTrigger.refresh();
        });

        return () => {
            cancelled = true;
            ctx.revert(); // kills the entrance and the ambient (timeline, ticker listener, ScrollTrigger); restores inline styles
            mm.revert(); // kills the scroll-linked tweens and their ScrollTriggers
            document.documentElement.classList.remove(TRAVEL_CLASS);
        };
    }, [rootRef]);
}