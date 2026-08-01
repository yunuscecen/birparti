import {
  Mail,
  MapPin,
  Phone,
} from "lucide-react";

import {
  FaFacebookF,
  FaInstagram,
  FaLinkedinIn,
  FaYoutube,
} from "react-icons/fa";

import {
  FaXTwitter,
} from "react-icons/fa6";

import {
  useSiteSettings,
} from "../../context/SiteSettingsContext";

import Container from "../common/Container";
import Logo from "./Logo";

const Footer = () => {
  const {
    settings,
  } = useSiteSettings();

const socialItems = [
  {
    key: "instagram",
    label: "Instagram",
    icon: FaInstagram,
  },
  {
    key: "facebook",
    label: "Facebook",
    icon: FaFacebookF,
  },
  {
    key: "x",
    label: "X",
    icon: FaXTwitter,
  },
  {
    key: "youtube",
    label: "YouTube",
    icon: FaYoutube,
  },
  {
    key: "linkedin",
    label: "LinkedIn",
    icon: FaLinkedinIn,
  },
].filter(
  (item) =>
    settings.socialLinks[
      item.key
    ]
);

  return (
    <footer className="site-footer">
      <Container className="site-footer__inner">
        <Logo light />

        <div className="site-footer__message">
          <strong>
            {
              settings.footer
                .primaryText
            }
          </strong>

          <span>
            {
              settings.footer
                .secondaryText
            }
          </span>
        </div>

        <div className="site-footer__contact">
          <a
            href={`mailto:${settings.contact.email}`}
          >
            <Mail size={17} />
            {settings.contact.email}
          </a>

          {settings.contact.phone && (
            <a
              href={`tel:${settings.contact.phone}`}
            >
              <Phone size={17} />
              {settings.contact.phone}
            </a>
          )}

          {settings.contact.address && (
            <span>
              <MapPin size={17} />
              {settings.contact.address}
            </span>
          )}
        </div>

        <p className="site-footer__copyright">
          © {new Date().getFullYear()}
          {" "}
          {
            settings.footer
              .copyrightText
          }
        </p>

        {socialItems.length > 0 && (
          <div className="site-footer__socials">
           {socialItems.map(
  (item) => {
    const Icon =
      item.icon;

    return (
      <a
        key={item.key}
        href={
          settings.socialLinks[
            item.key
          ]
        }
        className="site-footer__social"
        target="_blank"
        rel="noreferrer"
        aria-label={item.label}
        title={item.label}
      >
        <Icon size={17} />
      </a>
    );
  }
)}
          </div>
        )}
      </Container>
    </footer>
  );
};

export default Footer;