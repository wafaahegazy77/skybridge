import type { SVGProps } from "react";

// "long-arrow-alt-right" icon from the Figma components page (24×24 frame). Used on the blog cards.
// Uses currentColor so it follows the text color of its parent.
export default function LongArrowRightIcon(props: SVGProps<SVGSVGElement>) {
    return (
        <svg
            viewBox="0 0 24 24"
            width={20}
            height={20}
            fill="currentColor"
            aria-hidden="true"
            focusable="false"
            {...props}
        >
            <path d="M15.89 6.96L14.84 8.04L18.05 11.25H3V12.75H18.05L14.84 15.96L15.89 17.04L20.93 12L15.89 6.96Z" />
        </svg>
    );
}