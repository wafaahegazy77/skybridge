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

export interface HomeData {
    hero: HomeHero;
}