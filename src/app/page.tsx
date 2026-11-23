import Footer from "@/components/layout/Footer";
import Navbar from "@/components/layout/Navbar";
import Hero from "@/sections/home/Hero";
import { getHomeData } from "@/services/home.service";

export default async function HomePage() {
    // Data is fetched once at page level and passed down to presentational sections.
    const homeData = await getHomeData();

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
