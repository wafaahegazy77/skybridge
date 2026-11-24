"use client";

import { useEffect, useLayoutEffect, type RefObject } from "react";
import Swiper from "swiper";
import { A11y, Navigation } from "swiper/modules";
import { gsap } from "@/lib/gsap";

// Runs before paint on the client; falls back to useEffect during SSR (where it never runs).
const useIsomorphicLayoutEffect = typeof window !== "undefined" ? useLayoutEffect : useEffect;

// From tablet up the slider opens on the 2nd card (Figma: the middle card is the active one, with
// the 1st card on its left); on phones it opens on the 1st card.
const START_ON_SECOND_MEDIA = "(min-width: 768px)";
const SPEED = 750; // ms, slide transition
const PARALLAX = 40; // px the photo shifts inside its card per slide of distance from the center
const ACTIVE_CLASS = "is-active";

type ProgressSlide = HTMLElement & { progress: number };

/** The slide whose center is closest to the slider's center (Swiper progress 0 = centered). */
function getCenterSlide(swiper: Swiper) {
    let closest = swiper.slides[0] as ProgressSlide | undefined;
    let smallest = Number.POSITIVE_INFINITY;

    swiper.slides.forEach((slide) => {
        const distance = Math.abs((slide as ProgressSlide).progress);
        if (distance < smallest) {
            smallest = distance;
            closest = slide as ProgressSlide;
        }
    });

    return closest;
}

/**
 * Data index (0-based) of a slide. In loop mode Swiper reorders the slide elements and stamps each one
 * with its original position in `data-swiper-slide-index`; `slides` (the DOM order at setup) and the
 * service data share that order.
 */
function getRealIndex(slide: HTMLElement | undefined, slides: HTMLElement[]) {
    if (!slide) return 0;
    const stamped = Number(slide.dataset.swiperSlideIndex);
    return Number.isFinite(stamped) ? stamped : Math.max(0, slides.indexOf(slide));
}

/** Shortest step from one index to another on a loop of `total` items (sign = direction). */
function getLoopStep(from: number, to: number, total: number) {
    const forward = (to - from + total) % total;
    return forward <= total / 2 ? forward : forward - total;
}

/**
 * Swiper setup for the Services cards.
 * - Infinite loop: after the last service comes the first one again (and before the first, the last),
 *   with no empty space at either end. With fewer real slides than the loop needs to keep both sides of
 *   the centred card filled, the service list is rendered twice (see Services.tsx); the counter, the
 *   active state and the screen-reader labels always refer to the real service.
 * - centeredSlides: the card in the middle of the visible slider area is Swiper's active slide.
 *   From tablet up the slider starts on the 2nd card, which reproduces the Figma layout exactly on desktop.
 * - The active (center) card is recomputed from the real slide positions on every progress
 *   update — while dragging, swiping, clicking a side card, using the arrows or the keyboard —
 *   and gets `.is-active`; CSS handles the activation/deactivation transitions.
 * - Depth: each photo shifts inside its card according to its distance from the center
 *   (transform only, using Swiper's own transition duration so it moves with the slides).
 * - The counter rolls to the new number; the triangle patterns nudge in the slide direction.
 * - Keyboard: ←/→ (and Home/End) move the slider when focus is inside the section, or when nothing
 *   is focused and the section is on screen. Swiper's own Keyboard module is not used: its
 *   "only in viewport" check compares page offsets with the window size, so it stops working once
 *   the page is scrolled down to this section.
 */
