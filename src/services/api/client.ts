import axios from "axios";
import { apiConfig } from "../config";

// Shared axios instance for all backend requests.
export const apiClient = axios.create({
    baseURL: apiConfig.baseURL,
    headers: {
        Accept: "application/json",
        ...(apiConfig.secret ? { "X-Api-Secret": apiConfig.secret } : {}),
    },
});

/** Headers that tell the backend which language to return. */
export function localeHeaders(locale: string) {
    return { lang: locale };
}
