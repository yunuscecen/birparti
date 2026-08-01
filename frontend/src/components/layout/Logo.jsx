import {
  Link,
} from "react-router-dom";

import {
  useSiteSettings,
} from "../../context/SiteSettingsContext";

const Logo = ({
  light = false,
}) => {
  const {
    settings,
  } = useSiteSettings();

  const logo =
    settings.branding.logo;

  return (
    <Link
      to="/"
      className={`site-logo ${
        light
          ? "site-logo--light"
          : ""
      }`}
      aria-label={`${settings.identity.shortName} ana sayfa`}
    >
      {logo.url ? (
        <img
          className="site-logo__image"
          src={logo.url}
          alt={
            logo.alt ||
            settings.identity
              .siteName
          }
        />
      ) : (
        <svg
          className="site-logo__symbol"
          viewBox="0 0 56 76"
          aria-hidden="true"
        >
          <path
            d="M31 4C18.3 4 8 14.3 8 27c0 11.3 8.1 20.7 18.8 22.6C24.1 59.2 17.9 66.1 8 71c19.7-1.3 36-15.9 36-38.4V17C44 9.8 38.2 4 31 4Z"
            fill="currentColor"
          />

          <circle
            cx="29"
            cy="16"
            r="5"
            fill="white"
          />
        </svg>
      )}

      <span className="site-logo__text">
        {
          settings.identity
            .siteName
        }
      </span>
    </Link>
  );
};

export default Logo;