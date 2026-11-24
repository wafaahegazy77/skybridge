import Image from "next/image";
import RoundedButton from "@/components/ui/RoundedButton";
import { BRAND } from "@/constants/site";
import type { HomeHero } from "@/types/home";
import HeroBackground from "./HeroBackground";
import HeroMotion from "./HeroMotion";
import "./_Hero.scss";

type HeroProps = {
    data: HomeHero;
};

const TITLE_ID = "hero-title";

// Without JavaScript the entrance never runs, so show everything immediately.
const NO_SCRIPT_STYLES = `<style>.hero[data-hero-state="pending"] .hero__reveal{visibility:visible!important}</style>`;

export default function Hero({ data }: HeroProps) {
    const { eyebrow, title, primaryAction, secondaryAction } = data;

    return (
        <HeroMotion labelledBy={TITLE_ID}>
            <noscript dangerouslySetInnerHTML={{ __html: NO_SCRIPT_STYLES }} />

            <HeroBackground />

            <div className="container">
                <div className="hero__content">
                    <p className="hero__eyebrow hero__reveal">
                        <span className="hero__eyebrow-text">{eyebrow}</span>
                    </p>

                    {/* The pen is decorative: the point of light that writes the headline during the entrance. */}
                    <div className="hero__title-wrap">
                        <h1 id={TITLE_ID} className="hero__title hero__reveal">
                            {title}
                        </h1>
                        <span className="hero__pen" aria-hidden="true">
                            <span className="hero__pen-halo" />
                            <span className="hero__pen-core" />
                        </span>
                    </div>

                    <div className="hero__actions hero__reveal">
                        <RoundedButton
                            href={primaryAction.href}
                            label={primaryAction.label}
                            variant="primary"
                            className="hero__action"
                        />
                        <RoundedButton
                            href={secondaryAction.href}
                            label={secondaryAction.label}
                            variant="white"
                            className="hero__action"
                        />
                    </div>
                </div>
            </div>

            {/* Travels into the Intro section on scroll (target: [data-wordmark-target]). */}
            <div className="hero__wordmark" data-wordmark-source>
                <div className="hero__wordmark-mask hero__reveal">
                    {/* SVG wordmark: served as-is (the image optimizer does not process SVG). */}
                    <Image
                        src={BRAND.wordmark.src}
                        alt={BRAND.wordmark.alt}
                        width={BRAND.wordmark.width}
                        height={BRAND.wordmark.height}
                        className="hero__wordmark-img"
                        unoptimized
                        priority
                    />
                </div>
            </div>
        </HeroMotion>
    );
}