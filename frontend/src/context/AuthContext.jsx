import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  getCurrentUser,
  loginUser,
  logoutUser,
  refreshUserSession,
  registerUser,
} from "../services/authService";
import { clearAccessToken } from "../services/authTokenStore";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthReady, setIsAuthReady] =
    useState(false);

  useEffect(() => {
    let isMounted = true;

    const initializeSession = async () => {
      try {
        await refreshUserSession();

        const data = await getCurrentUser();

        if (isMounted) {
          setUser(data.user);
        }
      } catch {
        clearAccessToken();

        if (isMounted) {
          setUser(null);
        }
      } finally {
        if (isMounted) {
          setIsAuthReady(true);
        }
      }
    };

    initializeSession();

    return () => {
      isMounted = false;
    };
  }, []);

  const login = async (formData) => {
    const data = await loginUser(formData);

    setUser(data.user);

    return data.user;
  };

  const register = async (formData) => {
    const data = await registerUser(formData);

    setUser(data.user);

    return data.user;
  };

  const logout = async () => {
    await logoutUser();

    setUser(null);
  };

  const reloadUser = async () => {
    const data = await getCurrentUser();

    setUser(data.user);

    return data.user;
  };

  const value = useMemo(
    () => ({
      user,
      isAuthReady,
      isAuthenticated: Boolean(user),
      login,
      register,
      logout,
      reloadUser,
    }),
    [user, isAuthReady]
  );

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error(
      "useAuth yalnızca AuthProvider içinde kullanılabilir."
    );
  }

  return context;
};