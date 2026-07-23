import { Route, Routes } from "react-router-dom";

import AdminLayout from "./components/admin/AdminLayout";
import AdminRoute from "./components/auth/AdminRoute";
import ProtectedRoute from "./components/auth/ProtectedRoute";
import MainLayout from "./components/layout/MainLayout";

import AccountPage from "./pages/AccountPage";
import ContentPage from "./pages/ContentPage";
import HomePage from "./pages/HomePage";
import LoginPage from "./pages/LoginPage";
import NotFoundPage from "./pages/NotFoundPage";
import PlaceholderPage from "./pages/PlaceholderPage";
import ProjectDetailPage from "./pages/ProjectDetailPage";
import ProjectsPage from "./pages/ProjectsPage";
import RegisterPage from "./pages/RegisterPage";
import AdminProjectCategoriesPage from "./pages/admin/AdminProjectCategoriesPage";
import AdminProjectsPage from "./pages/admin/AdminProjectsPage";
import AdminProjectCreatePage from "./pages/admin/AdminProjectCreatePage";
import AdminProjectEditPage from "./pages/admin/AdminProjectEditPage";
import AdminPagesPage from "./pages/admin/AdminPagesPage";
import AdminPageEditPage from "./pages/admin/AdminPageEditPage";

import AdminDashboardPage from "./pages/admin/AdminDashboardPage";
import AdminUsersPage from "./pages/admin/AdminUsersPage";

const App = () => {
  return (
    <Routes>
      {/* Herkese açık sayfalar ve üye alanı */}
      <Route element={<MainLayout />}>
        <Route index element={<HomePage />} />

        <Route
          path="/projelerimiz"
          element={<ProjectsPage />}
        />

        <Route
          path="/projelerimiz/:slug"
          element={<ProjectDetailPage />}
        />

        <Route
          path="/biz-kimiz"
          element={
            <ContentPage fixedSlug="biz-kimiz" />
          }
        />

        <Route
          path="/neye-karsiyiz"
          element={
            <ContentPage fixedSlug="neye-karsiyiz" />
          }
        />

        <Route
          path="/blog"
          element={
            <PlaceholderPage
              eyebrow="Görüşler ve haberler"
              title="Blog"
              description="Blog yazıları, kategoriler, etiketler ve SEO alanları admin panelinden yönetilecek."
            />
          }
        />

        <Route
          path="/forum"
          element={
            <PlaceholderPage
              eyebrow="Birlikte konuşalım"
              title="Forum"
              description="Forum konuları herkes tarafından listelenebilecek; detay ve yorum işlemleri üyelik kurallarına bağlı olacak."
            />
          }
        />

        <Route
          path="/iletisim"
          element={
            <PlaceholderPage
              eyebrow="Görüşünüz değerli"
              title="İletişim ve Talepler"
              description="Kullanıcılar bu alandan öneri, görüş, şikâyet veya taleplerini iletebilecek."
            />
          }
        />

        <Route
          path="/bagis"
          element={
            <PlaceholderPage
              eyebrow="Bir Damla Ol"
              title="Birlikte çoğalalım"
              description="Halk bağışı ve milletvekili bağışı seçenekleri bu sayfa altında bulunacak."
            />
          }
        />

        <Route
          path="/giris"
          element={<LoginPage />}
        />

        <Route
          path="/kayit"
          element={<RegisterPage />}
        />

        <Route
          path="/sifremi-unuttum"
          element={
            <PlaceholderPage
              eyebrow="Hesap güvenliği"
              title="Şifremi Unuttum"
              description="Şifre sıfırlama bağlantısı bir sonraki aşamada e-posta servisine bağlanacak."
            />
          }
        />

        <Route
          path="/hesabim"
          element={
            <ProtectedRoute>
              <AccountPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="*"
          element={<NotFoundPage />}
        />
      </Route>

      {/* Admin paneli MainLayout dışında kalmalı */}
      <Route
        path="/admin"
        element={
          <AdminRoute>
            <AdminLayout />
          </AdminRoute>
        }
      >
        <Route
  path="projeler"
  element={<AdminProjectsPage />}
/>

<Route
  path="proje-kategorileri"
  element={<AdminProjectCategoriesPage />}
/>
        <Route
          index
          element={<AdminDashboardPage />}
        />

        <Route
          path="uyeler"
          element={<AdminUsersPage />}
        />
        <Route
  path="projeler/yeni"
  element={<AdminProjectCreatePage />}
/>

<Route
  path="projeler/:projectId/duzenle"
  element={<AdminProjectEditPage />}
/>
<Route
  path="sayfalar"
  element={<AdminPagesPage />}
/>

<Route
  path="sayfalar/:slug/duzenle"
  element={<AdminPageEditPage />}
/>
      </Route>
    </Routes>
  );
};

export default App;