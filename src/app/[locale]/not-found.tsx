import Image from "next/image";
import { useTranslations } from "next-intl";
import "./_NotFound.scss";

export default function NotFound() {
    const t = useTranslations("notFound");

    return (
        <div className="not-found d-flex align-items-center justify-content-center">
            <div className="col-lg-6 mx-auto">
                <Image
                    src="/images/not_found.svg"
                    alt={t("imageAlt")}
                    width={500}
                    height={500}
                    className="not-found__image img-contain"
                    priority
                />
            </div>
        </div>
    );
}
