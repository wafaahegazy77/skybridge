import { cache } from "react";
import { getAboutMock } from "@/mocks/about";
import type { AboutData } from "@/types/about";
import { apiClient } from "./api/client";
import { endpoints } from "./api/endpoints";
import { apiConfig } from "./config";

/**
 * Returns the About page data from the mock layer or the real API.
 * Wrapped in React `cache`: the page and its metadata share one request per render.
 */
export const getAboutData = cache(async (): Promise<AboutData> => {
    if (apiConfig.useMock) {
        return getAboutMock();
    }

    // Adjust here if the real API wraps the payload (e.g. `{ data: ... }`).
    const { data } = await apiClient.get<AboutData>(endpoints.about);

    return data;
});