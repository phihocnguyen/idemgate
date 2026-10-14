import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { Shell } from "./components/Shell";
import { isLoggedIn } from "./lib/auth";
import { LoginPage } from "./pages/Login";
import { OperationsPage } from "./pages/Operations";
import { OperationDetailPage } from "./pages/OperationDetail";
import { SettingsPage } from "./pages/Settings";
import { StatusPage } from "./pages/Status";

function RequireAuth({ children }: { children: React.ReactNode }) {
  if (!isLoggedIn()) return <Navigate to="/login" replace />;
  return children;
}

/** Vite BASE_URL is `/` in dev and `/ui/` in production builds. */
function routerBasename() {
  const base = import.meta.env.BASE_URL.replace(/\/$/, "");
  return base === "" ? undefined : base;
}

export default function App() {
  return (
    <BrowserRouter basename={routerBasename()}>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route
          element={
            <RequireAuth>
              <Shell />
            </RequireAuth>
          }
        >
          <Route path="/" element={<OperationsPage />} />
          <Route path="/operations/:id" element={<OperationDetailPage />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="/status" element={<StatusPage />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
