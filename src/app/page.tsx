import Footer from "@/components/layout/Footer";
import Navbar from "@/components/layout/Navbar";
import Hero from "@/sections/home/Hero";
import Intro from "@/sections/home/Intro";
import Services from "@/sections/home/Services";
import Showreel from "@/sections/home/Showreel";
import Mission from "@/sections/home/Mission";
import Portfolio from "@/sections/home/Portfolio";
import Partners from "@/sections/home/Partners";
import Process from "@/sections/home/Process";
import Blogs from "@/sections/home/Blogs";
import ContactCta from "@/sections/home/ContactCta";
import { getHomeData } from "@/services/home.service";

export default async function HomePage() {
    // Data is fetched once at page level and passed down to presentational sections.
    const homeData = await getHomeData();

    return (
        <>
            <Navbar />

            <main>
                <Hero data={homeData.hero} />
                <Intro data={homeData.intro} />
                <Services data={homeData.services} />
                <Showreel data={homeData.showreel} />
                <Mission data={homeData.mission} />
                <Portfolio data={homeData.portfolio} />
                <Partners data={homeData.partners} />
                <Process data={homeData.process} />
                <Blogs data={homeData.blogs} />
                <ContactCta data={homeData.contact} />
            </main>

            <Footer />
        </>
    );
}