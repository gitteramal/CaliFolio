import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

import LoginPage from "./pages/auth/LoginPage";

import AdminLayout from "./pages/admin/AdminLayout";
import OverviewPage from "./pages/admin/OverviewPage";
import SoftwareShowcasePage from "./pages/admin/SoftwareShowcasePage";
import ProductDetailsPage from "./pages/admin/ProductDetailsPage";
import ProductEditPage from "./pages/admin/ProductEditPage";
import AdminProductReviewPage from "./pages/admin/AdminProductReviewPage";
import ProductQuestionsPage from "./pages/admin/ProductQuestionsPage";


import GuestLayout from "./pages/guest/GuestLayout";
import GuestShowcasePage from "./pages/guest/GuestShowcasePage";
import GuestProductDetailsPage from "./pages/guest/GuestProductDetailsPage";
import GuestProductQAPage from "./pages/guest/GuestProductQAPage";

import FounderLayout from "./pages/founder/FounderLayout";
import FounderOverviewPage from "./pages/founder/FounderOverviewPage";
import FounderProductPage from "./pages/founder/FounderProductPage";

function App() {
  return (
    <BrowserRouter>
      <Routes>

        {/* =========================
            LOGIN
        ========================== */}

        <Route
          path="/"
          element={<LoginPage />}
        />


        {/* =========================
            ADMIN
        ========================== */}

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

          {/* /admin/software/3 */}
          <Route
            path="software/:productId"
            element={<ProductDetailsPage />}
          />

          {/* /admin/software/3/edit */}
          <Route
            path="software/:productId/edit"
            element={<ProductEditPage />}
          />

          {/* /admin/reviews */}
          <Route
  path="/admin/products/:productId/review"
  element={<AdminProductReviewPage />}
/>

          {/* /admin/questions */}
          <Route
  path="/admin/software/:productId/questions"
  element={<ProductQuestionsPage />}
/>

        </Route>

        {/* =========================
    FOUNDER
========================= */}

<Route
  path="/founder"
  element={<FounderLayout />}
>
  <Route
    index
    element={
      <Navigate
        to="overview"
        replace
      />
    }
  />

  <Route
    path="overview"
    element={<FounderOverviewPage />}
  />

<Route
  path="products/:productId"
  element={<FounderProductPage />}
/>
</Route>


{/* =========================
    GUEST
========================= */}

{/* =========================
    GUEST
========================= */}

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

  {/* /guest/software/3 */}
  <Route
    path="software/:productId"
    element={<GuestProductDetailsPage />}
  />

<Route
  path="/guest/software/:productId/qa"
  element={<GuestProductQAPage />}
/>

</Route>

      </Routes>
    </BrowserRouter>
  );
}

export default App;