import Image from "next/image";
import type { ReactNode } from "react";
import type { AboutImage } from "@/types/about";

type FeatureCardProps = {
    image: AboutImage;
    /** Which side the photo sits on (Figma: left in the first card, right in the second). */
    imageSide: "start" | "end";
    /** Figma: the first card has a green border. */
    accent?: boolean;
    /** Optional decorative layer, clipped to the card (the contour rings of the first card). */
    decor?: ReactNode;
    titleId: string;
    children: ReactNode;
};

// One glass card (Figma "Rectangle 161123894": 1194 × 469, white 4%, 1px border, 30px corners,
// background blur): a 393 × 400 photo with 20px corners and the copy beside it.
export default function FeatureCard({ image, imageSide, accent = false, decor, titleId, children }: FeatureCardProps) {
    const modifiers = [`about-feature--image-${imageSide}`, accent ? "about-feature--accent" : ""].filter(Boolean).join(" ");

    return (
        <article className={`about-feature ${modifiers} about-features__reveal`} aria-labelledby={titleId}>
            {decor && (
                <div className="about-feature__decor" aria-hidden="true">
                    {decor}
                </div>
            )}

            <div className="about-feature__media">
                {/* Slightly taller than the frame: room for the scroll depth (useFeaturesAnimation). */}
                <div className="about-feature__media-depth">
                    <Image
                        src={image.src}
                        alt={image.alt}
                        fill
                        sizes="(min-width: 992px) 393px, 100vw"
                        className="about-feature__img"
                    />
                </div>
            </div>

            <div className="about-feature__body">{children}</div>
        </article>
    );
}