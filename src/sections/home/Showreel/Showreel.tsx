import Image from "next/image";
import type { HomeShowreel } from "@/types/home";
import ShowreelMotion from "./ShowreelMotion";
import { SHOWREEL_TRIANGLE } from "./triangle";
import "./_Showreel.scss";

type ShowreelProps = {
    data: HomeShowreel;
};

const TITLE_ID = "showreel-title";

export default function Showreel({ data }: ShowreelProps) {
    const { wordStart, wordEnd, video } = data;

    return (
        <ShowreelMotion labelledBy={TITLE_ID}>
            {/* Accessible name; the visual words below are decorative. */}
            <h2 id={TITLE_ID} className="visually-hidden">
                {`${wordStart} ${wordEnd}`}
            </h2>

            {/* Showreel video, revealed through the triangle's opening (see useShowreelZoom).
                Decorative background footage: muted, looping, no controls, loaded only near the section. */}
            <div className="showreel__screen" aria-hidden="true">
                <video
                    className="showreel__video"
                    poster={video.poster}
                    muted
                    loop
                    playsInline
                    preload="none"
                    disablePictureInPicture
                    tabIndex={-1}
                >
                    <source src={video.srcMobile} type="video/mp4" media="(max-width: 767.98px) and (orientation: portrait)" />
                    <source src={video.src} type="video/mp4" />
                </video>
            </div>

            <div className="showreel__composition" aria-hidden="true">
                <span className="showreel__word showreel__word--start">{wordStart}</span>

                <div className="showreel__figure">
                    <span className="showreel__glow" />
                    <Image
                        src={SHOWREEL_TRIANGLE.src}
                        alt=""
                        width={SHOWREEL_TRIANGLE.width}
                        height={SHOWREEL_TRIANGLE.height}
                        sizes="(max-width: 575.98px) 84vw, (max-width: 991.98px) 70vw, min(524px, 34.66vw)"
                        className="showreel__triangle"
                    />
                </div>

                <span className="showreel__word showreel__word--end">{wordEnd}</span>
            </div>
        </ShowreelMotion>
    );
}