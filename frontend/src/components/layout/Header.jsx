import { useEffect, useState } from "react";
import {
  LayoutDashboard,
  Menu,
  UserRound,
  X,
} from "lucide-react";
import {
  NavLink,
  useLocation,
} from "react-router-dom";

import { siteConfig } from "../../config/site";
import { useAuth } from "../../context/AuthContext";
import ButtonLink from "../common/ButtonLink";
import Container from "../common/Container";
import Logo from "./Logo";

const adminRoles = ["admin", "superAdmin"];

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] =
    useState(false);

  const location = useLocation();

  const {
    user,
    isAuthenticated,
    isAuthReady,
  } = useAuth();

  const hasAdminAccess =
    isAuthenticated &&
    adminRoles.includes(user?.role);

  useEffect(() => {
    setIsMenuOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    document.body.style.overflow =
      isMenuOpen ? "hidden" : "";

    return () => {
      document.body.style.overflow = "";
    };
  }, [isMenuOpen]);

  return (
    <header className="site-header">
      <Container className="site-header__inner">
        <Logo />

        <nav
          id="main-navigation"
          className={`site-navigation ${
            isMenuOpen
              ? "site-navigation--open"
              : ""
          }`}
          aria-label="Ana menü"
        >
          <div className="site-navigation__mobile-top">
            <Logo />

            <button
              type="button"
              className="site-navigation__close"
              onClick={() => setIsMenuOpen(false)}
              aria-label="Menüyü kapat"
            >
              <X size={24} />
            </button>
          </div>

          <div className="site-navigation__links">
            {siteConfig.primaryNavigation.map(
              (item) => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  end={item.end}
                  className={({ isActive }) =>
                    `site-navigation__link ${
                      isActive
                        ? "site-navigation__link--active"
                        : ""
                    }`
                  }
                >
                  {item.label}
                </NavLink>
              )
            )}
          </div>

          <div className="site-navigation__mobile-actions">
            {isAuthReady && isAuthenticated ? (
              <>
                {hasAdminAccess && (
                  <ButtonLink
                    to="/admin"
                    variant="secondary"
                    className="site-navigation__mobile-button"
                  >
                    <LayoutDashboard size={18} />
                    Yönetim Paneli
                  </ButtonLink>
                )}

                <ButtonLink
                  to="/hesabim"
                  variant="ghost"
                  className="site-navigation__mobile-button"
                >
                  <UserRound size={18} />
                  Hesabım
                </ButtonLink>
              </>
            ) : (
              <ButtonLink
                to={siteConfig.auth.loginPath}
                variant="ghost"
                className="site-navigation__mobile-button"
              >
                <UserRound size={18} />
                {siteConfig.auth.loginLabel}
              </ButtonLink>
            )}

            <ButtonLink
              to={siteConfig.donation.path}
              className="site-navigation__mobile-button"
            >
              {siteConfig.donation.label}
            </ButtonLink>
          </div>
        </nav>

        <div className="site-header__actions">
          {isAuthReady && isAuthenticated ? (
            <>
              {hasAdminAccess && (
                <NavLink
                  to="/admin"
                  className="site-header__admin"
                >
                  <LayoutDashboard size={18} />
                  <span>Yönetim</span>
                </NavLink>
              )}

              <NavLink
                to="/hesabim"
                className="site-header__login"
              >
                <UserRound size={18} />
                <span>Hesabım</span>
              </NavLink>
            </>
          ) : (
            <NavLink
              to={siteConfig.auth.loginPath}
              className="site-header__login"
            >
              <UserRound size={18} />
              <span>
                {siteConfig.auth.loginLabel}
              </span>
            </NavLink>
          )}

          <ButtonLink
            to={siteConfig.donation.path}
            size="small"
            className="site-header__donation"
          >
            {siteConfig.donation.label}
          </ButtonLink>

          <button
            type="button"
            className="site-header__menu-button"
            onClick={() => setIsMenuOpen(true)}
            aria-label="Menüyü aç"
            aria-expanded={isMenuOpen}
            aria-controls="main-navigation"
          >
            <Menu size={25} />
          </button>
        </div>
      </Container>

      {isMenuOpen && (
        <button
          type="button"
          className="site-navigation-overlay"
          aria-label="Menüyü kapat"
          onClick={() => setIsMenuOpen(false)}
        />
      )}
    </header>
  );
};

export default Header;