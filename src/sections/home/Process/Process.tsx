import Image from "next/image";
import type { CSSProperties } from "react";
import type { HomeProcess } from "@/types/home";
import ProcessMotion from "./ProcessMotion";
import "./_Process.scss";

type ProcessProps = {
    data: HomeProcess;
};

const TITLE_ID = "process-title";

// Figma "fav-lg 3": the Skybridge triangle, 1000 × 876, already exported at its Figma look (grey, 2%).
const MARK = { src: "/images/fav-lg2.png", width: 1000, height: 876 };

// Server Component: all content is rendered here; ProcessMotion only adds the scroll sequence.
// Until it is armed (no JavaScript, reduced motion) the steps are shown as a plain grid of cards.
export default function Process({ data }: ProcessProps) {
    const { title, description, steps } = data;

    return (
        <ProcessMotion labelledBy={TITLE_ID}>
            {/* Figma "BG": a 10% gradient and a 5% desaturated light-ribbon image. */}
            <div className="process__bg" aria-hidden="true">
                <span className="process__bg-gradient" />
                <span className="process__bg-image" />
            </div>

            <div className="container">
                <div className="process__inner">
                    <header className="process__header">
                        <h2 id={TITLE_ID} className="process__title">
                            {title}
                        </h2>
                        <p className="process__description">{description}</p>
                    </header>

                    <div className="process__stage">
                        <Image
                            src={MARK.src}
                            alt=""
                            width={MARK.width}
                            height={MARK.height}
                            className="process__mark"
                            aria-hidden="true"
                            sizes="(min-width: 768px) 1000px, 130vw"
                        />

                        {/* Steps in order. Armed: a 3D stack the scroll moves through (Vine "/Create a unified
                            ecosystem" interaction). The number is decorative: the list already conveys the order. */}
                        <ol className="process__list" role="list">
                            {steps.map((step, index) => (
                                <li
                                    key={step.title}
                                    className={`process__card process__card--${index % 2 === 0 ? "left" : "right"}`}
                                    style={{ "--process-index": index } as CSSProperties}
                                >
                                    <div className="process__card-head">
                                        <span className="process__card-number" aria-hidden="true">
                                            {String(index + 1).padStart(2, "0")}
                                        </span>
                                        <h3 className="process__card-title">{step.title}</h3>
                                    </div>
                                    <p className="process__card-subtitle">{step.subtitle}</p>
                                    <p className="process__card-description">{step.description}</p>
                                </li>
                            ))}
                        </ol>
                    </div>
                </div>
            </div>
        </ProcessMotion>
    );
}