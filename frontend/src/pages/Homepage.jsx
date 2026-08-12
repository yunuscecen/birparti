import {
  ArrowRight,
  ArrowUpRight,
  CircleDollarSign,
  Eye,
  Landmark,
  Route,
  UsersRound,
} from "lucide-react";

import {
  useEffect,
} from "react";

import {
  useQuery,
} from "@tanstack/react-query";

import {
  Link,
} from "react-router-dom";

import ButtonLink from "../components/common/ButtonLink";
import Container from "../components/common/Container";

import {
  homeContent,
} from "../data/defaultContent";

import {
  getHomePageContent,
} from "../services/homePageService";

import {
  getProjects,
} from "../services/projectService";

import {
  getPageBySlug,
} from "../services/pageService";

import {
  getPublicTransparency,
} from "../services/transparencyService";

const fallbackOppositionCards = [
  {
    title: "Adaletsizliğe",
    description:
      "Hukuka ve eşit yurttaşlık ilkesine zarar veren anlayışlara karşıyız.",
    linkLabel: "Yaklaşımımızı İncele",
    linkUrl: "/neye-karsiyiz",
  },
  {
    title: "Hesapsız Yönetime",
    description:
      "Kamu kaynaklarının denetimsiz ve toplumdan gizli kullanılmasına karşıyız.",
    linkLabel: "Şeffaflığı İncele",
    linkUrl: "/seffaflik",
  },
  {
    title: "Kutuplaştırıcı Dile",
    description:
      "İnsanları ayrıştıran ve ortak geleceğimizi zayıflatan siyasi dile karşıyız.",
    linkLabel: "Topluluğa Katıl",
    linkUrl: "/forum",
  },
];

const fallbackRoadmapCards = [
  {
    title: "1. Dinleme",
    description:
      "Sorunları ve çözüm önerilerini doğrudan yurttaşlardan topluyoruz.",
  },
  {
    title: "2. Ortak Program",
    description:
      "Görüşleri açık tartışma ve uzmanlıkla uygulanabilir politikalara dönüştürüyoruz.",
  },
  {
    title: "3. Yerel Yapılanma",
    description:
      "Katılımcı ve hesap verebilir çalışma grupları oluşturuyoruz.",
  },
  {
    title: "4. Açık İlerleme",
    description:
      "Tamamlanan ve devam eden çalışmaları düzenli olarak yayımlıyoruz.",
  },
];

const setMetaDescription = (
  description = ""
) => {
  let meta = document.querySelector(
    'meta[name="description"]'
  );

  if (!meta) {
    meta =
      document.createElement(
        "meta"
      );

    meta.setAttribute(
      "name",
      "description"
    );

    document.head.appendChild(
      meta
    );
  }

  meta.setAttribute(
    "content",
    description
  );
};

const getPageCards = (page) => {
  const cardSection =
    page?.sections?.find(
      (section) =>
        section.type === "cards"
    );

  return cardSection?.cards || [];
};

const formatCurrency = (
  amount = 0
) => {
  return new Intl.NumberFormat(
    "tr-TR",
    {
      style: "currency",
      currency: "TRY",
      maximumFractionDigits: 0,
    }
  ).format(amount);
};

