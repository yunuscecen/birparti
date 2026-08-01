import {
  Ban,
} from "lucide-react";

import Container from "../components/common/Container";
import ButtonLink from "../components/common/ButtonLink";

const FeatureUnavailablePage = ({
  title,
  description,
}) => {
  return (
    <section className="content-page-state">
      <Container className="content-page-state__inner">
        <Ban size={38} />

        <h1>
          {title ||
            "Bu alan şu anda kapalı."}
        </h1>

        <p>
          {description ||
            "Bu özellik geçici olarak kullanılamıyor."}
        </p>

        <ButtonLink to="/">
          Ana Sayfaya Dön
        </ButtonLink>
      </Container>
    </section>
  );
};

export default FeatureUnavailablePage;