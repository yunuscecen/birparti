import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

const ProjectCard = ({ project }) => {
  const categoryColor =
    project.category?.color || "#2453ad";

  return (
    <article className="project-card">
      <Link
        to={`/projelerimiz/${project.slug}`}
        className="project-card__image-link"
        aria-label={`${project.title} projesini incele`}
      >
        <img
          className="project-card__image"
          src={project.coverImage?.url}
          alt={
            project.coverImage?.alt ||
            project.title
          }
          loading="lazy"
        />

        <span className="project-card__image-overlay" />
      </Link>

      <div className="project-card__content">
        <h2 className="project-card__title">
          <Link to={`/projelerimiz/${project.slug}`}>
            {project.title}
          </Link>
        </h2>

        <p className="project-card__summary">
          {project.summary}
        </p>

        <div className="project-card__footer">
          <span
            className="project-card__category"
            style={{
              "--category-color": categoryColor,
            }}
          >
            {project.category?.name || "Proje"}
          </span>

          <Link
            className="project-card__detail"
            to={`/projelerimiz/${project.slug}`}
          >
            Daha Fazlası
            <ArrowRight size={16} />
          </Link>
        </div>
      </div>
    </article>
  );
};

export default ProjectCard;