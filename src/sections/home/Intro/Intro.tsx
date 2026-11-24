import Image from "next/image";
import RoundedButton from "@/components/ui/RoundedButton";
import { BRAND } from "@/constants/site";
import type { HomeIntro } from "@/types/home";
import IntroMotion from "./IntroMotion";
import "./_Intro.scss";

type IntroProps = {
    data: HomeIntro;
};

const TITLE_ID = "intro-title";

// Without JavaScript the reveal never runs, so show everything immediately.
const NO_SCRIPT_STYLES = `<style>.intro[data-intro-state="pending"] .intro__reveal{visibility:visible!important}</style>`;

// Figma corner marks of the "intro" frame (35 × 35 L-shapes, 1px white, 15px rounded corner).
const CORNERS = ["top-left", "top-right", "bottom-right", "bottom-left"] as const;

export default function Intro({ data }: IntroProps) {
    const { title, description, action } = data;
    // Words are wrapped server-side so the scroll "reading" highlight needs no client-side text splitting.
    const words = description.split(/\s+/).filter(Boolean);

    return (
        <IntroMotion labelledBy={TITLE_ID}>
            <noscript dangerouslySetInnerHTML={{ __html: NO_SCRIPT_STYLES }} />

            <div className="intro__glows" aria-hidden="true">
                <span className="intro__glow intro__glow--green" />
                <span className="intro__glow intro__glow--purple" />
            </div>

            <div className="container">
                <div className="intro__frame">
                    {CORNERS.map((corner) => (
                        <span
                            key={corner}
                            className={`intro__corner intro__corner--${corner} intro__reveal`}
                            aria-hidden="true"
                        />
                    ))}

                    <div className="intro__content">
                        {/* Landing slot of the Hero wordmark: hidden while the Hero copy travels onto it. */}
                        <div className="intro__wordmark" data-wordmark-target>
                            <Image
                                src={BRAND.wordmark.src}
                                alt=""
                                width={BRAND.wordmark.width}
                                height={BRAND.wordmark.height}
                                className="intro__wordmark-img"
                                unoptimized
                            />
                        </div>

                        {/* The outline copy is decorative: drawn first, then flooded by the solid title (Hero language). */}
                        <div className="intro__title-wrap">
                            <span className="intro__title-outline" aria-hidden="true">
                                {title}
                            </span>
                            <h2 id={TITLE_ID} className="intro__title intro__reveal">
                                {title}
                            </h2>
                        </div>

                        <p className="intro__text">
                            {words.map((word, index) => (
                                <span key={index} className="intro__word">
                                    {word}
                                    {index < words.length - 1 ? " " : null}
                                </span>
                            ))}
                        </p>

                        <div className="intro__action-wrap intro__reveal">
                            <RoundedButton
                                href={action.href}
                                label={action.label}
                                variant="white"
                                className="intro__action"
                            />
                        </div>
                    </div>
                </div>
            </div>
        </IntroMotion>
    );
}