import {
  ArrowUpRight,
  CreditCard,
  HeartHandshake,
  RefreshCw,
  ShieldCheck,
} from "lucide-react";
import {
  Link,
} from "react-router-dom";

import {
  useEffect,
} from "react";

import Container from "../components/common/Container";

import KreosusEmbed from "../components/donation/KreosusEmbed";

import {
  siteConfig,
} from "../config/site";

const DonationPage = () => {
  useEffect(() => {
    document.title =
      "Bir Damla Ol | Bir Parti";

    return () => {
      document.title =
        "Bir Parti";
    };
  }, []);

  const {
    creatorId,
    profileUrl,
  } = siteConfig.donation;

  return (
    <section className="donation-page">
      <Container className="donation-page__container">
        <header className="donation-hero">
          <div>
            <p className="donation-eyebrow">
              Bir Damla Ol
            </p>

            <h1>
              Birlikte çoğalalım,
              birlikte değiştirelim.
            </h1>

            <p className="donation-hero__description">
              Vereceğiniz her destek;
              bağımsız projelerin,
              toplumsal çalışmaların ve
              ortak fikirlerin hayata
              geçirilmesine katkı sağlar.
            </p>
          </div>

          <a
            href={profileUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="button-link button-link--secondary"
          >
            Kreosus Profilini Aç
            <ArrowUpRight
              size={18}
            />
          </a>
        </header>

        <div className="donation-feature-grid">
          <article className="donation-feature-card">
            <span>
              <HeartHandshake
                size={23}
              />
            </span>

            <div>
              <h2>
                Tek Seferlik Destek
              </h2>

              <p>
                Belirlediğiniz miktarla
                yalnızca bir defa destek
                olabilirsiniz.
              </p>
            </div>
          </article>

          <article className="donation-feature-card">
            <span>
              <RefreshCw
                size={23}
              />
            </span>

            <div>
              <h2>
                Düzenli Destek
              </h2>

              <p>
                Çalışmaların
                sürdürülebilirliği için
                aylık destek
                oluşturabilirsiniz.
              </p>
            </div>
          </article>

          <article className="donation-feature-card">
            <span>
              <ShieldCheck
                size={23}
              />
            </span>

            <div>
              <h2>
                Güvenli Ödeme
              </h2>

              <p>
                Ödeme ve kart işlemleri
                doğrudan Kreosus
                altyapısında
                gerçekleştirilir.
              </p>
            </div>
          </article>
        </div>

        <div className="donation-main-grid">
          <section className="donation-information">
            <p className="donation-eyebrow">
              Neden destek?
            </p>

            <h2>
              Bir damla, ortak bir
              geleceğin başlangıcıdır.
            </h2>

            <p>
              Bağımsız bir yapının
              sürdürülebilmesi; şeffaf,
              gönüllü ve topluluk temelli
              desteklerle mümkündür.
            </p>

            <p>
              Yapılan desteklerin
              kullanım alanları
              Şeffaflık sayfamızda gelir
              ve harcama kayıtlarıyla
              yayımlanacaktır.
            </p>

           <Link
  to="/seffaflik"
  className="donation-text-link"
>
  Şeffaflık kayıtlarını incele
  <ArrowUpRight size={17} />
</Link>

            <div className="donation-security-note">
              <CreditCard size={22} />

              <p>
                Bir Parti sitesi kart
                numaranızı, güvenlik
                kodunuzu veya ödeme
                bilgilerinizi görmez ve
                saklamaz. İşlem Kreosus
                tarafından yönetilir.
              </p>
            </div>
          </section>

          <section className="donation-embed-card">
            <div className="donation-embed-card__heading">
              <p className="donation-eyebrow">
                Kreosus
              </p>

              <h2>
                Desteğini belirle
              </h2>

              <p>
                Tek seferlik veya aylık
                destek seçeneklerinden
                birini seçebilirsiniz.
              </p>
            </div>

            <KreosusEmbed
              creatorId={
                creatorId
              }
            />

            <a
              href={profileUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="donation-external-button"
            >
              Modülü açamıyorsanız
              Kreosus’ta devam edin

              <ArrowUpRight
                size={17}
              />
            </a>
          </section>
        </div>

        <aside className="donation-legal-note">
          <strong>
            Bilgilendirme
          </strong>

          <p>
            Ödeme, abonelik, iptal ve
            iade süreçleri Kreosus’un
            kullanım koşullarına göre
            yürütülür. Kreosus üzerinden
            gerçekleştirilen işlemler
            platform tarafından destek
            veya patronaj işlemi olarak
            değerlendirilebilir.
          </p>
        </aside>
      </Container>
    </section>
  );
};

export default DonationPage;