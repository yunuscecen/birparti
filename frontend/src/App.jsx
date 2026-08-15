import {
  Navigate,
  Route,
  Routes,
} from "react-router-dom";

import AdminLayout from "./components/admin/AdminLayout";
import AdminRoute from "./components/auth/AdminRoute";
import ProtectedRoute from "./components/auth/ProtectedRoute";
import MainLayout from "./components/layout/MainLayout";

import AccountPage from "./pages/AccountPage";
import MyContactRequestsPage from "./pages/MyContactRequestsPage";
import ContentPage from "./pages/ContentPage";
import HomePage from "./pages/Homepage";
import LoginPage from "./pages/LoginPage";
import NotFoundPage from "./pages/NotFoundPage";
import ProjectDetailPage from "./pages/ProjectDetailPage";
import DonationPage from "./pages/DonationPage";
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
import AdminTransparencyPage from "./pages/admin/AdminTransparencyPage";
import AdminForumTopicsPage from "./pages/admin/AdminForumTopicsPage";
import AdminForumTopicModerationPage from "./pages/admin/AdminForumTopicModerationPage";
import ForgotPasswordPage from "./pages/ForgotPasswordPage";
import ResetPasswordPage from "./pages/ResetPasswordPage";
import FeatureGate from "./components/common/FeatureGate";
import MyForumActivityPage from "./pages/MyForumActivityPage";
import AdminForumReportsPage from "./pages/admin/AdminForumReportsPage";
import MyForumNotificationsPage from "./pages/MyForumNotificationsPage";
import MyForumReportsPage from "./pages/MyForumReportsPage";
import MyForumReplyEditPage from "./pages/MyForumReplyEditPage";
import MyForumTopicEditPage from "./pages/MyForumTopicEditPage";
import AdminContactRequestsPage from "./pages/admin/AdminContactRequestsPage";
import AdminContactRequestDetailPage from "./pages/admin/AdminContactRequestDetailPage";
import AdminSiteSettingsPage from "./pages/admin/AdminSiteSettingsPage";
import TransparencyPage from "./pages/TransparencyPage";
import EmailVerificationPage from "./pages/EmailVerificationPage";
import EmailPreferencePage from "./pages/EmailPreferencePage";
import AdminBulkEmailsPage from "./pages/admin/AdminBulkEmailsPage";
import ContactPage from "./pages/ContactPage";

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
    <Navigate
      to="/manifesto"
      replace
    />
  }
/>

<Route
  path="/manifesto"
  element={
    <ContentPage fixedSlug="manifesto" />
  }
/>

<Route
  path="/yol-haritasi"
  element={
    <ContentPage fixedSlug="yol-haritasi" />
  }
/>

<Route
  path="/seffaflik"
  element={<TransparencyPage />}
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
  element={
    <FeatureGate
      feature="forumEnabled"
      title="Topluluk Şu Anda Kapalı"
      description="Topluluk geçici olarak kullanıma kapatılmıştır."
    >
      <ForumPage />
    </FeatureGate>
  }
/>

<Route
  path="/forum/yeni-konu"
  element={
    <FeatureGate
      feature="forumEnabled"
      title="Topluluk Şu Anda Kapalı"
      description="Yeni Topluluk konusu oluşturma işlemleri şu anda kapalıdır."
    >
      <ProtectedRoute>
        <ForumTopicCreatePage />
      </ProtectedRoute>
    </FeatureGate>
  }
/>





<Route
  path="/forum/:slug"
  element={
    <FeatureGate
      feature="forumEnabled"
      title="Topluluk Şu Anda Kapalı"
      description="Topluluk içerikleri şu anda görüntülenemiyor."
    >
      <ForumTopicDetailPage />
    </FeatureGate>
  }
/>

       <Route
  path="/iletisim"
  element={<ContactPage />}
/>

     <Route
  path="/bagis"
  element={
    <DonationPage />
  }
/>

        <Route
          path="/giris"
          element={<LoginPage />}
        />

        <Route
  path="/kayit"
  element={
    <FeatureGate
      feature="registrationsEnabled"
      title="Yeni Üyelikler Kapalı"
      description="Yeni üyelik oluşturma işlemleri şu anda kullanıma kapalıdır."
    >
      <RegisterPage />
    </FeatureGate>
  }
/>

     <Route
  path="/sifremi-unuttum"
  element={
    <ForgotPasswordPage />
  }
/>

<Route
  path="/sifre-sifirla/:token"
  element={
    <ResetPasswordPage />
  }
/>

<Route
  path="/e-posta-dogrula/:token"
  element={
    <EmailVerificationPage />
  }
/>
<Route
  path="/e-posta-tercihi/:token"
  element={
    <EmailPreferencePage />
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
  path="/hesabim/taleplerim"
  element={
    <ProtectedRoute>
      <MyContactRequestsPage />
    </ProtectedRoute>
  }
/>
<Route
  path="/hesabim/forum-konusu/:topicId/duzenle"
  element={
    <FeatureGate
      feature="forumEnabled"
      title="Topluluk Şu Anda Kapalı"
      description="Forum içeriklerini düzenleme işlemleri şu anda kullanılamıyor."
    >
      <ProtectedRoute>
        <MyForumTopicEditPage />
      </ProtectedRoute>
    </FeatureGate>
  }
/>

<Route
  path="/hesabim/forum-yaniti/:replyId/duzenle"
  element={
    <FeatureGate
      feature="forumEnabled"
      title="Topluluk Şu Anda Kapalı"
      description="Forum yanıtlarını düzenleme işlemleri şu anda kullanılamıyor."
    >
      <ProtectedRoute>
        <MyForumReplyEditPage />
      </ProtectedRoute>
    </FeatureGate>
  }
/>

<Route
  path="/hesabim/bildirdigim-icerikler"
  element={
    <FeatureGate
      feature="forumEnabled"
      title="Topluluk Şu Anda Kapalı"
      description="Forum bildirim kayıtları şu anda kullanılamıyor."
    >
      <ProtectedRoute>
        <MyForumReportsPage />
      </ProtectedRoute>
    </FeatureGate>
  }
/>

<Route
  path="/hesabim/forum-hareketlerim"
  element={
    <FeatureGate
      feature="forumEnabled"
      title="Topluluk Şu Anda Kapalı"
      description="Forum hareketleri şu anda görüntülenemiyor."
    >
      <ProtectedRoute>
        <MyForumActivityPage />
      </ProtectedRoute>
    </FeatureGate>
  }
/>

<Route
  path="/hesabim/forum-bildirimlerim"
  element={
    <FeatureGate
      feature="forumEnabled"
      title="Topluluk Şu Anda Kapalı"
      description="Forum bildirimleri şu anda görüntülenemiyor."
    >
      <ProtectedRoute>
        <MyForumNotificationsPage />
      </ProtectedRoute>
    </FeatureGate>
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
  path="seffaflik"
  element={<AdminTransparencyPage />}
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
  path="forum-bildirimleri"
  element={
    <AdminForumReportsPage />
  }
/>
<Route
  path="talepler"
  element={
    <AdminContactRequestsPage />
  }
/>
<Route
  path="talepler/:requestId"
  element={
    <AdminContactRequestDetailPage />
  }
/>
<Route
  path="forum/:topicId/moderasyon"
  element={
    <AdminForumTopicModerationPage />
  }
/>
<Route
  path="toplu-e-posta"
  element={
    <AdminBulkEmailsPage />
  }
/>
<Route
  path="site-ayarlari"
  element={
    <AdminSiteSettingsPage />
  }
/>

      </Route>
    </Routes>
  );
};

export default App;