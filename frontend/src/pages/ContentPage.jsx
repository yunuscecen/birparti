import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useParams } from "react-router-dom";
import ButtonLink from "../components/common/ButtonLink";
import Container from "../components/common/Container";
import ContentCard from "../components/content/ContentCard";
import { getPageBySlug } from "../services/pageService";

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
    queryFn: () => getPageBySlug(slug),
    enabled: Boolean(slug),
    retry: false,
  });

  const page = pageQuery.data?.data;

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
        </Container>
      </section>
    </div>
  );
};

export default ContentPage;