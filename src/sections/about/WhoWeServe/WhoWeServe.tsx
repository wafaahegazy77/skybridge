import type { AboutWhoWeServe } from "@/types/about";
import ServeCard from "./ServeCard";
import WhoWeServeMotion from "./WhoWeServeMotion";
import "./_WhoWeServe.scss";

type WhoWeServeProps = {
    data: AboutWhoWeServe;
};

const TITLE_ID = "who-we-serve-title";

// Figma "giphy-1": a 48-frame smoke animation behind the panel, seen at 5%. The still (its first frame,
// shared with the Home Mission panel) shows until the animation is ready, and stays for reduced motion;
// the frames, packed into one sprite sheet, are played by smokeRenderer.
const SMOKE_TEXTURE = "/images/mission-smoke.webp";
const SMOKE_ANIMATION = "/images/who-we-serve-smoke.webp";

// Without JavaScript the entrance never runs, so show everything immediately.
const NO_SCRIPT_STYLES = `<style>.who-we-serve[data-serve-state="pending"] .who-we-serve__reveal{visibility:visible!important}</style>`;

// Server Component: Figma About us → "about" (1512 × 804 at y 3444): a full-width dark panel with the
// smoke texture and two lights, the eyebrow and title centered, and four glass cards.
// WhoWeServeMotion (client) adds the moving smoke, the entrance, the scroll drift of the lights and the
// pointer light.
export default function WhoWeServe({ data }: WhoWeServeProps) {
    const { eyebrow, title, items } = data;

    return (
        <WhoWeServeMotion labelledBy={TITLE_ID}>
            <noscript dangerouslySetInnerHTML={{ __html: NO_SCRIPT_STYLES }} />

            {/* Figma background: smoke texture under a 95% #1A1F1F fill, green and purple lights (blur 300). */}
            <div className="who-we-serve__backdrop" aria-hidden="true">
                <span className="who-we-serve__texture" style={{ backgroundImage: `url(${SMOKE_TEXTURE})` }} />
                <canvas className="who-we-serve__smoke" data-src={SMOKE_ANIMATION} />
                <span className="who-we-serve__glow who-we-serve__glow--green" />
                <span className="who-we-serve__glow who-we-serve__glow--purple" />
            </div>

            <div className="container">
                <header className="who-we-serve__header">
                    <p className="who-we-serve__eyebrow who-we-serve__reveal">{eyebrow}</p>
                    <h2 id={TITLE_ID} className="who-we-serve__title who-we-serve__reveal">
                        {title}
                    </h2>
                </header>

                <ul className="who-we-serve__list">
                    {items.map((item) => (
                        <ServeCard key={item.id} item={item} />
                    ))}
                </ul>
            </div>
        </WhoWeServeMotion>
    );
}