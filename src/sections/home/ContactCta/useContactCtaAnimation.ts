"use client";

import { useEffect, useLayoutEffect, type RefObject } from "react";
import { gsap, ScrollTrigger, SplitText } from "@/lib/gsap";

// Runs before paint on the client; falls back to useEffect during SSR (where it never runs).
const useIsomorphicLayoutEffect = typeof window !== "undefined" ? useLayoutEffect : useEffect;

type ContactState = "pending" | "armed" | "done" | "static";

const POINTER_MEDIA = "(min-width: 992px) and (hover: hover) and (pointer: fine)";
const MAGNET = { strength: 0.22, reach: 14 }; // share of the pointer offset, and the largest pull (px)

/**
 * "Open line" entrance, played once when the card comes into view (~1.7s). The card is a channel that
 * opens and starts transmitting:
 * - the card opens like a lens (rounded aperture) while its light — the two glows and the green
 *   triangle — settles in from a little further away;
 * - the round "Contact Us" button switches on first and sends out one ripple;
 * - the words arrive like a signal: the eyebrow and each title line are wiped in from the left
 *   through a soft-edged mask;
 * - each contact row "connects": its ring is traced around the icon, the icon lights up, and the
 *   details are wiped in beside it.
 * Only transforms, opacity, clip-path, mask position and stroke offsets are animated, and everything
 * is cleared afterwards.
 */
function setupEntrance(root: HTMLElement, onDone: () => void) {
    const q = gsap.utils.selector(root);
    const card = q(".contact-cta__card");
    const decor = q(".contact-cta__decor");
    const glowGreen = q(".contact-cta__glow--green");
    const glowPurple = q(".contact-cta__glow--purple");
    const mark = q(".contact-cta__mark");
    const eyebrow = q(".contact-cta__eyebrow");
    const title = root.querySelector<HTMLElement>(".contact-cta__title");
    const items = q(".contact-cta__item") as HTMLElement[];
    const button = q(".contact-cta__button");
    const ripple = q(".contact-cta__button-ripple");
    const buttonIcon = q(".contact-cta__button-icon");
    const buttonLabel = q(".contact-cta__button-label");

    // Title lines as their own wipe targets (screen readers keep reading the heading as one text).
    const split = title
        ? SplitText.create(title, { type: "lines", linesClass: "contact-cta__title-line", aria: "auto" })
        : null;
    const wipes = [...eyebrow, ...((split?.lines as HTMLElement[]) ?? [])];
    const rows = items.map((item) => ({
        ring: item.querySelector(".contact-cta__ring circle"),
        glyph: item.querySelector(".contact-cta__glyph"),
        text: item.querySelector(".contact-cta__item-text"),
    }));
    const rowTexts = rows.map((row) => row.text).filter(Boolean) as Element[];

    // ---------- Initial states ----------
    gsap.set(card, { clipPath: "inset(7% 4% 7% 4% round 60px)" });
    gsap.set(decor, { scale: 1.12 });
    gsap.set(glowGreen, { autoAlpha: 0, x: -140, y: -60 });
    gsap.set(glowPurple, { autoAlpha: 0, x: 140, y: -60 });
    gsap.set(mark, { autoAlpha: 0, y: 140, rotation: -8 });
    gsap.set([...wipes, ...rowTexts], { "--wipe": "0%", x: -18 });
    gsap.set(rows.map((row) => row.ring), { strokeDasharray: 1, strokeDashoffset: 1 });
    gsap.set(rows.map((row) => row.glyph), { autoAlpha: 0, scale: 0.4 });
    gsap.set(button, { autoAlpha: 0, scale: 0.55 });
    gsap.set(buttonIcon, { x: -14, y: 14, autoAlpha: 0 });
    gsap.set(buttonLabel, { autoAlpha: 0 });
    gsap.set(ripple, { scale: 1, autoAlpha: 0 });

    const reveal = gsap.timeline({
        paused: true,
        defaults: { ease: "power3.out" },
        onComplete: () => {
            gsap.set([...card, ...decor, ...button, ...buttonIcon, ...buttonLabel, ...ripple], {
                clearProps: "clipPath,transform,opacity,visibility",
            });
            // The glows and the triangle keep their transform: the scroll parallax drives their yPercent.
            gsap.set([...glowGreen, ...glowPurple, ...mark], { clearProps: "opacity,visibility" });
            gsap.set([...wipes, ...rowTexts], { clearProps: "--wipe,transform" });
            gsap.set(rows.map((row) => row.ring), { clearProps: "strokeDasharray,strokeDashoffset" });
            gsap.set(rows.map((row) => row.glyph), { clearProps: "opacity,visibility,transform" });
            split?.revert();
            onDone();
        },
    });

    // The channel opens: aperture on the card, its light settles in from further away.
    reveal.to(card, { clipPath: "inset(0% 0% 0% 0% round 30px)", duration: 1.1, ease: "expo.out" }, 0);
    reveal.to(decor, { scale: 1, duration: 1.4 }, 0);
    reveal.to([...glowGreen, ...glowPurple], { autoAlpha: 1, x: 0, y: 0, duration: 1.4, ease: "power2.out" }, 0.05);
    reveal.to(mark, { autoAlpha: 1, y: 0, rotation: 0, duration: 1.4 }, 0.1);

    // The button switches on and sends one ripple out.
    reveal.to(button, { autoAlpha: 1, scale: 1, duration: 0.8, ease: "back.out(1.7)" }, 0.35);
    reveal.to(buttonIcon, { autoAlpha: 1, x: 0, y: 0, duration: 0.6 }, 0.6);
    reveal.to(buttonLabel, { autoAlpha: 1, duration: 0.5, ease: "power1.out" }, 0.65);
    reveal.fromTo(ripple, { scale: 1, autoAlpha: 0.55 }, { scale: 1.7, autoAlpha: 0, duration: 1.1, ease: "power2.out" }, 0.7);

    // The words arrive: soft-edged wipes from the left, line after line.
    reveal.to(wipes, { "--wipe": "120%", x: 0, duration: 0.9, stagger: 0.12, ease: "power2.out" }, 0.4);

    // The rows connect: ring traced, icon lit, details wiped in.
    rows.forEach((row, index) => {
        const at = 0.75 + index * 0.18;
        if (row.ring) reveal.to(row.ring, { strokeDashoffset: 0, duration: 0.7, ease: "power2.inOut" }, at);
        if (row.glyph) reveal.to(row.glyph, { autoAlpha: 1, scale: 1, duration: 0.45, ease: "back.out(2)" }, at + 0.35);
        if (row.text) reveal.to(row.text, { "--wipe": "120%", x: 0, duration: 0.75, ease: "power2.out" }, at + 0.25);
    });

    ScrollTrigger.create({
        trigger: root,
        start: "top 75%",
        end: "max",
        once: true,
        onEnter: () => reveal.play(),
    });
}

