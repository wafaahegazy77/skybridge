// Site footer content (Figma: Home → footer area under the "call action" card).
// Shared by every page, so it lives with the other site-wide constants (like the Navbar links).
// Hrefs are placeholders until the pages and the social accounts are confirmed.

const PENDING = "#";

export type FooterLink = {
    label: string;
    href: string;
};

export type SocialNetwork = "facebook" | "instagram" | "linkedin" | "tiktok";

export type SocialLink = {
    network: SocialNetwork;
    /** Accessible name of the icon-only link. */
    label: string;
    href: string;
};

export const FOOTER = {
    description:
        "At Skybridge, we believe that events should be felt, not just attended. Whether you’re planning a corporate gala, an immersive exhibition, or a high-tech conference, our passion, innovation, and expertise will bring your vision to life.",
    links: {
        title: "Top Links",
        items: [
            { label: "About", href: PENDING },
            { label: "Services", href: PENDING },
            { label: "Project", href: PENDING },
            { label: "News", href: PENDING },
            { label: "Contact", href: PENDING },
        ] satisfies FooterLink[],
    },
    newsletter: {
        title: "Let’s Bring Your Event to Life!",
        placeholder: "your email",
        // Figma text, kept as supplied (the sentence ends at "our" in Figma).
        consent: "By subscribing, you’re accept our",
        // Feedback messages (not in Figma).
        messages: {
            success: "Thank you for subscribing.",
            invalid: "Please enter a valid email address.",
            error: "Something went wrong. Please try again.",
        },
    },
    social: [
        { network: "facebook", label: "Skybridge on Facebook", href: PENDING },
        { network: "instagram", label: "Skybridge on Instagram", href: PENDING },
        { network: "linkedin", label: "Skybridge on LinkedIn", href: PENDING },
        { network: "tiktok", label: "Skybridge on TikTok", href: PENDING },
    ] satisfies SocialLink[],
} as const;