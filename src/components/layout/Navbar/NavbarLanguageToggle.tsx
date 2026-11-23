"use client";

import { useLocale } from "next-intl";
import { usePathname, useRouter } from "@/i18n/navigation";

// Switches between Arabic and English while keeping the current path.
export default function NavbarLanguageToggle() {
    const locale = useLocale();
    const router = useRouter();
    const pathname = usePathname();

    const toggleLanguage = () => {
        const nextLocale = locale === "en" ? "ar" : "en";
        router.replace(pathname, { locale: nextLocale });
    };

    return (
        <button type="button" className="language_switcher fw-medium " onClick={toggleLanguage}>
            <i className="fa-regular fa-globe"></i>
            <span>{locale === "ar" ? "English" : "عربي"}</span>
        </button>
    );
}
