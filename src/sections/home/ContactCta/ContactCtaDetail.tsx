import LocationPinIcon from "@/components/icons/LocationPinIcon";
import PhoneIcon from "@/components/icons/PhoneIcon";
import type { HomeContactDetail } from "@/types/home";

type ContactCtaDetailProps = {
    detail: HomeContactDetail;
};

// Icon per contact row (the "icon" key comes with the data; an unknown key shows an empty circle).
const ICONS: Partial<Record<string, typeof PhoneIcon>> = {
    location: LocationPinIcon,
    phone: PhoneIcon,
};

// One Figma contact row: icon circle, bold title, then the lines (phone / e-mail become links).
export default function ContactCtaDetail({ detail }: ContactCtaDetailProps) {
    const Icon = ICONS[detail.icon];

    return (
        <li className="contact-cta__item contact-cta__reveal">
            {/* The ring is drawn as an SVG circle so the entrance can trace it like a signal. */}
            <span className="contact-cta__icon" aria-hidden="true">
                <svg className="contact-cta__ring" viewBox="0 0 45 45" focusable="false">
                    <circle cx="22.5" cy="22.5" r="22" pathLength={1} />
                </svg>
                <span className="contact-cta__glyph">{Icon && <Icon />}</span>
            </span>

            <div className="contact-cta__item-text">
                <p className="contact-cta__item-title">{detail.title}</p>

                {detail.lines.map((line) => (
                    <p
                        key={line.text}
                        className={`contact-cta__item-line${line.href ? " contact-cta__item-line--nowrap" : ""}`}
                    >
                        {line.label && `${line.label}: `}
                        {line.href ? (
                            <a href={line.href} className="contact-cta__link">
                                {line.text}
                            </a>
                        ) : (
                            line.text
                        )}
                    </p>
                ))}
            </div>
        </li>
    );
}