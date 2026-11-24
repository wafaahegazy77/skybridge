import Image from "next/image";
import Link from "next/link";
import { FacebookIcon, InstagramIcon, LinkedinIcon, TiktokIcon } from "@/components/icons/SocialIcons";
import { FOOTER, type SocialNetwork } from "@/constants/footer";
import { ROUTES } from "@/constants/routes";
import { BRAND } from "@/constants/site";
import FooterNewsletter from "./FooterNewsletter";
import "./_Footer.scss";

const LINKS_TITLE_ID = "footer-links-title";

const SOCIAL_ICONS: Record<SocialNetwork, typeof FacebookIcon> = {
    facebook: FacebookIcon,
    instagram: InstagramIcon,
    linkedin: LinkedinIcon,
    tiktok: TiktokIcon,
};

// Site footer (Figma: Home, under the "call action" card). Server Component; only the newsletter form
// runs on the client. Columns: logo + description, "Top Links", newsletter + social links; below them
// the full-width Skybridge wordmark fading into the page.
export default function Footer() {
    const { description, links, social } = FOOTER;

    return (
        <footer className="site-footer">
            <div className="container">
                <div className="site-footer__main">
                    <div className="site-footer__about">
                        <Link href={ROUTES.home} className="site-footer__brand-link" aria-label="Skybridge home">
                            <Image
                                src="/images/logo.png"
                                alt="Skybridge"
                                width={160}
                                height={113}
                                className="site-footer__logo"
                            />
                        </Link>
                        <p className="site-footer__description">{description}</p>
                    </div>

                    <nav className="site-footer__links" aria-labelledby={LINKS_TITLE_ID}>
                        <h2 id={LINKS_TITLE_ID} className="site-footer__heading">
                            {links.title}
                        </h2>
                        <ul className="site-footer__list">
                            {links.items.map((link) => (
                                <li key={link.label}>
                                    <Link href={link.href} className="site-footer__link">
                                        {link.label}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </nav>

                    <div className="site-footer__connect">
                        <FooterNewsletter />

                        <ul className="site-footer__social" aria-label="Skybridge on social media">
                            {social.map((item) => {
                                const Icon = SOCIAL_ICONS[item.network];
                                // Real profile URLs open in a new tab; placeholders ("#") stay in place.
                                const external = item.href.startsWith("http");

                                return (
                                    <li key={item.network}>
                                        <a
                                            href={item.href}
                                            className="site-footer__social-link"
                                            aria-label={item.label}
                                            {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                                        >
                                            <Icon />
                                        </a>
                                    </li>
                                );
                            })}
                        </ul>
                    </div>
                </div>
            </div>

            {/* Figma "footer": the wordmark across the page, fading into the background at the bottom. */}
            <div className="site-footer__wordmark" aria-hidden="true">
                <Image
                    src={BRAND.wordmark.src}
                    alt=""
                    width={BRAND.wordmark.width}
                    height={BRAND.wordmark.height}
                    className="site-footer__wordmark-img"
                    sizes="100vw"
                />
            </div>
        </footer>
    );
}