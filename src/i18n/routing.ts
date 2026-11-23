import { defineRouting } from "next-intl/routing";

export const routing = defineRouting({
    // Arabic stays supported (and RTL-ready); English is the default during this phase.
    locales: ["en", "ar"],
    defaultLocale: "en",
    // Always start on the default locale instead of following the browser language,
    // so "/" opens English until the Arabic version is designed.
    localeDetection: false,
});

export type Locale = (typeof routing.locales)[number];
