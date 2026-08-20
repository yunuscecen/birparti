import {
  ArrowUpDown,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Eye,
  Handshake,
  Lock,
  MessageCircle,
  Pin,
  Search,
  Lightbulb,
  Plus,
  ThumbsUp,
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
import { useAuth } from "../context/AuthContext";
import Container from "../components/common/Container";
import ExpertBadge from "../components/forum/ExpertBadge";
import {
  getForumCategories,
  getForumTopics,
} from "../services/forumService";

const ideaStageLabels = {
  submitted: "Fikir Alındı",
  reviewing: "Değerlendiriliyor",
  planned: "Planlandı",
  in_progress:
    "Üzerinde Çalışılıyor",
  completed:
    "Hayata Geçirildi",
  not_planned:
    "Şimdilik Planlanmıyor",
};  

const formatDate = (date) => {
  if (!date) {
    return "—";
  }

  return new Intl.DateTimeFormat("tr-TR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(date));
};

const ForumPage = () => {
  const [searchParams, setSearchParams] =
    useSearchParams();
const {
  isAuthenticated,
} = useAuth();

const canCreateTopic =
  isAuthenticated;
  const category =
    searchParams.get("kategori") || "";

const search =
  searchParams.get("arama") || "";

const sort =
  searchParams.get("sirala") ||
  "newest";

  const page = Math.max(
    Number(searchParams.get("sayfa")) || 1,
    1
  );

  const [searchInput, setSearchInput] =
    useState(search);

  useEffect(() => {
    document.title = "Topluluk | Bir Parti";

    return () => {
      document.title = "Bir Parti";
    };
  }, []);

  const categoriesQuery = useQuery({
    queryKey: ["forum-categories"],
    queryFn: getForumCategories,
  });

  const topicsQuery = useQuery({
   queryKey: [
  "forum-topics",
  page,
  category,
  search,
  sort,
],

    queryFn: () =>
      getForumTopics({
  page,
  category,
  search,
  sort,
}),
  });

  const updateSearchParams = (updates) => {
    const nextParams =
      new URLSearchParams(searchParams);

    Object.entries(updates).forEach(
      ([key, value]) => {
        if (value) {
          nextParams.set(key, String(value));
        } else {
          nextParams.delete(key);
        }
      }
    );

    setSearchParams(nextParams);
  };

  const handleSearch = (event) => {
    event.preventDefault();

    updateSearchParams({
      arama: searchInput.trim(),
      sayfa: "",
    });
  };

  const categories =
    categoriesQuery.data?.categories || [];

  const topics =
    topicsQuery.data?.topics || [];

  const pagination =
    topicsQuery.data?.pagination;

  return (
    <div className="forum-page">
      <section className="forum-hero">
        <Container>
          <p className="forum-hero__eyebrow">
            Birlikte konuşalım
          </p>

         <h1>Topluluk</h1>

          <p>
            Görüşlerinizi paylaşın, farklı
            düşünceleri dinleyin ve ortak çözümler
            geliştirin.
          </p>
        </Container>
      </section>

      <section className="forum-content">
        <Container className="forum-layout">
          <aside className="forum-sidebar">
            <div className="forum-sidebar__heading">
              <h2>Kategoriler</h2>
            </div>

            <button
              type="button"
              className={
                !category
                  ? "forum-category forum-category--active"
                  : "forum-category"
              }
              onClick={() =>
                updateSearchParams({
                  kategori: "",
                  sayfa: "",
                })
              }
            >
              <span>Tüm Konular</span>

              <strong>
                {categories.reduce(
                  (total, item) =>
                    total +
                    (item.topicCount || 0),
                  0
                )}
              </strong>
            </button>

            {categories.map((item) => (
              <button
                type="button"
                key={item._id}
                className={
                  category === item.slug
                    ? "forum-category forum-category--active"
                    : "forum-category"
                }
                onClick={() =>
                  updateSearchParams({
                    kategori: item.slug,
                    sayfa: "",
                  })
                }
              >
                <span>
                  <i
                    style={{
                      backgroundColor:
                        item.color,
                    }}
                  />

                  {item.name}
                </span>

                <strong>
                  {item.topicCount || 0}
                </strong>
              </button>
            ))}
          </aside>

        <main className="forum-main">
  <div className="forum-main__toolbar">
    <form
      className="forum-search"
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
        placeholder="Topluluk konularında ara..."
      />

      <button type="submit">
        Ara
      </button>
      </form>

  <div className="forum-sort-control">
  <ArrowUpDown size={17} />

  <span className="forum-sort-control__label">
    Sırala
  </span>

  <select
    className="forum-sort-select"
    value={sort}
    onChange={(event) =>
      updateSearchParams({
        sirala:
          event.target.value,
        sayfa: "",
      })
    }
    aria-label="Konuları sırala"
  >
    <option value="newest">
      En Yeni
    </option>

    <option value="popular">
      En Popüler
    </option>

    <option value="most-voted">
      En Çok Oy Alan
    </option>

    <option value="solved">
      Çözülenler
    </option>

    <option value="most-supported">
      En Çok Desteklenen
    </option>

    <option value="most-commented">
      En Çok Yorum Alan
    </option>
  </select>
</div>
    {canCreateTopic && (
      <Link
        to="/forum/yeni-konu"
        className="forum-primary-button"
      >
        <Plus size={17} />
        Yeni Konu
      </Link>
    )}
  </div>

            {topicsQuery.isLoading ? (
              <div className="forum-state">
                <span className="auth-spinner" />
             <p>Topluluk konuları yükleniyor...</p>
              </div>
            ) : topicsQuery.isError ? (
              <div className="forum-state">
                <h2>Konular alınamadı.</h2>

                <button
                  type="button"
                  onClick={() =>
                    topicsQuery.refetch()
                  }
                >
                  Tekrar Dene
                </button>
              </div>
            ) : (
              <div className="forum-topic-list">
                {topics.map((topic) => (
                  <article
                    className="forum-topic-card"
                    key={topic._id}
                  >
                    <div className="forum-topic-card__content">
                      <div className="forum-topic-card__badges">
                        {topic.isPinned && (
                          <span>
                            <Pin size={13} />
                            Sabit
                          </span>
                        )}

                      {topic.status ===
  "locked" && (
  <span>
    <Lock size={13} />
    Kilitli
  </span>
)}

{topic.isSolved && (
  <span className="forum-topic-badge--solved">
    <CheckCircle2 size={13} />
    Çözüldü
  </span>
)}

{topic.ideaStage &&
  topic.ideaStage !==
    "none" && (
    <span className="forum-topic-badge--idea">
      <Lightbulb
        size={13}
      />

      {ideaStageLabels[
        topic.ideaStage
      ] || topic.ideaStage}
    </span>
  )}

<span>
  {topic.category?.name}
</span>
                      </div>

                      <h2>
                        <Link
                          to={`/forum/${topic.slug}`}
                        >
                          {topic.title}
                        </Link>
                      </h2>

                      <p>
                        {topic.body.length > 220
                          ? `${topic.body.slice(
                              0,
                              220
                            )}…`
                          : topic.body}
                      </p>

             <div className="forum-topic-card__author">
  <div className="forum-author-identity">
    <span>
      {topic.authorInfo?.name ||
        "Bir Parti"}
    </span>

    <ExpertBadge
      profile={
        topic.authorInfo
          ?.expertProfile
      }
      compact
    />
  </div>

  <span>
    {formatDate(
      topic.lastActivityAt
    )}
  </span>
</div>
                    </div>

                    <div className="forum-topic-card__stats">
  <span title="Yanıt sayısı">
    <MessageCircle size={16} />
    {topic.replyCount || 0}
  </span>

  <span title="Oy puanı">
    <ThumbsUp size={16} />
    {topic.voteScore || 0}
  </span>

  <span title="Destek sayısı">
    <Handshake size={16} />
    {topic.supportCount || 0}
  </span>

  <span title="Görüntülenme sayısı">
    <Eye size={16} />
    {topic.viewCount || 0}
  </span>
</div>
                  </article>
                ))}

                {topics.length === 0 && (
                  <div className="forum-state">
                    <h2>Konu bulunamadı.</h2>
                    <p>
                      Arama veya kategori seçimini
                      değiştirerek tekrar deneyin.
                    </p>
                  </div>
                )}
              </div>
            )}

            {pagination &&
              pagination.totalPages > 1 && (
                <div className="forum-pagination">
                  <button
                    type="button"
                    disabled={pagination.page <= 1}
                    onClick={() =>
                      updateSearchParams({
                        sayfa:
                          pagination.page - 1,
                      })
                    }
                  >
                    <ChevronLeft size={18} />
                  </button>

                  <strong>
                    {pagination.page} /{" "}
                    {pagination.totalPages}
                  </strong>

                  <button
                    type="button"
                    disabled={
                      pagination.page >=
                      pagination.totalPages
                    }
                    onClick={() =>
                      updateSearchParams({
                        sayfa:
                          pagination.page + 1,
                      })
                    }
                  >
                    <ChevronRight size={18} />
                  </button>
                </div>
              )}
          </main>
        </Container>
      </section>
    </div>
  );
};

export default ForumPage;