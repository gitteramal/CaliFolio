import React, { useEffect, useState } from "react";
import { Boxes, ChevronRight, ArrowUpRight } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function FounderOverviewPage() {
  const navigate = useNavigate();

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchMyProducts();
  }, []);

  async function fetchMyProducts() {
    try {
      setLoading(true);
      setError("");

      const token = localStorage.getItem("access_token");

      if (!token) {
        throw new Error("You are not logged in.");
      }

      const res = await fetch(
        "http://127.0.0.1:8000/products/founder/my-products",
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
          },
        }
      );

      const data = await res.json();

      if (!res.ok) {
        throw new Error(
          data.detail || "Failed to load your products."
        );
      }

      setProducts(data);
    } catch (err) {
      setError(
        err.message || "Something went wrong."
      );
    } finally {
      setLoading(false);
    }
  }

  // =========================================================
  // HELPERS
  // =========================================================

  function formatStage(stage) {
    const stages = {
      ideation: "Ideation",
      in_development: "In Development",
      ready: "Ready",
    };

    return stages[stage] || stage || "—";
  }

  function formatOrigin(origin) {
    const origins = {
      in_house: "In-house",
      acquired: "Acquired",
      whitelabelled: "White-labeled",
      whitelabeled: "White-labeled",
      hosted: "Hosted",
    };

    return origins[origin] || origin || "—";
  }

  function formatStatus(status) {
    if (!status) return "DRAFT";

    return String(status)
      .replace(/_/g, " ")
      .toUpperCase();
  }

  // Get founder name from localStorage
  const founderName = localStorage.getItem("full_name") || "Founder";

  return (
    <div className="w-full">

      {/* =====================================================
          PAGE HEADER - Professional Version
      ===================================================== */}

      <div className="mb-8">

        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-5">

          <div>

            <div className="flex items-center gap-2 mb-2">

              <span className="w-1.5 h-1.5 rounded-full bg-[#0097c1]" />

              <p className="cf-mono text-[10px] uppercase tracking-[0.18em] text-gray-400">
                Portfolio Management
              </p>

            </div>

            <h1 className="cf-display font-bold text-[26px] sm:text-[30px] tracking-[-0.025em] text-gray-950">
              Product Dashboard
            </h1>

            <p className="text-[14px] sm:text-[15px] text-gray-500 mt-2">
              Welcome back, <span className="font-semibold text-gray-700">{founderName}</span> • 
              Manage and track your assigned product portfolio
            </p>

          </div>

          {/* Product count */}

          {!loading && !error && (
            <div
              className="
                self-start
                sm:self-auto
                inline-flex
                items-center
                gap-2
                px-3.5
                py-2
                rounded-lg
                bg-white
                border
                border-gray-200
                shadow-[0_2px_8px_rgba(15,23,42,0.04)]
              "
            >
              <Boxes
                size={16}
                className="text-[#0097c1]"
                strokeWidth={2}
              />

              <span className="text-[13px] font-semibold text-gray-700">
                {products.length} product{products.length !== 1 ? "s" : ""}
              </span>
            </div>
          )}

        </div>

      </div>


      {/* =====================================================
          LOADING
      ===================================================== */}

      {loading && (
        <div
          className="
            bg-white
            border
            border-gray-200
            rounded-xl
            p-10
            shadow-[0_2px_8px_rgba(15,23,42,0.04)]
          "
        >

          <div className="flex flex-col items-center justify-center text-center">

            <div
              className="
                w-11
                h-11
                rounded-full
                border-2
                border-gray-200
                border-t-[#0097c1]
                animate-spin
                mb-4
              "
            />

            <p className="text-[14px] font-medium text-gray-700">
              Loading your portfolio...
            </p>

            <p className="text-[12px] text-gray-400 mt-1">
              Please wait while we retrieve your products.
            </p>

          </div>

        </div>
      )}


      {/* =====================================================
          ERROR
      ===================================================== */}

      {!loading && error && (
        <div
          className="
            bg-white
            border
            border-red-200
            rounded-xl
            p-6
            shadow-[0_2px_8px_rgba(15,23,42,0.04)]
          "
        >

          <div className="flex items-start gap-3">

            <div
              className="
                w-9
                h-9
                shrink-0
                rounded-lg
                bg-red-50
                border
                border-red-100
                flex
                items-center
                justify-center
              "
            >
              <span className="text-red-500 text-sm font-bold">
                !
              </span>
            </div>

            <div>

              <p className="text-[14px] font-semibold text-gray-900">
                Unable to load your portfolio
              </p>

              <p className="text-[13px] text-red-600 mt-1">
                {error}
              </p>

            </div>

          </div>

        </div>
      )}


      {/* =====================================================
          PRODUCTS
      ===================================================== */}

      {!loading && !error && (
        <>

          {/* =================================================
              SECTION HEADER
          ================================================= */}

          <div className="flex items-end justify-between mb-4">

            <div>

              <p
                className="
                  cf-mono
                  text-[10px]
                  uppercase
                  tracking-[0.18em]
                  font-medium
                  text-gray-400
                "
              >
                Product Catalog
              </p>

              <h2 className="cf-display text-[20px] sm:text-[21px] font-bold tracking-[-0.02em] text-gray-900 mt-1">
                Assigned Products
              </h2>

              <p className="text-[13px] sm:text-[14px] text-gray-500 mt-1">
                Review and update product details for your assigned portfolio
              </p>

            </div>

          </div>


          {/* =================================================
              EMPTY STATE
          ================================================= */}

          {products.length === 0 ? (

            <div
              className="
                relative
                overflow-hidden
                bg-white
                rounded-xl
                border
                border-gray-200
                shadow-[0_2px_8px_rgba(15,23,42,0.04)]
              "
            >

              {/* top accent */}

              <div className="h-1 bg-[#0097c1]" />

              <div className="p-12 text-center">

                <div
                  className="
                    w-14
                    h-14
                    mx-auto
                    rounded-xl
                    bg-[#0097c1]/10
                    border
                    border-[#0097c1]/10
                    flex
                    items-center
                    justify-center
                    mb-5
                  "
                >

                  <Boxes
                    size={25}
                    className="text-[#0097c1]"
                    strokeWidth={1.8}
                  />

                </div>

                <h3 className="cf-display text-[17px] font-bold text-gray-900">
                  No products assigned
                </h3>

                <p className="text-[13px] sm:text-[14px] text-gray-500 mt-2 max-w-md mx-auto leading-6">
                  Your CaliFolio administrator hasn't assigned
                  any products to you yet.
                </p>

              </div>

            </div>

          ) : (

            /* =================================================
               PRODUCT GRID
            ================================================= */

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">

              {products.map((product) => (

                <div
                  key={product.id}
                  className="
                    group
                    relative
                    overflow-hidden
                    bg-white
                    rounded-xl
                    border
                    border-gray-200
                    shadow-[0_2px_8px_rgba(15,23,42,0.04)]
                    hover:border-gray-300
                    hover:shadow-[0_8px_24px_rgba(15,23,42,0.08)]
                    transition-all
                    duration-200
                  "
                >

                  {/* =================================================
                      PRODUCT TOP AREA
                  ================================================= */}

                  <div
                    className="
                      relative
                      h-[108px]
                      overflow-hidden
                      bg-[#061114]
                    "
                  >

                    {/* Gradient */}

                    <div
                      className="
                        absolute
                        inset-0
                        bg-gradient-to-br
                        from-[#17494c]
                        via-[#09191c]
                        to-[#050b0d]
                      "
                    />

                    {/* Decorative circle */}

                    <div
                      className="
                        absolute
                        -right-10
                        -top-16
                        w-40
                        h-40
                        rounded-full
                        border
                        border-white/[0.06]
                      "
                    />

                    {/* Decorative line */}

                    <div
                      className="
                        absolute
                        right-[-35px]
                        top-[45px]
                        w-[180px]
                        h-px
                        bg-white/[0.06]
                        rotate-[25deg]
                      "
                    />

                    <div className="relative h-full flex items-center justify-between px-5">

                      {/* Product icon */}

                      <div
                        className="
                          w-11
                          h-11
                          rounded-lg
                          bg-white/[0.08]
                          border
                          border-white/[0.12]
                          backdrop-blur-sm
                          flex
                          items-center
                          justify-center
                        "
                      >

                        <Boxes
                          size={20}
                          className="text-[#a0d9d4]"
                          strokeWidth={1.8}
                        />

                      </div>


                      {/* Status */}

                      <span
                        className="
                          inline-flex
                          items-center
                          gap-1.5
                          rounded-md
                          bg-black/20
                          border
                          border-white/[0.12]
                          px-2.5
                          py-1.5
                          text-[9px]
                          font-semibold
                          tracking-[0.08em]
                          text-[#b9ded9]
                        "
                      >

                        <span className="w-1.5 h-1.5 rounded-full bg-[#5ee4c7]" />

                        {formatStatus(product.status)}

                      </span>

                    </div>

                  </div>


                  {/* =================================================
                      PRODUCT BODY
                  ================================================= */}

                  <div className="p-5">

                    {/* Name */}

                    <div className="flex items-start justify-between gap-3">

                      <div className="min-w-0">

                        <h3
                          className="
                            cf-display
                            font-bold
                            text-[17px]
                            text-gray-950
                            tracking-[-0.015em]
                            truncate
                          "
                        >
                          {product.name}
                        </h3>

                        {product.version && (
                          <p className="cf-mono text-[10px] text-gray-400 mt-1">
                            v{product.version}
                          </p>
                        )}

                      </div>

                    </div>


                    {/* One liner */}

                    <div className="mt-4 min-h-[58px]">

                      {product.one_liner ? (
                        <p
                          className="
                            text-[13px]
                            leading-[1.65]
                            text-gray-600
                            line-clamp-3
                          "
                        >
                          {product.one_liner}
                        </p>
                      ) : (
                        <p className="text-[13px] text-gray-300">
                          No product description provided.
                        </p>
                      )}

                    </div>


                    {/* Divider */}

                    <div className="border-t border-gray-100 my-4" />


                    {/* Product information */}

                    <div className="space-y-2.5">

                      <FounderProductInfo
                        label="Stage"
                        value={formatStage(product.stage)}
                      />

                      <FounderProductInfo
                        label="Origin"
                        value={formatOrigin(product.origin)}
                      />

                    </div>


                    {/* Continue */}

                    <button
                      onClick={() =>
                        navigate(
                          `/founder/products/${product.id}`
                        )
                      }
                      className="
                        w-full
                        mt-5
                        flex
                        items-center
                        justify-between
                        px-3.5
                        py-2.5
                        rounded-lg
                        bg-[#071015]
                        hover:bg-[#162126]
                        text-white
                        transition-all
                        duration-200
                        group/button
                      "
                    >

                      <span className="text-[12px] font-semibold">
                        Continue product
                      </span>

                      <ArrowUpRight
                        size={15}
                        className="
                          text-gray-400
                          group-hover/button:text-white
                          transition-colors
                        "
                      />

                    </button>

                  </div>

                </div>

              ))}

            </div>

          )}

        </>
      )}

    </div>
  );
}


// =============================================================
// PRODUCT INFORMATION
// =============================================================

function FounderProductInfo({ label, value }) {
  return (
    <div className="flex items-center justify-between gap-4">

      <span
        className="
          text-[10px]
          uppercase
          tracking-[0.12em]
          font-medium
          text-gray-400
        "
      >
        {label}
      </span>

      <span
        className="
          text-[12px]
          font-semibold
          text-gray-700
          text-right
        "
      >
        {value || "—"}
      </span>

    </div>
  );
}