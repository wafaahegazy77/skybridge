import type { HomeData } from "@/types/home";
import homeData from "./home.json";

/** Mock home page data, used until the real API is available. */
export async function getHomeMock(): Promise<HomeData> {
    return homeData;
}
