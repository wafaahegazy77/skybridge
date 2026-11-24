    import Image from "next/image";
import RoundedButton from "@/components/ui/RoundedButton";
import type { HomeProject } from "@/types/home";

type PortfolioCardProps = {
    project: HomeProject;
};

// Figma corner marks of the case-study card (35 × 35, 1px white at 50%, 15px rounded outer corner).
const CORNERS = ["top-left", "top-right", "bottom-right", "bottom-left"] as const;

// One case-study card (Figma "Group 21": 1206 × 629). The outer element is what gets pinned while the
// cards stack; the inner element carries the card itself and is what moves back when the next card
// covers it (see usePortfolioAnimation), so the two transforms never conflict.
export default function PortfolioCard({ project }: PortfolioCardProps) {
    const { id, title, subtitle, description, image, action } = project;
    const titleId = `portfolio-${id}-title`;

    return (
        <article className="portfolio__card" aria-labelledby={titleId}>
            <div className="portfolio__card-inner">
                <div className="portfolio__card-glows" aria-hidden="true">
                    <span className="portfolio__card-glow portfolio__card-glow--green" />
                    <span className="portfolio__card-glow portfolio__card-glow--purple" />
                </div>

                {CORNERS.map((corner) => (
                    <span key={corner} className={`portfolio__corner portfolio__corner--${corner}`} aria-hidden="true" />
                ))}

                <div className="portfolio__card-content">
                    <div className="portfolio__card-text">
                        <h3 id={titleId} className="portfolio__card-title portfolio__reveal">
                            <span className="portfolio__title-line">{title}</span>
                        </h3>
                        <p className="portfolio__card-subtitle portfolio__reveal">{subtitle}</p>
                        <p className="portfolio__card-description portfolio__reveal">{description}</p>

                        <div className="portfolio__card-action portfolio__reveal">
                            <RoundedButton
                                href={action.href}
                                label={action.label}
                                variant="white"
                                className="portfolio__button"
                                ariaLabel={`${action.label}: ${title}`}
                            />
                        </div>
                    </div>

                    <div className="portfolio__card-media portfolio__reveal">
                        <Image
                            src={image.src}
                            alt={image.alt}
                            width={image.width}
                            height={image.height}
                            sizes="(max-width: 767.98px) 92vw, (max-width: 1199.98px) 42vw, 485px"
                            className="portfolio__card-img"
                        />
                    </div>
                </div>
            </div>
        </article>
    );
}