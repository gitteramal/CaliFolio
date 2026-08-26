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

  const sidebarWidth = collapsed ? "w-[72px]" : "w-[252px]";

  return (
    <>
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

        /* Hide scrollbar completely */
        .cf-no-scrollbar::-webkit-scrollbar {
          display: none;
        }

        .cf-no-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>

      <div className="cf-root flex h-screen w-full overflow-hidden bg-[#f3f6f7]">

        {/* =====================================================
            MOBILE OVERLAY
        ====================================================== */}

        {mobileOpen && (
          <div
            onClick={() => setMobileOpen(false)}
            className="fixed inset-0 z-30 bg-black/30 lg:hidden"
          />
        )}

        {/* =====================================================
            SIDEBAR
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

                {/* Calinova mark */}
                <div className="relative flex items-center">
                  <span
                    className="
                      cf-display
                      text-[18px]
                      font-extrabold
                      tracking-[0.16em]
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
                      tracking-[0.16em]
                    "
                    style={{ color: BRAND }}
                  >
                    Folio
                  </span>
                </div>

                <div className="w-px h-5 bg-[#d7dde0]" />

                <span className="text-[12px] font-medium text-[#68777d]">
                  Admin
                </span>

              </div>
            ) : (
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
                <span className="cf-display text-[11px] font-bold text-white">
                  CF
                </span>
              </div>
            )}

            {/* Mobile close */}
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
            >
              <X size={17} />
            </button>
          </div>

          {/* =================================================
              NAVIGATION

              No overflow / no sidebar scrolling.
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

            {/* Catalogue heading */}
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
                      ${collapsed ? "justify-center" : "gap-3"}
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
                          strokeWidth={isActive ? 2.2 : 1.8}
                          className="shrink-0"
                        />

                        {!collapsed && (
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
                        )}
                      </>
                    )}
                  </NavLink>
                );
              })}

            </div>

          </nav>

          {/* =================================================
              COLLAPSE BUTTON
          ================================================== */}

          <div
            className={`
              hidden
              lg:block
              shrink-0
              px-4
              pb-3
            `}
          >
            <button
              onClick={() => setCollapsed((value) => !value)}
              className={`
                flex
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
            >
              {collapsed ? (
                <ChevronsRight size={17} />
              ) : (
                <>
                  <ChevronsLeft size={17} />
                  <span>Collapse</span>
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
                V1.0 · BUILT FOR CALINOVA
              </p>
            ) : (
              <p className="cf-mono text-[8px] text-[#a0aaae] text-center">
                V1.0
              </p>
            )}
          </div>

        </aside>

        {/* =====================================================
            MAIN COLUMN

            IMPORTANT:
            h-screen + overflow-hidden on root
            overflow-y-auto ONLY here.
        ====================================================== */}

        <div className="flex-1 min-w-0 h-screen flex flex-col">

          {/* =================================================
              HEADER
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

            {/* Left */}
            <div className="flex items-center gap-3 min-w-0">

              {/* Mobile menu */}
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
              >
                <Menu size={19} />
              </button>

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

                <p className="hidden sm:block text-[11px] text-[#8a969b] mt-0.5">
                  Manage your CaliFolio platform
                </p>
              </div>

            </div>

            {/* Right */}
            <div className="flex items-center gap-3 sm:gap-4 shrink-0">

              {/* Admin pill */}
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



              <div
                className="
                  w-8
                  h-8
                  rounded-full
                  flex
                  items-center
                  justify-center
                  text-[9px]
                  font-bold
                  text-white
                "
                style={{
                  background:
                    "linear-gradient(135deg, #0097c1, #123b43)",
                }}
              >
                SO
              </div>

              <button
                onClick={() => {
                  localStorage.removeItem("access_token");
                  localStorage.removeItem("token_type");

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

              ONLY THIS AREA SCROLLS.
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