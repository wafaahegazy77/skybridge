import type { SVGProps } from "react";

// Slider arrow from the Figma Services controls (20×20 frame, 2px stroke).
// Points right; flip it with CSS (scaleX(-1)) for "previous". Uses currentColor.
export default function ArrowRightIcon(props: SVGProps<SVGSVGElement>) {
    return (
        <svg
            viewBox="0 0 20 20"
            width={20}
            height={20}
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            aria-hidden="true"
            focusable="false"
            {...props}
        >
            <path d="M2.1 9.93H19.24" />
            <path d="M9.97 0.42L18.4 8.67Q19.6 9.93 18.4 11.18L9.97 19.43" />
        </svg>
    );
}