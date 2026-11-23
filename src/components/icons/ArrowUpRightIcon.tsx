import type { SVGProps } from "react";

// "arrow-top-right" icon from the Figma components page (24×24 frame, 18×18 glyph).
// Uses currentColor so it follows the text color of its parent.
export default function ArrowUpRightIcon(props: SVGProps<SVGSVGElement>) {
    return (
        <svg
            viewBox="-3 -3 24 24"
            width={14}
            height={14}
            fill="currentColor"
            aria-hidden="true"
            focusable="false"
            {...props}
        >
            <path d="M18 0V13.475H16.508V2.536L1.044 18L0 16.906L15.414 1.492H4.475V0H18Z" />
        </svg>
    );
}