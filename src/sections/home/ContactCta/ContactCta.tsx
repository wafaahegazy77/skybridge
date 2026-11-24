import Image from "next/image";
import Link from "next/link";
import ArrowUpRightIcon from "@/components/icons/ArrowUpRightIcon";
import type { HomeContact } from "@/types/home";
import ContactCtaDetail from "./ContactCtaDetail";
import ContactCtaMotion from "./ContactCtaMotion";
import "./_ContactCta.scss";

type ContactCtaProps = {
    data: HomeContact;
};

const TITLE_ID = "contact-cta-title";

// Without JavaScript the entrance never runs, so show everything immediately.
const NO_SCRIPT_STYLES = `<style>.contact-cta[data-contact-state="pending"] .contact-cta__reveal{visibility:visible!important}</style>`;

// Figma "fav-lg 4": the green Skybridge triangle (1228 × 1075, exported with its 80% opacity).
const MARK = { src: "/images/fav-lg.png", width: 1228, height: 1075 };

// Server Component: Figma "call action" card. ContactCtaMotion (client) adds the entrance, the depth
// parallax of the glows and triangle, and the button's magnetic pull; hover states are CSS.
export default function ContactCta({ data }: ContactCtaProps) {
    const { eyebrow, title, details, action } = data;

    return (
        <ContactCtaMotion labelledBy={TITLE_ID}>
            <noscript dangerouslySetInnerHTML={{ __html: NO_SCRIPT_STYLES }} />

            <div className="contact-cta__card contact-cta__reveal">
                {/* Figma "Mask group": two blurred glows and the triangle, clipped to the card. */}
                <div className="contact-cta__decor" aria-hidden="true">
                    <span className="contact-cta__glow contact-cta__glow--green" />
                    <span className="contact-cta__glow contact-cta__glow--purple" />
                    <Image
                        src={MARK.src}
                        alt=""
                        width={MARK.width}
                        height={MARK.height}
                        className="contact-cta__mark"
                        sizes="(min-width: 768px) 1228px, 560px"
                    />
                </div>

                <div className="container">
                    <div className="contact-cta__inner">
                        <div className="contact-cta__content">
                            <p className="contact-cta__eyebrow contact-cta__reveal">{eyebrow}</p>
                            <h2 id={TITLE_ID} className="contact-cta__title contact-cta__reveal">
                                {title}
                            </h2>

                            <address className="contact-cta__details">
                                <ul className="contact-cta__list">
                                    {details.map((detail) => (
                                        <ContactCtaDetail key={detail.title} detail={detail} />
                                    ))}
                                </ul>
                            </address>
                        </div>

                        {/* Figma "Button": 220px white circle, arrow above the label. */}
                        {/* The ripple ring is decorative: it pulses out once when the button appears, and on hover. */}
                        <Link href={action.href} className="contact-cta__button contact-cta__reveal">
                            <span className="contact-cta__button-ripple" aria-hidden="true" />
                            <ArrowUpRightIcon className="contact-cta__button-icon" />
                            <span className="contact-cta__button-label">{action.label}</span>
                        </Link>
                    </div>
                </div>
            </div>
        </ContactCtaMotion>
    );
}