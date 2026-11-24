/** Mock newsletter subscription, used until the real API is available: resolves after a short delay. */
export async function subscribeNewsletterMock(email: string): Promise<void> {
    await new Promise((resolve) => setTimeout(resolve, 600));

    if (!email.includes("@")) {
        throw new Error("Invalid email address");
    }
}