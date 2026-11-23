import Image from "next/image";
import Link from "next/link";
import RoundedButton from "@/components/ui/RoundedButton";
import { NAV_CTA, NAV_LINKS, ROUTES } from "@/constants/routes";
import NavbarLinks from "./NavbarLinks";
import "./_Navbar.scss";

// Server Component. Only NavbarLinks runs on the client (active state).
// The mobile collapse relies on Bootstrap's data attributes (styled in the responsive phase).
export default function Navbar() {
    return (
        <header className="site-header">
            <nav className="navbar navbar-expand-lg site-navbar" data-bs-theme="dark" aria-label="Main navigation">
                <div className="container">
                    <div className="site-navbar__bar">
                        <Link className="site-navbar__brand" href={ROUTES.home} aria-label="Skybridge home">
                            <Image
                                src="/images/logo.png"
                                alt="Skybridge"
                                width={72}
                                height={51}
                                className="site-navbar__logo"
                                priority
                            />
                        </Link>

                        <button
                            className="navbar-toggler site-navbar__toggler"
                            type="button"
                            data-bs-toggle="collapse"
                            data-bs-target="#siteNavbarMenu"
                            aria-controls="siteNavbarMenu"
                            aria-expanded="false"
                            aria-label="Toggle navigation"
                        >
                            <span className="site-navbar__toggler-line" />
                            <span className="site-navbar__toggler-line" />
                        </button>

                        <div className="collapse navbar-collapse site-navbar__collapse" id="siteNavbarMenu">
                            <NavbarLinks links={NAV_LINKS} />

                            <RoundedButton
                                href={NAV_CTA.href}
                                label={NAV_CTA.label}
                                variant="glass"
                                className="site-navbar__cta"
                            />
                        </div>
                    </div>
                </div>
            </nav>
        </header>
    );
}