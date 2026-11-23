"use client";

import NextError from "next/error";
import { routing } from "@/i18n/routing";
import { getDirection } from "@/utils/getDirection";

// Fallback for requests that never reach a locale segment.
// Localized 404s are handled by app/[locale]/not-found.tsx.
export default function GlobalNotFound() {
    return (
        <html lang={routing.defaultLocale} dir={getDirection(routing.defaultLocale)}>
            <body>
                <NextError statusCode={404} />
            </body>
        </html>
    );
}
