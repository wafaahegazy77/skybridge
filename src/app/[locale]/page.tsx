import { setRequestLocale } from "next-intl/server";
import Footer from "@/components/layout/Footer";
import Navbar from "@/components/layout/Navbar";
import Hero from "@/sections/home/Hero";
import { getHomeData } from "@/services/home.service";

type HomePageProps = {
    params: Promise<{ locale: string }>;
};

export default async function HomePage({ params }: HomePageProps) {
    const { locale } = await params;
    setRequestLocale(locale);

    // Data is fetched once at page level and passed down to presentational sections.
    const homeData = await getHomeData(locale);

    return (
        <>
            <Navbar />

            <main>
                <Hero data={homeData.hero} />
            </main>

            <Footer />
        </>
    );
}
