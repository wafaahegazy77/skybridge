import Image from "next/image";
import type { CSSProperties } from "react";
import type { HomePartners } from "@/types/home";
import "./_Partners.scss";

type PartnersProps = {
    data: HomePartners;
};

const TITLE_ID = "partners-title";

// Each row repeats the partner sequence this many times. The CSS animation moves a row by exactly one
// sequence (100% / COPIES of the track), so the next copy lands where the first one started: a seamless
// loop. Four copies keep the rows filled on screens up to ~3600px wide (sequence = 1225px at 1512).
const COPIES = 4;

// Figma: the top row runs left → right, the bottom row right → left (at a slightly different speed).
const ROWS = [
    { id: "top", direction: "right" },
    { id: "bottom", direction: "left" },
] as const;

// Server Component: the marquees are pure CSS (transform keyframes), no client JavaScript.
export default function Partners({ data }: PartnersProps) {
    const { eyebrow, title, items } = data;

    return (
        <section className="partners" aria-labelledby={TITLE_ID}>
            <div className="container">
                <header className="partners__header">
                    <p className="partners__eyebrow">{eyebrow}</p>
                    <h2 id={TITLE_ID} className="partners__title">
                        {title}
                    </h2>
                </header>
            </div>

            <div className="partners__rows">
                {ROWS.map((row, rowIndex) => (
                    <div
                        key={row.id}
                        className={`partners__row partners__row--${row.direction}`}
                        // The bottom row repeats the same partners: hidden from screen readers.
                        aria-hidden={rowIndex > 0 || undefined}
                    >
                        <div className="partners__track" style={{ "--partners-copies": COPIES } as CSSProperties}>
                            {Array.from({ length: COPIES }, (_, copy) => {
                                // Only the first sequence of the first row is announced; every repeat is decorative.
                                const isOriginal = rowIndex === 0 && copy === 0;

                                return (
                                    <ul
                                        key={copy}
                                        className="partners__group"
                                        aria-label={isOriginal ? title : undefined}
                                        aria-hidden={isOriginal ? undefined : true}
                                    >
                                        {items.map((partner) => (
                                            <li key={partner.name} className="partners__card">
                                                <Image
                                                    src={partner.logo.src}
                                                    alt={isOriginal ? partner.name : ""}
                                                    width={partner.logo.width}
                                                    height={partner.logo.height}
                                                    className="partners__logo"
                                                    style={{ "--partners-logo-w": `${partner.logo.width}px` } as CSSProperties}
                                                    draggable={false}
                                                />
                                            </li>
                                        ))}
                                    </ul>
                                );
                            })}
                        </div>
                    </div>
                ))}
            </div>
        </section>
    );
}