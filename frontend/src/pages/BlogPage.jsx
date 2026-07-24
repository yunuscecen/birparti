import {
  ArrowRight,
  CalendarDays,
  Search,
} from "lucide-react";
import {
  useEffect,
  useState,
} from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Link,
  useSearchParams,
} from "react-router-dom";

import Container from "../components/common/Container";
import {
  getBlogCategories,
  getBlogPosts,
} from "../services/blogService";

const formatDate = (date) => {
  if (!date) {
    return "";
  }

  return new Intl.DateTimeFormat("tr-TR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(new Date(date));
};

const BlogPage = () => {
  const [searchParams, setSearchParams] =
    useSearchParams();

  const selectedCategory =
    searchParams.get("kategori") || "";

  const currentSearch =
    searchParams.get("arama") || "";

  const [searchInput, setSearchInput] =
    useState(currentSearch);

  useEffect(() => {
    document.title = "Blog | Bir Parti";

    return () => {
      document.title = "Bir Parti";
    };
  }, []);

  const categoriesQuery = useQuery({
    queryKey: ["blog-categories"],
    queryFn: getBlogCategories,
  });

  const postsQuery = useQuery({
    queryKey: [
      "blog-posts",
      selectedCategory,
      currentSearch,
    ],

    queryFn: () =>
      getBlogPosts({
        category: selectedCategory,
        search: currentSearch,
      }),
  });

  const handleSearch = (event) => {
    event.preventDefault();

    const nextParams =
      new URLSearchParams(searchParams);

    if (searchInput.trim()) {
      nextParams.set(
        "arama",
        searchInput.trim()
      );
    } else {
      nextParams.delete("arama");
    }

    setSearchParams(nextParams);
  };

  const handleCategory = (slug) => {
    const nextParams =
      new URLSearchParams(searchParams);

    if (slug) {
      nextParams.set("kategori", slug);
    } else {
      nextParams.delete("kategori");
    }

    setSearchParams(nextParams);
  };

  const categories =
    categoriesQuery.data?.categories || [];

  const posts =
    postsQuery.data?.posts || [];

  return (
    <div className="blog-page">
      <section className="blog-hero">
        <Container>
          <p className="blog-hero__eyebrow">
            Görüşler ve haberler
          </p>

          <h1>Blog</h1>

          <p className="blog-hero__description">
            Demokrasi, toplumsal yaşam, ekonomi
            ve geleceğe ilişkin görüşlerimizi
            paylaşmak için buradayız.
          </p>
        </Container>
      </section>

      <section className="blog-content">
        <Container>
          <div className="blog-filters">
            <form
              className="blog-search"
              onSubmit={handleSearch}
            >
              <Search size={19} />

              <input
                type="search"
                value={searchInput}
                onChange={(event) =>
                  setSearchInput(
                    event.target.value
                  )
                }
                placeholder="Blog yazılarında ara..."
              />

              <button type="submit">
                Ara
              </button>
            </form>

            <div className="blog-categories">
              <button
                type="button"
                className={
                  !selectedCategory
                    ? "blog-category-button blog-category-button--active"
                    : "blog-category-button"
                }
                onClick={() =>
                  handleCategory("")
                }
              >
                Tümü
              </button>

              {categories.map(
                (category) => (
                  <button
                    type="button"
                    key={category._id}
                    className={
                      selectedCategory ===
                      category.slug
                        ? "blog-category-button blog-category-button--active"
                        : "blog-category-button"
                    }
                    onClick={() =>
                      handleCategory(
                        category.slug
                      )
                    }
                  >
                    {category.name}
                  </button>
                )
              )}
            </div>
          </div>

          {postsQuery.isLoading && (
            <div className="blog-state">
              <span className="auth-spinner" />
              <p>Blog yazıları yükleniyor...</p>
            </div>
          )}

          {postsQuery.isError && (
            <div className="blog-state">
              <h2>Yazılar alınamadı.</h2>

              <button
                type="button"
                onClick={() =>
                  postsQuery.refetch()
                }
              >
                Tekrar Dene
              </button>
            </div>
          )}

          {!postsQuery.isLoading &&
            !postsQuery.isError && (
              <div className="blog-grid">
                {posts.map((post) => (
                  <article
                    className="blog-card"
                    key={post._id}
                  >
                    {post.coverImage?.url ? (
                      <Link
                        to={`/blog/${post.slug}`}
                        className="blog-card__image"
                      >
                        <img
                          src={
                            post.coverImage.url
                          }
                          alt={
                            post.coverImage.alt ||
                            post.title
                          }
                        />
                      </Link>
                    ) : (
                      <Link
                        to={`/blog/${post.slug}`}
                        className="blog-card__image blog-card__image--empty"
                        aria-label={post.title}
                      >
                        <span>,</span>
                      </Link>
                    )}

                    <div className="blog-card__content">
                      <div className="blog-card__meta">
                        <span>
                          {post.category?.name}
                        </span>

                        <span>
                          <CalendarDays
                            size={14}
                          />

                          {formatDate(
                            post.publishedAt
                          )}
                        </span>
                      </div>

                      <h2>
                        <Link
                          to={`/blog/${post.slug}`}
                        >
                          {post.title}
                        </Link>
                      </h2>

                      <p>{post.excerpt}</p>

                      <Link
                        to={`/blog/${post.slug}`}
                        className="blog-card__link"
                      >
                        Yazıyı Oku
                        <ArrowRight size={16} />
                      </Link>
                    </div>
                  </article>
                ))}

                {posts.length === 0 && (
                  <div className="blog-empty">
                    <h2>
                      Yazı bulunamadı.
                    </h2>

                    <p>
                      Arama veya kategori
                      seçimini değiştirerek
                      tekrar deneyin.
                    </p>
                  </div>
                )}
              </div>
            )}
        </Container>
      </section>
    </div>
  );
};

export default BlogPage;