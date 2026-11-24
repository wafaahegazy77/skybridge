// Shape of the About page data. Assumed from the mock data; confirm against the real API response.
// Sections are added here step by step as the page is built.

export interface AboutSeo {
    title: string;
    description: string;
}

export interface AboutHero {
    title: string;
}

export interface AboutTicker {
    /** Phrases of the green band under the hero, in order (the band repeats them endlessly). */
    items: string[];
}

export interface AboutImage {
    src: string;
    width: number;
    height: number;
    alt: string;
}

export interface AboutWhoWeAre {
    /** Text of the glass pill above the title (displayed uppercase). */
    eyebrow: string;
    /** First line of the title (white). */
    title: string;
    /** Second line of the title, in Skybridge green (Figma). */
    titleHighlight: string;
    /** Grey paragraph under the title (right column). */
    intro: string;
    /** White paragraph (left column). */
    highlight: string;
    /** Grey paragraph under the highlight (left column). */
    description: string;
    badge: {
        /** Phrase set around the circle (repeated twice, as in Figma). */
        text: string;
        image: AboutImage;
    };
    media: AboutImage;
}

export interface AboutPromisePoint {
    /** Lead words, in white (Figma). */
    lead: string;
    /** Rest of the point, in grey; starts with the dash. */
    text: string;
}

export interface AboutPromise {
    /** Displayed uppercase. */
    title: string;
    points: AboutPromisePoint[];
    image: AboutImage;
}

export interface AboutVision {
    /** Displayed uppercase. */
    title: string;
    /** Green line under the title. */
    highlight: string;
    /** Grey paragraph; "\n" marks the Figma line break. */
    description: string;
    /** Closing line, in white. */
    closing: string;
    image: AboutImage;
}

/** The two glass cards under "Who we are". */
export interface AboutFeatures {
    promise: AboutPromise;
    vision: AboutVision;
}

export interface AboutServeItem {
    id: number;
    /** Icon name; the line icons are drawn in the front end (sections/about/WhoWeServe/ServeIcon). */
    icon: string;
    title: string;
    text: string;
}

export interface AboutWhoWeServe {
    /** Green line above the title. */
    eyebrow: string;
    /** Displayed uppercase. */
    title: string;
    items: AboutServeItem[];
}

export interface AboutData {
    seo: AboutSeo;
    hero: AboutHero;
    ticker: AboutTicker;
    whoWeAre: AboutWhoWeAre;
    features: AboutFeatures;
    whoWeServe: AboutWhoWeServe;
}