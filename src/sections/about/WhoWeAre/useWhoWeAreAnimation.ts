"use client";

import { useEffect, useLayoutEffect, type RefObject } from "react";
import { gsap, ScrollTrigger, SplitText } from "@/lib/gsap";

// Runs before paint on the client; falls back to useEffect during SSR (where it never runs).
const useIsomorphicLayoutEffect = typeof window !== "undefined" ? useLayoutEffect : useEffect;

type WhoState = "pending" | "armed" | "done" | "static";

/**
 * "Lock on" entrance, in three beats, each played once when it comes into view:
 * 1. The frame locks on: the two corner marks slide in and settle like viewfinder brackets; the badge
 *    rolls into place (a quarter turn while it grows) and the triangle lights up in it; the pill opens
 *    from its centre; the title is wiped in line by line through a soft-edged mask; the intro lines rise
 *    from their baselines; the sphere drifts in from the right edge.
 * 2. The story (left column) rises line by line when it reaches the screen.
 * 3. The photo rises into its notched frame while it settles back from a closer framing.
 * The text is split into lines only when its beat starts (the web fonts are loaded by then, so the
 * lines match the final layout). Only transforms, opacity and three CSS variables (mask / clip
 * positions) are animated; the line wrappers are removed and every inline style is cleared once the
 * three beats have played.
 */
function setupEntrance(root: HTMLElement, ctx: gsap.Context, onDone: () => void) {
    const q = gsap.utils.selector(root);
    const one = <T extends Element>(selector: string) => root.querySelector<T>(selector);

    const cornerStart = q(".who-we-are__corner--start");
    const cornerEnd = q(".who-we-are__corner--end");
    const badge = q(".who-we-are__badge");
    const mark = q(".who-we-are__badge-mark");
    const eyebrow = q(".who-we-are__eyebrow");
    const title = one<HTMLElement>(".who-we-are__title");
    const intro = one<HTMLElement>(".who-we-are__intro");
    const story = q(".who-we-are__story .who-we-are__text") as HTMLElement[];
    const storyBox = one<HTMLElement>(".who-we-are__story");
    const media = one<HTMLElement>(".who-we-are__media");
    const mediaDepth = q(".who-we-are__media-depth");
    const sphere = q(".who-we-are__sphere");
    const grid = one<HTMLElement>(".who-we-are__grid");
    const texts = [title, intro, ...story].filter((el): el is HTMLElement => Boolean(el));

    // ---------- Initial states (the copy stays hidden as a whole until its beat splits it) ----------
    gsap.set(cornerStart, { autoAlpha: 0, x: -24, y: -24 });
    gsap.set(cornerEnd, { autoAlpha: 0, x: 24, y: -24 });
    gsap.set(badge, { autoAlpha: 0, scale: 0.7, rotation: -90 });
    gsap.set(mark, { autoAlpha: 0, scale: 0.4 });
    gsap.set(eyebrow, { "--pill-open": "50%" });
    gsap.set(texts, { autoAlpha: 0 });
    gsap.set(sphere, { autoAlpha: 0, x: 80 });
    if (media) gsap.set(media, { "--media-reveal": "100%" });
    gsap.set(mediaDepth, { scale: 1.15 });

    // Lines as their own targets (screen readers keep reading each block as one text: aria "auto").
    const splits: SplitText[] = [];
    const splitLines = (el: HTMLElement | null, masked: boolean) => {
        if (!el) return [];
        const split = SplitText.create(el, {
            type: "lines",
            linesClass: masked ? "who-we-are__line" : "who-we-are__title-line",
            aria: "auto",
            ...(masked ? { mask: "lines" as const } : {}),
        });
        splits.push(split);
        gsap.set(el, { autoAlpha: 1 });
        return split.lines as HTMLElement[];
    };

    // ---------- Beats ----------
    let remaining = 3;
    const finish = () => {
        remaining -= 1;
        if (remaining > 0) return;

        gsap.set([...cornerStart, ...cornerEnd, ...badge, ...mark], { clearProps: "opacity,visibility,transform" });
        gsap.set(eyebrow, { clearProps: "--pill-open" });
        gsap.set(texts, { clearProps: "opacity,visibility" });
        // The sphere and the photo keep their transforms: the scroll depth also moves them (clearing a
        // single transform property would clear the whole transform until the next scroll update).
        gsap.set(sphere, { clearProps: "opacity,visibility" });
        if (media) gsap.set(media, { clearProps: "--media-reveal" });
        splits.forEach((split) => split.revert());
        onDone();
    };

    const beat = (trigger: Element | null, start: string, build: (tl: gsap.core.Timeline) => void) => {
        ScrollTrigger.create({
            trigger: trigger ?? root,
            start,
            end: "max",
            once: true,
            // Added to the context: the timeline and the splits are reverted with it (e.g. on unmount).
            onEnter: () =>
                ctx.add(() => {
                    const tl = gsap.timeline({ defaults: { ease: "power3.out" }, onComplete: finish });
                    build(tl);
                }),
        });
    };

    // 1. The frame locks on.
    beat(grid, "top 75%", (tl) => {
        const titleLines = splitLines(title, false);
        const introLines = splitLines(intro, true);
        gsap.set(titleLines, { "--wipe": "0%", x: -18 });
        gsap.set(introLines, { yPercent: 100 });

        tl.to([...cornerStart, ...cornerEnd], { autoAlpha: 1, x: 0, y: 0, duration: 0.8, ease: "expo.out" }, 0);
        tl.to(badge, { autoAlpha: 1, scale: 1, rotation: 0, duration: 1.2, ease: "expo.out" }, 0.1);
        tl.to(mark, { autoAlpha: 1, scale: 1, duration: 0.6, ease: "back.out(2)" }, 0.5);
        tl.to(eyebrow, { "--pill-open": "0%", duration: 0.7, ease: "power3.inOut" }, 0.15);
        tl.to(titleLines, { "--wipe": "120%", x: 0, duration: 0.9, stagger: 0.12, ease: "power2.out" }, 0.3);
        tl.to(introLines, { yPercent: 0, duration: 0.8, stagger: 0.06, ease: "expo.out" }, 0.6);
        tl.to(sphere, { autoAlpha: 1, x: 0, duration: 1.4, ease: "expo.out" }, 0.4);
    });

    // 2. The story rises.
    beat(storyBox, "top 80%", (tl) => {
        const storyLines = story.flatMap((el) => splitLines(el, true));
        gsap.set(storyLines, { yPercent: 100 });
        tl.to(storyLines, { yPercent: 0, duration: 0.8, stagger: 0.05, ease: "expo.out" }, 0);
    });

    // 3. The photo rises into its frame.
    beat(media, "top 85%", (tl) => {
        if (media) tl.to(media, { "--media-reveal": "0%", duration: 1.2, ease: "expo.inOut" }, 0);
        tl.to(mediaDepth, { scale: 1, duration: 1.6, ease: "expo.out" }, 0.1);
    });
}

