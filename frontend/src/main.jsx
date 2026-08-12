import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { QueryClientProvider } from "@tanstack/react-query";
import { AuthProvider } from "./context/AuthContext";
import App from "./App";
import "./styles/auth.css";
import "./styles/admin.css";
import "./styles/blog.css";
import "./styles/accountForum.css";
import "./styles/forum.css";
import "./styles/accountForumReports.css";
import "./styles/accountForumNotifications.css";
import "./styles/adminContactRequests.css";
import "./styles/adminBulkEmails.css";
import "./styles/accountContactRequests.css";
import { SiteSettingsProvider } from "./context/SiteSettingsContext";
import MaintenanceGate from "./components/common/MaintenanceGate";
import "./styles/maintenance.css";
import queryClient from "./config/queryClient";


import "./styles/tokens.css";
import "./styles/global.css";
import "./styles/layout.css";
import "./styles/home.css";
import "./styles/projects.css";
import "./styles/content-pages.css";
import "./styles/transparency.css";
createRoot(
  document.getElementById("root")
).render(
  <StrictMode>
    <QueryClientProvider
      client={queryClient}
    >
      <BrowserRouter>
        <AuthProvider>
          <SiteSettingsProvider>
            <MaintenanceGate>
              <App />
            </MaintenanceGate>
          </SiteSettingsProvider>
        </AuthProvider>
      </BrowserRouter>
    </QueryClientProvider>
  </StrictMode>
);