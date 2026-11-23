import Reveal from "@/components/animations/Reveal";
import "./_Footer.scss";

export default function Footer() {
    return (
        <footer className="footer_section">
            <div className="container">
                <Reveal animation="fade-down">Footer</Reveal>
            </div>
        </footer>
    );
}
