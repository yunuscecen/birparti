import ButtonLink from "../components/common/ButtonLink";
import Container from "../components/common/Container";

const PlaceholderPage = ({
  eyebrow = "Bir Parti",
  title,
  description,
}) => {
  return (
    <section className="placeholder-page">
      <div className="placeholder-page__watermark" aria-hidden="true">
        ,
      </div>

      <Container className="placeholder-page__container">
        <p className="placeholder-page__eyebrow">{eyebrow}</p>

        <h1>{title}</h1>

        <p className="placeholder-page__description">{description}</p>

        <ButtonLink to="/">Ana Sayfaya Dön</ButtonLink>
      </Container>
    </section>
  );
};

export default PlaceholderPage;