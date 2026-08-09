import {
  CheckCircle2,
  MessageSquarePlus,
  ShieldAlert,
  UserCheck,
  Users,
} from "lucide-react";
import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { getAdminDashboard } from "../../services/adminService";

const roleLabels = {
  member: "Üye",
  moderator: "Moderatör",
  contentEditor: "İçerik Editörü",
  financeManager: "Bağış Yöneticisi",
  admin: "Yönetici",
  superAdmin: "Süper Yönetici",
};

const statusLabels = {
  active: "Aktif",
  suspended: "Askıya Alındı",
  pending: "Bekliyor",
};

const formatDate = (date) => {
  if (!date) {
    return "—";
  }

  return new Intl.DateTimeFormat("tr-TR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(date));
};

const AdminDashboardPage = () => {
  const dashboardQuery = useQuery({
    queryKey: ["admin-dashboard"],
    queryFn: getAdminDashboard,
  });

  useEffect(() => {
    document.title =
      "Yönetim Paneli | Bir Parti";

    return () => {
      document.title = "Bir Parti";
    };
  }, []);

  if (dashboardQuery.isLoading) {
    return (
      <div className="admin-state">
        <span className="auth-spinner" />
        <p>Yönetim paneli yükleniyor...</p>
      </div>
    );
  }

  if (dashboardQuery.isError) {
    return (
      <div className="admin-state">
        <h1>Panel verileri alınamadı.</h1>

        <p>
          Backend bağlantısını ve yönetici
          yetkilerini kontrol edin.
        </p>

        <button
          type="button"
          onClick={() =>
            dashboardQuery.refetch()
          }
        >
          Tekrar Dene
        </button>
      </div>
    );
  }

  const {
    statistics,
    recentUsers,
  } = dashboardQuery.data;

  const cards = [
    {
      label: "Toplam Üye",
      value: statistics.totalUsers,
      icon: Users,
    },
    {
      label: "Aktif Üye",
      value: statistics.activeUsers,
      icon: UserCheck,
    },
    {
      label: "Askıya Alınan",
      value: statistics.suspendedUsers,
      icon: ShieldAlert,
    },
    {
      label: "Doğrulanan E-posta",
      value: statistics.verifiedUsers,
      icon: CheckCircle2,
    },
   {
  label:
    "Onay Bekleyen Konular",

  value:
    statistics.pendingForumTopicCount ||
    0,

  icon: MessageSquarePlus,
},
  ];

  return (
    <div className="admin-page">
      <div className="admin-page__heading">
        <div>
          <p>Genel bakış</p>
          <h1>Yönetim Paneli</h1>
        </div>

        <span>
          Platformun güncel üye ve yetki
          durumunu buradan takip edebilirsiniz.
        </span>
      </div>

      <div className="admin-stat-grid">
        {cards.map((card) => {
          const Icon = card.icon;

          return (
            <article
              className="admin-stat-card"
              key={card.label}
            >
              <span className="admin-stat-card__icon">
                <Icon size={21} />
              </span>

              <div>
                <p>{card.label}</p>
                <strong>{card.value}</strong>
              </div>
            </article>
          );
        })}
      </div>

      <section className="admin-panel-card">
        <div className="admin-panel-card__heading">
          <div>
            <p>Son kayıtlar</p>
            <h2>Yeni Üyeler</h2>
          </div>
        </div>

        <div className="admin-table-wrapper">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Üye</th>
                <th>Rol</th>
                <th>Durum</th>
                <th>Kayıt Tarihi</th>
              </tr>
            </thead>

            <tbody>
              {recentUsers.map((user) => (
                <tr key={user.id}>
                  <td>
                    <strong>{user.fullName}</strong>
                    <span>{user.email}</span>
                  </td>

                <td>
  {roleLabels[user.role] || user.role}
</td>

                  <td>
                    <span
                      className={`admin-status admin-status--${user.status}`}
                    >
                     {statusLabels[user.status] || user.status}
                    </span>
                  </td>

                  <td>{formatDate(user.createdAt)}</td>
                </tr>
              ))}

              {recentUsers.length === 0 && (
                <tr>
                  <td colSpan="4">
                    Henüz kayıtlı kullanıcı bulunmuyor.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
};

export default AdminDashboardPage;