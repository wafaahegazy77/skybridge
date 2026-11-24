import type { SVGProps } from "react";

// "envelope" icon from the Figma footer (24×24 frame). Uses currentColor.
export default function EnvelopeIcon(props: SVGProps<SVGSVGElement>) {
    return (
        <svg
            viewBox="-2.25 -6 24 24"
            width={24}
            height={24}
            fill="currentColor"
            aria-hidden="true"
            focusable="false"
            {...props}
        >
            <path d="M0 0V13.5H19.5V0H0ZM3.23 1.5H16.27L9.75 5.84L3.23 1.5ZM1.5 2.16L9.33 7.38L9.75 7.64L10.17 7.38L18 2.16V12H1.5V2.16Z" />
        </svg>
    );
}