import type { AboutData } from "@/types/about";
import aboutData from "./about.json";

/** Mock About page data, used until the real API is available. */
export async function getAboutMock(): Promise<AboutData> {
    return aboutData;
}