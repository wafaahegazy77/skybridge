import type { HomePortfolio } from "@/types/home";
import PortfolioCard from "./PortfolioCard";
import PortfolioMotion from "./PortfolioMotion";
import "./_Portfolio.scss";

type PortfolioProps = {
    data: HomePortfolio;
};

const TITLE_ID = "portfolio-title";

// Without JavaScript the entrance never runs, so show everything immediately.
const NO_SCRIPT_STYLES = `<style>.portfolio[data-portfolio-state="pending"] .portfolio__reveal{visibility:visible!important}</style>`;

export default function Portfolio({ data }: PortfolioProps) {
    const { eyebrow, title, projects } = data;

    return (
        <PortfolioMotion labelledBy={TITLE_ID}>
            <noscript dangerouslySetInnerHTML={{ __html: NO_SCRIPT_STYLES }} />

            <div className="container">
                <div className="portfolio__inner">
                    <header className="portfolio__header">
                        <p className="portfolio__eyebrow portfolio__reveal">{eyebrow}</p>
                        <h2 id={TITLE_ID} className="portfolio__title portfolio__reveal">
                            <span className="portfolio__title-line">{title}</span>
                        </h2>
                    </header>

                    {/* Case studies in stacking order: on desktop each card pins and the next one slides over it. */}
                    <div className="portfolio__stack">
                        {projects.map((project) => (
                            <PortfolioCard key={project.id} project={project} />
                        ))}
                    </div>
                </div>
            </div>
        </PortfolioMotion>
    );
}