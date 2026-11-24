"use client";

import { useEffect, useLayoutEffect, type RefObject } from "react";
import Swiper from "swiper";
import { A11y, Navigation, Pagination } from "swiper/modules";

// Runs before paint on the client; falls back to useEffect during SSR (where it never runs).
const useIsomorphicLayoutEffect = typeof window !== "undefined" ? useLayoutEffect : useEffect;

const SPEED = 600; // ms, slide transition

/**
 * Swiper setup for the blog cards.
 * - 1.1 cards on phones (the next card peeks in), 2 from 768px, 3 from 1200px (Figma: 386px cards,
 *   24px apart on the 1206 grid).
 * - The Figma pagination drives it: the arrows go one card back / forward, each dot is one slider
 *   position (so the number of dots follows the breakpoint: 4 on desktop, 5 on tablet, 6 on phones).
 *   Swiper keeps arrows and dots in sync with every move (arrows, dots, drag, swipe); the arrows are
 *   disabled at both ends.
 * - Dots are real <button>s (focusable, labelled by Swiper's A11y module).
 */
function setupSlider(root: HTMLElement, reduceMotion: boolean) {
    const sliderEl = root.querySelector<HTMLElement>(".blogs__slider");
    const dotsEl = root.querySelector<HTMLElement>(".blogs__dots");
    if (!sliderEl || !dotsEl) return () => {};

    const swiper = new Swiper(sliderEl, {
        modules: [Navigation, Pagination, A11y],
        slidesPerView: 1.1,
        spaceBetween: 16,
        breakpoints: {
            768: { slidesPerView: 2, spaceBetween: 24 },
            1200: { slidesPerView: 3, spaceBetween: 24 },
        },
        speed: reduceMotion ? 0 : SPEED,
        grabCursor: true,
        watchOverflow: true,
        navigation: {
            prevEl: root.querySelector<HTMLElement>(".blogs__nav--prev"),
            nextEl: root.querySelector<HTMLElement>(".blogs__nav--next"),
            disabledClass: "is-disabled",
        },
        pagination: {
            el: dotsEl,
            clickable: true,
            bulletElement: "button",
            bulletClass: "blogs__dot",
            bulletActiveClass: "is-active",
        },
        a11y: {
            prevSlideMessage: "Previous posts",
            nextSlideMessage: "Next posts",
            paginationBulletMessage: "Go to post {{index}}",
            containerRoleDescriptionMessage: "carousel",
            itemRoleDescriptionMessage: "post",
            slideLabelMessage: "{{index}} of {{slidesLength}}",
        },
    });

    return () => swiper.destroy(true, true);
}

export function useBlogsSlider(rootRef: RefObject<HTMLElement | null>) {
    useIsomorphicLayoutEffect(() => {
        const root = rootRef.current;
        if (!root) return;

        const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
        return setupSlider(root, reduceMotion);
    }, [rootRef]);
}