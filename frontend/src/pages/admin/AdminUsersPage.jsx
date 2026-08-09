import {
  ChevronLeft,
  ChevronRight,
  Search,
  ShieldCheck,
  UserRoundCog,
} from "lucide-react";
import {
  useEffect,
  useState,
} from "react";
import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { useAuth } from "../../context/AuthContext";
import {
  getAdminUsers,
  updateAdminUserRole,
  updateAdminUserStatus,
} from "../../services/adminService";

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

const AdminUsersPage = () => {
  const [page, setPage] = useState(1);
  const [searchInput, setSearchInput] =
    useState("");
  const [debouncedSearch, setDebouncedSearch] =
    useState("");
  const [role, setRole] = useState("");
  const [status, setStatus] = useState("");
  const [feedback, setFeedback] =
    useState("");

  const queryClient = useQueryClient();
  const { user: currentUser } = useAuth();

  useEffect(() => {
    document.title =
      "Üye Yönetimi | Bir Parti";

    return () => {
      document.title = "Bir Parti";
    };
  }, []);

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      setDebouncedSearch(searchInput.trim());
      setPage(1);
    }, 350);

    return () => {
      window.clearTimeout(timeout);
    };
  }, [searchInput]);

  const usersQuery = useQuery({
    queryKey: [
      "admin-users",
      page,
      debouncedSearch,
      role,
      status,
    ],

    queryFn: () =>
      getAdminUsers({
        page,
        search: debouncedSearch,
        role,
        status,
      }),
  });

  const refreshUsers = async () => {
    await Promise.all([
      queryClient.invalidateQueries({
        queryKey: ["admin-users"],
      }),

      queryClient.invalidateQueries({
        queryKey: ["admin-dashboard"],
      }),
    ]);
  };

  const statusMutation = useMutation({
    mutationFn: updateAdminUserStatus,

    onSuccess: async () => {
      setFeedback(
        "Kullanıcı durumu güncellendi."
      );

      await refreshUsers();
    },

    onError: (error) => {
      setFeedback(
        error.message ||
          "Kullanıcı durumu güncellenemedi."
      );
    },
  });



  const roleMutation = useMutation({
    mutationFn: updateAdminUserRole,

    onSuccess: async () => {
      setFeedback(
        "Kullanıcı rolü güncellendi."
      );

      await refreshUsers();
    },

    onError: (error) => {
      setFeedback(
        error.message ||
          "Kullanıcı rolü güncellenemedi."
      );
    },
  });

  const data = usersQuery.data;

  const users = data?.users || [];
  const pagination = data?.pagination;

  const isMutating =
  statusMutation.isPending ||
  roleMutation.isPending;

  return (
    <div className="admin-page">
      <div className="admin-page__heading">
        <div>
          <p>Üye yönetimi</p>
          <h1>Kullanıcılar</h1>
        </div>

        <span>
  Üye durumlarını ve kullanıcı
  rollerini yönetin.
</span>
      </div>

      {feedback && (
        <div className="admin-feedback">
          {feedback}

          <button
            type="button"
            onClick={() => setFeedback("")}
          >
            Kapat
          </button>
        </div>
      )}

      <section className="admin-panel-card">
        <div className="admin-user-filters">
          <div className="admin-search">
            <Search size={19} />

            <input
              type="search"
              value={searchInput}
              onChange={(event) =>
                setSearchInput(event.target.value)
              }
              placeholder="Ad, soyad veya e-posta ara..."
            />
          </div>

          <select
            value={role}
            onChange={(event) => {
              setRole(event.target.value);
              setPage(1);
            }}
          >
            <option value="">Tüm roller</option>
            <option value="member">Üye</option>
            <option value="moderator">
              Moderatör
            </option>
            <option value="contentEditor">
              İçerik Editörü
            </option>
            <option value="financeManager">
              Bağış Yöneticisi
            </option>
            <option value="admin">
              Yönetici
            </option>
            <option value="superAdmin">
              Süper Yönetici
            </option>
          </select>

          <select
            value={status}
            onChange={(event) => {
              setStatus(event.target.value);
              setPage(1);
            }}
          >
            <option value="">Tüm durumlar</option>
            <option value="active">Aktif</option>
            <option value="suspended">
              Askıya Alındı
            </option>
            <option value="pending">
              Bekliyor
            </option>
          </select>
        </div>

        {usersQuery.isLoading && (
          <div className="admin-state">
            <span className="auth-spinner" />
            <p>Kullanıcılar yükleniyor...</p>
          </div>
        )}

        {usersQuery.isError && (
          <div className="admin-state">
            <h2>Kullanıcılar alınamadı.</h2>

            <button
              type="button"
              onClick={() => usersQuery.refetch()}
            >
              Tekrar Dene
            </button>
          </div>
        )}

        {!usersQuery.isLoading &&
          !usersQuery.isError && (
            <div className="admin-table-wrapper">
              <table className="admin-table admin-users-table">
                <thead>
                  <tr>
                  <th>Üye</th>
<th>Rol</th>
<th>Durum</th>
<th>İşlemler</th>
                  </tr>
                </thead>

                <tbody>
                  {users.map((managedUser) => {
                    const canCreateTopic =
                      managedUser.permissions.includes(
                        "forum:create-topic"
                      );

                    const isCurrentUser =
                      managedUser.id ===
                      currentUser.id;

                    const isProtectedAdmin =
                      currentUser.role !==
                        "superAdmin" &&
                      [
                        "admin",
                        "superAdmin",
                      ].includes(managedUser.role);

                    const isActionDisabled =
                      isMutating ||
                      isCurrentUser ||
                      isProtectedAdmin;

                    return (
                      <tr key={managedUser.id}>
                        <td>
                          <strong>
                            {managedUser.fullName}
                          </strong>

                          <span>
                            {managedUser.email}
                          </span>
                        </td>

                        <td>
                          {currentUser.role ===
                            "superAdmin" &&
                          !isCurrentUser ? (
                            <select
                              value={
                                managedUser.role
                              }
                              disabled={isMutating}
                              onChange={(event) =>
                                roleMutation.mutate({
                                  userId:
                                    managedUser.id,
                                  role:
                                    event.target
                                      .value,
                                })
                              }
                            >
                              {Object.entries(
                                roleLabels
                              ).map(
                                ([
                                  roleValue,
                                  label,
                                ]) => (
                                  <option
                                    key={roleValue}
                                    value={roleValue}
                                  >
                                    {label}
                                  </option>
                                )
                              )}
                            </select>
                          ) : (
                            roleLabels[
                              managedUser.role
                            ] ||
                            managedUser.role
                          )}
                        </td>

                        <td>
                          <span
                            className={`admin-status admin-status--${managedUser.status}`}
                          >
                            {
                              statusLabels[
                                managedUser.status
                              ]
                            }
                          </span>
                        </td>

         

                        <td>
                          <div className="admin-user-actions">
                            {managedUser.status ===
                            "active" ? (
                              <button
                                type="button"
                                disabled={
                                  isActionDisabled
                                }
                                onClick={() =>
                                  statusMutation.mutate({
                                    userId:
                                      managedUser.id,
                                    status:
                                      "suspended",
                                  })
                                }
                              >
                                <UserRoundCog
                                  size={16}
                                />
                                Askıya Al
                              </button>
                            ) : (
                              <button
                                type="button"
                                disabled={
                                  isActionDisabled
                                }
                                onClick={() =>
                                  statusMutation.mutate({
                                    userId:
                                      managedUser.id,
                                    status:
                                      "active",
                                  })
                                }
                              >
                                <ShieldCheck
                                  size={16}
                                />
                                Aktifleştir
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}

                  {users.length === 0 && (
                    <tr>
                      <td colSpan="4">
                        Arama kriterlerine uygun
                        kullanıcı bulunamadı.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}

        {pagination && (
          <div className="admin-pagination">
            <span>
              Toplam {pagination.totalUsers} kullanıcı
            </span>

            <div>
              <button
                type="button"
                disabled={
                  !pagination.hasPreviousPage
                }
                onClick={() =>
                  setPage((current) =>
                    Math.max(current - 1, 1)
                  )
                }
              >
                <ChevronLeft size={18} />
              </button>

              <strong>
                {pagination.page} /{" "}
                {pagination.totalPages}
              </strong>

              <button
                type="button"
                disabled={
                  !pagination.hasNextPage
                }
                onClick={() =>
                  setPage((current) =>
                    current + 1
                  )
                }
              >
                <ChevronRight size={18} />
              </button>
            </div>
          </div>
        )}
      </section>
    </div>
  );
};

export default AdminUsersPage;