const POINTER_MEDIA = "(min-width: 992px) and (hover: hover) and (pointer: fine)";

/**
 * "Orbit": the section's objects keep moving, gently, for as long as it is on screen.
 *
 * Idle (continuous, only while the section is visible; seamless loops):
 * - the badge's text ring turns a full circle every 24s;
 * - the sphere floats (14px up and down, 3.4s) and sways around its axis (±6°, 5.3s; the periods
 *   never line up, so the motion never visibly repeats);
 * - the purple light over it breathes with the float: a little brighter and wider as the sphere rises.
 *
 * Scroll (scrubbed): depth. The sphere crosses the screen faster than the page (y +60 → −60px), turns
 * (−12° → 12°) and comes closer, then recedes (scale 0.92 → 1 at the middle → 0.95); its light follows
 * more slowly (y +30 → −30px), so it drifts over the sphere as you scroll. At the middle of the scroll
 * (the section centred on screen) both are at their Figma place. The photo moves a little inside its
 * frame (it is 12% taller than the frame, so its edges never show).
 *
 * Pointer (desktop, mouse): the sphere leans toward the pointer (up to 18 × 12px and 4°), the light
 * less (8px, sideways): the nearer object moves more, which gives the depth.
 *
 * Each source moves its own layer (the sphere box, its "lean" layer, its image; the glow box and the
 * light inside it), so they never fight. Transforms and opacity only.
 * Returns a cleanup for the pointer listeners (tweens and ScrollTriggers are reverted by the context).
 */
