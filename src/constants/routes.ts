// Central list of internal routes. Update once the Figma sitemap is confirmed.
export const ROUTES = {
    home: "/",
    products: "/products",
    pricing: "/pricing",
    download: "/download",
    login: "/login",
    contact: "/contact",
} as const;

// Main navigation items. `labelKey` refers to keys in the "navbar" translation namespace.
export const NAV_LINKS = [
    { labelKey: "home", href: ROUTES.home },
    { labelKey: "products", href: ROUTES.products },
    { labelKey: "pricing", href: ROUTES.pricing },
    { labelKey: "download", href: ROUTES.download },
] as const;
