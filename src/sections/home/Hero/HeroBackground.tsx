import { HERO_LINE_PATHS, HERO_LINES_VIEWBOX } from "./heroLines";

// Decorative Hero background: two light glows + the 37 Figma contour lines (static).
// Lives in its own clipped layer so the SKYBRIDGE wordmark can travel outside the Hero.
// During the entrance, the stencil sheet (heroStencil.ts) covers it and fades away to reveal it.
export default function HeroBackground() {
    return (
        <div className="hero__bg" aria-hidden="true">
            <div className="hero__glows hero__reveal">
                <span className="hero__glow hero__glow--green" />
                <span className="hero__glow hero__glow--purple" />
            </div>

            <div className="hero__lines hero__reveal">
                <svg
                    className="hero__lines-layer"
                    viewBox={`0 0 ${HERO_LINES_VIEWBOX.width} ${HERO_LINES_VIEWBOX.height}`}
                    width={HERO_LINES_VIEWBOX.width}
                    height={HERO_LINES_VIEWBOX.height}
                    fill="none"
                    focusable="false"
                >
                    <defs>
                        {/* Figma stroke: linear gradient #DCDCEE → #ECECED at 5% opacity */}
                        <linearGradient id="heroLineGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0" stopColor="#DCDCEE" />
                            <stop offset="1" stopColor="#ECECED" />
                        </linearGradient>
                    </defs>

                    {HERO_LINE_PATHS.map((d, index) => (
                        <path
                            key={index}
                            className="hero__line"
                            d={d}
                            stroke="url(#heroLineGradient)"
                            strokeOpacity={0.05}
                            strokeWidth={2}
                        />
                    ))}
                </svg>
            </div>
        </div>
    );
}