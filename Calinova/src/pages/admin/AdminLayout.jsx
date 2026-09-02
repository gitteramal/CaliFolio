import React, { useState, useEffect } from "react";
import {
  LayoutDashboard,
  Boxes,
  ShieldCheck,
  LogOut,
  ChevronsLeft,
  ChevronsRight,
  Menu,
  X,
} from "lucide-react";
import { NavLink, Outlet } from "react-router-dom";

const BRAND = "#0097c1";
const API_URL = import.meta.env.VITE_API_URL;

const NAV_ITEMS = [
  {
    path: "/admin/overview",
    label: "Overview",
    icon: LayoutDashboard,
    end: true,
  },
  {
    path: "/admin/software",
    label: "Software Showcase",
    icon: Boxes,
  },
];

export default function AdminLayout() {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [pendingQuestionCount, setPendingQuestionCount] = useState(0);

  // =========================================================
  // USER
  // =========================================================

  const fullName =
    sessionStorage.getItem("full_name") || "Admin";

  const initials = fullName
    .split(" ")
    .filter(Boolean)
    .map((name) => name.charAt(0))
    .join("")
    .slice(0, 2)
    .toUpperCase();

  // =========================================================
  // RESPONSIVE
  // =========================================================

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setMobileOpen(false);
      }
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  useEffect(() => {
    async function loadPendingQuestionCount() {
      try {
        const token = sessionStorage.getItem("access_token");
        if (!token) return;
        const res = await fetch(`${API_URL}/product-questions/admin`, {
          headers: { Accept: "application/json", Authorization: `Bearer ${token}` },
        });
        if (!res.ok) return;
        const questions = await res.json();
        setPendingQuestionCount(questions.filter((question) => question.status === "pending").length);
      } catch (err) {
        console.error("Failed to load pending question count:", err);
      }
    }

    loadPendingQuestionCount();
    const intervalId = window.setInterval(loadPendingQuestionCount, 15000);
    window.addEventListener(
      "admin-question-notifications-updated",
      loadPendingQuestionCount
    );
    return () => {
      window.clearInterval(intervalId);
      window.removeEventListener(
        "admin-question-notifications-updated",
        loadPendingQuestionCount
      );
    };
  }, []);

  const sidebarWidth = collapsed ? "w-[72px]" : "w-[252px]";

  return (
    <>
      {/* =====================================================
          CALIFOLIO ADMIN STYLES
      ====================================================== */}

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@600;700;800&family=Inter:wght@400;500;600&family=JetBrains+Mono:wght@500&display=swap');

        .cf-root {
          font-family: 'Inter', sans-serif;
        }

        .cf-display {
          font-family: 'Sora', sans-serif;
        }

        .cf-mono {
          font-family: 'JetBrains Mono', monospace;
          letter-spacing: 0.08em;
        }

        .cf-sidebar {
          transition:
            width 200ms ease,
            transform 200ms ease;
        }

        .cf-no-scrollbar::-webkit-scrollbar {
          display: none;
        }

        .cf-no-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>


      {/* =====================================================
          ROOT
      ====================================================== */}

      <div className="cf-root flex h-screen w-full overflow-hidden bg-[#f3f6f7]">

        {/* =====================================================
            MOBILE OVERLAY
        ====================================================== */}

        {mobileOpen && (
          <div
            onClick={() => setMobileOpen(false)}
            className="
              fixed
              inset-0
              z-30
              bg-black/30
              lg:hidden
            "
          />
        )}


        {/* =====================================================
            SIDEBAR
            SAME SIZE / STYLE AS GUEST
        ====================================================== */}

        <aside
          className={`
            cf-sidebar
            fixed
            lg:relative
            z-40
            inset-y-0
            left-0
            flex
            flex-col
            shrink-0
            bg-[#f7f9fa]
            border-r
            border-[#e2e7e9]
            ${sidebarWidth}

            ${
              mobileOpen
                ? "translate-x-0"
                : "-translate-x-full lg:translate-x-0"
            }
          `}
        >

          {/* =================================================
              LOGO
          ================================================== */}

          <div
            className={`
              h-[72px]
              shrink-0
              flex
              items-center
              border-b
              border-[#e5e9eb]
              ${collapsed ? "justify-center px-3" : "px-6"}
            `}
          >

            {!collapsed ? (
              <div className="flex items-center gap-3">

                {/* =================================================
                    CaliFolio
                    CALI = BLACK
                    FOLIO = BLUE
                ================================================== */}

                <div className="relative flex items-center">

                  <span
                    className="
                      cf-display
                      text-[18px]
                      font-extrabold
                      tracking-[0.08em]
                      text-[#11181c]
                    "
                  >
                    Cali
                  </span>

                  <span
                    className="
                      cf-display
                      text-[18px]
                      font-extrabold
                      tracking-[0.08em]
                    "
                    style={{
                      color: BRAND,
                    }}
                  >
                    Folio
                  </span>

                </div>


                {/* DIVIDER */}

                <div className="w-px h-5 bg-[#d7dde0]" />


                {/* ADMIN */}

                <span
                  className="
                    text-[12px]
                    font-medium
                    text-[#68777d]
                  "
                >
                  Admin
                </span>

              </div>
            ) : (

              /* =================================================
                 COLLAPSED LOGO
              ================================================== */

              <div
                className="
                  w-9
                  h-9
                  rounded-lg
                  bg-black
                  flex
                  items-center
                  justify-center
                "
              >
                <span
                  className="
                    cf-display
                    text-[11px]
                    font-bold
                    text-white
                  "
                >
                  CF
                </span>
              </div>

            )}


            {/* =================================================
                MOBILE CLOSE
            ================================================== */}

            <button
              onClick={() => setMobileOpen(false)}
              className="
                lg:hidden
                ml-auto
                w-8
                h-8
                rounded-lg
                flex
                items-center
                justify-center
                text-[#718087]
                hover:bg-black/5
                transition
              "
              aria-label="Close menu"
            >
              <X size={17} />
            </button>

          </div>


          {/* =================================================
              NAVIGATION
          ================================================== */}

          <nav
            className="
              flex-1
              min-h-0
              px-4
              pt-7
              overflow-hidden
            "
          >

            {/* =================================================
                CATALOGUE
            ================================================== */}

            {!collapsed && (
              <p
                className="
                  cf-mono
                  px-3
                  mb-3
                  text-[9px]
                  font-medium
                  uppercase
                  text-[#9aa6ab]
                "
              >
                Catalogue
              </p>
            )}


            <div className="space-y-1">

              {NAV_ITEMS.map((item) => {
                const Icon = item.icon;

                return (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    end={item.end}
                    title={collapsed ? item.label : undefined}
                    onClick={() => setMobileOpen(false)}
                    className={({ isActive }) => `
                      group
                      flex
                      items-center
                      ${
                        collapsed
                          ? "justify-center"
                          : "gap-3"
                      }
                      w-full
                      min-h-[42px]
                      px-3
                      rounded-[7px]
                      transition-all
                      duration-150

                      ${
                        isActive
                          ? "bg-black text-white shadow-sm"
                          : "text-[#64747b] hover:bg-[#e9edef] hover:text-[#1d292e]"
                      }
                    `}
                  >
                    {({ isActive }) => (
                      <>
                        <Icon
                          size={17}
                          strokeWidth={
                            isActive ? 2.2 : 1.8
                          }
                          className="shrink-0"
                        />

                        {!collapsed && (
                          <>
                            <span
                              className={`
                                text-[13px]
                                ${
                                  isActive
                                    ? "font-medium text-white"
                                    : "font-medium"
                                }
                              `}
                            >
                              {item.label}
                            </span>
                            {item.path === "/admin/software" && pendingQuestionCount > 0 && (
                              <span className={`ml-auto flex h-5 min-w-5 items-center justify-center rounded-full px-1.5 text-[10px] font-bold ${isActive ? "bg-white text-[#111B26]" : "bg-[#E5484D] text-white"}`}>
                                {pendingQuestionCount > 99 ? "99+" : pendingQuestionCount}
                              </span>
                            )}
                          </>
                        )}
                      </>
                    )}
                  </NavLink>
                );
              })}

            </div>

          </nav>


          {/* =================================================
              COLLAPSE AREA

              LOGIC IS SAME AS YOUR ADMIN CODE
          ================================================== */}

          <div
            className="
              shrink-0
              px-4
              pb-3
            "
          >

            {/* =================================================
                COLLAPSE

                SAME POSITION / SIZE AS GUEST
            ================================================== */}

            <button
              type="button"
              onClick={() =>
                setCollapsed((value) => !value)
              }
              className={`
                hidden
                lg:flex
                items-center
                ${
                  collapsed
                    ? "justify-center"
                    : "justify-start gap-3"
                }
                w-full
                min-h-[40px]
                px-3
                rounded-[7px]
                text-[12px]
                font-medium
                text-[#77858a]
                hover:bg-[#e9edef]
                hover:text-[#1d292e]
                transition
              `}
              title={
                collapsed
                  ? "Expand"
                  : "Collapse"
              }
            >

              {collapsed ? (
                <ChevronsRight size={17} />
              ) : (
                <>
                  <ChevronsLeft size={17} />
                  <span>
                    Collapse
                  </span>
                </>
              )}

            </button>

          </div>


          {/* =================================================
              FOOTER
          ================================================== */}

          <div
            className={`
              shrink-0
              border-t
              border-[#e2e7e9]
              py-4
              ${collapsed ? "px-2" : "px-6"}
            `}
          >

            {!collapsed ? (
              <p className="cf-mono text-[8px] text-[#a0aaae]">
                V1.0 · BUILT FOR CALIFOLIO
              </p>
            ) : (
              <p
                className="
                  cf-mono
                  text-[8px]
                  text-[#a0aaae]
                  text-center
                "
              >
                V1.0
              </p>
            )}

          </div>

        </aside>


        {/* =====================================================
            MAIN COLUMN
        ====================================================== */}

        <div className="flex-1 min-w-0 h-screen flex flex-col">

          {/* =================================================
              HEADER
              SAME 72px HEIGHT AS GUEST
          ================================================== */}

          <header
            className="
              h-[72px]
              shrink-0
              bg-white
              border-b
              border-[#e2e7e9]
              px-4
              sm:px-7
              flex
              items-center
              justify-between
            "
          >

            {/* =================================================
                LEFT
            ================================================== */}

            <div
              className="
                flex
                items-center
                gap-3
                min-w-0
              "
            >

              {/* MOBILE MENU */}

              <button
                onClick={() => setMobileOpen(true)}
                className="
                  lg:hidden
                  w-9
                  h-9
                  rounded-lg
                  flex
                  items-center
                  justify-center
                  text-[#5f6d73]
                  hover:bg-gray-100
                "
                aria-label="Open menu"
              >
                <Menu size={19} />
              </button>


              {/* HEADER TITLE */}

              <div className="min-w-0">

                <h1
                  className="
                    cf-display
                    text-[15px]
                    sm:text-[17px]
                    font-bold
                    text-[#12191d]
                    truncate
                  "
                >
                  Admin Console
                </h1>

                <p
                  className="
                    hidden
                    sm:block
                    text-[11px]
                    text-[#8a969b]
                    mt-0.5
                  "
                >
                  Manage your CaliFolio platform
                </p>

              </div>

            </div>


            {/* =================================================
                RIGHT
            ================================================== */}

            <div
              className="
                flex
                items-center
                gap-3
                sm:gap-4
                shrink-0
              "
            >

              {/* =================================================
                  ADMIN PILL
              ================================================== */}

              <span
                className="
                  hidden
                  sm:flex
                  items-center
                  gap-1.5
                  rounded-full
                  bg-black
                  px-3
                  py-1.5
                  text-[10px]
                  font-semibold
                  text-white
                "
              >
                <ShieldCheck size={11} />
                Admin
              </span>


<div className="min-w-0 leading-tight">
  <p
    className="
      text-[12px]
      font-semibold
      text-[#1d292e]
      truncate
    "
  >
    {fullName}
  </p>
</div>


              {/* =================================================
                  LOGOUT
              ================================================== */}

              <button
                onClick={() => {
                  sessionStorage.removeItem("access_token");
                  sessionStorage.removeItem("token_type");
                  sessionStorage.removeItem("role");
                  sessionStorage.removeItem("full_name");

                  window.location.href = "/";
                }}
                title="Logout"
                className="
                  w-8
                  h-8
                  rounded-lg
                  flex
                  items-center
                  justify-center
                  text-[#7b898f]
                  hover:bg-red-50
                  hover:text-red-600
                  transition
                "
              >
                <LogOut size={16} />
              </button>

            </div>

          </header>


          {/* =================================================
              PAGE CONTENT

              ONLY THIS AREA SCROLLS
          ================================================== */}

          <main
            className="
              flex-1
              min-h-0
              overflow-y-auto
              overflow-x-hidden
              bg-[#f3f6f7]
              p-4
              sm:p-6
              lg:p-7
            "
          >
            <Outlet />
          </main>

        </div>

      </div>
    </>
  );
}
