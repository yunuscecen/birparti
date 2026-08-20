import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useParams } from "react-router-dom";
import ButtonLink from "../components/common/ButtonLink";
import Container from "../components/common/Container";
import ContentCard from "../components/content/ContentCard";
import { getPageBySlug } from "../services/pageService";
import {
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

const setMetaDescription = (description = "") => {
  let meta = document.querySelector(
    'meta[name="description"]'
  );

  if (!meta) {
    meta = document.createElement("meta");
    meta.setAttribute("name", "description");
    document.head.appendChild(meta);
  }

  meta.setAttribute("content", description);
};

const ContentPage = ({ fixedSlug }) => {
  const params = useParams();
  const slug = fixedSlug || params.slug;

  const pageQuery = useQuery({
    queryKey: ["page-content", slug],
    queryFn: () =>
      getPageBySlug(slug),
    enabled: Boolean(slug),
    retry: false,
  });

  const roadmapIdeasQuery =
    useQuery({
      queryKey: [
        "roadmap-community-ideas",
      ],

      queryFn: () =>
        getForumTopics({
          page: 1,
          limit: 12,
          sort: "newest",
          roadmapOnly: true,
        }),

      enabled:
        slug === "yol-haritasi",

      retry: false,
    });

  const page =
    pageQuery.data?.data;

  const roadmapIdeas =
    roadmapIdeasQuery.data
      ?.topics || [];

  useEffect(() => {
    if (!page) {
      return;
    }

    document.title =
      page.seo?.title ||
      `${page.title} | Bir Parti`;

    setMetaDescription(
      page.seo?.description ||
      page.description ||
      "Bir Parti"
    );

    return () => {
      document.title = "Bir Parti";
    };
  }, [page]);

  if (pageQuery.isLoading) {
    return (
      <section className="content-page-state">
        <span className="projects-loading__spinner" />
        <p>Sayfa yükleniyor...</p>
      </section>
    );
  }

  if (pageQuery.isError || !page) {
    return (
      <section className="content-page-state">
        <Container className="content-page-state__inner">
          <span className="content-page-state__code">
            404
          </span>

          <h1>Sayfa içeriği bulunamadı.</h1>

          <p>
            Sayfa henüz yayınlanmamış veya kaldırılmış
            olabilir.
          </p>

          <ButtonLink to="/">
            Ana Sayfaya Dön
          </ButtonLink>
        </Container>
      </section>
    );
  }

  return (
    <div
      className={`content-page content-page--${page.slug}`}
    >
      <section className="content-page-hero">
        <div
          className="content-page-hero__watermark"
          aria-hidden="true"
        >
          ,
        </div>

        <Container className="content-page-hero__container">
          {page.eyebrow && (
            <p className="content-page-hero__eyebrow">
              {page.eyebrow}
            </p>
          )}

          <h1>{page.title}</h1>

          {page.description && (
            <p className="content-page-hero__description">
              {page.description}
            </p>
          )}
        </Container>
      </section>

      <section className="content-page-body">
        <Container>
          {page.sections?.map((section) => {
            if (section.type === "text") {
              return (
                <section
                  className="content-text-section"
                  key={section._id}
                >
                  {section.title && (
                    <h2>{section.title}</h2>
                  )}

                  <div className="content-text-section__paragraphs">
                    {section.paragraphs?.map(
                      (paragraph, index) => (
                        <p
                          key={`${section._id}-paragraph-${index}`}
                        >
                          {paragraph}
                        </p>
                      )
                    )}
                  </div>
                </section>
              );
            }

            if (section.type === "cards") {
              return (
                <section
                  className="content-cards-section"
                  key={section._id}
                >
                  {section.title && (
                    <div className="content-cards-section__heading">
                      <p>Başlıklar</p>
                      <h2>{section.title}</h2>
                    </div>
                  )}

                  <div className="content-cards-grid">
                    {section.cards?.map((card) => (
                      <ContentCard
                        key={card._id}
                        card={card}
                      />
                    ))}
                  </div>
                </section>
              );
            }

            return null;
               })}

          {slug ===
            "yol-haritasi" && (
            <section className="content-roadmap-ideas">
              <div className="content-roadmap-ideas__heading">
                <p>
                  Topluluktan Yol Haritasına
                </p>

                <h2>
                  Takip Edilen Fikirler
                </h2>

                <span>
                  Toplulukta geliştirilen ve
                  yönetim tarafından yol
                  haritasına alınan fikirler.
                </span>
              </div>

              {roadmapIdeasQuery
                .isLoading ? (
                <div className="content-roadmap-ideas__state">
                  <span className="projects-loading__spinner" />

                  <p>
                    Fikirler yükleniyor...
                  </p>
                </div>
              ) : roadmapIdeasQuery
                  .isError ? (
                <div className="content-roadmap-ideas__state">
                  <p>
                    Yol haritasındaki
                    fikirler alınamadı.
                  </p>
                </div>
              ) : roadmapIdeas.length >
                0 ? (
                <div className="content-roadmap-ideas__grid">
                  {roadmapIdeas.map(
                    (topic) => (
                      <article
                        className="content-roadmap-idea-card"
                        key={topic._id}
                      >
                        <span>
                          {ideaStageLabels[
                            topic.ideaStage
                          ] ||
                            "Topluluk Fikri"}
                        </span>

                        <h3>
                          {topic.title}
                        </h3>

                        <p>
                          {topic.body
                            ?.length > 180
                            ? `${topic.body.slice(
                                0,
                                180
                              )}…`
                            : topic.body}
                        </p>

                        {topic.linkedProject && (
                          <small>
                            Bağlı proje:{" "}
                            <strong>
                              {
                                topic
                                  .linkedProject
                                  .title
                              }
                            </strong>
                          </small>
                        )}

                        <div className="content-roadmap-idea-card__actions">
                          <ButtonLink
                            to={`/forum/${topic.slug}`}
                            size="small"
                          >
                            Fikri İncele
                          </ButtonLink>

                          {topic.linkedProject && (
                            <ButtonLink
                              to={`/projelerimiz/${topic.linkedProject.slug}`}
                              variant="secondary"
                              size="small"
                            >
                              Projeyi Gör
                            </ButtonLink>
                          )}
                        </div>
                      </article>
                    )
                  )}
                </div>
              ) : (
                <div className="content-roadmap-ideas__state">
                  <p>
                    Henüz yol haritasına
                    eklenen bir topluluk
                    fikri bulunmuyor.
                  </p>
                </div>
              )}
            </section>
          )}
        </Container>
      </section>
    </div>
  );
};

export default ContentPage;