import Image from "next/image";
import Link from "next/link";
import LongArrowRightIcon from "@/components/icons/LongArrowRightIcon";
import type { HomeBlogPost } from "@/types/home";

type BlogCardProps = {
    post: HomeBlogPost;
};

// One blog post (Figma "Posts" card). The title link covers the whole card (stretched link), so the
// card has a single link and a single tab stop; the arrow is decorative.
export default function BlogCard({ post }: BlogCardProps) {
    return (
        <article className="blogs__card blogs__reveal">
            <div className="blogs__card-media">
                <div className="blogs__card-image">
                    <Image
                        src={post.image.src}
                        alt={post.image.alt}
                        fill
                        sizes="(min-width: 1200px) 386px, (min-width: 768px) 50vw, 90vw"
                        className="blogs__card-img"
                        draggable={false}
                    />
                </div>
                <span className="blogs__card-tag">{post.tag}</span>
                <span className="blogs__card-arrow" aria-hidden="true">
                    <LongArrowRightIcon />
                </span>
            </div>

            <h3 className="blogs__card-title">
                {/* Not draggable: a native link drag would cancel the Swiper swipe started on the card. */}
                <Link href={post.href} className="blogs__card-link" draggable={false}>
                    {/* Inline wrapper: carries the hover underline along every line of the title. */}
                    <span className="blogs__card-title-text">{post.title}</span>
                </Link>
            </h3>
            <p className="blogs__card-excerpt">{post.excerpt}</p>
        </article>
    );
}