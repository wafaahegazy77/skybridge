// Central list of internal routes.
export const ROUTES = {
    home: "/",
    about: "/about",
} as const;

// Placeholder href for links whose destination is not decided yet.
const PENDING = "#";

export type NavLink = {
    label: string;
    href: string;
};

// Main navigation (Figma: Home → Menu → linkes). Update hrefs here once the pages exist.
export const NAV_LINKS: readonly NavLink[] = [
    { label: "Home", href: ROUTES.home },
    { label: "About", href: ROUTES.about },
    { label: "Services", href: PENDING },
    { label: "Careers", href: PENDING },
    { label: "Works", href: PENDING },
];

// Navbar call to action (Figma: Home → Menu → Group 16 → "Start Project").
export const NAV_CTA: NavLink = { label: "Start Project", href: PENDING };