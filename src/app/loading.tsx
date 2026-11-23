// Server Component: the loader is pure markup + CSS, no client-side JavaScript needed.
export default function Loading() {
    return (
        <section className="page_loader">
            <div className="loader_wrapper">
                <div className="loader_animation">
                    <span className="ring ring1"></span>
                    <span className="ring ring2"></span>
                    <span className="ring ring3"></span>

                    <div className="loader_logo">
                        {/* Plain <img>: a tiny decorative icon inside a CSS-only loader. */}
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src="/images/icon.png" alt="Logo" className="icon object-fit-contain" />
                    </div>
                </div>

                <p className="loader_text">Preparing your workspace...</p>
            </div>
        </section>
    );
}
