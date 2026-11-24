import type { Metadata } from "next";
import Footer from "@/components/layout/Footer";
import Navbar from "@/components/layout/Navbar";
import PageHero from "@/components/layout/PageHero";
import AboutTicker from "@/sections/about/Ticker";
import WhoWeAre from "@/sections/about/WhoWeAre";
import AboutFeatures from "@/sections/about/Features";
import WhoWeServe from "@/sections/about/WhoWeServe";
import { getAboutData } from "@/services/about.service";
import Blogs from "@/sections/home/Blogs";
import Partners from "@/sections/home/Partners";
import ContactCta from "@/sections/home/ContactCta";
import { getHomeData } from "@/services/home.service";

// Title and description come with the page data ("About Us | Skybridge" through the root title template).
export async function generateMetadata(): Promise<Metadata> {
    const { seo } = await getAboutData();

    return { title: seo.title, description: seo.description };
}

export default async function AboutPage() {
    // Data is fetched once at page level and passed down to presentational sections.
    const aboutData = await getAboutData();
    const homeData = await getHomeData();
    
    return (
        <>
            <Navbar />

            <main>
                {/* Figma: the green band sits on the bottom edge of the hero (inside its 546px). */}
                <PageHero title={aboutData.hero.title}>
                    <AboutTicker data={aboutData.ticker} />
                </PageHero>

                <WhoWeAre data={aboutData.whoWeAre} />
                <AboutFeatures data={aboutData.features} />
                <WhoWeServe data={aboutData.whoWeServe} />

                <Blogs data={homeData.blogs} />
                <Partners data={homeData.partners} />
                <ContactCta data={homeData.contact} />
            </main>

            <Footer />
        </>
    );
}