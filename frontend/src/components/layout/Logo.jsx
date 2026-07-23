import { Link } from "react-router-dom";
import { siteConfig } from "../../config/site";

const Logo = ({ light = false }) => {
  return (
    <Link
      to="/"
      className={`site-logo ${light ? "site-logo--light" : ""}`}
      aria-label={`${siteConfig.shortName} ana sayfa`}
    >
      <svg
        className="site-logo__symbol"
        viewBox="0 0 56 76"
        aria-hidden="true"
      >
        <path
          d="M31 4C18.3 4 8 14.3 8 27c0 11.3 8.1 20.7 18.8 22.6C24.1 59.2 17.9 66.1 8 71c19.7-1.3 36-15.9 36-38.4V17C44 9.8 38.2 4 31 4Z"
          fill="currentColor"
        />

        <circle cx="29" cy="16" r="5" fill="white" />
      </svg>

      <span className="site-logo__text">{siteConfig.name}</span>
    </Link>
  );
};

export default Logo;