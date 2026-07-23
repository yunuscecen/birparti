import { useEffect } from "react";
import {
  ArrowLeft,
  CalendarDays,
  MessageCircle,
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { Link, useParams } from "react-router-dom";
import ButtonLink from "../components/common/ButtonLink";
import Container from "../components/common/Container";
import { getProjectBySlug } from "../services/projectService";

const formatDate = (date) => {
  if (!date) {
    return "";
  }

  return new Intl.DateTimeFormat("tr-TR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(date));
};

const ProjectDetailPage = () => {
  const { slug } = useParams();

  const projectQuery = useQuery({
    queryKey: ["project", slug],
    queryFn: () => getProjectBySlug(slug),
    enabled: Boolean(slug),
    retry: false,
  });

  const project = projectQuery.data?.data;

  useEffect(() => {
    if (project?.seo?.title) {
      document.title = project.seo.title;
    } else if (project?.title) {
      document.title = `${project.title} | Bir Parti`;
    }

    return () => {
      document.title = "Bir Parti";
    };
  }, [project]);

  if (projectQuery.isLoading) {
    return (
      <section className="project-detail-state">
        <span className="projects-loading__spinner" />
        <p>Proje yükleniyor...</p>
      </section>
    );
  }

  if (projectQuery.isError || !project) {
    return (
      <section className="project-detail-state">
        <Container className="project-detail-state__inner">
          <span className="project-detail-state__code">
            404
          </span>

          <h1>Proje bulunamadı.</h1>

          <p>
            Aradığınız proje kaldırılmış, taslak
            durumuna alınmış veya adresi değişmiş
            olabilir.
          </p>

          <ButtonLink to="/projelerimiz">
            Projelere Dön
          </ButtonLink>
        </Container>
      </section>
    );
  }

  const categoryColor =
    project.category?.color || "#2453ad";

  return (
    <article className="project-detail-page">
      <section className="project-detail-hero">
        <div
          className="project-detail-hero__background"
          style={{
            backgroundImage: `url("${project.coverImage?.url}")`,
          }}
        />

        <div className="project-detail-hero__overlay" />

        <Container className="project-detail-hero__container">
          <Link
            to="/projelerimiz"
            className="project-detail-back"
          >
            <ArrowLeft size={18} />
            Tüm Projeler
          </Link>

          <span
            className="project-detail-category"
            style={{
              "--category-color": categoryColor,
            }}
          >
            {project.category?.name}
          </span>

          <h1>{project.title}</h1>

          <p className="project-detail-hero__summary">
            {project.summary}
          </p>

          {project.publishedAt && (
            <div className="project-detail-date">
              <CalendarDays size={18} />
              {formatDate(project.publishedAt)}
            </div>
          )}
        </Container>
      </section>

      <section className="project-detail-content">
        <Container className="project-detail-layout">
       <div className="project-detail-main">
  <div className="project-detail-body">
    {project.sections?.length > 0 ? (
      project.sections.map((section, index) =>
        section.body ? (
          <p
            key={
              section._id ||
              `project-content-${index}`
            }
          >
            {section.body}
          </p>
        ) : null
      )
    ) : (
      <p>
        Lorem ipsum dolor sit amet, consectetur adipiscing
        elit. Projenin ayrıntılı içeriği daha sonra müşteri
        tarafından gönderilecektir.
      </p>
    )}
  </div>
</div>

          <aside className="project-detail-sidebar">
            <div className="project-detail-info-card">
              <p className="project-detail-info-card__label">
                Proje kategorisi
              </p>

              <strong>
                {project.category?.name || "Proje"}
              </strong>

              {project.tags?.length > 0 && (
                <div className="project-detail-tags">
                  {project.tags.map((tag) => (
                    <span key={tag}>{tag}</span>
                  ))}
                </div>
              )}
            </div>

            <div className="project-detail-cta">
              <MessageCircle size={29} />

              <h2>Bu proje hakkında ne düşünüyorsun?</h2>

              <p>
                Görüş, öneri ve eleştirilerini bizimle
                paylaşabilirsin.
              </p>

              <ButtonLink
                to="/iletisim"
                className="project-detail-cta__button"
              >
                Görüşünü Paylaş
              </ButtonLink>
            </div>
          </aside>
        </Container>
      </section>
    </article>
  );
};

export default ProjectDetailPage;