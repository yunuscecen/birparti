import {
  ArrowLeft,
  CalendarDays,
  Eye,
} from "lucide-react";
import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Link,
  useParams,
} from "react-router-dom";

import Container from "../components/common/Container";
import { getBlogPostBySlug } from "../services/blogService";

const setMetaDescription = (
  description = ""
) => {
  let meta = document.querySelector(
    'meta[name="description"]'
  );

  if (!meta) {
    meta = document.createElement("meta");
    meta.setAttribute(
      "name",
      "description"
    );

    document.head.appendChild(meta);
  }

  meta.setAttribute(
    "content",
    description
  );
};

const formatDate = (date) => {
  return new Intl.DateTimeFormat("tr-TR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(new Date(date));
};

const BlogDetailPage = () => {
  const { slug } = useParams();

  const postQuery = useQuery({
    queryKey: ["blog-post", slug],
    queryFn: () =>
      getBlogPostBySlug(slug),
    enabled: Boolean(slug),
    retry: false,
  });

  const post = postQuery.data?.post;

  useEffect(() => {
    if (!post) {
      return;
    }

    document.title =
      post.seo?.title ||
      `${post.title} | Bir Parti`;

    setMetaDescription(
      post.seo?.description ||
        post.excerpt
    );

    return () => {
      document.title = "Bir Parti";
    };
  }, [post]);

  if (postQuery.isLoading) {
    return (
      <div className="blog-state blog-state--page">
        <span className="auth-spinner" />
        <p>Blog yazısı yükleniyor...</p>
      </div>
    );
  }

  if (postQuery.isError || !post) {
    return (
      <div className="blog-state blog-state--page">
        <h1>Blog yazısı bulunamadı.</h1>

        <Link to="/blog">
          Blog Sayfasına Dön
        </Link>
      </div>
    );
  }

  return (
    <article className="blog-detail">
      <header className="blog-detail-hero">
        <Container>
          <Link
            to="/blog"
            className="blog-detail__back"
          >
            <ArrowLeft size={17} />
            Blog
          </Link>

          <div className="blog-detail__meta">
            <span>
              {post.category?.name}
            </span>

            <span>
              <CalendarDays size={15} />
              {formatDate(post.publishedAt)}
            </span>

            <span>
              <Eye size={15} />
              {post.viewCount || 0}
            </span>
          </div>

          <h1>{post.title}</h1>

          <p className="blog-detail__excerpt">
            {post.excerpt}
          </p>
        </Container>
      </header>

      <section className="blog-detail-content">
        <Container className="blog-detail-content__container">
          {post.coverImage?.url && (
            <figure className="blog-detail__cover">
              <img
                src={post.coverImage.url}
                alt={
                  post.coverImage.alt ||
                  post.title
                }
              />
            </figure>
          )}

          <div className="blog-detail__body">
            {post.sections?.map(
              (section) => (
                <section
                  key={section._id}
                  className="blog-detail__section"
                >
                  {section.heading && (
                    <h2>
                      {section.heading}
                    </h2>
                  )}

                  {section.body
                    ?.split("\n")
                    .filter(Boolean)
                    .map(
                      (
                        paragraph,
                        index
                      ) => (
                        <p
                          key={`${section._id}-${index}`}
                        >
                          {paragraph}
                        </p>
                      )
                    )}
                </section>
              )
            )}

            {post.tags?.length > 0 && (
              <div className="blog-detail__tags">
                {post.tags.map((tag) => (
                  <span key={tag}>
                    #{tag}
                  </span>
                ))}
              </div>
            )}
          </div>
        </Container>
      </section>
    </article>
  );
};

export default BlogDetailPage;