const HomePage = () => {
  const currentYear =
    new Date().getFullYear();

  const homePageQuery =
    useQuery({
      queryKey: [
        "home-page-content",
      ],
      queryFn:
        getHomePageContent,
      retry: false,
      staleTime:
        5 * 60 * 1000,
    });

  const projectsQuery =
    useQuery({
      queryKey: [
        "home-projects",
      ],
      queryFn: () =>
        getProjects(),
      retry: false,
      staleTime:
        5 * 60 * 1000,
    });

  const oppositionQuery =
    useQuery({
      queryKey: [
        "home-opposition",
      ],
      queryFn: () =>
        getPageBySlug(
          "neye-karsiyiz"
        ),
      retry: false,
      staleTime:
        5 * 60 * 1000,
    });

  const roadmapQuery =
    useQuery({
      queryKey: [
        "home-roadmap",
      ],
      queryFn: () =>
        getPageBySlug(
          "yol-haritasi"
        ),
      retry: false,
      staleTime:
        5 * 60 * 1000,
    });

  const transparencyQuery =
    useQuery({
      queryKey: [
        "home-transparency",
        currentYear,
      ],
      queryFn: () =>
        getPublicTransparency({
          year: currentYear,
        }),
      retry: false,
      staleTime:
        5 * 60 * 1000,
    });

  const content =
    homePageQuery.data
      ?.content ||
    homeContent;

  const projects =
    projectsQuery.data?.data ||
    [];

  const featuredProjects =
    projects.slice(0, 3);

  const oppositionPage =
    oppositionQuery.data?.data;

  const oppositionCards =
    getPageCards(
      oppositionPage
    ).length > 0
      ? getPageCards(
          oppositionPage
        ).slice(0, 3)
      : fallbackOppositionCards;

  const roadmapPage =
    roadmapQuery.data?.data;

  const roadmapCards =
    getPageCards(
      roadmapPage
    ).length > 0
      ? getPageCards(
          roadmapPage
        ).slice(0, 4)
      : fallbackRoadmapCards;

  const transparency =
    transparencyQuery.data;

  useEffect(() => {
    document.title =
      content.seo?.title ||
      "Bir Parti";

    setMetaDescription(
      content.seo?.description ||
        content.hero
          ?.description ||
        "Bir Parti"
    );

    return () => {
      document.title =
        "Bir Parti";
    };
  }, [content]);

  useEffect(() => {
    const elements =
      document.querySelectorAll(
        ".home-page [data-reveal]"
      );

    if (
      !(
        "IntersectionObserver" in
        window
      )
    ) {
      elements.forEach(
        (element) =>
          element.classList.add(
            "is-visible"
          )
      );

      return undefined;
    }

    const observer =
      new IntersectionObserver(
        (entries) => {
          entries.forEach(
            (entry) => {
              if (
                entry.isIntersecting
              ) {
                entry.target
                  .classList.add(
                    "is-visible"
                  );

                observer.unobserve(
                  entry.target
                );
              }
            }
          );
        },
        {
          threshold: 0.12,
        }
      );

    elements.forEach(
      (element) =>
        observer.observe(
          element
        )
    );

    return () =>
      observer.disconnect();
  }, [
    projectsQuery.data,
    oppositionQuery.data,
    roadmapQuery.data,
    transparencyQuery.data,
  ]);

  return (
    <div className="home-page">
      <section className="home-launch">
        <Container className="home-launch__container">
          <div
            className="home-launch__content"
            data-reveal
          >
            <p className="home-eyebrow home-eyebrow--light">
              {content.hero
                ?.eyebrow ||
                "Dünyanın ilk sanal siyasi partisi"}
            </p>

            <h1>
              <strong>
                {
                  content.hero
                    .titleFirst
                }
              </strong>

              <span>
                {
                  content.hero
                    .titleSecond
                }
              </span>
            </h1>

            <p className="home-launch__description">
              {
                content.hero
                  .description
              }
            </p>

            <div className="home-launch__actions">
              <ButtonLink
                to={
                  content.hero
                    .primaryButton
                    .path
                }
              >
                {
                  content.hero
                    .primaryButton
                    .label
                }

                <ArrowRight
                  size={18}
                />
              </ButtonLink>

              <ButtonLink
                to={
                  content.hero
                    .secondaryButton
                    .path
                }
                variant="secondary"
              >
                {
                  content.hero
                    .secondaryButton
                    .label
                }
              </ButtonLink>
            </div>
          </div>

          <div
            className="home-launch__panel"
            data-reveal
          >
            <div className="home-launch__panel-heading">
              <span className="home-live-dot" />

              Canlı platform görünümü
            </div>

            <div className="home-launch__statistics">
              <article>
                <strong>
                  {projectsQuery
                    .isLoading
                    ? "—"
                    : projects.length}
                </strong>

                <span>
                  Yayındaki proje
                </span>
              </article>

              <article>
                <strong>
                  {
                    roadmapCards.length
                  }
                </strong>

                <span>
                  Yol haritası aşaması
                </span>
              </article>

              <article>
                <strong>
                  {transparencyQuery
                    .isLoading
                    ? "—"
                    : transparency
                        ?.totals
                        ?.recordCount ||
                      0}
                </strong>

                <span>
                  Açık finans kaydı
                </span>
              </article>
            </div>

            <div className="home-launch__statement">
              <Eye size={22} />

              <div>
                <strong>
                  Her adım görünür
                </strong>

                <span>
                  Kararlar, projeler ve kaynaklar toplumun denetimine açık.
                </span>
              </div>
            </div>
          </div>
        </Container>
      </section>

      <section className="home-section home-how">
        <Container>
          <div
            className="home-section-heading"
            data-reveal
          >
            <div>
              <p className="home-eyebrow">
                Katılımcı siyaset
              </p>

              <h2>
                Nasıl çalışıyoruz?
              </h2>
            </div>

            <p>
              Dinliyor, birlikte üretiyor ve sonuçları açık biçimde paylaşıyoruz.
            </p>
          </div>

          <div className="home-how__grid">
            {(content.featureCards ||
              [])
              .slice(0, 3)
              .map(
                (
                  card,
                  index
                ) => (
                  <article
                    className="home-how-card"
                    key={
                      card._id ||
                      card.id ||
                      card.title
                    }
                    data-reveal
                  >
                    <span className="home-how-card__number">
                      {String(
                        index + 1
                      ).padStart(
                        2,
                        "0"
                      )}
                    </span>

                    <h3>
                      {card.title}
                    </h3>

                    <p>
                      {
                        card.description
                      }
                    </p>

                    <Link
                      to={card.path}
                    >
                      {
                        card.buttonLabel
                      }

                      <ArrowRight
                        size={16}
                      />
                    </Link>
                  </article>
                )
              )}
          </div>
        </Container>
      </section>

      <section className="home-section home-projects">
        <Container>
          <div
            className="home-section-heading"
            data-reveal
          >
            <div>
              <p className="home-eyebrow">
                Çözüm üretiyoruz
              </p>

              <h2>
                Projelerimiz
              </h2>
            </div>

            <ButtonLink
              to="/projelerimiz"
              variant="secondary"
            >
              Tüm Projeler
              <ArrowRight size={17} />
            </ButtonLink>
          </div>

          <div className="home-project-grid">
            {featuredProjects.map(
              (project) => (
                <Link
                  className="home-project-card"
                  to={`/projelerimiz/${project.slug}`}
                  key={project._id}
                  data-reveal
                >
                  <div className="home-project-card__visual">
                    {project.coverImage
                      ?.url ? (
                      <img
                        src={
                          project
                            .coverImage
                            .url
                        }
                        alt={
                          project
                            .coverImage
                            .alt ||
                          project.title
                        }
                      />
                    ) : (
                      <span>
                        {project.title
                          .charAt(0)
                          .toUpperCase()}
                      </span>
                    )}
                  </div>

                  <div className="home-project-card__content">
                    <small>
                      {project.category
                        ?.name ||
                        "Bir Parti"}
                    </small>

                    <h3>
                      {project.title}
                    </h3>

                    <p>
                      {project.summary}
                    </p>

                    <span className="home-project-card__link">
                      Projeyi İncele
                      <ArrowUpRight
                        size={17}
                      />
                    </span>
                  </div>
                </Link>
              )
            )}

            {!projectsQuery
              .isLoading &&
              featuredProjects
                .length === 0 && (
                <div className="home-empty-state">
                  <p>
                    Yayındaki projeler yakında burada yer alacak.
                  </p>
                </div>
              )}
          </div>
        </Container>
      </section>

      <section className="home-section home-opposition">
        <Container>
          <div
            className="home-section-heading home-section-heading--light"
            data-reveal
          >
            <div>
              <p className="home-eyebrow home-eyebrow--light">
                Açık tavrımız
              </p>

              <h2>
                Neye karşıyız?
              </h2>
            </div>

            <p>
              Karşı durduğumuz her soruna, uygulanabilir ve denetlenebilir bir çözüm öneriyoruz.
            </p>
          </div>

          <div className="home-opposition__grid">
            {oppositionCards.map(
              (card, index) => (
                <Link
                  className="home-opposition-card"
                  to={
                    card.linkUrl ||
                    "/neye-karsiyiz"
                  }
                  key={
                    card._id ||
                    `${card.title}-${index}`
                  }
                  data-reveal
                >
                  <span>
                    {String(
                      index + 1
                    ).padStart(
                      2,
                      "0"
                    )}
                  </span>

                  <h3>
                    {card.title}
                  </h3>

                  <p>
                    {
                      card.description
                    }
                  </p>

                  <strong>
                    {card.linkLabel ||
                      "Devamını Oku"}

                    <ArrowRight
                      size={16}
                    />
                  </strong>
                </Link>
              )
            )}
          </div>

          <div className="home-centered-action">
            <ButtonLink
              to="/neye-karsiyiz"
            >
              Tüm Başlıkları İncele
            </ButtonLink>
          </div>
        </Container>
      </section>

      <section className="home-section home-roadmap">
        <Container>
          <div
            className="home-section-heading"
            data-reveal
          >
            <div>
              <p className="home-eyebrow">
                Birlikte ilerliyoruz
              </p>

              <h2>
                Yol haritamız
              </h2>
            </div>

            <ButtonLink
              to="/yol-haritasi"
              variant="secondary"
            >
              Yol Haritası
              <Route size={17} />
            </ButtonLink>
          </div>

          <div className="home-roadmap__timeline">
            {roadmapCards.map(
              (card, index) => (
                <article
                  className="home-roadmap-card"
                  key={
                    card._id ||
                    `${card.title}-${index}`
                  }
                  data-reveal
                >
                  <div className="home-roadmap-card__marker">
                    {index + 1}
                  </div>

                  <div>
                    <h3>
                      {card.title}
                    </h3>

                    <p>
                      {
                        card.description
                      }
                    </p>
                  </div>
                </article>
              )
            )}
          </div>
        </Container>
      </section>

      <section className="home-section home-transparency">
        <Container className="home-transparency__container">
          <div
            className="home-transparency__content"
            data-reveal
          >
            <p className="home-eyebrow">
              Hesap verebilirlik
            </p>

            <h2>
              Şeffaflık söz değil, sistemdir.
            </h2>

            <p>
              Gelirleri, harcamaları ve mali dengeyi düzenli olarak kamuoyuyla paylaşıyoruz.
            </p>

            <ButtonLink to="/seffaflik">
              Tüm Kayıtları Gör
              <ArrowRight size={17} />
            </ButtonLink>
          </div>

          <div
            className="home-finance-grid"
            data-reveal
          >
            <article>
              <Landmark size={22} />

              <span>
                Toplam Gelir
              </span>

              <strong>
                {formatCurrency(
                  transparency
                    ?.totals
                    ?.income || 0
                )}
              </strong>
            </article>

            <article>
              <CircleDollarSign
                size={22}
              />

              <span>
                Toplam Harcama
              </span>

              <strong>
                {formatCurrency(
                  transparency
                    ?.totals
                    ?.expense || 0
                )}
              </strong>
            </article>

            <article className="home-finance-card--balance">
              <Eye size={22} />

              <span>
                Güncel Denge
              </span>

              <strong>
                {formatCurrency(
                  transparency
                    ?.totals
                    ?.balance || 0
                )}
              </strong>
            </article>
          </div>
        </Container>
      </section>

      <section className="home-join">
        <Container>
          <div
            className="home-join__card"
            data-reveal
          >
            <div className="home-join__icon">
              <UsersRound
                size={32}
              />
            </div>

            <p className="home-eyebrow home-eyebrow--light">
              Bir Damla Ol
            </p>

            <h2>
              Değişim, bir kişinin cesaretiyle başlar.
            </h2>

            <p>
              Fikre, dayanışmaya ve geleceğe ortak olun. Birlikte çoğalalım.
            </p>

            <div className="home-join__actions">
              <ButtonLink to="/bagis">
                Bir Damla Ol
                <ArrowRight
                  size={18}
                />
              </ButtonLink>

              <ButtonLink
                to="/iletisim"
                variant="secondary"
              >
                Fikre Ortak Ol
              </ButtonLink>
            </div>
          </div>
        </Container>
      </section>
    </div>
  );
};

export default HomePage;