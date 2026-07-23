import {
  Navigate,
  useLocation,
} from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

const allowedAdminRoles = [
  "admin",
  "superAdmin",
];

const AdminRoute = ({ children }) => {
  const location = useLocation();

  const {
    user,
    isAuthenticated,
    isAuthReady,
  } = useAuth();

  if (!isAuthReady) {
    return (
      <section className="auth-page-state">
        <span className="auth-spinner" />
        <p>Yönetici oturumu kontrol ediliyor...</p>
      </section>
    );
  }

  if (!isAuthenticated) {
    return (
      <Navigate
        to="/giris"
        replace
        state={{
          from: location,
        }}
      />
    );
  }

  if (!allowedAdminRoles.includes(user.role)) {
    return (
      <Navigate
        to="/hesabim"
        replace
      />
    );
  }

  return children;
};

export default AdminRoute;