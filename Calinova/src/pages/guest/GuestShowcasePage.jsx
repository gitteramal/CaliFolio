import React, { useEffect, useState } from "react";
import {
  ArrowUpRight,
  Boxes,
  MessageCircle,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

const API_URL = "http://127.0.0.1:8000";

export default function GuestShowcasePage() {
  const navigate = useNavigate();

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchPublishedProducts();
  }, []);

  async function fetchPublishedProducts() {
    try {
      setLoading(true);
      setError("");

      const token = sessionStorage.getItem("access_token");

      if (!token) {
        throw new Error("You are not authenticated.");
      }

      const res = await fetch(
        `${API_URL}/products/guest/published`,
        {
          method: "GET",
          headers: {
            Accept: "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await res.json();

      if (!res.ok) {
        throw new Error(
          data.detail || "Unable to load products."
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

  function openProduct(productId) {
    navigate(`/guest/software/${productId}`);
  }

  function openProductQA(productId, e) {
  e.stopPropagation();

  navigate(`/guest/software/${productId}/qa`);
}

  return (
    <div className="w-full">

      {/* =====================================================
          HEADER
      ===================================================== */}

      <div className="mb-8">

        <div className="flex items-center gap-2 text-[#82909A]">
          <Boxes
            size={15}
            strokeWidth={1.8}
          />

          <span
            className="
              font-mono
              text-[10px]
              tracking-[0.22em]
              uppercase
            "
          >
            Software Showcase
          </span>
        </div>


        <div className="mt-3 flex items-end justify-between gap-6">

          <div>

            <h1
              className="
                text-3xl
                font-semibold
                tracking-[-0.025em]
                text-[#111B26]
              "
            >
              Software Showcase
            </h1>

            <p
              className="
                mt-2
                text-sm
                leading-6
                text-[#687780]
              "
            >
              Explore the software products curated for you.
            </p>

          </div>


          {!loading && !error && (
            <div className="hidden sm:block">

              <span
                className="
                  font-mono
                  text-[10px]
                  tracking-[0.18em]
                  text-[#8A969E]
                "
              >
                {products.length}{" "}
                {products.length === 1
                  ? "PRODUCT"
                  : "PRODUCTS"}
              </span>

            </div>
          )}

        </div>

      </div>


      {/* =====================================================
          ERROR
      ===================================================== */}

      {error && (
        <div
          className="
            mb-6
            rounded-xl
            border
            border-red-200
            bg-red-50
            px-5
            py-4
          "
        >
          <p className="text-sm text-red-700">
            {error}
          </p>
        </div>
      )}


      {/* =====================================================
          LOADING
      ===================================================== */}

      {loading && (
        <div
          className="
            grid
            grid-cols-1
            gap-5
            md:grid-cols-2
            xl:grid-cols-3
          "
        >

          {Array.from({ length: 6 }).map((_, index) => (
            <div
              key={index}
              className="
                overflow-hidden
                rounded-2xl
                border
                border-[#DCE3E6]
                bg-white
              "
            >

              {/* Dark thumbnail skeleton */}

              <div
                className="
                  h-[205px]
                  animate-pulse
                  bg-[#0A171B]
                "
              />

              <div className="space-y-4 p-5">

                <div
                  className="
                    h-5
                    w-2/3
                    animate-pulse
                    rounded
                    bg-[#E9EEF0]
                  "
                />

                <div
                  className="
                    h-4
                    w-full
                    animate-pulse
                    rounded
                    bg-[#E9EEF0]
                  "
                />

                <div
                  className="
                    h-4
                    w-4/5
                    animate-pulse
                    rounded
                    bg-[#E9EEF0]
                  "
                />

              </div>

            </div>
          ))}

        </div>
      )}


      {/* =====================================================
          EMPTY STATE
      ===================================================== */}

      {!loading && !error && products.length === 0 && (
        <div
          className="
            flex
            min-h-[420px]
            items-center
            justify-center
            rounded-2xl
            border
            border-dashed
            border-[#D4DDE0]
            bg-[#F8FAFA]
          "
        >

          <div className="text-center">

            <div
              className="
                mx-auto
                flex
                h-12
                w-12
                items-center
                justify-center
                rounded-full
                border
                border-[#D9E1E4]
                bg-white
              "
            >
              <Boxes
                size={20}
                strokeWidth={1.7}
                className="text-[#84929A]"
              />
            </div>

            <h2
              className="
                mt-4
                text-lg
                font-semibold
                text-[#111B26]
              "
            >
              No products available
            </h2>

            <p
              className="
                mt-2
                max-w-sm
                text-sm
                leading-relaxed
                text-[#87939A]
              "
            >
              There are currently no published products
              assigned to your account.
            </p>

          </div>

        </div>
      )}


      {/* =====================================================
          PRODUCT GRID
      ===================================================== */}

      {!loading && !error && products.length > 0 && (
        <div
          className="
            grid
            grid-cols-1
            gap-5
            md:grid-cols-2
            xl:grid-cols-3
          "
        >

          {products.map((product) => (

            <article
              key={product.id}
              onClick={() => openProduct(product.id)}
              className="
                group
                cursor-pointer
                overflow-hidden
                rounded-2xl
                border
                border-[#DCE3E6]
                bg-white
                shadow-[0_2px_8px_rgba(15,23,42,0.04)]
                transition-all
                duration-300
                hover:-translate-y-1
                hover:border-[#C8D3D7]
                hover:shadow-[0_14px_35px_rgba(15,23,42,0.10)]
              "
            >

              {/* =================================================
                  THUMBNAIL
              ================================================= */}

              <div
                className="
                  relative
                  h-[205px]
                  overflow-hidden
                  bg-[#071519]
                "
              >

                {product.thumbnail_url ? (

                  <img
                    src={product.thumbnail_url}
                    alt={product.name}
                    className="
                      h-full
                      w-full
                      object-cover
                      transition-transform
                      duration-700
                      ease-out
                      group-hover:scale-[1.045]
                    "
                  />

                ) : (

                  <div
                    className="
                      flex
                      h-full
                      w-full
                      items-center
                      justify-center
                      bg-[radial-gradient(circle_at_center,#123F46_0%,#071519_55%,#040B0E_100%)]
                    "
                  >

                    <div
                      className="
                        flex
                        h-16
                        w-16
                        items-center
                        justify-center
                        rounded-2xl
                        border
                        border-white/10
                        bg-white/[0.06]
                        backdrop-blur-sm
                      "
                    >
                      <Boxes
                        size={27}
                        strokeWidth={1.5}
                        className="text-white/60"
                      />
                    </div>

                  </div>

                )}


                {/* =================================================
                    DARK GRADIENT
                ================================================= */}

                <div
                  className="
                    absolute
                    inset-0
                    bg-gradient-to-t
                    from-[#03090B]/90
                    via-[#061216]/20
                    to-transparent
                  "
                />


                {/* =================================================
                    TOP BORDER GLOW
                ================================================= */}

                <div
                  className="
                    absolute
                    left-0
                    right-0
                    top-0
                    h-px
                    bg-white/20
                  "
                />


                {/* =================================================
                    PUBLISHED BADGE
                ================================================= */}

                <div className="absolute left-4 top-4">

                  <span
                    className="
                      inline-flex
                      items-center
                      gap-1.5
                      rounded-md
                      border
                      border-white/20
                      bg-[#07171A]/75
                      px-2.5
                      py-1.5
                      font-mono
                      text-[9px]
                      font-medium
                      tracking-[0.12em]
                      text-white/85
                      backdrop-blur-md
                    "
                  >

                    <span
                      className="
                        h-1.5
                        w-1.5
                        rounded-full
                        bg-[#49D7C4]
                        shadow-[0_0_7px_rgba(73,215,196,0.7)]
                      "
                    />

                    PUBLISHED

                  </span>

                </div>


                {/* =================================================
                    VERSION
                ================================================= */}

                {product.version && (
                  <div
                    className="
                      absolute
                      bottom-4
                      right-4
                    "
                  >

                    <span
                      className="
                        font-mono
                        text-[10px]
                        tracking-[0.08em]
                        text-white/65
                      "
                    >
                      v{product.version}
                    </span>

                  </div>
                )}


                {/* =================================================
                    OPEN BUTTON
                ================================================= */}

                <div
                  className="
                    absolute
                    right-4
                    top-4
                    flex
                    h-9
                    w-9
                    items-center
                    justify-center
                    rounded-full
                    border
                    border-white/20
                    bg-black/30
                    text-white
                    opacity-0
                    backdrop-blur-md
                    transition-all
                    duration-200
                    group-hover:opacity-100
                  "
                >

                  <ArrowUpRight
                    size={16}
                    strokeWidth={1.8}
                    className="
                      transition-transform
                      duration-200
                      group-hover:-translate-y-0.5
                      group-hover:translate-x-0.5
                    "
                  />

                </div>

              </div>


              {/* =================================================
                  CONTENT
              ================================================= */}

              <div className="p-5">

                {/* PRODUCT NAME */}

                <div
                  className="
                    flex
                    items-start
                    justify-between
                    gap-4
                  "
                >

                  <div className="min-w-0">

                    <h2
                      className="
                        truncate
                        text-[18px]
                        font-semibold
                        tracking-[-0.015em]
                        text-[#111B26]
                        transition-colors
                        duration-200
                        group-hover:text-[#006F8D]
                      "
                    >
                      {product.name}
                    </h2>

                  </div>


                  <ArrowUpRight
                    size={17}
                    strokeWidth={1.7}
                    className="
                      mt-0.5
                      shrink-0
                      text-[#9AA6AD]
                      transition-all
                      duration-200
                      group-hover:-translate-y-0.5
                      group-hover:translate-x-0.5
                      group-hover:text-[#111B26]
                    "
                  />

                </div>


                {/* =================================================
                    ONE LINER
                ================================================= */}

                {product.one_liner && (
                  <p
                    className="
                      mt-3
                      line-clamp-2
                      min-h-[42px]
                      text-[13px]
                      leading-[1.65]
                      text-[#687780]
                    "
                  >
                    {product.one_liner}
                  </p>
                )}


                {/* =================================================
                    TAGS
                ================================================= */}

                <div
                  className="
                    mt-4
                    flex
                    min-h-[27px]
                    flex-wrap
                    gap-1.5
                  "
                >

                  {product.stage && (
                    <span
                      className="
                        rounded-md
                        border
                        border-[#DCE3E6]
                        bg-[#F5F7F8]
                        px-2.5
                        py-1
                        text-[10px]
                        font-medium
                        text-[#64737C]
                      "
                    >
                      {product.stage}
                    </span>
                  )}

                  {product.origin && (
                    <span
                      className="
                        rounded-md
                        border
                        border-[#DCE3E6]
                        bg-[#F5F7F8]
                        px-2.5
                        py-1
                        text-[10px]
                        font-medium
                        text-[#64737C]
                      "
                    >
                      {product.origin}
                    </span>
                  )}

                </div>


                {/* =================================================
                    FOOTER
                ================================================= */}

{/* =================================================
    FOOTER
================================================= */}

<div
  className="
    mt-5
    border-t
    border-[#E9EEF0]
    pt-4
  "
>

  <div className="flex items-center justify-between gap-3">

    {/* View Product */}

    <button
      type="button"
      onClick={(e) => {
        e.stopPropagation();
        openProduct(product.id);
      }}
      className="
        flex
        items-center
        gap-1
        rounded-md
        px-1
        py-1
        font-mono
        text-[9px]
        font-medium
        tracking-[0.16em]
        uppercase
        text-[#8A969E]
        transition-colors
        duration-200
        hover:text-[#111B26]
      "
    >
      View product

      <ArrowUpRight
        size={12}
        strokeWidth={1.8}
      />
    </button>


    {/* Q&A */}

    <button
      type="button"
      onClick={(e) =>
        openProductQA(product.id, e)
      }
      className="
        inline-flex
        items-center
        gap-2
        rounded-lg
        border
        border-[#DCE3E6]
        bg-[#F8FAFA]
        px-3
        py-2
        text-[11px]
        font-medium
        text-[#46555E]
        transition-all
        duration-200
        hover:border-[#0097C1]
        hover:bg-white
        hover:text-[#006F8D]
      "
    >

      <MessageCircle
        size={14}
        strokeWidth={1.8}
      />

      Q&A

    </button>

  </div>

</div>

              </div>

            </article>

          ))}

        </div>
      )}

    </div>
  );
}