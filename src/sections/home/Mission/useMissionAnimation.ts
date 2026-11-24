"use client";

import { useEffect, useLayoutEffect, type RefObject } from "react";
import { gsap, ScrollTrigger } from "@/lib/gsap";

// Runs before paint on the client; falls back to useEffect during SSR (where it never runs).
const useIsomorphicLayoutEffect = typeof window !== "undefined" ? useLayoutEffect : useEffect;

type MissionState = "pending" | "armed" | "static";

// Desktop pointers only: the spotlight follows a mouse, never a finger.
const SPOTLIGHT_MEDIA = "(hover: hover) and (pointer: fine)";
// Added to each title line while its light band sweeps across it (gradient text, see _Mission.scss).
const SWEEP_CLASS = "mission__title-line--sweep";

/**
 * "Lights Up" — the section comes on like a stage being lit:
 * - Title: a soft light band sweeps across each line and leaves the type lit behind it.
 * - Image: opens from a vertical slit, like stage doors parting, while the photo settles from 1.15×.
 * - Card: rises out of the stage floor (revealed from its bottom edge upwards).
 * - Mission lead-ins switch on one after another (bullet and words, with a brief soft glow that
 *   fades out); each statement's body follows its lead-in.
 * - The tab strip slides out of the card's left edge; the button opens like the Hero buttons.
 * Scroll-linked: the green and purple lights drift slightly in opposite directions (scrubbed, so they
 * only move while the page is being scrolled). Desktop: a restrained spotlight follows the cursor
 * over the card. Only clip-path, transform, opacity, background-position and CSS variables are
 * animated; nothing runs continuously.
 */
function setupMotion(root: HTMLElement) {
    const q = gsap.utils.selector(root);

    const titleWrap = q(".mission__title")[0];
    const titleLines = q(".mission__title-line") as HTMLElement[];
    const stage = q(".mission__stage")[0];
    const media = q(".mission__media")[0];
    const photo = q(".mission__img");
    const card = q(".mission__card")[0];
    const tabs = q(".mission__tabs")[0];
    const action = q(".mission__action");
    const items = q('.mission__panel[data-active="true"] .mission__item') as HTMLElement[];
    const glowGreen = q(".mission__glow--green");
    const glowPurple = q(".mission__glow--purple");

    // ---------- Title: light band ----------
    if (titleWrap && titleLines.length) {
        titleLines.forEach((line) => line.classList.add(SWEEP_CLASS));
        gsap.set(titleLines, { backgroundPosition: "100% 0%" });

        const sweep = gsap.to(titleLines, {
            backgroundPosition: "0% 0%",
            duration: 1.05,
            stagger: 0.14,
            ease: "power2.inOut",
            paused: true,
            onComplete: () => {
                titleLines.forEach((line) => line.classList.remove(SWEEP_CLASS));
                gsap.set(titleLines, { clearProps: "backgroundPosition" });
            },
        });

        ScrollTrigger.create({ trigger: titleWrap, start: "top 85%", end: "max", once: true, onEnter: () => sweep.play() });
    }

    // ---------- Stage: image, card, lead-ins, tabs, button ----------
    let finishEntrance = () => {};

    if (stage && media && card) {
        const bodies = items.map((item) => item.querySelector<HTMLElement>(".mission__body")).filter(Boolean) as HTMLElement[];

        gsap.set(media, { clipPath: "inset(0% 50% 0% 50% round 30px)" });
        gsap.set(photo, { scale: 1.15 });
        gsap.set(card, { clipPath: "inset(100% 0% 0% 0% round 30px)", y: 48 });
        gsap.set(items, { "--mission-lit": 0.16, "--mission-glow": 0 });
        gsap.set(bodies, { opacity: 0 });
        if (tabs) gsap.set(tabs, { clipPath: "inset(0% 0% 0% 100%)", xPercent: -100 });
        gsap.set(action, { clipPath: "inset(0% 50% 0% 50% round 30px)" });

        const entrance = gsap.timeline({
            paused: true,
            defaults: { ease: "power3.inOut" },
            onComplete: () => {
                gsap.set([media, card, ...action], { clearProps: "clipPath,transform" });
                gsap.set(photo, { clearProps: "transform" });
                gsap.set(items, { clearProps: "--mission-lit,--mission-glow" });
                gsap.set(bodies, { clearProps: "opacity" });
                if (tabs) gsap.set(tabs, { clearProps: "clipPath,transform" });
            },
        });

        // Stage doors.
        entrance.to(media, { clipPath: "inset(0% 0% 0% 0% round 30px)", duration: 0.95 }, 0);
        entrance.to(photo, { scale: 1, duration: 1.4, ease: "power2.out" }, 0);

        // Card rises from the stage floor.
        entrance.to(card, { clipPath: "inset(0% 0% 0% 0% round 30px)", duration: 0.85 }, 0.12);
        entrance.to(card, { y: 0, duration: 0.95, ease: "power3.out" }, 0.12);

        // Lead-ins switch on one by one; each body follows its lead-in.
        items.forEach((item, index) => {
            const at = 0.55 + index * 0.26;

            entrance.to(item, { "--mission-lit": 1, duration: 0.4, ease: "power2.out" }, at);
            entrance.to(item, { "--mission-glow": 1, duration: 0.18, ease: "power1.out" }, at);
            entrance.to(item, { "--mission-glow": 0, duration: 0.6, ease: "power1.inOut" }, at + 0.2);
            if (bodies[index]) entrance.to(bodies[index], { opacity: 1, duration: 0.5, ease: "power1.out" }, at + 0.18);
        });

        // The tab strip slides out of the card's left edge: it moves one strip width to the right while
        // its clip opens by the same amount, so it never shows outside the card. The button opens.
        if (tabs) {
            entrance.to(tabs, { clipPath: "inset(0% 0% 0% 0%)", xPercent: 0, duration: 0.6, ease: "power3.out" }, 0.75);
        }
        entrance.to(action, { clipPath: "inset(0% 0% 0% 0% round 30px)", duration: 0.6 }, 1.05);

        ScrollTrigger.create({ trigger: stage, start: "top 82%", end: "max", once: true, onEnter: () => entrance.play() });

        // Using the tabs before (or during) the entrance completes it at once, so the switch always
        // starts from the final state and a focused tab is never hidden.
        finishEntrance = () => {
            if (entrance.progress() < 1) entrance.progress(1);
        };
    }

    // ---------- Background lights: scroll-linked drift ----------
    if (glowGreen.length || glowPurple.length) {
        const drift = gsap.timeline({
            defaults: { ease: "none" },
            scrollTrigger: { trigger: root, start: "top bottom", end: "bottom top", scrub: 0.8 },
        });

        drift.fromTo(glowGreen, { yPercent: 6 }, { yPercent: -6 }, 0);
        drift.fromTo(glowPurple, { yPercent: -5 }, { yPercent: 5 }, 0);
    }

    return finishEntrance;
}

