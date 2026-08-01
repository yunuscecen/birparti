import {
  Clock3,
  Wrench,
} from "lucide-react";

const MaintenancePage = ({
  message,
}) => {
  return (
    <main className="maintenance-page">
      <div className="maintenance-card">
        <div className="maintenance-card__icon">
          <Wrench size={34} />
        </div>

        <p>Bir Parti</p>

        <h1>
          Kısa Bir Ara Veriyoruz
        </h1>

        <span>
          {message ||
            "Sitemiz kısa süreli bir bakım çalışmasındadır."}
        </span>

        <div className="maintenance-card__notice">
          <Clock3 size={18} />

          En kısa sürede yeniden
          buradayız.
        </div>
      </div>
    </main>
  );
};

export default MaintenancePage;