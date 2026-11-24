import Image from "next/image";
import RoundedButton from "@/components/ui/RoundedButton";
import type { HomeMission } from "@/types/home";
import MissionMotion from "./MissionMotion";
import MissionTabs, { type MissionTab } from "./MissionTabs";
import "./_Mission.scss";

type MissionProps = {
    data: HomeMission;
};

const TITLE_ID = "mission-title";

// Figma "giphy-1": smoke texture behind the section, seen through the 95% dark fill (decorative, not content).
const SMOKE_TEXTURE = "/images/mission-smoke.webp";

// Without JavaScript the entrance never runs, so show everything immediately.
const NO_SCRIPT_STYLES = `<style>.mission[data-mission-state="pending"] .mission__reveal{visibility:visible!important}</style>`;

export default function Mission({ data }: MissionProps) {
    const { title, image, mission, values, action } = data;
    const titleLines = title.split("\n").map((line) => line.trim()).filter(Boolean);
    const titleText = titleLines.join(" ");

    // Figma tab order: OUR VALUES, then OUR MISSION (the default tab).
    // The values show their titles only, so both tabs hold a similar amount of content; the longer
    // descriptions stay in the data for the "Learn More" page.
    const tabs: MissionTab[] = [
        {
            id: "values",
            label: values.label,
            content: (
                <ul className="mission__list">
                    {values.items.map((item) => (
                        <li key={item.title} className="mission__item">
                            <span className="mission__lead">{item.title}</span>
                        </li>
                    ))}
                </ul>
            ),
        },
        {
            id: "mission",
            label: mission.label,
            content: (
                <ul className="mission__list">
                    {mission.statements.map((statement) => (
                        <li key={statement.lead} className="mission__item">
                            <span className="mission__lead">{statement.lead}</span>
                            <span className="mission__body">{statement.text}</span>
                        </li>
                    ))}
                </ul>
            ),
        },
    ];

    return (
        <MissionMotion labelledBy={TITLE_ID}>
            <noscript dangerouslySetInnerHTML={{ __html: NO_SCRIPT_STYLES }} />

            {/* Figma background: smoke texture under a 95% #1A1F1F fill, green and purple lights (blur 300). */}
            <div className="mission__backdrop" aria-hidden="true">
                <span className="mission__texture" style={{ backgroundImage: `url(${SMOKE_TEXTURE})` }} />
                <span className="mission__glow mission__glow--green" />
                <span className="mission__glow mission__glow--purple" />
            </div>

            <div className="container">
                <h2 id={TITLE_ID} className="mission__title mission__reveal">
                    {titleLines.map((line) => (
                        <span key={line} className="mission__title-line">
                            {line}
                        </span>
                    ))}
                </h2>

                <div className="mission__stage">
                    <div className="mission__media mission__reveal">
                        <Image
                            src={image.src}
                            alt={image.alt}
                            fill
                            sizes="(max-width: 991.98px) 92vw, 870px"
                            className="mission__img"
                        />
                    </div>

                    <div className="mission__card-wrap">
                        <MissionTabs
                            tabs={tabs}
                            defaultTabId="mission"
                            label={titleText}
                            action={
                                <RoundedButton
                                    href={action.href}
                                    label={action.label}
                                    variant="glass"
                                    className="mission__action"
                                    ariaLabel={`${action.label}: ${titleText}`}
                                />
                            }
                        />
                    </div>
                </div>
            </div>
        </MissionMotion>
    );
}