import { ArrowRight } from "lucide-react";
import ButtonLink from "../components/common/ButtonLink";
import Container from "../components/common/Container";
import { homeContent } from "../data/defaultContent";

const HomePage = () => {
  return (
    <div className="home-page">
      <section className="home-hero">
        <div className="home-hero__watermark" aria-hidden="true">
          ,
        </div>

        <Container className="home-hero__container">
          <div className="home-hero__content">
            <p className="home-hero__eyebrow">
              Yeni bir siyaset anlayışı
            </p>

            <h1 className="home-hero__title">
              <strong>{homeContent.hero.titleFirst}</strong>
              <span>{homeContent.hero.titleSecond}</span>
            </h1>

            <p className="home-hero__description">
              {homeContent.hero.description}
            </p>

            <div className="home-hero__actions">
              <ButtonLink to={homeContent.hero.primaryButton.path}>
                {homeContent.hero.primaryButton.label}
              </ButtonLink>

              <ButtonLink
                to={homeContent.hero.secondaryButton.path}
                variant="secondary"
              >
                {homeContent.hero.secondaryButton.label}
              </ButtonLink>
            </div>
          </div>

          <div className="home-features">
            {homeContent.featureCards.map((card) => (
              <article className="home-feature-card" key={card.id}>
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
            ))}
          </div>

          <div className="home-manifesto">
            <p className="home-manifesto__eyebrow">
              Birlikte mümkün
            </p>

            <h2>{homeContent.manifesto.title}</h2>

            <p>{homeContent.manifesto.description}</p>

            <div className="home-manifesto__actions">
              <ButtonLink to={homeContent.manifesto.primaryButton.path}>
                {homeContent.manifesto.primaryButton.label}
              </ButtonLink>

              <ButtonLink
                to={homeContent.manifesto.secondaryButton.path}
                variant="secondary"
              >
                {homeContent.manifesto.secondaryButton.label}
              </ButtonLink>
            </div>
          </div>
        </Container>
      </section>
    </div>
  );
};

export default HomePage;