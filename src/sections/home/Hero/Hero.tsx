import Reveal from "@/components/animations/Reveal";
import type { HomeHero } from "@/types/home";
import "./_Hero.scss";

type HeroProps = {
    data: HomeHero;
};

export default function Hero({ data }: HeroProps) {
    return (
        <section className="hero_section">
            <div className="container">
                <div className="col-lg-5 mx-auto">
                    <div className="txt_box text-center ">
                        <Reveal animation="fade-up" trigger="load">
                            <h1 className="title fw-bold cr-blue fsz-55 mb-4">{data.title}</h1>
                        </Reveal>
                    </div>
                </div>
            </div>
        </section>
    );
}
