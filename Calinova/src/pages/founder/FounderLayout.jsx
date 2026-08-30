import { useState, useEffect } from "react";
import {
  LayoutDashboard,
  LogOut,
  ChevronsLeft,
  ChevronsRight,
  Menu,
  X,
} from "lucide-react";
import { NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";

const BRAND = "#0097c1";

const NAV_ITEMS = [
  {
    key: "overview",
    label: "Overview",
    icon: LayoutDashboard,
  },
];

export default function FounderLayout() {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const isOverviewActive =
    pathname === "/founder/overview" ||
    pathname.startsWith("/founder/products/");

  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  // =========================================================
  // USER
  // =========================================================

  const fullName =
    sessionStorage.getItem("full_name") || "Founder";

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

  // =========================================================
  // LOGOUT
  // =========================================================

  function logout() {
    sessionStorage.removeItem("access_token");
    sessionStorage.removeItem("token_type");
    sessionStorage.removeItem("role");
    sessionStorage.removeItem("full_name");
    navigate("/");
  }

  // =========================================================
  // SIDEBAR WIDTH
  // SAME AS GUEST / ADMIN
  // =========================================================

  const sidebarWidth = collapsed
    ? "w-[72px]"
    : "w-[252px]";

  return (
    <>
      {/* =====================================================
          CALIFOLIO FOUNDER STYLES
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
            SAME SIZE / STYLE AS GUEST / ADMIN
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


                {/* FOUNDER */}

                <span
                  className="
                    text-[12px]
                    font-medium
                    text-[#68777d]
                  "
                >
                  Founder
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
                WORKSPACE
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
                Workspace
              </p>
            )}


            <div className="space-y-1">

              {NAV_ITEMS.map((item) => {
                const Icon = item.icon;
                const isActive =
                  item.key === "overview" && isOverviewActive;

                return (
                  <NavLink
                    key={item.key}
                    to={`/founder/${item.key}`}
                    title={collapsed ? item.label : undefined}
                    onClick={() => setMobileOpen(false)}
                    className={() => `
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
                    {() => (
                      <>
                        <Icon
                          size={17}
                          strokeWidth={
                            isActive ? 2.2 : 1.8
                          }
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
              LOGOUT + COLLAPSE AREA
          ================================================== */}

          <div
            className="
              shrink-0
              px-4
              pb-3
            "
          >

            {/* =================================================
                LOGOUT
            ================================================== */}

            <button
              type="button"
              onClick={logout}
              title={
                collapsed
                  ? "Logout"
                  : undefined
              }
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

              <LogOut
                size={17}
                strokeWidth={1.8}
                className="shrink-0"
              />

              {!collapsed && (
                <span>
                  Logout
                </span>
              )}

            </button>


            {/* =================================================
                COLLAPSE

                SAME POSITION / SIZE AS GUEST / ADMIN
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
                mt-1
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
              SAME 72px HEIGHT AS GUEST / ADMIN
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
                  Founder Dashboard
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
                  Manage your products and questions
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
                  FOUNDER PILL
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
                Founder
              </span>


              {/* =================================================
                  LOGGED-IN USER CARD
              ================================================== */}
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
                onClick={logout}
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