function setupSlider(root: HTMLElement, reduceMotion: boolean) {
    const sliderEl = root.querySelector<HTMLElement>(".services__slider");
    if (!sliderEl) return () => {};

    const prevEl = root.querySelector<HTMLButtonElement>(".services__nav-btn--prev");
    const nextEl = root.querySelector<HTMLButtonElement>(".services__nav-btn--next");
    const counter = root.querySelector<HTMLElement>(".services__counter-current");
    const patterns = root.querySelectorAll<HTMLElement>(".services__pattern-inner");
    const slides = Array.from(sliderEl.querySelectorAll<HTMLElement>(".services__slide"));
    // Number of real services (the list may be rendered twice for the loop, see Services.tsx).
    const total = Number(sliderEl.dataset.servicesCount) || slides.length;
    const media = new Map(slides.map((slide) => [slide, slide.querySelector<HTMLElement>(".services__card-media")]));

    let currentSlide: HTMLElement | null = null;
    let current = -1;

    const renderCounter = (value: number, direction: number) => {
        if (!counter) return;

        // First render, or no motion: replace the number in place.
        if (direction === 0 || reduceMotion) {
            counter.replaceChildren(Object.assign(document.createElement("span"), {
                className: "services__counter-num",
                textContent: String(value),
            }));
            return;
        }

        // Roll: the old number leaves in the slide direction, the new one enters from the other side.
        const outgoing = Array.from(counter.children);
        const incoming = Object.assign(document.createElement("span"), {
            className: "services__counter-num",
            textContent: String(value),
        });
        counter.appendChild(incoming);

        gsap.fromTo(incoming, { yPercent: 100 * direction }, { yPercent: 0, duration: 0.5, ease: "power3.out" });
        gsap.to(outgoing, {
            yPercent: -100 * direction,
            duration: 0.5,
            ease: "power3.out",
            onComplete: () => outgoing.forEach((node) => node.remove()),
        });
    };

    const setActive = (slide: HTMLElement | undefined) => {
        if (!slide || slide === currentSlide) return;

        const index = getRealIndex(slide, slides) % total;
        const direction = current === -1 ? 0 : Math.sign(getLoopStep(current, index, total));
        currentSlide = slide;

        slides.forEach((item) => item.classList.toggle(ACTIVE_CLASS, item === slide));
        if (index === current) return; // the same service (its duplicate) is now in the centre
        current = index;
        renderCounter(index + 1, direction);

        if (direction !== 0 && !reduceMotion && patterns.length) {
            gsap.fromTo(
                patterns,
                { x: -14 * direction },
                { x: 0, duration: 1.1, ease: "power3.out", overwrite: "auto" },
            );
        }
    };

    const applyDepth = (swiper: Swiper) => {
        if (reduceMotion) return;

        swiper.slides.forEach((slide) => {
            const layer = media.get(slide as HTMLElement);
            if (!layer) return;
            const progress = gsap.utils.clamp(-1.2, 1.2, (slide as ProgressSlide).progress);
            layer.style.transform = `translate3d(${progress * PARALLAX}px, 0, 0)`;
        });
    };

    const swiper = new Swiper(sliderEl, {
        modules: [Navigation, A11y],
        slidesPerView: "auto",
        centeredSlides: true,
        loop: true,
        initialSlide: window.matchMedia(START_ON_SECOND_MEDIA).matches ? Math.min(1, total - 1) : 0,
        spaceBetween: 16,
        breakpoints: {
            768: { spaceBetween: 20 },
            1200: { spaceBetween: 30 },
        },
        speed: reduceMotion ? 0 : SPEED,
        grabCursor: true,
        watchSlidesProgress: true,
        slideToClickedSlide: true,
        navigation: { prevEl, nextEl, disabledClass: "is-disabled" },
        a11y: {
            prevSlideMessage: "Previous service",
            nextSlideMessage: "Next service",
            containerRoleDescriptionMessage: "carousel",
            itemRoleDescriptionMessage: "service",
            // Each slide carries its own "n of total" label (set in Services.tsx), duplicates included.
            slideLabelMessage: "",
        },
        on: {
            // Fires on every translate change (drag, swipe, transitions start/end, resize).
            progress: (instance) => setActive(getCenterSlide(instance)),
            setTranslate: (instance) => applyDepth(instance),
            // Keep the photo layers in step with Swiper's own transition (0 while dragging).
            setTransition: (_instance, duration) => {
                media.forEach((layer) => {
                    if (layer) layer.style.transitionDuration = `${reduceMotion ? 0 : duration}ms`;
                });
            },
        },
    });

    // Initial state (the events above may already have run during init; this makes it explicit).
    setActive(getCenterSlide(swiper));
    applyDepth(swiper);

    // Is at least a third of the section on screen? (IntersectionObserver: no per-scroll work.)
    let inView = false;
    const observer = new IntersectionObserver(([entry]) => (inView = entry.isIntersecting), { threshold: 0.33 });
    observer.observe(root);

    const onKeyDown = (event: KeyboardEvent) => {
        if (event.altKey || event.ctrlKey || event.metaKey || event.shiftKey) return;

        const focused = document.activeElement;
        const nothingFocused = !focused || focused === document.body;
        if (!root.contains(focused) && !(nothingFocused && inView)) return;

        const actions: Record<string, () => void> = {
            ArrowLeft: () => swiper.slidePrev(),
            ArrowRight: () => swiper.slideNext(),
            Home: () => swiper.slideToLoop(0),
            End: () => swiper.slideToLoop(total - 1),
        };
        const action = actions[event.key];
        if (!action) return;

        event.preventDefault();
        action();
    };

    document.addEventListener("keydown", onKeyDown);

    return () => {
        document.removeEventListener("keydown", onKeyDown);
        observer.disconnect();
        gsap.killTweensOf(patterns);
        if (counter) gsap.killTweensOf(Array.from(counter.children));
        swiper.destroy(true, true);
        slides.forEach((slide) => slide.classList.remove(ACTIVE_CLASS));
        media.forEach((layer) => layer?.style.removeProperty("transform"));
        media.forEach((layer) => layer?.style.removeProperty("transition-duration"));
    };
}

export function useServicesSlider(rootRef: RefObject<HTMLElement | null>) {
    useIsomorphicLayoutEffect(() => {
        const root = rootRef.current;
        if (!root) return;

        const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
        return setupSlider(root, reduceMotion);
    }, [rootRef]);
}