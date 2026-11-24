import Image from "next/image";
import Link from "next/link";
import ArrowUpRightIcon from "@/components/icons/ArrowUpRightIcon";
import type { HomeContact } from "@/types/home";
import ContactCtaDetail from "./ContactCtaDetail";
import "./_ContactCta.scss";

type ContactCtaProps = {
    data: HomeContact;
};

const TITLE_ID = "contact-cta-title";

// Figma "fav-lg 4": the green Skybridge triangle (1228 × 1075, exported with its 80% opacity).
const MARK = { src: "/images/fav-lg.png", width: 1228, height: 1075 };

// Server Component (no client JavaScript): Figma "call action" card. The only interactions are the
// hover / focus states of the round "Contact Us" button and of the phone and e-mail links (CSS).
export default function ContactCta({ data }: ContactCtaProps) {
    const { eyebrow, title, details, action } = data;

    return (
        <section className="contact-cta" aria-labelledby={TITLE_ID}>
            <div className="contact-cta__card">
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
                            <p className="contact-cta__eyebrow">{eyebrow}</p>
                            <h2 id={TITLE_ID} className="contact-cta__title">
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
                        <Link href={action.href} className="contact-cta__button">
                            <ArrowUpRightIcon className="contact-cta__button-icon" />
                            <span className="contact-cta__button-label">{action.label}</span>
                        </Link>
                    </div>
                </div>
            </div>
        </section>
    );
}