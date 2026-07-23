import {
  FileText,
  Pencil,
} from "lucide-react";
import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";

import { getAdminPages } from "../../services/adminPageService";

const statusLabels = {
  draft: "Taslak",
  published: "Yayında",
  archived: "Arşivlendi",
};

const pageLabels = {
  "biz-kimiz": "Biz Kimiz?",
  "neye-karsiyiz": "Neye Karşıyız?",
};

const formatDate = (date) => {
  if (!date) {
    return "—";
  }

  return new Intl.DateTimeFormat("tr-TR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(date));
};

const AdminPagesPage = () => {
  const pagesQuery = useQuery({
    queryKey: ["admin-pages"],
    queryFn: getAdminPages,
  });

  useEffect(() => {
    document.title =
      "Sayfa Yönetimi | Bir Parti";

    return () => {
      document.title = "Bir Parti";
    };
  }, []);

  if (pagesQuery.isLoading) {
    return (
      <div className="admin-state">
        <span className="auth-spinner" />
        <p>Sayfalar yükleniyor...</p>
      </div>
    );
  }

  if (pagesQuery.isError) {
    return (
      <div className="admin-state">
        <h1>Sayfalar alınamadı.</h1>

        <p>
          Backend bağlantısını ve yönetici
          oturumunu kontrol edin.
        </p>

        <button
          type="button"
          onClick={() =>
            pagesQuery.refetch()
          }
        >
          Tekrar Dene
        </button>
      </div>
    );
  }

  const pages =
    pagesQuery.data?.pages || [];

  return (
    <div className="admin-page">
      <div className="admin-page__heading">
        <div>
          <p>İçerik yönetimi</p>
          <h1>Sayfalar</h1>
        </div>

        <span>
          Sabit sayfaların metinlerini,
          kartlarını ve SEO alanlarını
          düzenleyin.
        </span>
      </div>

      <div className="admin-page-card-grid">
        {pages.map((page) => (
          <article
            className="admin-managed-page-card"
            key={page.slug}
          >
            <div className="admin-managed-page-card__icon">
              <FileText size={24} />
            </div>

            <div className="admin-managed-page-card__content">
              <div className="admin-managed-page-card__top">
                <div>
                  <span>
                    /{page.slug}
                  </span>

                  <h2>
                    {pageLabels[page.slug] ||
                      page.title}
                  </h2>
                </div>

                <span
                  className={`admin-status admin-status--${page.status}`}
                >
                  {statusLabels[page.status] ||
                    page.status}
                </span>
              </div>

              <p>
                {page.description ||
                  "Bu sayfa için açıklama girilmemiş."}
              </p>

              <div className="admin-managed-page-card__footer">
                <span>
                  Son güncelleme:{" "}
                  {formatDate(page.updatedAt)}
                </span>

                <Link
                  to={`/admin/sayfalar/${page.slug}/duzenle`}
                  className="admin-secondary-button"
                >
                  <Pencil size={16} />
                  Düzenle
                </Link>
              </div>
            </div>
          </article>
        ))}

        {pages.length === 0 && (
          <div className="admin-empty-warning">
            <h2>Yönetilebilir sayfa bulunamadı.</h2>

            <p>
              Sayfa içeriklerini oluşturmak için
              backend sayfa seed komutunu
              çalıştırın.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminPagesPage;