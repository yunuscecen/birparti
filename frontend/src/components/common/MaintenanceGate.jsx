import {
  useLocation,
} from "react-router-dom";

import {
  useAuth,
} from "../../context/AuthContext";

import {
  useSiteSettings,
} from "../../context/SiteSettingsContext";

import MaintenancePage from "../../pages/MaintenancePage";

const adminRoles = [
  "admin",
  "superAdmin",
];

const MaintenanceGate = ({
  children,
}) => {
  const location =
    useLocation();

  const {
    user,
    isAuthReady,
  } = useAuth();

  const {
    settings,
    isLoading,
  } = useSiteSettings();

  const isAdmin =
    adminRoles.includes(
      user?.role
    );

 const isAllowedPath =
  location.pathname ===
    "/giris" ||
  location.pathname ===
    "/sifremi-unuttum" ||
  location.pathname.startsWith(
    "/sifre-sifirla/"
  ) ||
  location.pathname.startsWith(
    "/admin"
  );

  if (
    isLoading ||
    !isAuthReady
  ) {
    return (
      <main className="maintenance-loading">
        <span className="auth-spinner" />

        <p>
          Site hazırlanıyor...
        </p>
      </main>
    );
  }

  if (
    settings.features
      .maintenanceMode &&
    !isAdmin &&
    !isAllowedPath
  ) {
    return (
      <MaintenancePage
        message={
          settings
            .maintenanceMessage
        }
      />
    );
  }

  return children;
};

export default MaintenanceGate;