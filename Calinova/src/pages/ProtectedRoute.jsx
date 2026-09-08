import React, { useEffect } from "react";
import { Navigate, Outlet, useLocation, useNavigate } from "react-router-dom";

export default function ProtectedRoute({ allowedRoles }) {
  const location = useLocation();
  const navigate = useNavigate();

  const token = sessionStorage.getItem("access_token");
  const role = sessionStorage.getItem("role");

  // =========================================================
  // HANDLE BROWSER BACK/FORWARD CACHE
  // =========================================================

  useEffect(() => {
    const checkAuthentication = () => {
      const currentToken = sessionStorage.getItem("access_token");
      const currentRole = sessionStorage.getItem("role");

      // No token -> user is logged out
      if (!currentToken) {
        window.location.replace("/login");
        return;
      }

      // Wrong role -> don't allow access
      if (
        allowedRoles &&
        !allowedRoles.includes(currentRole)
      ) {
        window.location.replace("/login");
      }
    };

    // Browser back/forward navigation
    const handlePageShow = () => {
      checkAuthentication();
    };

    window.addEventListener(
      "pageshow",
      handlePageShow
    );

    return () => {
      window.removeEventListener(
        "pageshow",
        handlePageShow
      );
    };
  }, [allowedRoles]);

  // =========================================================
  // NORMAL REACT ROUTE PROTECTION
  // =========================================================

  if (!token) {
    return (
      <Navigate
        to="/login"
        replace
        state={{ from: location }}
      />
    );
  }

  // =========================================================
  // ROLE PROTECTION
  // =========================================================

  if (
    allowedRoles &&
    !allowedRoles.includes(role)
  ) {
    return (
      <Navigate
        to="/login"
        replace
      />
    );
  }

  // =========================================================
  // AUTHENTICATED
  // =========================================================

  return <Outlet />;
}