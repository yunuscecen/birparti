import "dotenv/config";
import app from "./app.js";
import connectDatabase from "./config/db.js";

const port = Number(process.env.PORT) || 5000;

const startServer = async () => {
  try {
    await connectDatabase();

    const server = app.listen(port, () => {
      console.log(`API http://localhost:${port} adresinde çalışıyor.`);
    });

    const shutdown = async (signal) => {
      console.log(`${signal} sinyali alındı. Sunucu kapatılıyor...`);

      server.close(() => {
        process.exit(0);
      });
    };

    process.on("SIGTERM", () => shutdown("SIGTERM"));
    process.on("SIGINT", () => shutdown("SIGINT"));
  } catch (error) {
    console.error("Sunucu başlatılamadı:", error.message);
    process.exit(1);
  }
};

startServer();