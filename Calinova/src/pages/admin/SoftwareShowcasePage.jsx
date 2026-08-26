import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Search,
  ChevronRight,
  Sparkles,
  X,
  Users,
  UserPlus,
  UserMinus,
  MessageSquare,
} from "lucide-react";

const API_URL = "http://127.0.0.1:8000";
const BRAND = "#0097c1";

export default function SoftwareShowcasePage() {
  const navigate = useNavigate();

  // =========================================================
  // PRODUCTS
  // =========================================================

  const [query, setQuery] = useState("");
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // =========================================================
  // GUEST ACCESS
  // =========================================================

  const [showGuestModal, setShowGuestModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);

  const [guests, setGuests] = useState([]);
  const [assignedGuests, setAssignedGuests] = useState([]);

  const [guestLoading, setGuestLoading] = useState(false);
  const [guestError, setGuestError] = useState("");
  const [guestActionLoading, setGuestActionLoading] =
    useState(null);

  // =========================================================
  // LOAD PUBLISHED PRODUCTS
  // =========================================================

  useEffect(() => {
    loadPublishedProducts();
  }, []);

  async function loadPublishedProducts() {
    setLoading(true);
    setError("");

    try {
      const token = sessionStorage.getItem("access_token");

      if (!token) {
        throw new Error(
          "You are not authenticated. Please log in again."
        );
      }

      const res = await fetch(
        `${API_URL}/products/admin/published`,
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
          data.detail ||
            "Failed to load published products."
        );
      }

      setProducts(data);
    } catch (err) {
      console.error(
        "Failed to load published products:",
        err
      );

      setError(
        err.message ||
          "Something went wrong while loading products."
      );
    } finally {
      setLoading(false);
    }
  }

  // =========================================================
  // STAGE LABEL
  // =========================================================

  function formatStage(stage) {
    const stages = {
      ideation: "Ideation",
      in_development: "In Development",
      ready: "Ready",
    };

    return stages[stage] || stage || "Unknown";
  }

  // =========================================================
  // ORIGIN LABEL
  // =========================================================

  function formatOrigin(origin) {
    const origins = {
      in_house: "In House",
      acquired: "Acquired",
      whitelabeled: "Whitelabeled",
      hosted: "Hosted",
    };

    return origins[origin] || origin || "Unknown";
  }

  // =========================================================
  // OPEN GUEST ACCESS MODAL
  // =========================================================

  function openGuestAccess(product) {
    setSelectedProduct(product);
    setShowGuestModal(true);
    setGuestError("");

    loadGuestAccess(product.id);
  }

  // =========================================================
  // CLOSE GUEST ACCESS MODAL
  // =========================================================

  function closeGuestAccess() {
    setShowGuestModal(false);
    setSelectedProduct(null);
    setGuests([]);
    setAssignedGuests([]);
    setGuestError("");
    setGuestActionLoading(null);
  }

  // =========================================================
  // LOAD GUEST ACCESS
  // =========================================================

  async function loadGuestAccess(productId) {
    setGuestLoading(true);
    setGuestError("");

    try {
      const token = sessionStorage.getItem("access_token");

      if (!token) {
        throw new Error(
          "You are not authenticated."
        );
      }

      // =====================================================
      // GET ALL ACTIVE GUESTS
      // =====================================================

      const guestsRes = await fetch(
        `${API_URL}/products/admin/guests`,
        {
          method: "GET",
          headers: {
            Accept: "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const guestsData = await guestsRes.json();

      if (!guestsRes.ok) {
        throw new Error(
          guestsData.detail ||
            "Unable to load guests."
        );
      }

      // =====================================================
      // GET GUESTS ASSIGNED TO THIS PRODUCT
      // =====================================================

      const assignedRes = await fetch(
        `${API_URL}/products/admin/${productId}/guests`,
        {
          method: "GET",
          headers: {
            Accept: "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const assignedData = await assignedRes.json();

      if (!assignedRes.ok) {
        throw new Error(
          assignedData.detail ||
            "Unable to load product guest access."
        );
      }

      setGuests(guestsData);
      setAssignedGuests(assignedData);
    } catch (err) {
      console.error(
        "Failed to load guest access:",
        err
      );

      setGuestError(
        err.message ||
          "Unable to load guest access."
      );
    } finally {
      setGuestLoading(false);
    }
  }

  // =========================================================
  // CHECK IF GUEST IS ASSIGNED
  // =========================================================

  function isGuestAssigned(guestId) {
    return assignedGuests.some(
      (guest) => guest.id === guestId
    );
  }

  // =========================================================
  // ASSIGN GUEST
  // =========================================================

  async function assignGuest(guestId) {
    if (!selectedProduct) {
      return;
    }

    setGuestActionLoading(guestId);
    setGuestError("");

    try {
      const token = sessionStorage.getItem("access_token");

      if (!token) {
        throw new Error(
          "You are not authenticated."
        );
      }

      const res = await fetch(
        `${API_URL}/products/admin/${selectedProduct.id}/assign-guest/${guestId}`,
        {
          method: "POST",
          headers: {
            Accept: "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await res.json();

      if (!res.ok) {
        throw new Error(
          data.detail ||
            "Unable to assign guest."
        );
      }

      await loadGuestAccess(
        selectedProduct.id
      );
    } catch (err) {
      console.error(
        "Failed to assign guest:",
        err
      );

      setGuestError(
        err.message ||
          "Unable to assign guest."
      );
    } finally {
      setGuestActionLoading(null);
    }
  }

  // =========================================================
  // REMOVE GUEST
  // =========================================================

  async function removeGuest(guestId) {
    if (!selectedProduct) {
      return;
    }

    setGuestActionLoading(guestId);
    setGuestError("");

    try {
      const token = sessionStorage.getItem("access_token");

      if (!token) {
        throw new Error(
          "You are not authenticated."
        );
      }

      const res = await fetch(
        `${API_URL}/products/admin/${selectedProduct.id}/assign-guest/${guestId}`,
        {
          method: "DELETE",
          headers: {
            Accept: "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await res.json();

      if (!res.ok) {
        throw new Error(
          data.detail ||
            "Unable to remove guest access."
        );
      }

      await loadGuestAccess(
        selectedProduct.id
      );
    } catch (err) {
      console.error(
        "Failed to remove guest:",
        err
      );

      setGuestError(
        err.message ||
          "Unable to remove guest access."
      );
    } finally {
      setGuestActionLoading(null);
    }
  }

  // =========================================================
  // SEARCH
  // =========================================================

  const filteredProducts = products.filter(
    (product) => {
      const search = query.toLowerCase().trim();

      if (!search) {
        return true;
      }

      return (
        product.name
          ?.toLowerCase()
          .includes(search) ||
        product.one_liner
          ?.toLowerCase()
          .includes(search) ||
        product.company
          ?.toLowerCase()
          .includes(search)
      );
    }
  );

  // =========================================================
  // RENDER
  // =========================================================

  return (
    <>
      <div>

        {/* =====================================================
            PAGE HEADER
        ===================================================== */}

        <div className="flex items-center justify-between mb-6">

          <div>
            <h2 className="cf-display font-bold text-2xl text-black">
              Software Showcase
            </h2>

            <p className="text-sm text-gray-500 mt-1">
              View the software products currently
              published in your portfolio.
            </p>
          </div>

        </div>


        {/* =====================================================
            SEARCH
        ===================================================== */}

        <div className="relative w-64 mb-6">

          <Search
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
          />

          <input
            value={query}
            onChange={(e) =>
              setQuery(e.target.value)
            }
            placeholder="Search products..."
            style={{
              "--tw-ring-color": BRAND,
            }}
            className="pl-9 pr-4 py-2.5 w-full rounded-lg border border-gray-200 bg-white text-sm focus:outline-none focus:ring-2"
          />

        </div>


        {/* =====================================================
            LOADING
        ===================================================== */}

        {loading && (
          <div className="py-12 text-center">

            <p className="text-sm text-gray-500">
              Loading published products...
            </p>

          </div>
        )}


        {/* =====================================================
            ERROR
        ===================================================== */}

        {!loading && error && (
          <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}


        {/* =====================================================
            PRODUCTS
        ===================================================== */}

        {!loading &&
          !error &&
          filteredProducts.length > 0 && (

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">

              {filteredProducts.map((product) => (

                <article
                  key={product.id}
                  className="
                    group
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
                      PREMIUM PRODUCT THUMBNAIL
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
                          <Sparkles
                            size={27}
                            strokeWidth={1.5}
                            className="text-white/60"
                          />
                        </div>

                      </div>

                    )}


                    {/* Dark image overlay */}

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


                    {/* Top highlight */}

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


                    {/* Stage badge */}

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
                          text-white/90
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

                        {formatStage(product.stage)}

                      </span>

                    </div>


                    {/* Version */}

                    <div className="absolute bottom-4 right-4">

                      <span
                        className="
                          font-mono
                          text-[10px]
                          tracking-[0.08em]
                          text-white/70
                        "
                      >
                        {product.version
                          ? `v${product.version}`
                          : "NO VERSION"}
                      </span>

                    </div>


                    {/* Hover arrow */}

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
                      <ChevronRight
                        size={17}
                        strokeWidth={1.8}
                        className="
                          transition-transform
                          duration-200
                          group-hover:translate-x-0.5
                        "
                      />
                    </div>

                  </div>


                  {/* =================================================
                      CARD CONTENT
                  ================================================= */}

                  <div className="p-5">

                    {/* Product name */}

                    <div className="flex items-start justify-between gap-4">

                      <div className="min-w-0">

                        <h3
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
                        </h3>

                      </div>

                    </div>


                    {/* One liner */}

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
                      {product.one_liner ||
                        "No description available."}
                    </p>


                    {/* Origin */}

                    <div
                      className="
                        mt-4
                        flex
                        min-h-[27px]
                        flex-wrap
                        gap-1.5
                      "
                    >

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
                          {formatOrigin(product.origin)}
                        </span>
                      )}

                    </div>


                    {/* Divider */}

                    <div className="mt-5 border-t border-[#E9EEF0] pt-4">

                      {/* View details */}

                      <button
                        type="button"
                        onClick={() =>
                          navigate(
                            `/admin/software/${product.id}`
                          )
                        }
                        className="
                          flex
                          w-full
                          items-center
                          justify-between
                          rounded-lg
                          px-1
                          py-1
                          text-left
                          text-[11px]
                          font-medium
                          text-[#687780]
                          transition-colors
                          duration-200
                          hover:text-[#006F8D]
                        "
                      >

                        <span
                          className="
                            font-mono
                            text-[9px]
                            font-medium
                            tracking-[0.16em]
                            uppercase
                          "
                        >
                          View product
                        </span>

                        <span className="flex items-center gap-1">

                          Details

                          <ChevronRight
                            size={13}
                            strokeWidth={1.8}
                            className="
                              transition-transform
                              group-hover:translate-x-0.5
                            "
                          />

                        </span>

                      </button>


                      {/* Manage guest access */}

                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          openGuestAccess(product);
                        }}
                        className="
                          mt-3
                          flex
                          w-full
                          items-center
                          justify-center
                          gap-2
                          rounded-lg
                          border
                          border-[#DCE3E6]
                          bg-[#F5F7F8]
                          px-3
                          py-2.5
                          text-[11px]
                          font-medium
                          text-[#46555E]
                          transition-all
                          duration-200
                          hover:border-[#0097c1]
                          hover:bg-white
                          hover:text-[#006F8D]
                        "
                      >

                        <Users
                          size={14}
                          strokeWidth={1.8}
                        />

                        Manage Guest Access

                      </button>

                      {/* Q&A */}

<button
  type="button"
  onClick={(e) => {
    e.stopPropagation();

    navigate(
      `/admin/software/${product.id}/questions`
    );
  }}
  className="
    mt-2.5
    flex
    w-full
    items-center
    justify-center
    gap-2
    rounded-lg
    border
    border-[#DCE3E6]
    bg-white
    px-3
    py-2.5
    text-[11px]
    font-medium
    text-[#46555E]
    transition-all
    duration-200
    hover:border-[#0097c1]
    hover:bg-[#F7FCFD]
    hover:text-[#006F8D]
  "
>
  <MessageSquare
    size={14}
    strokeWidth={1.8}
  />

  Q&A
</button>

                    </div>

                  </div>

                </article>

              ))}

            </div>
          )}


        {/* =====================================================
            EMPTY STATE
        ===================================================== */}

        {!loading &&
          !error &&
          filteredProducts.length === 0 && (

            <div className="bg-white border border-gray-200 rounded-xl p-10 text-center">

              <div
                className="mx-auto w-12 h-12 rounded-full flex items-center justify-center"
                style={{
                  backgroundColor:
                    "rgba(0,151,193,0.08)",
                }}
              >
                <Sparkles
                  size={21}
                  style={{
                    color: BRAND,
                  }}
                />
              </div>

              <h3 className="mt-4 text-sm font-semibold text-gray-800">
                {query
                  ? "No products found"
                  : "No published products"}
              </h3>

              <p className="text-sm text-gray-500 mt-1">
                {query
                  ? `No published products match "${query}".`
                  : "Products will appear here after they are approved and published."}
              </p>

            </div>
          )}

      </div>


      {/* =======================================================
          GUEST ACCESS MODAL
      ======================================================= */}

      {showGuestModal && (

        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4"
          onClick={closeGuestAccess}
        >

          <div
            className="w-full max-w-lg overflow-hidden rounded-2xl border border-[#E5E1D8] bg-white shadow-2xl"
            onClick={(e) =>
              e.stopPropagation()
            }
          >

            {/* =================================================
                MODAL HEADER
            ================================================= */}

            <div className="flex items-start justify-between border-b border-[#EEEAE1] px-6 py-5">

              <div className="min-w-0">

                <div className="flex items-center gap-2">

                  <div
                    className="flex h-8 w-8 items-center justify-center rounded-lg"
                    style={{
                      backgroundColor:
                        "rgba(0,151,193,0.08)",
                    }}
                  >
                    <Users
                      size={16}
                      style={{
                        color: BRAND,
                      }}
                    />
                  </div>

                  <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-[#9B968A]">
                    Guest Access
                  </p>

                </div>

                <h2 className="mt-3 text-lg font-semibold text-[#1C1B19]">
                  Manage Guest Access
                </h2>

                {selectedProduct && (
                  <p className="mt-1 text-sm text-[#6B6A63]">
                    {selectedProduct.name}
                  </p>
                )}

              </div>


              <button
                type="button"
                onClick={closeGuestAccess}
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[#8B8C99] transition hover:bg-[#F5F3EE] hover:text-[#1C1B19]"
              >
                <X size={17} />
              </button>

            </div>


            {/* =================================================
                MODAL CONTENT
            ================================================= */}

            <div className="max-h-[60vh] overflow-y-auto px-6 py-5">

              {/* Error */}

              {guestError && (
                <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3">

                  <p className="text-sm text-red-700">
                    {guestError}
                  </p>

                </div>
              )}


              {/* Loading */}

              {guestLoading ? (

                <div className="space-y-3">

                  {Array.from({
                    length: 4,
                  }).map((_, index) => (

                    <div
                      key={index}
                      className="flex items-center justify-between rounded-lg border border-[#EEEAE1] p-4"
                    >

                      <div className="space-y-2">

                        <div className="h-4 w-32 animate-pulse rounded bg-[#F1EFE9]" />

                        <div className="h-3 w-44 animate-pulse rounded bg-[#F1EFE9]" />

                      </div>

                      <div className="h-8 w-20 animate-pulse rounded bg-[#F1EFE9]" />

                    </div>

                  ))}

                </div>

              ) : guests.length === 0 ? (

                /* =================================================
                   NO GUESTS
                ================================================= */

                <div className="py-10 text-center">

                  <div
                    className="mx-auto flex h-12 w-12 items-center justify-center rounded-full"
                    style={{
                      backgroundColor:
                        "rgba(0,151,193,0.08)",
                    }}
                  >
                    <Users
                      size={20}
                      style={{
                        color: BRAND,
                      }}
                    />
                  </div>

                  <p className="mt-4 text-sm font-medium text-[#1C1B19]">
                    No guests available
                  </p>

                  <p className="mt-1 text-sm text-[#8B8C99]">
                    There are currently no active
                    guest accounts.
                  </p>

                </div>

              ) : (

                /* =================================================
                   GUEST LIST
                ================================================= */

                <div className="space-y-2">

                  {guests.map((guest) => {

                    const assigned =
                      isGuestAssigned(
                        guest.id
                      );

                    const actionLoading =
                      guestActionLoading ===
                      guest.id;

                    return (

                      <div
                        key={guest.id}
                        className="flex items-center justify-between gap-4 rounded-lg border border-[#E5E1D8] px-4 py-3"
                      >

                        {/* Guest information */}

                        <div className="min-w-0">

                          <div className="flex items-center gap-2">

                            <p className="truncate text-sm font-medium text-[#1C1B19]">
                              {guest.full_name}
                            </p>

                            {assigned && (
                              <span className="shrink-0 rounded-full bg-green-50 px-2 py-0.5 font-mono text-[9px] uppercase tracking-wide text-green-700">
                                Assigned
                              </span>
                            )}

                          </div>

                          <p className="truncate text-xs text-[#8B8C99]">
                            {guest.email}
                          </p>

                        </div>


                        {/* Action */}

                        {assigned ? (

                          <button
                            type="button"
                            disabled={
                              actionLoading
                            }
                            onClick={() =>
                              removeGuest(
                                guest.id
                              )
                            }
                            className="flex shrink-0 items-center gap-1.5 rounded-md border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-medium text-red-700 transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-50"
                          >

                            <UserMinus
                              size={13}
                            />

                            {actionLoading
                              ? "Removing..."
                              : "Remove"}

                          </button>

                        ) : (

                          <button
                            type="button"
                            disabled={
                              actionLoading
                            }
                            onClick={() =>
                              assignGuest(
                                guest.id
                              )
                            }
                            className="flex shrink-0 items-center gap-1.5 rounded-md border border-[#DDD9CE] bg-[#FAF9F6] px-3 py-1.5 text-xs font-medium text-[#1C1B19] transition hover:border-[#C6A15B] hover:bg-white disabled:cursor-not-allowed disabled:opacity-50"
                          >

                            <UserPlus
                              size={13}
                            />

                            {actionLoading
                              ? "Assigning..."
                              : "Assign"}

                          </button>

                        )}

                      </div>

                    );
                  })}

                </div>

              )}

            </div>


            {/* =================================================
                MODAL FOOTER
            ================================================= */}

            <div className="flex items-center justify-between border-t border-[#EEEAE1] bg-[#FAF9F6] px-6 py-4">

              <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-[#9B968A]">

                {assignedGuests.length}{" "}

                {assignedGuests.length === 1
                  ? "guest has"
                  : "guests have"}{" "}

                access

              </p>


              <button
                type="button"
                onClick={closeGuestAccess}
                className="rounded-md bg-[#1C1B19] px-4 py-2 text-sm font-medium text-white transition hover:bg-[#14151C]"
              >
                Done
              </button>

            </div>

          </div>

        </div>

      )}

    </>
  );
}