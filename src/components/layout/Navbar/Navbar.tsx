import Image from "next/image";
import { useTranslations } from "next-intl";
import { NAV_LINKS, ROUTES } from "@/constants/routes";
import { Link } from "@/i18n/navigation";
import NavbarLanguageToggle from "./NavbarLanguageToggle";
import "./_Navbar.scss";

// Server Component. Only the language toggle needs client-side JavaScript;
// the mobile collapse is handled by Bootstrap's data attributes.
export default function Navbar() {
    const t = useTranslations("navbar");

    return (
        <nav className="navbar navbar-expand-lg navbar-dark ff-heading homeNav">
            <div className="container">
                <Link className="navbar-brand" href={ROUTES.home}>
                    <Image src="/images/logo.svg" alt="Logo" className="logo object-fit-contain" width={100} height={100} />
                </Link>
                <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarSupportedContent" aria-controls="navbarSupportedContent" aria-expanded="false" aria-label="Toggle navigation">
                    <span className="navbar-toggler-icon"></span>
                </button>
                <div className="collapse navbar-collapse" id="navbarSupportedContent">
                    <ul className="navbar-nav mx-auto mb-2 mb-lg-0">
                        {NAV_LINKS.map(({ labelKey, href }) => {
                            // Active state is static for now; it will follow the current route in Phase 2.
                            const isActive = href === ROUTES.home;

                            return (
                                <li className="nav-item" key={href}>
                                    <Link
                                        className={`nav-link${isActive ? " active" : ""}`}
                                        aria-current={isActive ? "page" : undefined}
                                        href={href}
                                    >
                                        {t(labelKey)}
                                    </Link>
                                </li>
                            );
                        })}
                    </ul>
                    <div className="nav-side d-flex align-items-center gap-3">
                        <Link className="link fw-medium" href={ROUTES.login}>
                            {t("login")}
                        </Link>
                        <NavbarLanguageToggle />
                        <Link className="butn bg-blue radius-10 hvr-txt-trans hvr-scale" href={ROUTES.contact}>
                            <div className="txt" data-text={t("contact")}><span> {t("contact")} </span></div>
                        </Link>
                    </div>
                </div>
            </div>
        </nav>
    );
}
