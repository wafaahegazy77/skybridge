import type { HomeData } from "@/types/home";
import homeAr from "./home.ar.json";
import homeEn from "./home.en.json";

/** Mock home page data, used until the real API is available. */
export async function getHomeMock(locale: string): Promise<HomeData> {
    return locale === "ar" ? homeAr : homeEn;
}
