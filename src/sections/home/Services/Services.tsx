import Image from "next/image";
import ArrowRightIcon from "@/components/icons/ArrowRightIcon";
import RoundedButton from "@/components/ui/RoundedButton";
import type { HomeServices } from "@/types/home";
import ServicesMotion from "./ServicesMotion";
import "./_Services.scss";

type ServicesProps = {
    data: HomeServices;
};

const TITLE_ID = "services-title";
const PATTERN = { src: "/images/services/pattern-triangles.png", width: 646, height: 684 };

// The slider loops endlessly. Swiper's loop needs more slides than fit around the centred card, so a short
// service list is rendered several times in a row (4 services → 8 slides); the slider still counts and
// announces the real services only (see useServicesSlider).
const LOOP_MIN_SLIDES = 8;

// Without JavaScript the reveal never runs, so show everything immediately.
const NO_SCRIPT_STYLES = `<style>.services[data-services-state="pending"] .services__reveal{visibility:visible!important}</style>`;

export default function Services({ data }: ServicesProps) {
    const { title, subtitle, items } = data;
    const copies = items.length ? Math.ceil(LOOP_MIN_SLIDES / items.length) : 0;
    const slides = Array.from({ length: copies }, (_, copy) => items.map((service, index) => ({ service, index, copy }))).flat();

    return (
        <ServicesMotion labelledBy={TITLE_ID}>
            <noscript dangerouslySetInnerHTML={{ __html: NO_SCRIPT_STYLES }} />

            <span className="services__glow" aria-hidden="true" />

            <div className="services__panel">
                <span className="services__panel-bg services__reveal" aria-hidden="true" />

                {/* Figma "pat 1" / "pat 2": green triangle pattern at 40% opacity. */}
                {(["top", "bottom"] as const).map((position) => (
                    <div key={position} className={`services__pattern services__pattern--${position}`} aria-hidden="true">
                        <div className="services__pattern-inner">
                            <Image
                                src={PATTERN.src}
                                alt=""
                                width={PATTERN.width}
                                height={PATTERN.height}
                                sizes="142px"
                                className="services__pattern-img"
                            />
                        </div>
                    </div>
                ))}

                <header className="services__header">
                    {/* Decorative outline copy: drawn first, then flooded by the solid title (Hero/Intro language). */}
                    <div className="services__title-wrap">
                        <span className="services__title-outline" aria-hidden="true">
                            {title}
                        </span>
                        <h2 id={TITLE_ID} className="services__title services__reveal">
                            {title}
                        </h2>
                    </div>
                    <p className="services__subtitle services__reveal">{subtitle}</p>
                </header>

                <div className="services__body">
                    <div className="services__controls">
                        {/* Visual counter; Swiper's a11y module announces slide changes to screen readers. */}
                        <div className="services__counter services__reveal" aria-hidden="true">
                            <span className="services__counter-current">
                                <span className="services__counter-num">1</span>
                            </span>
                            <span className="services__counter-sep">:</span>
                            <span className="services__counter-total">{items.length}</span>
                        </div>

                        <div className="services__nav">
                            <button type="button" className="services__nav-btn services__nav-btn--prev services__reveal">
                                <ArrowRightIcon className="services__nav-icon" />
                            </button>
                            <button type="button" className="services__nav-btn services__nav-btn--next services__reveal">
                                <ArrowRightIcon className="services__nav-icon" />
                            </button>
                        </div>
                    </div>

                    <div className="services__slider swiper" data-services-count={items.length}>
                        <div className="swiper-wrapper">
                            {slides.map(({ service, index, copy }) => (
                                <div
                                    key={`${service.title}-${copy}`}
                                    className="swiper-slide services__slide"
                                    aria-label={`${index + 1} of ${items.length}`}
                                >
                                    <article className="services__card services__reveal">
                                        <div className="services__card-media">
                                            <div className="services__card-zoom">
                                                <Image
                                                    src={service.image.src}
                                                    alt={service.image.alt}
                                                    fill
                                                    sizes="(max-width: 767.98px) 396px, (max-width: 1199.98px) 416px, 476px"
                                                    className="services__card-img"
                                                />
                                            </div>
                                        </div>
                                        <span className="services__card-shade" aria-hidden="true" />

                                        <div className="services__card-body">
                                            <h3 className="services__card-title">{service.title}</h3>
                                            <p className="services__card-text">{service.description}</p>
                                        </div>

                                        <div className="services__card-action">
                                            <RoundedButton
                                                href={service.action.href}
                                                label={service.action.label}
                                                ariaLabel={`${service.action.label} about ${service.title}`}
                                                variant="white"
                                                className="services__button"
                                            />
                                        </div>
                                    </article>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </ServicesMotion>
    );
}