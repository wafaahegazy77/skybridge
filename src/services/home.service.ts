import { getHomeMock } from "@/mocks/home";
import type { HomeData } from "@/types/home";
import { apiClient, localeHeaders } from "./api/client";
import { endpoints } from "./api/endpoints";
import { apiConfig } from "./config";

/** Returns the home page data from the mock layer or the real API. */
export async function getHomeData(locale: string): Promise<HomeData> {
    if (apiConfig.useMock) {
        return getHomeMock(locale);
    }

    // Adjust here if the real API wraps the payload (e.g. `{ data: ... }`).
    const { data } = await apiClient.get<HomeData>(endpoints.home, {
        headers: localeHeaders(locale),
    });

    return data;
}
