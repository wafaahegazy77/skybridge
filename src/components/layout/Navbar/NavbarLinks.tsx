"use client";

import { useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { NavLink } from "@/constants/routes";

type NavbarLinksProps = {
    links: readonly NavLink[];
};

const OPEN_TOGGLER = '.site-navbar__toggler[aria-expanded="true"]';

// Strips the trailing slash so "/about/" and "/about" are treated as the same route.
const normalize = (path: string) => (path.length > 1 ? path.replace(/\/+$/, "") : path);

/** Closes the mobile menu through Bootstrap's own toggle (keeps its state and ARIA in sync). */
const closeMobileMenu = () => document.querySelector<HTMLButtonElement>(OPEN_TOGGLER)?.click();

// Client Component: reads the current route for the active state and closes the mobile menu.
export default function NavbarLinks({ links }: NavbarLinksProps) {
    const pathname = normalize(usePathname() ?? "/");

    // Escape closes the open mobile menu and returns focus to the toggle.
    useEffect(() => {
        const onKeyDown = (event: KeyboardEvent) => {
            if (event.key !== "Escape") return;
            const toggler = document.querySelector<HTMLButtonElement>(OPEN_TOGGLER);
            if (!toggler) return;
            toggler.click();
            toggler.focus();
        };

        document.addEventListener("keydown", onKeyDown);
        return () => document.removeEventListener("keydown", onKeyDown);
    }, []);

    return (
        <ul className="navbar-nav site-navbar__menu">
            {links.map(({ label, href }) => {
                // Placeholder links ("#") are never marked as active.
                const isActive = href !== "#" && normalize(href) === pathname;

                return (
                    <li className="site-navbar__item" key={label}>
                        <Link
                            href={href}
                            className={`site-navbar__link${isActive ? " site-navbar__link--active" : ""}`}
                            aria-current={isActive ? "page" : undefined}
                            onClick={closeMobileMenu}
                        >
                            {label}
                        </Link>
                    </li>
                );
            })}
        </ul>
    );
}
