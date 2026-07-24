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
import AdminHomePage from "./pages/admin/AdminHomePage";
import BlogPage from "./pages/BlogPage";
import BlogDetailPage from "./pages/BlogDetailPage";
import AdminDashboardPage from "./pages/admin/AdminDashboardPage";
import AdminUsersPage from "./pages/admin/AdminUsersPage";
import AdminBlogCategoriesPage from "./pages/admin/AdminBlogCategoriesPage";
import AdminBlogPostsPage from "./pages/admin/AdminBlogPostsPage";
import AdminBlogPostCreatePage from "./pages/admin/AdminBlogPostCreatePage";
import AdminBlogPostEditPage from "./pages/admin/AdminBlogPostEditPage";
import ForumPage from "./pages/ForumPage";
import ForumTopicDetailPage from "./pages/ForumTopicDetailPage";
import ForumTopicCreatePage from "./pages/ForumTopicCreatePage";
import AdminForumCategoriesPage from "./pages/admin/AdminForumCategoriesPage";
import AdminForumTopicsPage from "./pages/admin/AdminForumTopicsPage";
import AdminForumTopicModerationPage from "./pages/admin/AdminForumTopicModerationPage";

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
  element={<BlogPage />}
/>

<Route
  path="/blog/:slug"
  element={<BlogDetailPage />}
/>

 <Route
  path="/forum"
  element={<ForumPage />}
/>

<Route
  path="/forum/yeni-konu"
  element={
    <ProtectedRoute>
      <ForumTopicCreatePage />
    </ProtectedRoute>
  }
/>

<Route
  path="/forum/:slug"
  element={<ForumTopicDetailPage />}
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
<Route
  path="anasayfa"
  element={<AdminHomePage />}
/>
<Route
  path="blog"
  element={<AdminBlogPostsPage />}
/>

<Route
  path="blog/yeni"
  element={<AdminBlogPostCreatePage />}
/>

<Route
  path="blog/:postId/duzenle"
  element={<AdminBlogPostEditPage />}
/>

<Route
  path="blog-kategorileri"
  element={<AdminBlogCategoriesPage />}
/>
<Route
  path="forum"
  element={<AdminForumTopicsPage />}
/>

<Route
  path="forum-kategorileri"
  element={<AdminForumCategoriesPage />}
/>
<Route
  path="forum/:topicId/moderasyon"
  element={
    <AdminForumTopicModerationPage />
  }
/>
      </Route>
    </Routes>
  );
};

export default App;