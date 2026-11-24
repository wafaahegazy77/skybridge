import { subscribeNewsletterMock } from "@/mocks/newsletter";
import { apiClient } from "./api/client";
import { endpoints } from "./api/endpoints";
import { apiConfig } from "./config";

/**
 * Subscribes an e-mail address to the newsletter, through the mock layer or the real API.
 * Note: this runs in the browser, where only NEXT_PUBLIC_* variables exist, so the mock is used
 * until NEXT_PUBLIC_API_URL is set and the switch is revisited for client-side calls.
 */
export async function subscribeToNewsletter(email: string): Promise<void> {
    if (apiConfig.useMock) {
        return subscribeNewsletterMock(email);
    }

    await apiClient.post(endpoints.newsletter, { email });
}