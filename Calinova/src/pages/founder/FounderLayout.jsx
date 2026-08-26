import React from "react";
import {
  LayoutDashboard,
  Boxes,
  MessageSquare,
  LogOut,
} from "lucide-react";

import {
  NavLink,
  Outlet,
  useNavigate,
} from "react-router-dom";

const NAV_ITEMS = [
  {
    key: "overview",
    label: "Overview",
    icon: LayoutDashboard,
  },
  {
    key: "products",
    label: "My Products",
    icon: Boxes,
  },
  {
    key: "questions",
    label: "Questions",
    icon: MessageSquare,
  },
];

export default function FounderLayout() {
  const navigate = useNavigate();

  function logout() {
    localStorage.removeItem("access_token");
    localStorage.removeItem("token_type");
    navigate("/");
  }

  return (
    <>
      <style>{`
        .founder-root {
          font-family: 'Inter', sans-serif;
        }

        .founder-display {
          font-family: 'Sora', sans-serif;
        }

        .founder-mono {
          font-family: 'JetBrains Mono', monospace;
          letter-spacing: 0.06em;
        }

        .founder-sidebar {
          width: 256px;
          flex-shrink: 0;
        }

        .founder-main {
          min-width: 0;
          overflow-y: auto;
          overflow-x: hidden;
        }

        .founder-content {
          width: 100%;
          max-width: 1180px;
          margin: 0 auto;
        }

        @media (max-width: 1023px) {
          .founder-sidebar {
            width: 220px;
          }
        }

        @media (max-width: 767px) {
          .founder-sidebar {
            display: none;
          }
        }
      `}</style>

      <div className="founder-root h-screen overflow-hidden bg-[#f3f6f7] text-slate-800">

        {/* =====================================================
            TOP HEADER
        ====================================================== */}

        <header
          className="
            h-16
            shrink-0
            bg-white
            border-b
            border-gray-200
            flex
            items-center
            justify-between
            px-5
            lg:px-7
          "
        >

          {/* Logo */}

          <div className="flex items-center gap-3 shrink-0">

            <div className="w-9 h-9 rounded-lg bg-[#071014] flex items-center justify-center">
              <span className="founder-display font-bold text-white text-sm">
                CF
              </span>
            </div>

            <div className="flex items-center gap-3">

              <p className="founder-display font-bold text-gray-900 text-sm">
                CaliFolio
              </p>

              <div className="w-px h-5 bg-gray-300" />

              <p className="text-sm text-gray-500">
                Founder
              </p>

            </div>

          </div>


          {/* Search */}

          <div className="hidden md:flex flex-1 max-w-[520px] mx-8 lg:mx-12">

            <div className="relative w-full">

              <svg
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <circle
                  cx="11"
                  cy="11"
                  r="7"
                />

                <path d="m20 20-3.5-3.5" />
              </svg>

              <input
                type="text"
                placeholder="Search the catalogue..."
                className="
                  w-full
                  h-10
                  pl-10
                  pr-4
                  rounded-lg
                  border
                  border-gray-200
                  bg-[#f7f9f9]
                  text-sm
                  text-gray-700
                  placeholder-gray-400
                  outline-none
                  focus:border-[#18b8c8]
                  focus:ring-2
                  focus:ring-[#18b8c8]/10
                "
              />

            </div>

          </div>


          {/* Right side */}

          <div className="flex items-center gap-2.5 shrink-0">

            <div className="hidden sm:flex items-center bg-gray-100 border border-gray-200 rounded-full p-1">

              <span className="px-3.5 py-1.5 rounded-full bg-[#071014] text-white text-xs font-semibold">
                Founder
              </span>



            </div>

            <div className="w-9 h-9 rounded-full bg-[#075b76] flex items-center justify-center text-white text-xs font-bold">
              FD
            </div>

            <button
              onClick={logout}
              title="Logout"
              className="
                w-9
                h-9
                flex
                items-center
                justify-center
                rounded-lg
                text-gray-500
                hover:bg-red-50
                hover:text-red-600
                transition-colors
              "
            >
              <LogOut size={17} />
            </button>

          </div>

        </header>


        {/* =====================================================
            BODY
        ====================================================== */}

        <div className="flex h-[calc(100vh-4rem)] min-h-0">


          {/* =================================================
              SIDEBAR
          ================================================== */}

          <aside
            className="
              founder-sidebar
              bg-[#f7f9fa]
              border-r
              border-gray-200
              flex
              flex-col
              overflow-hidden
            "
          >

            {/* Navigation */}

            <nav className="flex-1 min-h-0 px-4 py-7">

              <p className="founder-mono text-[10px] text-gray-400 uppercase mb-4 px-2">
                Workspace
              </p>

              <div className="space-y-1">

                {NAV_ITEMS.map((item) => {

                  const Icon = item.icon;

                  return (
                    <NavLink
                      key={item.key}
                      to={`/founder/${item.key}`}
                      className={({ isActive }) =>
                        `
                        flex
                        items-center
                        gap-3
                        px-3
                        py-2.5
                        rounded-lg
                        text-sm
                        font-medium
                        transition-all
                        ${
                          isActive
                            ? "bg-[#071014] text-white shadow-sm"
                            : "text-gray-500 hover:bg-gray-200/70 hover:text-gray-900"
                        }
                        `
                      }
                    >

                      <Icon
                        size={17}
                        strokeWidth={1.9}
                        className="shrink-0"
                      />

                      <span>
                        {item.label}
                      </span>

                    </NavLink>
                  );

                })}

              </div>


              {/* Divider */}

              <div className="my-7 border-t border-gray-200" />


              {/* Founder information */}

              <p className="founder-mono text-[10px] text-gray-400 uppercase mb-4 px-2">
                Your workspace
              </p>

              <div className="px-3">

                <div className="flex items-center gap-3">

                  <div className="w-9 h-9 rounded-full bg-[#075b76] flex items-center justify-center text-white text-xs font-bold shrink-0">
                    FD
                  </div>

                  <div className="min-w-0">

                    <p className="text-sm font-semibold text-gray-800 truncate">
                      Founder
                    </p>

                    <p className="text-xs text-gray-400 truncate">
                      Product owner
                    </p>

                  </div>

                </div>

              </div>

            </nav>


            {/* Sidebar footer */}

            <div className="shrink-0 px-5 py-5 border-t border-gray-200">

              <p className="founder-mono text-[9px] text-gray-400 uppercase">
                Founder workspace
              </p>

              <p className="text-xs text-gray-400 mt-1">
                CaliFolio
              </p>

            </div>

          </aside>


          {/* =================================================
              MAIN CONTENT

              ONLY THIS AREA SCROLLS
          ================================================== */}

          <main
            className="
              founder-main
              flex-1
              min-w-0
              bg-[#f3f6f7]
            "
          >

            <div className="founder-content px-5 py-7 sm:px-7 lg:px-9 lg:py-8">

              <Outlet />

            </div>

          </main>

        </div>

      </div>
    </>
  );
}