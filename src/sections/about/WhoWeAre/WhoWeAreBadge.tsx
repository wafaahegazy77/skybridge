import Image from "next/image";
import type { AboutWhoWeAre } from "@/types/about";

type WhoWeAreBadgeProps = {
    badge: AboutWhoWeAre["badge"];
};

// Text ring: the phrase twice around the circle (Figma "curve text"), starting at the top and running
// clockwise. Baseline radius 88.5px in the 220px badge; the text is spread over the whole circle.
const RING_ID = "who-we-are-badge-ring";
const RADIUS = 88.5;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;
// Non-breaking spaces between the two phrases: a plain space can collapse when the text is spread
// over the circle (textLength).
const GAP = "\u00a0\u00a0";
const RING_PATH = `M110 ${110 - RADIUS}a${RADIUS} ${RADIUS} 0 1 1 0 ${RADIUS * 2}a${RADIUS} ${RADIUS} 0 1 1 0 -${RADIUS * 2}`;

// Figma "Circle Badge": 220px #222222 disc with a 1px #333333 ring, the Skybridge triangle in the
// middle and "Since 2015, Skybridge" set around it. Decorative: the same facts are in the copy.
export default function WhoWeAreBadge({ badge }: WhoWeAreBadgeProps) {
    return (
        <div className="who-we-are__badge who-we-are__reveal" aria-hidden="true">
            <svg className="who-we-are__badge-ring" viewBox="0 0 220 220" focusable="false">
                <defs>
                    <path id={RING_ID} d={RING_PATH} />
                </defs>
                <text className="who-we-are__badge-text">
                    <textPath href={`#${RING_ID}`} textLength={CIRCUMFERENCE} lengthAdjust="spacing">
                        {`${badge.text}${GAP}${badge.text}${GAP}`}
                    </textPath>
                </text>
            </svg>
            <Image
                src={badge.image.src}
                alt=""
                width={badge.image.width}
                height={badge.image.height}
                className="who-we-are__badge-mark"
                sizes="100px"
            />
        </div>
    );
}