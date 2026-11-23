const RTL_LOCALES: readonly string[] = ["ar"];

/** Returns the text direction for a given locale. */
export function getDirection(locale: string): "rtl" | "ltr" {
    return RTL_LOCALES.includes(locale) ? "rtl" : "ltr";
}
