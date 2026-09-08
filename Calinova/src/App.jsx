import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

import LoginPage from "./pages/auth/AuthLoginpage";
import ProtectedRoute from "./pages/ProtectedRoute";

// =========================================================
// ADMIN
// =========================================================

import AdminLayout from "./pages/admin/AdminLayout";
import OverviewPage from "./pages/admin/OverviewPage";
import SoftwareShowcasePage from "./pages/admin/SoftwareShowcasePage";
import ProductDetailsPage from "./pages/admin/ProductDetailsPage";
import ProductEditPage from "./pages/admin/ProductEditPage";
import AdminProductReviewPage from "./pages/admin/AdminProductReviewPage";
import ProductQuestionsPage from "./pages/admin/ProductQuestionsPage";
import GuestManagementPage from "./pages/admin/GuestManagementPage";

// =========================================================
// GUEST
// =========================================================

import GuestLayout from "./pages/guest/GuestLayout";
import GuestShowcasePage from "./pages/guest/GuestShowcasePage";
import GuestProductDetailsPage from "./pages/guest/GuestProductDetailsPage";
import GuestProductQAPage from "./pages/guest/GuestProductQAPage";

// =========================================================
// FOUNDER
// =========================================================

import FounderLayout from "./pages/founder/FounderLayout";
import FounderOverviewPage from "./pages/founder/FounderOverviewPage";
import FounderProductPage from "./pages/founder/FounderProductPage";

function App() {
  return (
    <BrowserRouter>
      <Routes>

        {/* =====================================================
            LOGIN
        ====================================================== */}

        <Route
          path="/"
          element={<LoginPage />}
        />

        <Route
          path="/login"
          element={<LoginPage />}
        />


        {/* =====================================================
            ADMIN
            Protected: admin only
        ====================================================== */}

        <Route
          element={
            <ProtectedRoute allowedRoles={["admin"]} />
          }
        >
          <Route
            path="/admin"
            element={<AdminLayout />}
          >

            {/* /admin → /admin/overview */}
            <Route
              index
              element={
                <Navigate
                  to="overview"
                  replace
                />
              }
            />

            {/* /admin/overview */}
            <Route
              path="overview"
              element={<OverviewPage />}
            />

            {/* /admin/software */}
            <Route
              path="software"
              element={<SoftwareShowcasePage />}
            />

            {/* /admin/software/:productId */}
            <Route
              path="software/:productId"
              element={<ProductDetailsPage />}
            />

            {/* /admin/software/:productId/edit */}
            <Route
              path="software/:productId/edit"
              element={<ProductEditPage />}
            />

            {/* /admin/products/:productId/review */}
            <Route
              path="products/:productId/review"
              element={<AdminProductReviewPage />}
            />

            {/* /admin/software/:productId/questions */}
            <Route
              path="software/:productId/questions"
              element={<ProductQuestionsPage />}
            />

            <Route
              path="guests"
              element={<GuestManagementPage />}
            />

          </Route>
        </Route>


        {/* =====================================================
            FOUNDER
            Protected: founder only
        ====================================================== */}

        <Route
          element={
            <ProtectedRoute allowedRoles={["founder"]} />
          }
        >
          <Route
            path="/founder"
            element={<FounderLayout />}
          >

            {/* /founder → /founder/overview */}
            <Route
              index
              element={
                <Navigate
                  to="overview"
                  replace
                />
              }
            />

            {/* /founder/overview */}
            <Route
              path="overview"
              element={<FounderOverviewPage />}
            />

            {/* /founder/products/:productId */}
            <Route
              path="products/:productId"
              element={<FounderProductPage />}
            />

          </Route>
        </Route>


        {/* =====================================================
            GUEST
            Protected: guest only
        ====================================================== */}

        <Route
          element={
            <ProtectedRoute allowedRoles={["guest"]} />
          }
        >
          <Route
            path="/guest"
            element={<GuestLayout />}
          >

            {/* /guest → /guest/showcase */}
            <Route
              index
              element={
                <Navigate
                  to="showcase"
                  replace
                />
              }
            />

            {/* /guest/showcase */}
            <Route
              path="showcase"
              element={<GuestShowcasePage />}
            />

            {/* /guest/software/:productId */}
            <Route
              path="software/:productId"
              element={<GuestProductDetailsPage />}
            />

            {/* /guest/software/:productId/qa */}
            <Route
              path="software/:productId/qa"
              element={<GuestProductQAPage />}
            />

          </Route>
        </Route>


        {/* =====================================================
            FALLBACK
        ====================================================== */}

        <Route
          path="*"
          element={
            <Navigate
              to="/"
              replace
            />
          }
        />

      </Routes>
    </BrowserRouter>
  );
}

export default App;
