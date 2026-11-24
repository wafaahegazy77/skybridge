import Link from "next/link";
import ArrowUpRightIcon from "@/components/icons/ArrowUpRightIcon";

export type RoundedButtonVariant = "glass" | "primary" | "white";

type RoundedButtonProps = {
    href: string;
    label: string;
    /** glass = Navbar CTA, primary = green fill, white = white fill (Figma "Button Rounded"). */
    variant: RoundedButtonVariant;
    className?: string;
    /** Accessible name when the visible label alone is ambiguous (e.g. repeated "Learn More" links). */
    ariaLabel?: string;
};

// Figma "Button Rounded" (Medium, icon right). Built on the existing `.butn` system and keeps
// its text-slide (`hvr-txt-trans`) and scale (`hvr-scale`) animations.
export default function RoundedButton({ href, label, variant, className, ariaLabel }: RoundedButtonProps) {
    const classes = [
        "butn",
        `${variant}_butn`,
        "rounded_butn",
        "radius-30",
        "hvr-txt-trans",
        "hvr-scale",
        className,
    ]
        .filter(Boolean)
        .join(" ");

    return (
        <Link href={href} className={classes} aria-label={ariaLabel}>
            <div className="txt" data-text={label}>
                <span>{label}</span>
            </div>
            <ArrowUpRightIcon className="butn__icon" />
        </Link>
    );
}