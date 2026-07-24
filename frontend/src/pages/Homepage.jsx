import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { ArrowRight } from "lucide-react";

import ButtonLink from "../components/common/ButtonLink";
import Container from "../components/common/Container";
import { homeContent } from "../data/defaultContent";
import { getHomePageContent } from "../services/homePageService";

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

const HomePage = () => {
  const homePageQuery = useQuery({
    queryKey: ["home-page-content"],
    queryFn: getHomePageContent,
    retry: false,
    staleTime: 5 * 60 * 1000,
  });

  /*
   * MongoDB kaydı henüz yoksa mevcut
   * defaultContent kullanılmaya devam eder.
   */
  const content =
    homePageQuery.data?.content ||
    homeContent;

  useEffect(() => {
    document.title =
      content.seo?.title ||
      "Bir Parti";

    setMetaDescription(
      content.seo?.description ||
        content.hero?.description ||
        "Bir Parti"
    );

    return () => {
      document.title = "Bir Parti";
    };
  }, [content]);

  return (
    <div className="home-page">
      <section className="home-hero">
        <div
          className="home-hero__watermark"
          aria-hidden="true"
        >
          ,
        </div>

        <Container className="home-hero__container">
          <div className="home-hero__content">
            <p className="home-hero__eyebrow">
              {content.hero.eyebrow}
            </p>

            <h1 className="home-hero__title">
              <strong>
                {content.hero.titleFirst}
              </strong>

              <span>
                {content.hero.titleSecond}
              </span>
            </h1>

            <p className="home-hero__description">
              {content.hero.description}
            </p>

            <div className="home-hero__actions">
              <ButtonLink
                to={
                  content.hero.primaryButton
                    .path
                }
              >
                {
                  content.hero.primaryButton
                    .label
                }
              </ButtonLink>

              <ButtonLink
                to={
                  content.hero
                    .secondaryButton.path
                }
                variant="secondary"
              >
                {
                  content.hero
                    .secondaryButton.label
                }
              </ButtonLink>
            </div>
          </div>

          <div className="home-features">
            {content.featureCards.map(
              (card, index) => (
                <article
                  className="home-feature-card"
                  key={
                    card._id ||
                    card.id ||
                    `${card.title}-${index}`
                  }
                >
                  <div className="home-feature-card__heading">
                    <span
                      className="home-feature-card__symbol"
                      aria-hidden="true"
                    >
                      ,
                    </span>

                    <h2>{card.title}</h2>
                  </div>

                  <p>{card.description}</p>

                  <ButtonLink
                    to={card.path}
                    size="small"
                    className="home-feature-card__button"
                  >
                    {card.buttonLabel}
                    <ArrowRight size={16} />
                  </ButtonLink>
                </article>
              )
            )}
          </div>

          <div className="home-manifesto">
            <p className="home-manifesto__eyebrow">
              {content.manifesto.eyebrow}
            </p>

            <h2>
              {content.manifesto.title}
            </h2>

            <p>
              {content.manifesto.description}
            </p>

            <div className="home-manifesto__actions">
              <ButtonLink
                to={
                  content.manifesto
                    .primaryButton.path
                }
              >
                {
                  content.manifesto
                    .primaryButton.label
                }
              </ButtonLink>

              <ButtonLink
                to={
                  content.manifesto
                    .secondaryButton.path
                }
                variant="secondary"
              >
                {
                  content.manifesto
                    .secondaryButton.label
                }
              </ButtonLink>
            </div>
          </div>
        </Container>
      </section>
    </div>
  );
};

export default HomePage;