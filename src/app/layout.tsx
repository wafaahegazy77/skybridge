import type { Metadata } from "next";
import type { ReactNode } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "@/app/styles/lib/all.min.css";
import "@/app/styles/scss/style.scss";
import { SITE } from "@/constants/site";
import { bagoss, manrope, poppins } from "@/lib/fonts";
import BootstrapClient from "@/components/providers/BootstrapClient";
import LenisProvider from "@/components/providers/LenisProvider";
import MotionProvider from "@/components/providers/MotionProvider";
import QueryProvider from "@/components/providers/QueryProvider";

export const metadata: Metadata = {
    title: {
        default: SITE.name,
        template: `%s | ${SITE.name}`,
    },
    description: SITE.description,
};

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
    return (
        <html lang="en" className={`${bagoss.variable} ${poppins.variable} ${manrope.variable}`}>
            <body suppressHydrationWarning>
                <QueryProvider>
                    <MotionProvider>
                        <LenisProvider>{children}</LenisProvider>
                    </MotionProvider>
                </QueryProvider>
                <BootstrapClient />
            </body>
        </html>
    );
}