/** Cursor spotlight over the card: one CSS variable update per frame, only while the mouse moves over it. */
function setupSpotlight(card: HTMLElement) {
    let frame = 0;
    let x = 0;
    let y = 0;

    const apply = () => {
        frame = 0;
        card.style.setProperty("--mission-spot-x", `${x}px`);
        card.style.setProperty("--mission-spot-y", `${y}px`);
    };

    const handleMove = (event: PointerEvent) => {
        if (event.pointerType !== "mouse") return;
        const rect = card.getBoundingClientRect();
        x = event.clientX - rect.left;
        y = event.clientY - rect.top;
        if (!frame) frame = requestAnimationFrame(apply);
    };

    card.addEventListener("pointermove", handleMove, { passive: true });

    return () => {
        card.removeEventListener("pointermove", handleMove);
        cancelAnimationFrame(frame);
        card.style.removeProperty("--mission-spot-x");
        card.style.removeProperty("--mission-spot-y");
    };
}

export function useMissionAnimation(rootRef: RefObject<HTMLElement | null>) {
    useIsomorphicLayoutEffect(() => {
        const root = rootRef.current;
        if (!root) return;

        const setState = (state: MissionState) => {
            root.dataset.missionState = state;
        };

        // Reduced motion: final Figma composition, no motion at all (tabs switch instantly).
        if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
            setState("static");
            return;
        }

        let finishEntrance = () => {};
        const ctx = gsap.context(() => {
            finishEntrance = setupMotion(root);
        }, root);
        setState("armed"); // initial GSAP states are applied; the CSS pre-hide can be lifted

        const tabs = root.querySelector<HTMLElement>(".mission__tabs");
        const handleTabsUse = () => finishEntrance();
        tabs?.addEventListener("pointerdown", handleTabsUse, true);
        tabs?.addEventListener("focusin", handleTabsUse, true);

        const card = root.querySelector<HTMLElement>(".mission__card");
        const stopSpotlight = card && window.matchMedia(SPOTLIGHT_MEDIA).matches ? setupSpotlight(card) : undefined;

        return () => {
            tabs?.removeEventListener("pointerdown", handleTabsUse, true);
            tabs?.removeEventListener("focusin", handleTabsUse, true);
            stopSpotlight?.();
            ctx.revert(); // kills every tween, timeline and ScrollTrigger created above; restores inline styles
            root.querySelectorAll(`.${SWEEP_CLASS}`).forEach((line) => line.classList.remove(SWEEP_CLASS));
            setState("pending");
        };
    }, [rootRef]);
}