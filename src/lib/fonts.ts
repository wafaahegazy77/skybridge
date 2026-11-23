import localFont from "next/font/local";

// Headings and titles.
// Weights follow the style name of each file (Thin=100 … Bold=700).
// NOTE: these are the Bagoss Standard TRIAL files; a web licence is required before production.
export const bagoss = localFont({
    src: [
        { path: "../../public/fonts/bagoss/thin.otf", weight: "100", style: "normal" },
        { path: "../../public/fonts/bagoss/light.otf", weight: "300", style: "normal" },
        { path: "../../public/fonts/bagoss/regular.otf", weight: "400", style: "normal" },
        { path: "../../public/fonts/bagoss/medium.otf", weight: "500", style: "normal" },
        { path: "../../public/fonts/bagoss/semiBold.otf", weight: "600", style: "normal" },
        { path: "../../public/fonts/bagoss/bold.otf", weight: "700", style: "normal" },
    ],
    variable: "--font-bagoss",
    display: "swap",
    // All weights are declared, but only the ones actually used are downloaded.
    // Preloading is enabled per weight later, once the first-screen weights are known.
    preload: false,
});

// Body text and general content.
export const poppins = localFont({
    src: [
        { path: "../../public/fonts/poppins/thin.ttf", weight: "100", style: "normal" },
        { path: "../../public/fonts/poppins/extraLight.ttf", weight: "200", style: "normal" },
        { path: "../../public/fonts/poppins/light.ttf", weight: "300", style: "normal" },
        { path: "../../public/fonts/poppins/regular.ttf", weight: "400", style: "normal" },
        { path: "../../public/fonts/poppins/medium.ttf", weight: "500", style: "normal" },
        { path: "../../public/fonts/poppins/semiBold.ttf", weight: "600", style: "normal" },
        { path: "../../public/fonts/poppins/bold.ttf", weight: "700", style: "normal" },
        { path: "../../public/fonts/poppins/extraBold.ttf", weight: "800", style: "normal" },
        { path: "../../public/fonts/poppins/black.ttf", weight: "900", style: "normal" },
    ],
    variable: "--font-poppins",
    display: "swap",
    preload: false,
});
