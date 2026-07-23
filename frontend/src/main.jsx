import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { QueryClientProvider } from "@tanstack/react-query";
import App from "./App";
import queryClient from "./config/queryClient";

import "./styles/tokens.css";
import "./styles/global.css";
import "./styles/layout.css";
import "./styles/home.css";
import "./styles/projects.css";
import "./styles/content-pages.css";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </QueryClientProvider>
  </StrictMode>
);