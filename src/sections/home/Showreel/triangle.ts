// The Showreel triangle (Figma "f69f5444…_removalai_preview 1": a 600 × 600 transparent PNG shown at 524 × 524).
// The camera flies into the see-through "play" opening in its centre and the showreel video is revealed
// through it, so the opening's geometry is part of the asset itself. Everything is stored as fractions of
// the image size, measured from its alpha channel, so it holds for any export size of the same framing.
export const SHOWREEL_TRIANGLE = {
    src: "/images/showreel/showreel-triangle2.png",
    width: 600,
    height: 600,
    /** Centre of the largest circle that fits inside the opening (the zoom's focal point). */
    holeX: 319 / 600,
    holeY: 307 / 600,
    /** Radius of that circle, as a fraction of the image width. */
    holeRadius: 20.6 / 600,
    /** Corners of the opening (a triangle pointing right): top-left, tip, bottom-left. */
    holeShape: [
        [295 / 600, 260.5 / 600],
        [351 / 600, 309 / 600],
        [295 / 600, 350.7 / 600],
    ],
} as const;