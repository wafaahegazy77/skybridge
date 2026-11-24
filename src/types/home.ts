// Shape of the home page data. Assumed from the mock data; confirm against the real API response.
export interface HomeAction {
    label: string;
    href: string;
}

export interface HomeHero {
    /** Text inside the glass pill above the title (displayed uppercase). */
    eyebrow: string;
    title: string;
    primaryAction: HomeAction;
    secondaryAction: HomeAction;
}

export interface HomeIntro {
    title: string;
    description: string;
    action: HomeAction;
}

export interface HomeImage {
    src: string;
    width: number;
    height: number;
    alt: string;
}

export interface HomeService {
    title: string;
    /** Short supporting copy, revealed on the active (center) card. */
    description: string;
    image: HomeImage;
    action: HomeAction;
}

export interface HomeServices {
    title: string;
    subtitle: string;
    items: HomeService[];
}

export interface HomeVideo {
    /** MP4 (H.264) for tablets and desktops. */
    src: string;
    /** Portrait-cropped MP4 (H.264) for phones held upright (≤ 767px, portrait). */
    srcMobile: string;
    /** First frame, shown until the video plays (or if it cannot). */
    poster: string;
}

export interface HomeShowreel {
    /** Word left of the triangle (displayed uppercase). */
    wordStart: string;
    /** Word right of the triangle (displayed uppercase). */
    wordEnd: string;
    /** Showreel video revealed through the triangle. */
    video: HomeVideo;
}

export interface HomeMissionStatement {
    /** Opening words, highlighted (Figma: Bagoss Medium 22, white). */
    lead: string;
    /**
     * Rest of the statement (Figma: Poppins Regular 18, #A4A4A4). Starts with the character that follows
     * the lead-in in Figma: a space, or a no-break space where Figma keeps the words on one line.
     */
    text: string;
}

export interface HomeValue {
    /** Shown in the OUR VALUES tab. */
    title: string;
    /** Extended copy, kept for the "Learn More" page (not shown in the tab, so both tabs stay balanced). */
    description: string;
}

export interface HomeMission {
    /** Section title; "\n" marks the line break (displayed uppercase). */
    title: string;
    image: HomeImage;
    mission: {
        /** Tab label (displayed uppercase). */
        label: string;
        statements: HomeMissionStatement[];
    };
    values: {
        /** Tab label (displayed uppercase). */
        label: string;
        items: HomeValue[];
    };
    action: HomeAction;
}

export interface HomeProject {
    /** Stable key for the card (used for React keys and element ids). */
    id: string;
    title: string;
    /** Short line under the title (displayed uppercase). */
    subtitle: string;
    description: string;
    image: HomeImage;
    action: HomeAction;
}

export interface HomePortfolio {
    /** Small line above the title. */
    eyebrow: string;
    /** Section title (displayed uppercase). */
    title: string;
    /** Case studies, in stacking order: each one slides over the previous one. */
    projects: HomeProject[];
}

export interface HomePartner {
    /** Partner name (used as the logo's alt text). */
    name: string;
    /** Logo file and its natural size in px (Figma size on the 1512 frame). */
    logo: {
        src: string;
        width: number;
        height: number;
    };
}

export interface HomePartners {
    /** Small line above the title. */
    eyebrow: string;
    /** Section title (displayed uppercase). */
    title: string;
    /** Partners in display order (both marquee rows use this order). */
    items: HomePartner[];
}

export interface HomeProcessStep {
    title: string;
    /** Short highlighted line under the title. */
    subtitle: string;
    description: string;
}

export interface HomeProcess {
    /** Section title (displayed uppercase). */
    title: string;
    description: string;
    /** Steps in order: the scroll sequence brings them forward one after another. */
    steps: HomeProcessStep[];
}

export interface HomeBlogPost {
    /** Stable key for the card. */
    id: string;
    title: string;
    excerpt: string;
    /** Hashtag shown on the image, including the "#". */
    tag: string;
    image: HomeImage;
    href: string;
}

export interface HomeBlogs {
    /** Section title (displayed uppercase). */
    title: string;
    action: HomeAction;
    posts: HomeBlogPost[];
}

export interface HomeContactLine {
    /** Optional label before the value, e.g. "Phone". */
    label?: string;
    text: string;
    /** tel: / mailto: link for the value, when it has one. */
    href?: string;
}

export interface HomeContactDetail {
    /** Icon key: "location" or "phone" (any other value shows no icon). */
    icon: string;
    title: string;
    lines: HomeContactLine[];
}

export interface HomeContact {
    eyebrow: string;
    title: string;
    details: HomeContactDetail[];
    action: HomeAction;
}

export interface HomeData {
    hero: HomeHero;
    intro: HomeIntro;
    services: HomeServices;
    showreel: HomeShowreel;
    mission: HomeMission;
    portfolio: HomePortfolio;
    partners: HomePartners;
    process: HomeProcess;
    blogs: HomeBlogs;
    contact: HomeContact;

}