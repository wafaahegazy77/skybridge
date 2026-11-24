import type { AboutTicker as AboutTickerData } from "@/types/about";
import AboutTickerMotion from "./AboutTickerMotion";
import "./_AboutTicker.scss";

type AboutTickerProps = {
    data: AboutTickerData;
};

// The phrase set is repeated so the band is always full while it scrolls (3 sets cover screens up to
// about 2× the set width; the set is ~1860px wide on desktop). Only the first set is read by assistive
// technology; the copies are hidden from it.
const COPIES = 3;

// Without JavaScript the band is shown as is (no entrance).
const NO_SCRIPT_STYLES = `<style>.about-ticker[data-ticker-state="pending"]{clip-path:none!important;animation:none!important}</style>`;

// Server Component: Figma "Group 1000001770", the green band on the bottom edge of the About hero.
// AboutTickerMotion (client) makes it an endless, scroll-reactive marquee.
export default function AboutTicker({ data }: AboutTickerProps) {
    return (
        <AboutTickerMotion>
            <noscript dangerouslySetInnerHTML={{ __html: NO_SCRIPT_STYLES }} />

            <div className="about-ticker__track">
                {Array.from({ length: COPIES }, (_, copy) => (
                    <ul className="about-ticker__group" key={copy} aria-hidden={copy > 0 || undefined}>
                        {data.items.map((item, index) => (
                            <li className="about-ticker__item" key={`${item}-${index}`}>
                                {/* Figma "Polygon 1": a 29px triangle turned to point right. */}
                                <svg className="about-ticker__icon" viewBox="0 0 29 29" aria-hidden="true" focusable="false">
                                    <path d="M29 14.5 7.25 27.06V1.94Z" />
                                </svg>
                                {item}
                            </li>
                        ))}
                    </ul>
                ))}
            </div>
        </AboutTickerMotion>
    );
}