type ServeIconProps = {
    /** Icon name from the data (Figma has one icon so far, "events"). */
    name: string;
    /** Unique per card: the icon's gradient ids are built from it. */
    idPrefix: string;
};

// Figma "Frame" (40 × 39) in each "Who we serve" card: line icon, 1.5px round strokes, each stroke filled
// with the Figma gradient (#2DD975 at the top → #4C24C1 at the bottom). Every shape is a separate element
// with pathLength 1, so useWhoWeServeAnimation can draw it on and the hover can move it on its own.
// Figma has a single icon so far ("events"), shared by the four cards: every name draws it until the
// content brings new icons (they are added here when it does).
export default function ServeIcon({ name, idPrefix }: ServeIconProps) {
    const top = `${idPrefix}-top`;
    const bottom = `${idPrefix}-bottom`;

    return (
        <svg
            className={`who-we-serve__icon who-we-serve__icon--${name}`}
            width="40"
            height="39"
            viewBox="0 0 40 39"
            fill="none"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
            focusable="false"
        >
            <defs>
                {/* One gradient per icon row (Figma: each shape runs green → purple from its top to its bottom). */}
                <linearGradient id={top} x1="0" y1="0.9" x2="0" y2="16.62" gradientUnits="userSpaceOnUse">
                    <stop offset="0" stopColor="#2dd975" />
                    <stop offset="1" stopColor="#4c24c1" />
                </linearGradient>
                <linearGradient id={bottom} x1="0" y1="23.76" x2="0" y2="38.05" gradientUnits="userSpaceOnUse">
                    <stop offset="0" stopColor="#2dd975" />
                    <stop offset="1" stopColor="#4c24c1" />
                </linearGradient>
            </defs>

            {/* "events": square, triangle, circle and three lines (Figma vectors, exact coordinates). */}
            <path
                className="who-we-serve__shape who-we-serve__shape--square"
                d="M1.6 2.33H15.89V16.62H1.6Z"
                stroke={`url(#${top})`}
                pathLength={1}
            />
            <path
                className="who-we-serve__shape who-we-serve__shape--triangle"
                d="M30.89 0.9L38.74 16.62H23.03Z"
                stroke={`url(#${top})`}
                pathLength={1}
            />
            <circle
                className="who-we-serve__shape who-we-serve__shape--circle"
                cx="8.74"
                cy="30.9"
                r="7.14"
                stroke={`url(#${bottom})`}
                pathLength={1}
            />
            {[23.76, 30.9, 38.05].map((y) => (
                <line
                    key={y}
                    className="who-we-serve__shape who-we-serve__shape--line"
                    x1="23.74"
                    y1={y}
                    x2="38.03"
                    y2={y}
                    stroke={`url(#${bottom})`}
                    pathLength={1}
                />
            ))}
        </svg>
    );
}