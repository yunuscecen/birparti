import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

const ContentCard = ({ card }) => {
  const hasLink = Boolean(
    card.linkUrl && card.linkLabel
  );

  return (
    <article className="content-card">
      <div className="content-card__heading">
        <span
          className="content-card__symbol"
          aria-hidden="true"
        >
          ,
        </span>

        <h3>{card.title}</h3>
      </div>

      <p>{card.description}</p>

      {hasLink && (
        <Link
          to={card.linkUrl}
          className="content-card__link"
        >
          {card.linkLabel}
          <ArrowRight size={16} />
        </Link>
      )}
    </article>
  );
};

export default ContentCard;