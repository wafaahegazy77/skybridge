import type { AboutServeItem } from "@/types/about";
import ServeIcon from "./ServeIcon";

type ServeCardProps = {
    item: AboutServeItem;
};

// One glass card (Figma "Rectangle 161123896": 279 × 324, white 5%, white 20% border, 30px corners,
// background blur): the icon, the title and the description, centered.
export default function ServeCard({ item }: ServeCardProps) {
    return (
        <li className="who-we-serve__card who-we-serve__reveal">
            {/* Pointer light (desktop only, set by useWhoWeServeAnimation). */}
            <span className="who-we-serve__card-light" aria-hidden="true" />
            <ServeIcon name={item.icon} idPrefix={`who-we-serve-icon-${item.id}`} />
            <h3 className="who-we-serve__card-title">{item.title}</h3>
            <p className="who-we-serve__card-text">{item.text}</p>
        </li>
    );
}