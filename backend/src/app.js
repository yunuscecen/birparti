import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import rateLimit from "express-rate-limit";

const app = express();

app.set("trust proxy", 1);

const allowedOrigins = (
  process.env.CLIENT_URLS || "http://localhost:5173"
)
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

app.use(
  helmet({
    crossOriginResourcePolicy: {
      policy: "cross-origin",
    },
  })
);

app.use(
  cors({
    origin(origin, callback) {
      // Postman, Render health check veya sunucu içi isteklerde
      // origin bulunmayabilir.
      if (!origin || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      return callback(
        new Error("Bu kaynaktan gelen isteğe CORS izni verilmedi.")
      );
    },
    credentials: true,
  })
);

app.use(express.json({ limit: "2mb" }));
app.use(
  express.urlencoded({
    extended: true,
    limit: "2mb",
  })
);

app.use(cookieParser());

app.use(
  morgan(process.env.NODE_ENV === "production" ? "combined" : "dev")
);

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 300,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  message: {
    success: false,
    message: "Çok fazla istek gönderildi. Lütfen biraz sonra tekrar deneyin.",
  },
});

app.use("/api", apiLimiter);

app.get("/api/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Bir Parti API çalışıyor.",
    environment: process.env.NODE_ENV || "development",
    timestamp: new Date().toISOString(),
  });
});

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "İstenen API adresi bulunamadı.",
  });
});

// eslint-disable-next-line no-unused-vars
app.use((error, req, res, next) => {
  console.error(error);

  res.status(error.statusCode || 500).json({
    success: false,
    message:
      error.message || "Sunucu tarafında beklenmeyen bir hata oluştu.",
    ...(process.env.NODE_ENV === "development" && {
      stack: error.stack,
    }),
  });
});

export default app;