function setupMotion(root: HTMLElement) {
    const one = <T extends Element>(selector: string) => root.querySelector<T>(selector);
    const ring = one(".who-we-are__badge-ring");
    const sphere = one(".who-we-are__sphere");
    const sphereLean = one(".who-we-are__sphere-lean");
    const sphereImg = one(".who-we-are__sphere-img");
    const glow = one(".who-we-are__glow");
    const light = one(".who-we-are__glow-light");
    const media = one(".who-we-are__media");
    const mediaDepth = one(".who-we-are__media-depth");

    // ---------- Idle ----------
    const idle = gsap.timeline({ paused: true });
    const loop = { ease: "sine.inOut", yoyo: true, repeat: -1 } as const;
    if (ring) idle.to(ring, { rotation: 360, transformOrigin: "50% 50%", duration: 24, ease: "none", repeat: -1 }, 0);
    if (sphereImg) {
        gsap.set(sphereImg, { y: 7, rotation: -6 }); // start at the bottom of the float, left of the sway
        idle.to(sphereImg, { y: -7, duration: 3.4, ...loop }, 0);
        idle.to(sphereImg, { rotation: 6, duration: 5.3, ...loop }, 0);
    }
    if (light) {
        gsap.set(light, { opacity: 0.85, scale: 0.97, transformOrigin: "50% 50%" });
        idle.to(light, { opacity: 1, scale: 1.03, duration: 3.4, ...loop }, 0);
    }

    ScrollTrigger.create({
        trigger: root,
        start: "top bottom",
        end: "bottom top",
        onToggle: (self) => (self.isActive ? idle.play() : idle.pause()),
    });

    // ---------- Scroll depth ----------
    const section = { trigger: root, start: "top bottom", end: "bottom top", scrub: 0.6 };

    if (sphere) {
        const depth = gsap.timeline({ scrollTrigger: section, defaults: { ease: "none" } });
        depth.fromTo(sphere, { y: 60, rotation: -12 }, { y: -60, rotation: 12, duration: 1 }, 0);
        depth.fromTo(sphere, { scale: 0.92 }, { scale: 1, duration: 0.5, ease: "sine.out" }, 0);
        depth.to(sphere, { scale: 0.95, duration: 0.5, ease: "sine.in" }, 0.5);
    }
    if (glow) gsap.fromTo(glow, { y: 30 }, { y: -30, ease: "none", scrollTrigger: section });
    if (mediaDepth) {
        gsap.fromTo(mediaDepth, { yPercent: -5 }, { yPercent: 5, ease: "none", scrollTrigger: { ...section, trigger: media ?? root } });
    }

    // ---------- Pointer ----------
    const pointerOk = window.matchMedia(POINTER_MEDIA);
    if (!sphereLean || !glow) return () => {};

    const lean = { duration: 1.2, ease: "power3.out" };
    const sphereX = gsap.quickTo(sphereLean, "x", lean);
    const sphereY = gsap.quickTo(sphereLean, "y", lean);
    const sphereTurn = gsap.quickTo(sphereLean, "rotation", lean);
    const glowX = gsap.quickTo(glow, "x", { duration: 1.6, ease: "power3.out" });

    const onMove = (event: PointerEvent) => {
        if (!pointerOk.matches || event.pointerType !== "mouse") return;
        const bounds = root.getBoundingClientRect();
        const dx = ((event.clientX - bounds.left) / bounds.width - 0.5) * 2; // −1 … 1
        const dy = ((event.clientY - bounds.top) / bounds.height - 0.5) * 2;
        sphereX(dx * 18);
        sphereY(dy * 12);
        sphereTurn(dx * 4);
        glowX(dx * 8); // the glow's y belongs to the scroll depth; its pointer lean is horizontal only
    };
    const onLeave = () => {
        sphereX(0);
        sphereY(0);
        sphereTurn(0);
        glowX(0);
    };

    root.addEventListener("pointermove", onMove, { passive: true });
    root.addEventListener("pointerleave", onLeave);

    return () => {
        root.removeEventListener("pointermove", onMove);
        root.removeEventListener("pointerleave", onLeave);
    };
}

export function useWhoWeAreAnimation(rootRef: RefObject<HTMLElement | null>) {
    useIsomorphicLayoutEffect(() => {
        const root = rootRef.current;
        if (!root) return;

        const setState = (state: WhoState) => {
            root.dataset.whoState = state;
        };

        // Reduced motion: the final Figma composition straight away: no entrance, no idle or scroll motion.
        if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
            setState("static");
            return;
        }

        let removePointer = () => {};
        const ctx = gsap.context(() => {}, root);
        ctx.add(() => {
            removePointer = setupMotion(root);
            setupEntrance(root, ctx, () => setState("done"));
        });
        setState("armed"); // initial states are applied; the CSS pre-hide is lifted (masks on while revealing)

        return () => {
            removePointer();
            ctx.revert(); // kills the beats, the idle loops, the scroll depth and their ScrollTriggers; reverts splits and inline styles
            setState("pending");
        };
    }, [rootRef]);
}