import Image from "next/image";
import type { AboutWhoWeAre } from "@/types/about";
import WhoWeAreBadge from "./WhoWeAreBadge";
import WhoWeAreMotion from "./WhoWeAreMotion";
import "./_WhoWeAre.scss";

type WhoWeAreProps = {
    data: AboutWhoWeAre;
};

const TITLE_ID = "who-we-are-title";

// Figma "agency-benefits-bg-shape": the dark ribbed sphere at the right edge (decorative design asset).
const SPHERE = { src: "/images/sphere.webp", width: 299, height: 307 };

// Without JavaScript the entrance never runs, so show everything immediately.
const NO_SCRIPT_STYLES = `<style>.who-we-are[data-who-state="pending"] .who-we-are__reveal{visibility:visible!important}</style>`;

// Server Component: Figma About us → "about" (1463 × 1314). Circle badge and the "Who we are" copy in
// two staggered columns, then the wide event photo in its notched frame. WhoWeAreMotion (client) adds
// the entrance and the scroll depth.
export default function WhoWeAre({ data }: WhoWeAreProps) {
    const { eyebrow, title, titleHighlight, intro, highlight, description, badge, media } = data;

    return (
        <WhoWeAreMotion labelledBy={TITLE_ID}>
            <noscript dangerouslySetInnerHTML={{ __html: NO_SCRIPT_STYLES }} />

            {/* Decorative layers, in the Figma order: the sphere, then the purple glow over it (Figma
                "agency-benefits-bg-shape", "Ellipse 5"). Each has nested layers so the scroll depth, the
                pointer and the idle motion can move it at the same time (useWhoWeAreAnimation). */}
            <div className="who-we-are__decor" aria-hidden="true">
                <div className="who-we-are__sphere who-we-are__reveal">
                    <div className="who-we-are__sphere-lean">
                        <Image
                            src={SPHERE.src}
                            alt=""
                            width={SPHERE.width}
                            height={SPHERE.height}
                            className="who-we-are__sphere-img"
                            sizes="315px"
                        />
                    </div>
                </div>
                <div className="who-we-are__glow">
                    <span className="who-we-are__glow-light" />
                </div>
            </div>

            <div className="container">
                <div className="who-we-are__inner">
                    {/* Figma "Group 5": two corner marks framing the section, top left and top right. */}
                    <span className="who-we-are__corner who-we-are__corner--start who-we-are__reveal" aria-hidden="true" />
                    <span className="who-we-are__corner who-we-are__corner--end who-we-are__reveal" aria-hidden="true" />

                    <div className="who-we-are__grid">
                        <WhoWeAreBadge badge={badge} />

                        <div className="who-we-are__content">
                            <p className="who-we-are__eyebrow who-we-are__reveal">
                                <span className="who-we-are__eyebrow-dot" aria-hidden="true" />
                                {eyebrow}
                            </p>
                            {/* Figma: the second line is Skybridge green. */}
                            <h2 id={TITLE_ID} className="who-we-are__title who-we-are__reveal">
                                {title}
                                {"\n"}
                                <span className="who-we-are__title-accent">{titleHighlight}</span>
                            </h2>
                            <p className="who-we-are__text who-we-are__text--muted who-we-are__intro who-we-are__reveal">
                                {intro}
                            </p>
                        </div>

                        <div className="who-we-are__story">
                            <p className="who-we-are__text who-we-are__reveal">{highlight}</p>
                            <p className="who-we-are__text who-we-are__text--muted who-we-are__reveal">{description}</p>
                        </div>
                    </div>

                    {/* Figma "Subtract": the event photo in a frame with two notched corners. */}
                    <div className="who-we-are__media who-we-are__reveal">
                        <div className="who-we-are__media-frame">
                            {/* Slightly taller than the frame: room for the scroll depth (useWhoWeAreAnimation). */}
                            <div className="who-we-are__media-depth">
                                <Image
                                    src={media.src}
                                    alt={media.alt}
                                    fill
                                    sizes="(min-width: 1400px) 1208px, 100vw"
                                    className="who-we-are__media-img"
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </WhoWeAreMotion>
    );
}