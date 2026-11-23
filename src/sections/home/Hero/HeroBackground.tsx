import { HERO_LINE_PATHS, HERO_LINES_VIEWBOX } from "./heroLines";

// The 37 Figma contour lines are interleaved into two layers: even lines stay still ("base"),
// odd lines drift slowly ("drift"). Neighbouring lines sliding past each other is what makes the
// field read as a living wave, while only ONE composited layer ever moves (measured: every extra
// moving full-size layer roughly doubles compositing cost, see useHeroAnimation).
const LAYERS = (["base", "drift"] as const).map((name, layer) => ({
    name,
    paths: HERO_LINE_PATHS.map((d, index) => ({ d, index })).filter(({ index }) => index % 2 === layer),
}));

// Decorative Hero background: two light glows + Figma contour lines.
// Lives in its own clipped layer so the SKYBRIDGE wordmark can travel outside the Hero.
export default function HeroBackground() {
    return (
        <div className="hero__bg" aria-hidden="true">
            <div className="hero__glows hero__reveal">
                <span className="hero__glow hero__glow--green" />
                <span className="hero__glow hero__glow--purple" />
            </div>

            <div className="hero__lines hero__reveal">
                {LAYERS.map(({ name, paths }, layer) => (
                    <svg
                        key={name}
                        className={`hero__lines-layer hero__lines-layer--${name}`}
                        viewBox={`0 0 ${HERO_LINES_VIEWBOX.width} ${HERO_LINES_VIEWBOX.height}`}
                        width={HERO_LINES_VIEWBOX.width}
                        height={HERO_LINES_VIEWBOX.height}
                        fill="none"
                        focusable="false"
                    >
                        <defs>
                            {/* Figma stroke: linear gradient #DCDCEE → #ECECED at 5% opacity */}
                            <linearGradient id={`heroLineGradient${layer}`} x1="0" y1="0" x2="0" y2="1">
                                <stop offset="0" stopColor="#DCDCEE" />
                                <stop offset="1" stopColor="#ECECED" />
                            </linearGradient>
                        </defs>

                        {paths.map(({ d, index }) => (
                            <path
                                key={index}
                                className="hero__line"
                                data-line={index}
                                d={d}
                                pathLength={1}
                                stroke={`url(#heroLineGradient${layer})`}
                                strokeOpacity={0.05}
                                strokeWidth={2}
                            />
                        ))}
                    </svg>
                ))}
            </div>
        </div>
    );
}
