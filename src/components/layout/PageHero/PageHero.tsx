import type { ReactNode } from "react";
import PageHeroMotion from "./PageHeroMotion";
import "./_PageHero.scss";

type PageHeroProps = {
    title: string;
    /** Optional content pinned to the bottom edge of the hero (About: the green ticker band). */
    children?: ReactNode;
};

const TITLE_ID = "page-hero-title";

// Without JavaScript the entrance never runs, so show everything immediately.
const NO_SCRIPT_STYLES = `<style>.page-hero[data-page-hero-state="pending"] .page-hero__reveal{visibility:visible!important}</style>`;

// Server Component: header of the inner pages (Figma: About us → "hero", 1512 × 546). A dark wave
// photo under a 90% gradient, one green glow and the page title. PageHeroMotion (client) adds the
// entrance, the scroll recede and the glow's pointer lean.
export default function PageHero({ title, children }: PageHeroProps) {
    return (
        <PageHeroMotion labelledBy={TITLE_ID}>
            <noscript dangerouslySetInnerHTML={{ __html: NO_SCRIPT_STYLES }} />

            {/* Decorative layers (Figma: image fill, 90% gradient, masked green ellipse). */}
            <div className="page-hero__bg" aria-hidden="true">
                <span className="page-hero__image page-hero__reveal" />
                <span className="page-hero__shade" />
                <span className="page-hero__glow page-hero__reveal" />
            </div>

            <div className="container">
                <div className="page-hero__content">
                    <h1 id={TITLE_ID} className="page-hero__title page-hero__reveal">
                        {title}
                    </h1>
                </div>
            </div>

            {children && <div className="page-hero__bottom">{children}</div>}
        </PageHeroMotion>
    );
}