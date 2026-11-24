import { PROMISE_CONTOURS } from "./promiseRings";

const GRADIENT_ID = "about-promise-contour-gradient";

// Figma "Frame" (339 × 343, clipped) in the "Our promise to you" card: the contour rings, 40% overall,
// each ring filled with the Figma gradient (#2DD975 on the right → #4C24C1 on the left). The rings are
// separate paths so useFeaturesAnimation can ripple them.
export default function PromiseContours() {
    return (
        <svg className="about-feature__contours" viewBox="0 0 339 343" focusable="false">
            <defs>
                <linearGradient id={GRADIENT_ID} x1="1" y1="0.5" x2="0" y2="0.5">
                    <stop offset="0" stopColor="#2dd975" />
                    <stop offset="1" stopColor="#4c24c1" />
                </linearGradient>
            </defs>
            <g className="about-feature__contour-group" transform="translate(9 -138.7)" fill={`url(#${GRADIENT_ID})`}>
                {PROMISE_CONTOURS.map((ring, index) => (
                    <path
                        key={index}
                        className="about-feature__ring"
                        transform={`translate(${ring.x} ${ring.y})`}
                        opacity={ring.opacity}
                        data-opacity={ring.opacity}
                        d={ring.d}
                    />
                ))}
            </g>
        </svg>
    );
}