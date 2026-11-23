// Shape of the home page data. Assumed from the mock data; confirm against the real API response.
export interface HomeHero {
    title: string;
    description: string;
    primaryButton: string;
    secondaryButton: string;
}

export interface HomeData {
    hero: HomeHero;
}
