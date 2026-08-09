import {
  ArrowDownRight,
  ArrowUpRight,
  CalendarDays,
  ExternalLink,
  Landmark,
  ReceiptText,
  Scale,
} from "lucide-react";

import {
  useEffect,
} from "react";

import {
  useQuery,
} from "@tanstack/react-query";

import {
  useSearchParams,
} from "react-router-dom";

import Container from "../components/common/Container";

import {
  getPublicTransparency,
} from "../services/transparencyService";

const formatMoney = (
  value = 0
) => {
  return new Intl.NumberFormat(
    "tr-TR",
    {
      style: "currency",
      currency: "TRY",
      minimumFractionDigits: 2,
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
      month: "long",
      year: "numeric",
    }
  ).format(new Date(date));
};

const TransparencyPage = () => {
  const [
    searchParams,
    setSearchParams,
  ] = useSearchParams();

  const currentYear =
    new Date().getFullYear();

  const requestedYear =
    Number(
      searchParams.get("yil")
    );

  const year =
    Number.isInteger(
      requestedYear
    ) &&
    requestedYear >= 2000
      ? requestedYear
      : currentYear;

  useEffect(() => {
    document.title =
      "Şeffaflık | Bir Parti";

    return () => {
      document.title =
        "Bir Parti";
    };
  }, []);

  const transparencyQuery =
    useQuery({
      queryKey: [
        "public-transparency",
        year,
      ],

      queryFn: () =>
        getPublicTransparency({
          year,
        }),

      retry: false,
    });

  if (
    transparencyQuery.isLoading
  ) {
    return (
      <div className="transparency-state">
        <span className="auth-spinner" />
        <p>
          Şeffaflık verileri
          yükleniyor...
        </p>
      </div>
    );
  }

  if (
    transparencyQuery.isError
  ) {
    return (
      <div className="transparency-state">
        <h1>
          Şeffaflık verileri
          alınamadı.
        </h1>

        <p>
          Lütfen daha sonra yeniden
          deneyin.
        </p>

        <button
          type="button"
          onClick={() =>
            transparencyQuery.refetch()
          }
        >
          Tekrar Dene
        </button>
      </div>
    );
  }

  const data =
    transparencyQuery.data || {
      availableYears: [],
      totals: {},
      categories: [],
      records: [],
    };

  const totals =
    data.totals || {};

  const records =
    data.records || [];

  const incomeCategories =
    (data.categories || []).filter(
      (item) =>
        item.type === "income"
    );

  const expenseCategories =
    (data.categories || []).filter(
      (item) =>
        item.type === "expense"
    );

  const availableYears =
    data.availableYears?.length > 0
      ? data.availableYears
      : [year];

  return (
    <div className="transparency-page">
      <section className="transparency-hero">
        <Container>
          <p className="transparency-hero__eyebrow">
            Açık ve hesap verebilir
          </p>

          <h1>Şeffaflık</h1>

          <p className="transparency-hero__description">
            Gelirlerimizi,
            harcamalarımızı ve
            kaynakların kullanımını
            herkesin görebileceği
            biçimde paylaşıyoruz.
          </p>
        </Container>
      </section>

      <section className="transparency-content">
        <Container>
          <div className="transparency-toolbar">
            <div>
              <CalendarDays
                size={20}
              />

              <span>
                Raporlama dönemi
              </span>
            </div>

            <select
              value={year}
              onChange={(event) =>
                setSearchParams({
                  yil:
                    event.target
                      .value,
                })
              }
              aria-label="Raporlama yılını seç"
            >
              {availableYears.map(
                (item) => (
                  <option
                    key={item}
                    value={item}
                  >
                    {item}
                  </option>
                )
              )}
            </select>
          </div>

          <div className="transparency-summary-grid">
            <article className="transparency-summary-card transparency-summary-card--income">
              <span>
                <ArrowUpRight
                  size={22}
                />
              </span>

              <div>
                <p>Toplam Gelir</p>

                <strong>
                  {formatMoney(
                    totals.income
                  )}
                </strong>
              </div>
            </article>

            <article className="transparency-summary-card transparency-summary-card--expense">
              <span>
                <ArrowDownRight
                  size={22}
                />
              </span>

              <div>
                <p>
                  Toplam Harcama
                </p>

                <strong>
                  {formatMoney(
                    totals.expense
                  )}
                </strong>
              </div>
            </article>

            <article className="transparency-summary-card transparency-summary-card--balance">
              <span>
                <Scale size={22} />
              </span>

              <div>
                <p>Güncel Bakiye</p>

                <strong>
                  {formatMoney(
                    totals.balance
                  )}
                </strong>
              </div>
            </article>

            <article className="transparency-summary-card">
              <span>
                <ReceiptText
                  size={22}
                />
              </span>

              <div>
                <p>Kayıt Sayısı</p>

                <strong>
                  {totals.recordCount ||
                    0}
                </strong>
              </div>
            </article>
          </div>

          {records.length === 0 ? (
            <div className="transparency-empty">
              <Landmark size={31} />

              <h2>
                Bu dönem için henüz
                yayımlanmış kayıt yok.
              </h2>

              <p>
                Gelir ve harcama
                kayıtları yayımlandıkça
                burada görüntülenecektir.
              </p>
            </div>
          ) : (
            <>
              <div className="transparency-breakdown">
                <section>
                  <div className="transparency-section-heading">
                    <p>Gelir Dağılımı</p>
                    <h2>
                      Gelir Kategorileri
                    </h2>
                  </div>

                  <div className="transparency-category-list">
                    {incomeCategories.map(
                      (item) => (
                        <article
                          key={`income-${item.category}`}
                        >
                          <span>
                            {item.category}
                          </span>

                          <strong>
                            {formatMoney(
                              item.total
                            )}
                          </strong>
                        </article>
                      )
                    )}
                  </div>
                </section>

                <section>
                  <div className="transparency-section-heading">
                    <p>
                      Harcama Dağılımı
                    </p>

                    <h2>
                      Harcama
                      Kategorileri
                    </h2>
                  </div>

                  <div className="transparency-category-list">
                    {expenseCategories.map(
                      (item) => (
                        <article
                          key={`expense-${item.category}`}
                        >
                          <span>
                            {item.category}
                          </span>

                          <strong>
                            {formatMoney(
                              item.total
                            )}
                          </strong>
                        </article>
                      )
                    )}
                  </div>
                </section>
              </div>

              <section className="transparency-records">
                <div className="transparency-section-heading">
                  <p>Açık Kayıtlar</p>
                  <h2>
                    Gelir ve Harcamalar
                  </h2>
                </div>

                <div className="transparency-record-list">
                  {records.map(
                    (record) => (
                      <article
                        className="transparency-record"
                        key={record.id}
                      >
                        <span
                          className={`transparency-record__type transparency-record__type--${record.type}`}
                        >
                          {record.type ===
                          "income"
                            ? "Gelir"
                            : "Harcama"}
                        </span>

                        <div className="transparency-record__content">
                          <div>
                            <p>
                              {
                                record.category
                              }
                            </p>

                            <h3>
                              {
                                record.title
                              }
                            </h3>
                          </div>

                          {record.description && (
                            <p>
                              {
                                record.description
                              }
                            </p>
                          )}

                          <small>
                            {formatDate(
                              record.transactionDate
                            )}
                          </small>
                        </div>

                        <div className="transparency-record__amount">
                          <strong>
                            {record.type ===
                            "income"
                              ? "+"
                              : "-"}
                            {formatMoney(
                              record.amount
                            )}
                          </strong>

                          {record.documentUrl && (
                            <a
                              href={
                                record.documentUrl
                              }
                              target="_blank"
                              rel="noreferrer"
                            >
                              Belgeyi Gör
                              <ExternalLink
                                size={14}
                              />
                            </a>
                          )}
                        </div>
                      </article>
                    )
                  )}
                </div>
              </section>
            </>
          )}
        </Container>
      </section>
    </div>
  );
};

export default TransparencyPage;