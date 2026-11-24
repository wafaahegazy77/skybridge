"use client";

import { useId, useState, type FormEvent } from "react";
import { useMutation } from "@tanstack/react-query";
import EnvelopeIcon from "@/components/icons/EnvelopeIcon";
import LongArrowRightIcon from "@/components/icons/LongArrowRightIcon";
import { FOOTER } from "@/constants/footer";
import { subscribeToNewsletter } from "@/services/newsletter.service";

const { title, placeholder, consent, messages } = FOOTER.newsletter;

// Simple shape check; the backend stays the authority on what it accepts.
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

type Status = { type: "success" | "error"; text: string } | null;

// Figma "Group 131": envelope + title, the e-mail pill with its round submit button, and the consent
// line. Client Component (form state). Submits through the newsletter service (mock until the API is
// available) and announces the result to screen readers.
export default function FooterNewsletter() {
    const id = useId();
    const titleId = `${id}-title`;
    const statusId = `${id}-status`;
    const [email, setEmail] = useState("");
    const [status, setStatus] = useState<Status>(null);

    const subscription = useMutation({
        mutationFn: subscribeToNewsletter,
        onSuccess: () => {
            setEmail("");
            setStatus({ type: "success", text: messages.success });
        },
        onError: () => setStatus({ type: "error", text: messages.error }),
    });

    const onSubmit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const value = email.trim();

        if (!EMAIL_PATTERN.test(value)) {
            setStatus({ type: "error", text: messages.invalid });
            return;
        }

        setStatus(null);
        subscription.mutate(value);
    };

    return (
        <div className="site-footer__newsletter">
            <div className="site-footer__newsletter-head">
                <EnvelopeIcon className="site-footer__newsletter-icon" />
                <h2 id={titleId} className="site-footer__newsletter-title">
                    {title}
                </h2>
            </div>

            <form
                className="site-footer__form"
                onSubmit={onSubmit}
                noValidate
                aria-labelledby={titleId}
                aria-busy={subscription.isPending}
            >
                <input
                    type="email"
                    name="email"
                    className="site-footer__input"
                    placeholder={placeholder}
                    aria-label="Email address"
                    autoComplete="email"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    aria-invalid={status?.type === "error" || undefined}
                    aria-describedby={statusId}
                    // Read-only (not disabled) while sending, so the field keeps the keyboard focus.
                    readOnly={subscription.isPending}
                />
                <button
                    type="submit"
                    className="site-footer__submit"
                    aria-label="Subscribe"
                    disabled={subscription.isPending}
                >
                    <LongArrowRightIcon />
                </button>
            </form>

            <p className="site-footer__consent">{consent}</p>
            <p
                id={statusId}
                className={`site-footer__status${status ? ` site-footer__status--${status.type}` : ""}`}
                role="status"
            >
                {status?.text}
            </p>
        </div>
    );
}