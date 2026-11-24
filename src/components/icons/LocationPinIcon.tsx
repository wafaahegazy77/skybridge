import type { SVGProps } from "react";

// Location pin from the Figma contact row (15 × 18 outline, 1px stroke). Uses currentColor.
export default function LocationPinIcon(props: SVGProps<SVGSVGElement>) {
    return (
        <svg
            viewBox="-0.5 -0.5 15.73 19"
            width={15}
            height={18}
            fill="none"
            stroke="currentColor"
            strokeWidth={1}
            aria-hidden="true"
            focusable="false"
            {...props}
        >
            <path d="M14.73 7.36C14.73 12.36 7.36 18 7.36 18S0 12.36 0 7.36a7.36 7.36 0 0 1 14.73 0Z" />
            <circle cx="7.36" cy="7.36" r="2.45" />
        </svg>
    );
}