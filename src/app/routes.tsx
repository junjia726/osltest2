import { createBrowserRouter } from "react-router";
import { Layout } from "./components/Layout";
import { HomePage } from "./pages/HomePage";
import { ModelsPage } from "./pages/ModelsPage";
import { ModelDetailPage } from "./pages/ModelDetailPage";
import { ConfiguratorPage } from "./pages/ConfiguratorPage";
import { CalculatorPage } from "./pages/CalculatorPage";
import { QuizPage } from "./pages/QuizPage";
import { SAProfilePage } from "./pages/SAProfilePage";
import { SAListPage } from "./pages/SAListPage";
import { SADashboardPage } from "./pages/SADashboardPage";
import { SAProfileEditPage } from "./pages/SAProfileEditPage";
import { LoginPage } from "./pages/LoginPage";
import { RegisterPage } from "./pages/RegisterPage";
import { ProfilePage } from "./pages/ProfilePage";
import { AdminPage } from "./pages/AdminPage";
import { PartnerDetailPage } from "./pages/PartnerDetailPage";
import { PartnerPanel } from "./pages/PartnerPanel";
import { Link } from "react-router";

import { FeedPage } from "./pages/FeedPage";
import { GetQuotationPage } from "./pages/GetQuotationPage";

function NotFound() {
  return (
    <div className="px-5 py-16 text-center">
      <h1 className="text-6xl text-primary mb-4">404</h1>
      <p className="text-muted-foreground mb-6">Page not found</p>
      <Link
        to="/"
        className="bg-primary text-white px-6 py-3 rounded-xl inline-block transition-opacity hover:opacity-90"
      >
        Back to Home
      </Link>
    </div>
  );
}

export const router = createBrowserRouter([
  {
    path: "/get-quotation",
    Component: GetQuotationPage,
  },
  {
    path: "/admin",
    Component: AdminPage,
  },
  {
    path: "/",
    Component: Layout,
    children: [
      { index: true, Component: HomePage },
      { path: "models", Component: ModelsPage },
      { path: "models/:id", Component: ModelDetailPage },
      { path: "configurator/:id", Component: ConfiguratorPage },
      { path: "calculator", Component: CalculatorPage },
      { path: "quiz", Component: QuizPage },
      { path: "sa-list", Component: SAListPage },
      { path: "sa/:saId", Component: SAProfilePage },
      { path: "sa-dashboard", Component: SADashboardPage },
      { path: "sa-dashboard/edit", Component: SAProfileEditPage },
      { path: "admin", Component: AdminPage },
      { path: "login", Component: LoginPage },
      { path: "register", Component: RegisterPage },
      { path: "profile", Component: ProfilePage },
      { path: "partner-panel", Component: PartnerPanel },
      { path: "partner/:id", Component: PartnerDetailPage },
      { path: "community", Component: FeedPage },
      { path: "*", Component: NotFound },
    ],
  },
]);
