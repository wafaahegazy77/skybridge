const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? "";

export const apiConfig = {
    baseURL: apiUrl,
    // Server-only: no NEXT_PUBLIC_ prefix, so it is never included in the browser bundle.
    secret: process.env.API_SECRET,
    // Mock data is used unless USE_MOCK_API is explicitly "false" and an API URL is configured.
    useMock: process.env.USE_MOCK_API !== "false" || !apiUrl,
} as const;
