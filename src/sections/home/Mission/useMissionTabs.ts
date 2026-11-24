"use client";

import { useEffect, useLayoutEffect, useRef, useState, type KeyboardEvent } from "react";
import { gsap } from "@/lib/gsap";

// Runs before paint on the client; falls back to useEffect during SSR (where it never runs).
const useIsomorphicLayoutEffect = typeof window !== "undefined" ? useLayoutEffect : useEffect;

/**
 * Tab state, keyboard support (WAI-ARIA vertical tabs, automatic activation) and the content switch.
 * The tabs are stacked bottom-up (OUR VALUES at the bottom, OUR MISSION above), so ArrowUp/ArrowRight
 * move to the next tab and ArrowDown/ArrowLeft to the previous one; Home and End jump to the ends.
 *
 * Switch: the outgoing items lift away one after another, then the incoming items rise in with their
 * lead-ins switching on (as in the entrance). Both panels share one grid cell, so the card never
 * changes height and nothing on the page moves. A new switch during a running one finishes the running
 * one first. With reduced motion the change is instant. Only transform, opacity and a CSS variable are
 * animated, once per click.
 */
export function useMissionTabs(ids: string[], defaultId: string) {
    const [activeId, setActiveId] = useState(defaultId);
    const panelsRef = useRef<HTMLDivElement>(null);
    const fromIdRef = useRef<string | null>(null);
    const timelineRef = useRef<ReturnType<typeof gsap.timeline> | null>(null);

    const select = (id: string) => {
        if (id === activeId || !ids.includes(id)) return;

        fromIdRef.current = activeId;
        setActiveId(id);
    };

    const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
        const index = ids.indexOf(activeId);
        let next = -1;

        if (event.key === "ArrowUp" || event.key === "ArrowRight") next = (index + 1) % ids.length;
        else if (event.key === "ArrowDown" || event.key === "ArrowLeft") next = (index - 1 + ids.length) % ids.length;
        else if (event.key === "Home") next = 0;
        else if (event.key === "End") next = ids.length - 1;
        if (next < 0) return;

        event.preventDefault();
        const nextId = ids[next];
        select(nextId);
        event.currentTarget.querySelector<HTMLElement>(`[role="tab"][data-tab="${nextId}"]`)?.focus();
    };

    useIsomorphicLayoutEffect(() => {
        const fromId = fromIdRef.current;
        const panels = panelsRef.current;
        fromIdRef.current = null;
        if (!fromId || !panels) return; // first render

        // Finish a switch that is still running, so every element starts from a clean state.
        timelineRef.current?.progress(1).kill();
        timelineRef.current = null;

        if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

        const incoming = panels.querySelector<HTMLElement>(`[role="tabpanel"][data-tab="${activeId}"]`);
        const outgoing = panels.querySelector<HTMLElement>(`[role="tabpanel"][data-tab="${fromId}"]`);
        if (!incoming || !outgoing) return;

        const outItems = outgoing.querySelectorAll<HTMLElement>(".mission__item");
        const inItems = incoming.querySelectorAll<HTMLElement>(".mission__item");
        const inBodies = incoming.querySelectorAll<HTMLElement>(".mission__body");

        const timeline = gsap.timeline({
            defaults: { overwrite: "auto" },
            onComplete: () => {
                gsap.set(outgoing, { clearProps: "visibility" });
                gsap.set([...outItems, ...inItems, ...inBodies], { clearProps: "transform,opacity,visibility,--mission-lit" });
                timelineRef.current = null;
            },
        });

        // The outgoing panel is already marked inactive (hidden by CSS); keep it visible while it leaves.
        timeline.set(outgoing, { visibility: "visible" }, 0);
        timeline.to(outItems, { y: -12, autoAlpha: 0, duration: 0.26, stagger: 0.035, ease: "power2.in" }, 0);

        timeline.fromTo(
            inItems,
            { y: 16, autoAlpha: 0, "--mission-lit": 0.2 },
            { y: 0, autoAlpha: 1, "--mission-lit": 1, duration: 0.5, stagger: 0.06, ease: "power3.out" },
            0.24,
        );
        if (inBodies.length) {
            timeline.fromTo(inBodies, { opacity: 0.35 }, { opacity: 1, duration: 0.45, stagger: 0.06, ease: "power1.out" }, 0.34);
        }

        timelineRef.current = timeline;
    }, [activeId]);

    // Unmount: stop a running switch.
    useEffect(
        () => () => {
            timelineRef.current?.kill();
            timelineRef.current = null;
        },
        [],
    );

    return { activeId, panelsRef, select, handleKeyDown };
}