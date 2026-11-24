import type { SVGProps } from "react";

// "angle-right" chevron from the Figma components page (24×24 frame). Points right; flip it with CSS
// (scaleX(-1)) for "previous" — the Figma "angle-left" is its exact mirror. Uses currentColor.
export default function AngleRightIcon(props: SVGProps<SVGSVGElement>) {
    return (
        <svg
            viewBox="0 0 24 24"
            width={14}
            height={14}
            fill="currentColor"
            aria-hidden="true"
            focusable="false"
            {...props}
        >
            <path d="M9.73 3.21L8.65 4.29L16.36 12L8.65 19.71L9.73 20.79L17.98 12.54L18.49 12L17.98 11.46L9.73 3.21Z" />
        </svg>
    );
}