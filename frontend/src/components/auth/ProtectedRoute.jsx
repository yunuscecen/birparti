import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

const ProtectedRoute = ({ children }) => {
  const location = useLocation();

  const {
    isAuthenticated,
    isAuthReady,
  } = useAuth();

  if (!isAuthReady) {
    return (
      <section className="auth-page-state">
        <span className="auth-spinner" />
        <p>Oturum kontrol ediliyor...</p>
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

  return children;
};

export default ProtectedRoute;