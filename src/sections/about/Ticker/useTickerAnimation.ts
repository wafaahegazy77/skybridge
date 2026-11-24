"use client";

import { useEffect, useLayoutEffect, type RefObject } from "react";
import { gsap, ScrollTrigger } from "@/lib/gsap";

// Runs before paint on the client; falls back to useEffect during SSR (where it never runs).
const useIsomorphicLayoutEffect = typeof window !== "undefined" ? useLayoutEffect : useEffect;

type TickerState = "pending" | "running" | "open" | "static";

const START = -192; // px: Figma starts the band 192px left of the frame (first item partly off-screen)
const SPEED = 60; // px/s at rest
const BOOST = { per: 250, max: 6, decay: 0.92 }; // scroll speed (px/s) per extra ×1, cap, decay per frame

/**
 * The green band as an endless marquee, "the bridge in motion":
 * - It drifts right to left at a calm reading pace.
 * - Scrolling pushes it: it speeds up with the scroll speed (up to 7×) and follows the scroll
 *   direction (down: right to left, up: left to right), then eases back to its calm pace.
 * - Entrance: the band opens from its centre outward (clip-path), just after the hero title.
 * Cost control: one transform on one element, advanced on GSAP's ticker only while the band is on
 * screen. The phrase set is repeated (server-rendered copies), so the loop is seamless: the track
 * wraps by exactly one set width.
 */
function setupMarquee(root: HTMLElement) {
    const track = root.querySelector<HTMLElement>(".about-ticker__track");
    const group = root.querySelector<HTMLElement>(".about-ticker__group");
    if (!track || !group) return () => {};

    const setX = gsap.quickSetter(track, "x", "px");
    let setWidth = group.offsetWidth;
    let wrap = gsap.utils.wrap(-setWidth, 0);
    let x = wrap(START);
    let direction = 1; // 1: right to left, -1: left to right
    let boost = 0;
    let visible = true;

    setX(x);

    const trigger = ScrollTrigger.create({
        trigger: root,
        start: "top bottom",
        end: "bottom top",
        onToggle: (self) => (visible = self.isActive),
        onUpdate: (self) => {
            const velocity = self.getVelocity();
            if (Math.abs(velocity) < 1) return;
            direction = velocity > 0 ? 1 : -1;
            boost = Math.max(boost, Math.min(Math.abs(velocity) / BOOST.per, BOOST.max));
        },
        // The set width changes with the breakpoint (font size, gaps): re-measure on every refresh.
        onRefresh: (self) => {
            visible = self.isActive;
            setWidth = group.offsetWidth;
            wrap = gsap.utils.wrap(-setWidth, 0);
            x = wrap(x);
            setX(x);
        },
    });

    const tick = (_time: number, deltaTime: number) => {
        if (!visible) return;
        const dt = Math.min(deltaTime, 100) / 1000; // ignore long gaps (background tab, resume)
        x = wrap(x - direction * SPEED * (1 + boost) * dt);
        setX(x);
        boost *= Math.pow(BOOST.decay, dt * 60); // frame-rate independent decay
    };

    gsap.ticker.add(tick);

    return () => {
        gsap.ticker.remove(tick);
        trigger.kill();
        gsap.set(track, { clearProps: "transform" });
    };
}

export function useTickerAnimation(rootRef: RefObject<HTMLElement | null>) {
    useIsomorphicLayoutEffect(() => {
        const root = rootRef.current;
        if (!root) return;

        const setState = (state: TickerState) => {
            root.dataset.tickerState = state;
        };

        // Reduced motion: the band stays still, as in Figma.
        if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
            setState("static");
            return;
        }

        let removeMarquee = () => {};
        const ctx = gsap.context(() => {
            // The opening is driven by one CSS variable (the side insets of the clip-path, see the SCSS):
            // browsers shorten a symmetric inset() ("inset(0% 50%)"), which GSAP cannot interpolate
            // reliably against a 4-value end state.
            gsap.set(root, { "--ticker-open": "50%" });
            setState("running");

            gsap.to(root, {
                "--ticker-open": "0%",
                duration: 0.9,
                delay: 0.45,
                ease: "power3.inOut",
                onComplete: () => {
                    gsap.set(root, { clearProps: "--ticker-open" });
                    setState("open");
                },
            });

            removeMarquee = setupMarquee(root);
        }, root);

        return () => {
            removeMarquee();
            ctx.revert();
            setState("pending");
        };
    }, [rootRef]);
}