/**
 * Depth while the card scrolls through the screen: the triangle and the two glows drift at different
 * rates (scrubbed, transforms only), so the light inside the card feels behind the content. Uses
 * yPercent / xPercent, which never collide with the entrance's x / y.
 */
function setupParallax(root: HTMLElement) {
    const q = gsap.utils.selector(root);
    const scroll = { trigger: root, start: "top bottom", end: "bottom top", scrub: 0.6 };

    gsap.fromTo(q(".contact-cta__mark"), { yPercent: 6 }, { yPercent: -6, ease: "none", scrollTrigger: scroll });
    gsap.fromTo(q(".contact-cta__glow--green"), { yPercent: -4 }, { yPercent: 6, ease: "none", scrollTrigger: scroll });
    gsap.fromTo(q(".contact-cta__glow--purple"), { yPercent: 5 }, { yPercent: -5, ease: "none", scrollTrigger: scroll });
}

/**
 * Magnetic button (desktop, fine pointers): the circle leans toward the pointer and the arrow leans a
 * little further (CSS: the arrow follows the same variables at 1.6×), then both spring back when the
 * pointer leaves. GSAP writes the pull into two CSS variables (--magnet-x / --magnet-y), which the
 * stylesheet turns into `translate`, so the pull combines with the CSS hover `scale` and arrow nudge.
 */
function setupMagnet(root: HTMLElement) {
    const button = root.querySelector<HTMLElement>(".contact-cta__button");
    if (!button) return () => {};

    const pointerOk = window.matchMedia(POINTER_MEDIA);
    // GSAP tweens a plain object; every update writes it to the two CSS variables in px.
    const pull = { x: 0, y: 0 };
    const setX = gsap.quickSetter(button, "--magnet-x", "px");
    const setY = gsap.quickSetter(button, "--magnet-y", "px");
    const apply = () => {
        setX(pull.x);
        setY(pull.y);
    };
    const tween = { duration: 0.5, ease: "power3.out", onUpdate: apply };
    const moveX = gsap.quickTo(pull, "x", tween);
    const moveY = gsap.quickTo(pull, "y", tween);
    const clampReach = gsap.utils.clamp(-MAGNET.reach, MAGNET.reach);

    const onMove = (event: PointerEvent) => {
        if (!pointerOk.matches || event.pointerType !== "mouse") return;
        const bounds = button.getBoundingClientRect();
        moveX(clampReach((event.clientX - (bounds.left + bounds.width / 2)) * MAGNET.strength));
        moveY(clampReach((event.clientY - (bounds.top + bounds.height / 2)) * MAGNET.strength));
    };

    const onLeave = () => {
        gsap.to(pull, {
            x: 0,
            y: 0,
            duration: 0.9,
            ease: "elastic.out(1, 0.45)",
            overwrite: "auto",
            onUpdate: apply,
        });
    };

    button.addEventListener("pointermove", onMove, { passive: true });
    button.addEventListener("pointerleave", onLeave);

    return () => {
        button.removeEventListener("pointermove", onMove);
        button.removeEventListener("pointerleave", onLeave);
        gsap.killTweensOf(pull);
        button.style.removeProperty("--magnet-x");
        button.style.removeProperty("--magnet-y");
    };
}

export function useContactCtaAnimation(rootRef: RefObject<HTMLElement | null>) {
    useIsomorphicLayoutEffect(() => {
        const root = rootRef.current;
        if (!root) return;

        const setState = (state: ContactState) => {
            root.dataset.contactState = state;
        };

        // Reduced motion: the final Figma composition straight away, no entrance, parallax or magnet.
        if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
            setState("static");
            return;
        }

        let removeMagnet = () => {};
        const ctx = gsap.context(() => {
            setupEntrance(root, () => setState("done"));
            setupParallax(root);
            removeMagnet = setupMagnet(root);
        }, root);
        setState("armed"); // initial GSAP states are applied; the CSS pre-hide can be lifted (masks on while revealing)

        return () => {
            removeMagnet();
            ctx.revert(); // kills the entrance, the parallax and their ScrollTriggers; restores inline styles and the split
            setState("pending");
        };
    }, [rootRef]);
}