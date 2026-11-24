"use client";

import { useId, type CSSProperties, type ReactNode } from "react";
import { useMissionTabs } from "./useMissionTabs";

export type MissionTab = {
    id: string;
    label: string;
    /** Server-rendered panel content. */
    content: ReactNode;
};

type MissionTabsProps = {
    tabs: MissionTab[];
    defaultTabId: string;
    /** Accessible name of the tab list. */
    label: string;
    /** Rendered inside the card, below the panels (the "Learn More" button). */
    action?: ReactNode;
};

// The content card and its tabs (Figma "Group 23" + "Group 1000001768").
// Figma: the tab group is rotated -90°, so the tabs form a vertical strip on the inside of the card's
// left edge: 52 × 500, from 41px below the card top to 40px above its bottom, OUR VALUES at the bottom,
// OUR MISSION above it, labels reading upwards. The tab list comes first in the DOM (keyboard order:
// tabs → panel → button). Both panels share one grid cell, so the card keeps one height for both tabs.
export default function MissionTabs({ tabs, defaultTabId, label, action }: MissionTabsProps) {
    const baseId = useId();
    const { activeId, panelsRef, select, handleKeyDown } = useMissionTabs(
        tabs.map((tab) => tab.id),
        defaultTabId,
    );
    const activeIndex = Math.max(0, tabs.findIndex((tab) => tab.id === activeId));

    return (
        <>
            <div
                role="tablist"
                aria-label={label}
                aria-orientation="vertical"
                className="mission__tabs mission__reveal"
                style={{ "--mission-tab-index": activeIndex, "--mission-tab-count": tabs.length } as CSSProperties}
                onKeyDown={handleKeyDown}
            >
                {/* White active pill: slides to the selected tab (CSS transform transition). */}
                <span className="mission__tab-indicator" aria-hidden="true" />

                {tabs.map((tab) => {
                    const selected = tab.id === activeId;

                    return (
                        <button
                            key={tab.id}
                            type="button"
                            role="tab"
                            id={`${baseId}-tab-${tab.id}`}
                            aria-selected={selected}
                            aria-controls={`${baseId}-panel-${tab.id}`}
                            tabIndex={selected ? 0 : -1}
                            className="mission__tab"
                            data-tab={tab.id}
                            onClick={() => select(tab.id)}
                        >
                            <span className="mission__tab-label">{tab.label}</span>
                        </button>
                    );
                })}
            </div>

            <div className="mission__card mission__reveal">
                {/* Cursor spotlight layer (desktop only, see useMissionAnimation). */}
                <span className="mission__spotlight" aria-hidden="true" />

                <div ref={panelsRef} className="mission__panels">
                    {tabs.map((tab) => {
                        const selected = tab.id === activeId;

                        return (
                            <div
                                key={tab.id}
                                role="tabpanel"
                                id={`${baseId}-panel-${tab.id}`}
                                aria-labelledby={`${baseId}-tab-${tab.id}`}
                                className="mission__panel"
                                data-tab={tab.id}
                                data-active={selected}
                                tabIndex={selected ? 0 : -1}
                                inert={!selected}
                            >
                                {tab.content}
                            </div>
                        );
                    })}
                </div>

                {action}
            </div>
        </>
    );
}