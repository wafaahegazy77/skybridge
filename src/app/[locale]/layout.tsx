import type { Metadata } from "next";
import type { ReactNode } from "react";
import { notFound } from "next/navigation";
import { hasLocale, NextIntlClientProvider } from "next-intl";
import { getMessages, getTranslations, setRequestLocale } from "next-intl/server";
import "bootstrap/dist/css/bootstrap.min.css";
import "@/app/styles/lib/all.min.css";
import "@/app/styles/scss/style.scss";
import { routing } from "@/i18n/routing";
import { bagoss, poppins } from "@/lib/fonts";
import { getDirection } from "@/utils/getDirection";
import BootstrapClient from "@/components/providers/BootstrapClient";
import LenisProvider from "@/components/providers/LenisProvider";
import MotionProvider from "@/components/providers/MotionProvider";
import QueryProvider from "@/components/providers/QueryProvider";

type LocaleLayoutProps = Readonly<{
    children: ReactNode;
    params: Promise<{ locale: string }>;
}>;

export function generateStaticParams() {
    return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({ params }: Pick<LocaleLayoutProps, "params">): Promise<Metadata> {
    const { locale } = await params;

    if (!hasLocale(routing.locales, locale)) {
        return {};
    }

    const t = await getTranslations({ locale, namespace: "metadata" });

    return {
        title: {
            default: t("title"),
            template: `%s | ${t("title")}`,
        },
        description: t("description"),
    };
}

export default async function LocaleLayout({ children, params }: LocaleLayoutProps) {
    const { locale } = await params;

    if (!hasLocale(routing.locales, locale)) {
        notFound();
    }

    setRequestLocale(locale);
    const messages = await getMessages({ locale });

    return (
        <html lang={locale} dir={getDirection(locale)} className={`${bagoss.variable} ${poppins.variable}`}>
            <body suppressHydrationWarning>
                <NextIntlClientProvider messages={messages}>
                    <QueryProvider>
                        <MotionProvider>
                            <LenisProvider>{children}</LenisProvider>
                        </MotionProvider>
                    </QueryProvider>
                </NextIntlClientProvider>
                <BootstrapClient />
            </body>
        </html>
    );
}
