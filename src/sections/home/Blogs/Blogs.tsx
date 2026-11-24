import AngleRightIcon from "@/components/icons/AngleRightIcon";
import RoundedButton from "@/components/ui/RoundedButton";
import type { HomeBlogs } from "@/types/home";
import BlogCard from "./BlogCard";
import BlogsMotion from "./BlogsMotion";
import "./_Blogs.scss";

type BlogsProps = {
    data: HomeBlogs;
};

const TITLE_ID = "blogs-title";

// Without JavaScript the entrance never runs, so show everything immediately.
const NO_SCRIPT_STYLES = `<style>.blogs[data-blogs-state="pending"] .blogs__reveal{visibility:visible!important}</style>`;

// Server Component: all content is rendered here; BlogsMotion adds the Swiper slider and the entrance.
export default function Blogs({ data }: BlogsProps) {
    const { title, action, posts } = data;

    return (
        <BlogsMotion labelledBy={TITLE_ID}>
            <noscript dangerouslySetInnerHTML={{ __html: NO_SCRIPT_STYLES }} />

            <div className="container">
                <div className="blogs__inner">
                    <header className="blogs__header">
                        <h2 id={TITLE_ID} className="blogs__title blogs__reveal">
                            <span className="blogs__title-line">{title}</span>
                        </h2>
                        <RoundedButton
                            href={action.href}
                            label={action.label}
                            variant="glass"
                            className="blogs__action"
                        />
                    </header>

                    <div className="blogs__slider swiper">
                        <div className="swiper-wrapper">
                            {posts.map((post) => (
                                <div key={post.id} className="swiper-slide blogs__slide">
                                    <BlogCard post={post} />
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Figma "Pagination" (Dot, Boxed): previous arrow, one dot per slider position, next arrow. */}
                    <div className="blogs__pagination">
                        <button type="button" className="blogs__nav blogs__nav--prev" aria-label="Previous posts">
                            <AngleRightIcon className="blogs__nav-icon" />
                        </button>
                        <div className="blogs__dots" />
                        <button type="button" className="blogs__nav blogs__nav--next" aria-label="Next posts">
                            <AngleRightIcon className="blogs__nav-icon" />
                        </button>
                    </div>
                </div>
            </div>
        </BlogsMotion>
    );
}