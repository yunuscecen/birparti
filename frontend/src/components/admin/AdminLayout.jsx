import {
  FolderKanban,
  Gauge,
  LogOut,
  Menu,
  MessageSquareText,
   Flag,
  FileText,
  Newspaper,
  Settings,
  House,
  Users,
  Tags,
  X,
} from "lucide-react";
import { useState } from "react";
import {
  NavLink,
  Outlet,
  useNavigate,
} from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import Logo from "../layout/Logo";

const adminNavigation = [
  {
    label: "Genel Bakış",
    path: "/admin",
    icon: Gauge,
    end: true,
  },
   {
  label: "Ana Sayfa",
  path: "/admin/anasayfa",
  icon: House,
},
 {
    label: "Üye Yönetimi",
    path: "/admin/uyeler",
    icon: Users,
  },

  {
  label: "Sayfa Yönetimi",
  path: "/admin/sayfalar",
  icon: FileText,
},
 {
    label: "Projeler",
    path: "/admin/projeler",
    icon: FolderKanban,
  },
  {
    label: "Proje Kategorileri",
    path: "/admin/proje-kategorileri",
    icon: Tags,
  },
  {
  label: "Forum Konuları",
  path: "/admin/forum",
  icon: MessageSquareText,
},
{
  label: "Forum Kategorileri",
  path: "/admin/forum-kategorileri",
  icon: Tags,
},
{
  label: "Forum Bildirimleri",
  path: "/admin/forum-bildirimleri",
  icon: Flag,
},
  {
  label: "Blog Yazıları",
  path: "/admin/blog",
  icon: Newspaper,
},
{
  label: "Blog Kategorileri",
  path: "/admin/blog-kategorileri",
  icon: Tags,
},
{
  label: "Talepler",
  path: "/admin/talepler",
  icon: MessageSquareText,
},

 
 
 
];

const futureNavigation = [


 
  {
    label: "Site Ayarları",
    icon: Settings,
  },
];

const AdminLayout = () => {
  const [isSidebarOpen, setIsSidebarOpen] =
    useState(false);

  const navigate = useNavigate();

  const {
    user,
    logout,
  } = useAuth();

  const handleLogout = async () => {
    await logout();

    navigate("/", {
      replace: true,
    });
  };

  return (
    <div className="admin-shell">
      <aside
        className={`admin-sidebar ${
          isSidebarOpen
            ? "admin-sidebar--open"
            : ""
        }`}
      >
        <div className="admin-sidebar__top">
          <Logo />

          <button
            type="button"
            className="admin-sidebar__close"
            onClick={() => setIsSidebarOpen(false)}
            aria-label="Yönetim menüsünü kapat"
          >
            <X size={21} />
          </button>
        </div>

        <nav className="admin-navigation">
          <p className="admin-navigation__title">
            Yönetim
          </p>

          {adminNavigation.map((item) => {
            const Icon = item.icon;

            return (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.end}
                className={({ isActive }) =>
                  `admin-navigation__link ${
                    isActive
                      ? "admin-navigation__link--active"
                      : ""
                  }`
                }
                onClick={() =>
                  setIsSidebarOpen(false)
                }
              >
                <Icon size={19} />
                {item.label}
              </NavLink>
            );
          })}

          <p className="admin-navigation__title admin-navigation__title--secondary">
            Sonraki modüller
          </p>

          {futureNavigation.map((item) => {
            const Icon = item.icon;

            return (
              <span
                key={item.label}
                className="admin-navigation__link admin-navigation__link--disabled"
              >
                <Icon size={19} />
                {item.label}
                <small>Yakında</small>
              </span>
            );
          })}
        </nav>

        <div className="admin-sidebar__user">
          <div>
            <strong>{user.fullName}</strong>
            <span>{user.email}</span>
          </div>

          <button
            type="button"
            onClick={handleLogout}
            aria-label="Çıkış yap"
          >
            <LogOut size={18} />
          </button>
        </div>
      </aside>

      {isSidebarOpen && (
        <button
          type="button"
          className="admin-sidebar-overlay"
          onClick={() => setIsSidebarOpen(false)}
          aria-label="Yönetim menüsünü kapat"
        />
      )}

      <div className="admin-main">
        <header className="admin-topbar">
          <button
            type="button"
            className="admin-topbar__menu"
            onClick={() => setIsSidebarOpen(true)}
            aria-label="Yönetim menüsünü aç"
          >
            <Menu size={22} />
          </button>

          <div className="admin-topbar__identity">
            <span>Yönetim Paneli</span>
            <strong>{user.fullName}</strong>
          </div>

          <NavLink
            to="/"
            className="admin-topbar__website"
          >
            Siteyi Görüntüle
          </NavLink>
        </header>

        <main className="admin-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;