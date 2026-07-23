import ButtonLink from "../components/common/ButtonLink";
import Container from "../components/common/Container";

const NotFoundPage = () => {
  return (
    <section className="not-found-page">
      <Container className="not-found-page__container">
        <span className="not-found-page__code">404</span>

        <h1>Aradığınız sayfa bulunamadı.</h1>

        <p>
          Sayfa kaldırılmış, taşınmış veya adresi yanlış yazılmış olabilir.
        </p>

        <ButtonLink to="/">Ana Sayfaya Dön</ButtonLink>
      </Container>
    </section>
  );
};

export default NotFoundPage;