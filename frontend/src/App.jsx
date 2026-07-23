import { Route, Routes } from "react-router-dom";
import MainLayout from "./components/layout/MainLayout";
import HomePage from "./pages/HomePage";
import NotFoundPage from "./pages/NotFoundPage";
import PlaceholderPage from "./pages/PlaceholderPage";
import ProjectsPage from "./pages/ProjectsPage";
import ProjectDetailPage from "./pages/ProjectDetailPage";
import ContentPage from "./pages/ContentPage";
import ProtectedRoute from "./components/auth/ProtectedRoute";
import AccountPage from "./pages/AccountPage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
const App = () => {
  return (
    <Routes>
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
  element={<ContentPage fixedSlug="biz-kimiz" />}
/>
        <Route
  path="/neye-karsiyiz"
  element={<ContentPage fixedSlug="neye-karsiyiz" />}
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
  path="/hesabim"
  element={
    <ProtectedRoute>
      <AccountPage />
    </ProtectedRoute>
  }
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

        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
};

export default App;