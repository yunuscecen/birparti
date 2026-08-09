import {
  CircleDollarSign,
  Edit3,
  ExternalLink,
  Plus,
  Search,
  X,
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

import {
  createAdminTransparencyRecord,
  getAdminTransparencyRecords,
  updateAdminTransparencyRecord,
} from "../../services/transparencyService";

const today = () => {
  return new Date()
    .toISOString()
    .slice(0, 10);
};

const createInitialForm = () => ({
  type: "income",
  category: "",
  title: "",
  description: "",
  amount: "",
  transactionDate: today(),
  documentUrl: "",
  status: "published",
});

const formatMoney = (
  value = 0
) => {
  return new Intl.NumberFormat(
    "tr-TR",
    {
      style: "currency",
      currency: "TRY",
    }
  ).format(value);
};

const formatDate = (date) => {
  if (!date) {
    return "—";
  }

  return new Intl.DateTimeFormat(
    "tr-TR",
    {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }
  ).format(new Date(date));
};

const statusLabels = {
  draft: "Taslak",
  published: "Yayında",
  archived: "Arşivlendi",
};

const AdminTransparencyPage =
  () => {
    const queryClient =
      useQueryClient();

    const [
      page,
      setPage,
    ] = useState(1);

    const [
      searchInput,
      setSearchInput,
    ] = useState("");

    const [
      search,
      setSearch,
    ] = useState("");

    const [
      typeFilter,
      setTypeFilter,
    ] = useState("");

    const [
      statusFilter,
      setStatusFilter,
    ] = useState("");

    const [
      formData,
      setFormData,
    ] = useState(
      createInitialForm
    );

    const [
      editingId,
      setEditingId,
    ] = useState("");

    const [
      feedback,
      setFeedback,
    ] = useState({
      type: "",
      message: "",
    });

    useEffect(() => {
      document.title =
        "Şeffaflık Yönetimi | Bir Parti";

      return () => {
        document.title =
          "Bir Parti";
      };
    }, []);

    const recordsQuery =
      useQuery({
        queryKey: [
          "admin-transparency",
          page,
          search,
          typeFilter,
          statusFilter,
        ],

        queryFn: () =>
          getAdminTransparencyRecords({
            page,
            search,
            type:
              typeFilter,
            status:
              statusFilter,
          }),
      });

    const resetForm = () => {
      setFormData(
        createInitialForm()
      );

      setEditingId("");
    };

    const saveMutation =
      useMutation({
        mutationFn: (
          payload
        ) => {
          if (editingId) {
            return updateAdminTransparencyRecord({
              recordId:
                editingId,

              formData:
                payload,
            });
          }

          return createAdminTransparencyRecord(
            payload
          );
        },

        onSuccess: async () => {
          await Promise.all([
            queryClient.invalidateQueries({
              queryKey: [
                "admin-transparency",
              ],
            }),

            queryClient.invalidateQueries({
              queryKey: [
                "public-transparency",
              ],
            }),
          ]);

          setFeedback({
            type: "success",

            message: editingId
              ? "Şeffaflık kaydı güncellendi."
              : "Şeffaflık kaydı oluşturuldu.",
          });

          resetForm();
        },

        onError: (error) => {
          setFeedback({
            type: "error",

            message:
              error?.response?.data
                ?.message ||
              error?.message ||
              "Kayıt işlemi tamamlanamadı.",
          });
        },
      });

    const handleChange = (
      event
    ) => {
      const {
        name,
        value,
      } = event.target;

      setFormData(
        (current) => ({
          ...current,
          [name]: value,
        })
      );
    };

    const handleSubmit = (
      event
    ) => {
      event.preventDefault();

      if (
        !formData.category.trim() ||
        !formData.title.trim()
      ) {
        setFeedback({
          type: "error",
          message:
            "Kategori ve başlık zorunludur.",
        });

        return;
      }

      const amount =
        Number(
          formData.amount
        );

      if (
        !Number.isFinite(
          amount
        ) ||
        amount <= 0
      ) {
        setFeedback({
          type: "error",
          message:
            "Geçerli bir tutar girilmelidir.",
        });

        return;
      }

      setFeedback({
        type: "",
        message: "",
      });

      saveMutation.mutate({
        ...formData,
        amount,
      });
    };

    const startEditing = (
      record
    ) => {
      setEditingId(
        record._id
      );

      setFormData({
        type:
          record.type,

        category:
          record.category,

        title:
          record.title,

        description:
          record.description ||
          "",

        amount:
          String(
            record.amount
          ),

        transactionDate:
          new Date(
            record.transactionDate
          )
            .toISOString()
            .slice(0, 10),

        documentUrl:
          record.documentUrl ||
          "",

        status:
          record.status,
      });

      setFeedback({
        type: "",
        message: "",
      });

      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    };

    const handleSearch = (
      event
    ) => {
      event.preventDefault();

      setSearch(
        searchInput.trim()
      );

      setPage(1);
    };

    const records =
      recordsQuery.data
        ?.records || [];

    const pagination =
      recordsQuery.data
        ?.pagination;

    return (
      <div className="admin-page">
        <div className="admin-page__heading">
          <div>
            <p>
              Finansal açıklık
            </p>

            <h1>
              Şeffaflık Yönetimi
            </h1>
          </div>

          <span>
            Yayımlanacak gelir ve
            harcama kayıtlarını buradan
            yönetin.
          </span>
        </div>

        {feedback.message && (
          <div
            className={`admin-transparency-feedback admin-transparency-feedback--${feedback.type}`}
          >
            {feedback.message}

            <button
              type="button"
              onClick={() =>
                setFeedback({
                  type: "",
                  message: "",
                })
              }
            >
              <X size={17} />
            </button>
          </div>
        )}

        <section className="admin-panel-card admin-transparency-form-card">
          <div className="admin-panel-card__heading">
            <div>
              <p>
                {editingId
                  ? "Kayıt düzenleme"
                  : "Yeni kayıt"}
              </p>

              <h2>
                {editingId
                  ? "Finans Kaydını Düzenle"
                  : "Gelir veya Harcama Ekle"}
              </h2>
            </div>

            {editingId && (
              <button
                type="button"
                className="admin-transparency-cancel"
                onClick={
                  resetForm
                }
              >
                <X size={16} />
                Düzenlemeyi İptal Et
              </button>
            )}
          </div>

          <form
            className="admin-transparency-form"
            onSubmit={
              handleSubmit
            }
          >
            <label>
              <span>Kayıt Türü</span>

              <select
                name="type"
                value={
                  formData.type
                }
                onChange={
                  handleChange
                }
              >
                <option value="income">
                  Gelir
                </option>

                <option value="expense">
                  Harcama
                </option>
              </select>
            </label>

            <label>
              <span>Kategori</span>

              <input
                type="text"
                name="category"
                value={
                  formData.category
                }
                onChange={
                  handleChange
                }
                placeholder="Örnek: Bireysel Bağışlar"
                maxLength={100}
              />
            </label>

            <label>
              <span>Başlık</span>

              <input
                type="text"
                name="title"
                value={
                  formData.title
                }
                onChange={
                  handleChange
                }
                placeholder="Kayıt başlığı"
                maxLength={180}
              />
            </label>

            <label>
              <span>Tutar (TL)</span>

              <input
                type="number"
                name="amount"
                value={
                  formData.amount
                }
                onChange={
                  handleChange
                }
                min="0.01"
                step="0.01"
                placeholder="0,00"
              />
            </label>

            <label>
              <span>İşlem Tarihi</span>

              <input
                type="date"
                name="transactionDate"
                value={
                  formData.transactionDate
                }
                onChange={
                  handleChange
                }
              />
            </label>

            <label>
              <span>Yayın Durumu</span>

              <select
                name="status"
                value={
                  formData.status
                }
                onChange={
                  handleChange
                }
              >
                <option value="published">
                  Yayında
                </option>

                <option value="draft">
                  Taslak
                </option>

                <option value="archived">
                  Arşivlendi
                </option>
              </select>
            </label>

            <label className="admin-transparency-form__wide">
              <span>
                Açıklama
              </span>

              <textarea
                name="description"
                value={
                  formData.description
                }
                onChange={
                  handleChange
                }
                rows={4}
                maxLength={2000}
                placeholder="Kaydın amacı ve ayrıntıları..."
              />
            </label>

            <label className="admin-transparency-form__wide">
              <span>
                Belge Bağlantısı
              </span>

              <input
                type="url"
                name="documentUrl"
                value={
                  formData.documentUrl
                }
                onChange={
                  handleChange
                }
                placeholder="https://..."
              />
            </label>

            <div className="admin-transparency-form__actions">
              <button
                type="submit"
                disabled={
                  saveMutation.isPending
                }
              >
                {editingId ? (
                  <Edit3
                    size={17}
                  />
                ) : (
                  <Plus
                    size={17}
                  />
                )}

                {saveMutation.isPending
                  ? "Kaydediliyor..."
                  : editingId
                    ? "Değişiklikleri Kaydet"
                    : "Kaydı Oluştur"}
              </button>
            </div>
          </form>
        </section>

        <section className="admin-panel-card">
          <div className="admin-panel-card__heading">
            <div>
              <p>Kayıtlar</p>
              <h2>
                Gelir ve Harcamalar
              </h2>
            </div>
          </div>

          <div className="admin-transparency-filters">
            <form
              onSubmit={
                handleSearch
              }
            >
              <Search size={18} />

              <input
                type="search"
                value={
                  searchInput
                }
                onChange={(
                  event
                ) =>
                  setSearchInput(
                    event.target
                      .value
                  )
                }
                placeholder="Başlık veya kategoride ara..."
              />

              <button type="submit">
                Ara
              </button>
            </form>

            <select
              value={
                typeFilter
              }
              onChange={(event) => {
                setTypeFilter(
                  event.target.value
                );

                setPage(1);
              }}
            >
              <option value="">
                Tüm Türler
              </option>

              <option value="income">
                Gelirler
              </option>

              <option value="expense">
                Harcamalar
              </option>
            </select>

            <select
              value={
                statusFilter
              }
              onChange={(event) => {
                setStatusFilter(
                  event.target.value
                );

                setPage(1);
              }}
            >
              <option value="">
                Tüm Durumlar
              </option>

              <option value="published">
                Yayında
              </option>

              <option value="draft">
                Taslak
              </option>

              <option value="archived">
                Arşivlendi
              </option>
            </select>
          </div>

          {recordsQuery.isLoading ? (
            <div className="admin-state">
              <span className="auth-spinner" />
              <p>
                Finans kayıtları
                yükleniyor...
              </p>
            </div>
          ) : recordsQuery.isError ? (
            <div className="admin-state">
              <h2>
                Kayıtlar alınamadı.
              </h2>

              <button
                type="button"
                onClick={() =>
                  recordsQuery.refetch()
                }
              >
                Tekrar Dene
              </button>
            </div>
          ) : (
            <div className="admin-table-wrapper">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Tür</th>
                    <th>Kayıt</th>
                    <th>Tutar</th>
                    <th>Tarih</th>
                    <th>Durum</th>
                    <th>Belge</th>
                    <th>İşlem</th>
                  </tr>
                </thead>

                <tbody>
                  {records.map(
                    (record) => (
                      <tr
                        key={
                          record._id
                        }
                      >
                        <td>
                          <span
                            className={`admin-transparency-type admin-transparency-type--${record.type}`}
                          >
                            {record.type ===
                            "income"
                              ? "Gelir"
                              : "Harcama"}
                          </span>
                        </td>

                        <td>
                          <strong>
                            {
                              record.title
                            }
                          </strong>

                          <span>
                            {
                              record.category
                            }
                          </span>
                        </td>

                        <td>
                          <strong>
                            {formatMoney(
                              record.amount
                            )}
                          </strong>
                        </td>

                        <td>
                          {formatDate(
                            record.transactionDate
                          )}
                        </td>

                        <td>
                          <span
                            className={`admin-status admin-status--${record.status}`}
                          >
                            {statusLabels[
                              record
                                .status
                            ]}
                          </span>
                        </td>

                        <td>
                          {record.documentUrl ? (
                            <a
                              href={
                                record.documentUrl
                              }
                              target="_blank"
                              rel="noreferrer"
                              className="admin-transparency-document"
                            >
                              Aç
                              <ExternalLink
                                size={14}
                              />
                            </a>
                          ) : (
                            "—"
                          )}
                        </td>

                        <td>
                          <button
                            type="button"
                            className="admin-transparency-edit"
                            onClick={() =>
                              startEditing(
                                record
                              )
                            }
                          >
                            <Edit3
                              size={16}
                            />
                            Düzenle
                          </button>
                        </td>
                      </tr>
                    )
                  )}

                  {records.length ===
                    0 && (
                    <tr>
                      <td colSpan="7">
                        Henüz finans kaydı
                        bulunmuyor.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}

          {pagination &&
            pagination.totalPages >
              1 && (
              <div className="admin-transparency-pagination">
                <button
                  type="button"
                  disabled={
                    pagination.page <=
                    1
                  }
                  onClick={() =>
                    setPage(
                      pagination.page -
                        1
                    )
                  }
                >
                  Önceki
                </button>

                <strong>
                  {pagination.page} /{" "}
                  {
                    pagination.totalPages
                  }
                </strong>

                <button
                  type="button"
                  disabled={
                    pagination.page >=
                    pagination.totalPages
                  }
                  onClick={() =>
                    setPage(
                      pagination.page +
                        1
                    )
                  }
                >
                  Sonraki
                </button>
              </div>
            )}
        </section>
      </div>
    );
  };

export default AdminTransparencyPage;