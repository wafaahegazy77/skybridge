import type { AboutFeatures as AboutFeaturesData } from "@/types/about";
import AboutFeaturesMotion from "./AboutFeaturesMotion";
import FeatureCard from "./FeatureCard";
import PromiseContours from "./PromiseContours";
import "./_AboutFeatures.scss";

type AboutFeaturesProps = {
    data: AboutFeaturesData;
};

const PROMISE_TITLE_ID = "about-promise-title";
const VISION_TITLE_ID = "about-vision-title";

// Without JavaScript the entrance never runs, so show everything immediately.
const NO_SCRIPT_STYLES = `<style>.about-features[data-features-state="pending"] .about-features__reveal{visibility:visible!important}</style>`;

// Server Component: Figma About us → "Group 1000001778" and "Group 1000001779", two glass cards under
// "Who we are": "Our promise to you" (photo left, green border, contour rings) and "When it's never been
// done before" (photo right). AboutFeaturesMotion (client) adds the entrance and the depth.
export default function AboutFeatures({ data }: AboutFeaturesProps) {
    const { promise, vision } = data;

    return (
        <AboutFeaturesMotion>
            <noscript dangerouslySetInnerHTML={{ __html: NO_SCRIPT_STYLES }} />

            {/* Figma "Ellipse 1": the green glow behind the first card's left edge. */}
            <span className="about-features__glow" aria-hidden="true" />

            <div className="container">
                <div className="about-features__list">
                    <FeatureCard
                        image={promise.image}
                        imageSide="start"
                        accent
                        decor={<PromiseContours />}
                        titleId={PROMISE_TITLE_ID}
                    >
                        <h2 id={PROMISE_TITLE_ID} className="about-feature__title">
                            {promise.title}
                        </h2>
                        <ul className="about-feature__points">
                            {promise.points.map((point) => (
                                <li key={point.lead} className="about-feature__text about-feature__text--muted">
                                    <span className="about-feature__lead">{point.lead}</span>
                                    {"\u00a0"}
                                    {point.text}
                                </li>
                            ))}
                        </ul>
                    </FeatureCard>

                    <FeatureCard image={vision.image} imageSide="end" titleId={VISION_TITLE_ID}>
                        <h2 id={VISION_TITLE_ID} className="about-feature__title">
                            {vision.title}
                        </h2>
                        <p className="about-feature__text about-feature__text--accent">{vision.highlight}</p>
                        <p className="about-feature__text about-feature__text--muted about-feature__text--lines">
                            {vision.description}
                        </p>
                        <p className="about-feature__text">{vision.closing}</p>
                    </FeatureCard>
                </div>
            </div>
        </AboutFeaturesMotion>
    );
}