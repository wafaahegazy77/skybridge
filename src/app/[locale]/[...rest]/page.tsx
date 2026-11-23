import { notFound } from "next/navigation";

// Sends unknown paths inside a locale (e.g. /en/unknown) to app/[locale]/not-found.tsx,
// so the 404 page renders inside the localized layout.
export default function CatchAllPage() {
    notFound();
}
