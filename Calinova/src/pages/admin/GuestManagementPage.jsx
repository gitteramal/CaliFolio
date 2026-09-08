import { useEffect, useState } from "react";
import {
  Check,
  CircleOff,
  PackageOpen,
  UsersRound,
  X,
  ToggleLeft,
  ToggleRight,
} from "lucide-react";

const API_URL = import.meta.env.VITE_API_URL;

function initials(name = "") {
  return name
    .split(" ")
    .filter(Boolean)
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export default function GuestManagementPage() {
  // =========================================================
  // GUESTS
  // =========================================================

  const [guests, setGuests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [updatingId, setUpdatingId] = useState(null);

  // =========================================================
  // GUEST ACCESS MODAL
  // =========================================================

  const [selectedGuest, setSelectedGuest] = useState(null);
  const [showAccessModal, setShowAccessModal] = useState(false);

  const [products, setProducts] = useState([]);
  const [accessLoading, setAccessLoading] = useState(false);
  const [accessError, setAccessError] = useState("");
  const [accessActionLoading, setAccessActionLoading] =
    useState(null);

  // =========================================================
  // LOAD GUESTS
  // =========================================================

  useEffect(() => {
    loadGuests();
  }, []);

  async function loadGuests() {
    setLoading(true);
    setError("");

    try {
      const token = sessionStorage.getItem("access_token");

      if (!token) {
        throw new Error(
          "You are not authenticated. Please log in again."
        );
      }

      const response = await fetch(
        `${API_URL}/users/guests`,
        {
          method: "GET",
          headers: {
            Accept: "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.detail || "Unable to load guests."
        );
      }

      setGuests(data);
    } catch (err) {
      console.error("Failed to load guests:", err);

      setError(
        err.message || "Unable to load guests."
      );
    } finally {
      setLoading(false);
    }
  }

  // =========================================================
  // ACTIVATE / DEACTIVATE GUEST
  // =========================================================

  async function toggleGuest(guest) {
    setUpdatingId(guest.id);
    setError("");

    try {
      const token = sessionStorage.getItem("access_token");

      if (!token) {
        throw new Error(
          "You are not authenticated. Please log in again."
        );
      }

      const response = await fetch(
        `${API_URL}/users/guests/${guest.id}/status`,
        {
          method: "PATCH",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            is_active: !guest.is_active,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.detail ||
            "Unable to update guest status."
        );
      }

      setGuests((current) =>
        current.map((item) =>
          item.id === guest.id
            ? {
                ...item,
                is_active: data.is_active,
              }
            : item
        )
      );

      // Keep selected guest synchronized if modal is open
      setSelectedGuest((current) => {
        if (!current || current.id !== guest.id) {
          return current;
        }

        return {
          ...current,
          is_active: data.is_active,
        };
      });
    } catch (err) {
      console.error(
        "Failed to update guest status:",
        err
      );

      setError(
        err.message ||
          "Unable to update guest status."
      );
    } finally {
      setUpdatingId(null);
    }
  }

  // =========================================================
  // OPEN GUEST ACCESS
  // =========================================================

  function openGuestAccess(guest) {
    setSelectedGuest(guest);
    setShowAccessModal(true);
    setAccessError("");

    loadGuestProducts(guest);
  }

  // =========================================================
  // CLOSE GUEST ACCESS
  // =========================================================

  function closeAccessModal() {
    setShowAccessModal(false);
    setSelectedGuest(null);
    setProducts([]);
    setAccessError("");
    setAccessActionLoading(null);
  }

  // =========================================================
  // LOAD PRODUCTS + CURRENT ACCESS
  // =========================================================

  async function loadGuestProducts(guest) {
    setAccessLoading(true);
    setAccessError("");

    try {
      const token = sessionStorage.getItem("access_token");

      if (!token) {
        throw new Error(
          "You are not authenticated. Please log in again."
        );
      }

      // -------------------------------------------------------
      // GET ALL PUBLISHED PRODUCTS
      // -------------------------------------------------------

      const productsResponse = await fetch(
        `${API_URL}/products/admin/published`,
        {
          method: "GET",
          headers: {
            Accept: "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const productsData =
        await productsResponse.json();

      if (!productsResponse.ok) {
        throw new Error(
          productsData.detail ||
            "Unable to load published products."
        );
      }

      // -------------------------------------------------------
      // PRODUCTS ALREADY ASSIGNED TO THIS GUEST
      // -------------------------------------------------------

      const assignedProductIds = new Set(
        (guest.products || []).map(
          (product) => product.id
        )
      );

      // -------------------------------------------------------
      // ADD hasAccess TO EVERY PRODUCT
      // -------------------------------------------------------

      const productsWithAccess =
        productsData.map((product) => ({
          ...product,
          hasAccess: assignedProductIds.has(
            product.id
          ),
        }));

      setProducts(productsWithAccess);
    } catch (err) {
      console.error(
        "Failed to load guest product access:",
        err
      );

      setAccessError(
        err.message ||
          "Unable to load guest access."
      );
    } finally {
      setAccessLoading(false);
    }
  }

  // =========================================================
  // TOGGLE PRODUCT ACCESS
  // =========================================================

  async function toggleProductAccess(product) {
    if (!selectedGuest) {
      return;
    }

    const actionKey = `${selectedGuest.id}-${product.id}`;

    setAccessActionLoading(actionKey);
    setAccessError("");

    try {
      const token =
        sessionStorage.getItem("access_token");

      if (!token) {
        throw new Error(
          "You are not authenticated. Please log in again."
        );
      }

      const currentlyHasAccess =
        product.hasAccess;

      const response = await fetch(
        `${API_URL}/products/admin/${product.id}/assign-guest/${selectedGuest.id}`,
        {
          method: currentlyHasAccess
            ? "DELETE"
            : "POST",
          headers: {
            Accept: "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.detail ||
            `Unable to ${
              currentlyHasAccess
                ? "remove"
                : "grant"
            } product access.`
        );
      }

      // -------------------------------------------------------
      // UPDATE MODAL PRODUCTS
      // -------------------------------------------------------

      setProducts((current) =>
        current.map((item) =>
          item.id === product.id
            ? {
                ...item,
                hasAccess: !currentlyHasAccess,
              }
            : item
        )
      );

      // -------------------------------------------------------
      // UPDATE MAIN GUEST TABLE
      // -------------------------------------------------------

      setGuests((currentGuests) =>
        currentGuests.map((guest) => {
          if (guest.id !== selectedGuest.id) {
            return guest;
          }

          const currentProducts =
            guest.products || [];

          return {
            ...guest,
            products: currentlyHasAccess
              ? currentProducts.filter(
                  (item) =>
                    item.id !== product.id
                )
              : [
                  ...currentProducts,
                  product,
                ],
          };
        })
      );

      // -------------------------------------------------------
      // UPDATE SELECTED GUEST
      // -------------------------------------------------------

      setSelectedGuest((currentGuest) => {
        if (!currentGuest) {
          return currentGuest;
        }

        const currentProducts =
          currentGuest.products || [];

        return {
          ...currentGuest,
          products: currentlyHasAccess
            ? currentProducts.filter(
                (item) =>
                  item.id !== product.id
              )
            : [
                ...currentProducts,
                product,
              ],
        };
      });
    } catch (err) {
      console.error(
        "Failed to update product access:",
        err
      );

      setAccessError(
        err.message ||
          "Unable to update product access."
      );
    } finally {
      setAccessActionLoading(null);
    }
  }

  // =========================================================
  // RENDER
  // =========================================================

  return (
    <>
      <section className="mx-auto max-w-[1440px]">

        {/* =====================================================
            PAGE HEADER
        ====================================================== */}

<div className="flex items-center justify-between mb-6">
  <div>
    <h2 className="cf-display font-bold text-2xl text-black">
      Guests &amp; access
    </h2>

    <p className="text-sm text-gray-500 mt-1">
      Review each guest’s product access and activate or deactivate their account.
    </p>
  </div>
</div>

        {/* =====================================================
            ERROR
        ====================================================== */}

        {error && (
          <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-[13px] text-red-700">
            {error}
          </div>
        )}

        {/* =====================================================
            GUEST TABLE
        ====================================================== */}

        <div className="overflow-hidden rounded-2xl border border-[#e1e7e9] bg-white shadow-[0_10px_25px_rgba(20,39,48,0.06)]">

          <div className="overflow-x-auto">

            <table className="w-full min-w-[720px] text-left">

              {/* =================================================
                  TABLE HEADER
              ================================================= */}

              <thead className="border-b border-[#dce4e7] bg-[#fbfcfc]">

                <tr className="cf-mono text-[10px] uppercase text-[#77929e]">

                  <th className="px-7 py-4 font-medium">
                    Guest
                  </th>

                  <th className="px-7 py-4 font-medium">
                    Products shared
                  </th>

                  <th className="px-7 py-4 font-medium">
                    Status
                  </th>

                </tr>

              </thead>

              {/* =================================================
                  TABLE BODY
              ================================================= */}

              <tbody className="divide-y divide-[#e4eaec]">

                {/* LOADING */}

                {loading && (
                  <tr>
                    <td
                      colSpan="3"
                      className="px-7 py-12 text-center text-[13px] text-[#718087]"
                    >
                      Loading guests…
                    </td>
                  </tr>
                )}

                {/* EMPTY */}

                {!loading &&
                  guests.length === 0 && (
                    <tr>
                      <td
                        colSpan="3"
                        className="px-7 py-12 text-center"
                      >
                        <UsersRound
                          className="mx-auto mb-3 text-[#9cabb1]"
                          size={25}
                        />

                        <p className="text-[14px] font-medium text-[#52646b]">
                          No guests available
                        </p>

                        <p className="mt-1 text-[12px] text-[#8a989d]">
                          Guest accounts will appear
                          here when they are created.
                        </p>
                      </td>
                    </tr>
                  )}

                {/* GUESTS */}

                {!loading &&
                  guests.map((guest) => (

                    <tr
                      key={guest.id}
                      onClick={() =>
                        openGuestAccess(guest)
                      }
                      className="
                        cursor-pointer
                        transition
                        hover:bg-[#f8fbfb]
                      "
                    >

                      {/* =========================================
                          GUEST
                      ========================================== */}

                      <td className="px-7 py-4">

                        <div className="flex items-center gap-3">

                          <span
                            className="
                              flex
                              h-10
                              w-10
                              shrink-0
                              items-center
                              justify-center
                              rounded-full
                              bg-[#00688b]
                              text-[12px]
                              font-bold
                              text-white
                            "
                          >
                            {initials(
                              guest.full_name
                            )}
                          </span>

                          <div className="min-w-0">

                            <p className="truncate text-[14px] font-semibold text-[#121c21]">
                              {guest.full_name}
                            </p>

                            <p className="mt-0.5 truncate text-[12px] text-[#70818a]">
                              {guest.email}
                            </p>

                          </div>

                        </div>

                      </td>

                      {/* =========================================
                          PRODUCTS
                      ========================================== */}

                      <td className="px-7 py-4">

                        <div className="flex max-w-[520px] flex-wrap gap-2">

                          {guest.products?.length ? (

                            guest.products.map(
                              (product) => (

                                <span
                                  key={product.id}
                                  title={product.name}
                                  className="
                                    inline-flex
                                    max-w-[190px]
                                    items-center
                                    gap-1.5
                                    truncate
                                    rounded-md
                                    bg-[#eaf4f7]
                                    px-2.5
                                    py-1
                                    text-[12px]
                                    font-medium
                                    text-[#245768]
                                  "
                                >

                                  <PackageOpen
                                    size={13}
                                    className="shrink-0"
                                  />

                                  <span className="truncate">
                                    {product.name}
                                  </span>

                                </span>

                              )
                            )

                          ) : (

                            <span className="text-[12px] text-[#89979d]">
                              No products assigned
                            </span>

                          )}

                        </div>

                      </td>

                      {/* =========================================
                          STATUS
                      ========================================== */}

                      <td className="px-7 py-4">

                        <div className="flex items-center gap-3">

                          {/* STATUS */}

                          <span
                            className={`
                              inline-flex
                              items-center
                              gap-1.5
                              rounded-md
                              px-2.5
                              py-1
                              text-[12px]
                              font-medium
                              ${
                                guest.is_active
                                  ? "bg-[#e7f6ee] text-[#18724d]"
                                  : "bg-[#f2f3f4] text-[#69787e]"
                              }
                            `}
                          >

                            {guest.is_active ? (
                              <Check size={13} />
                            ) : (
                              <CircleOff size={13} />
                            )}

                            {guest.is_active
                              ? "Active"
                              : "Deactivated"}

                          </span>

                          {/* ACTIVATE / DEACTIVATE */}

                          <button
                            type="button"
                            onClick={(event) => {
                              event.stopPropagation();
                              toggleGuest(guest);
                            }}
                            disabled={
                              updatingId ===
                              guest.id
                            }
                            className={`
                              rounded-lg
                              border
                              px-3
                              py-1.5
                              text-[12px]
                              font-semibold
                              transition
                              disabled:cursor-wait
                              disabled:opacity-50
                              ${
                                guest.is_active
                                  ? "border-[#f0c8c8] text-[#b63838] hover:bg-[#fff5f5]"
                                  : "border-[#b9dfd1] text-[#197552] hover:bg-[#f0faf5]"
                              }
                            `}
                          >

                            {updatingId ===
                            guest.id
                              ? "Updating…"
                              : guest.is_active
                              ? "Deactivate"
                              : "Activate"}

                          </button>

                        </div>

                      </td>

                    </tr>

                  ))}

              </tbody>

            </table>

          </div>

        </div>

      </section>

      {/* =======================================================
          GUEST PRODUCT ACCESS MODAL
      ======================================================== */}

      {showAccessModal &&
        selectedGuest && (

          <div
            className="
              fixed
              inset-0
              z-50
              flex
              items-center
              justify-center
              bg-black/40
              px-4
            "
            onClick={closeAccessModal}
          >

            <div
              className="
                w-full
                max-w-2xl
                overflow-hidden
                rounded-2xl
                border
                border-[#E1E7E9]
                bg-white
                shadow-2xl
              "
              onClick={(event) =>
                event.stopPropagation()
              }
            >

              {/* =================================================
                  MODAL HEADER
              ================================================= */}

              <div className="flex items-start justify-between border-b border-[#E5EAEC] px-6 py-5">

                <div className="min-w-0">

                  <div className="flex items-center gap-3">

                    <span
                      className="
                        flex
                        h-10
                        w-10
                        shrink-0
                        items-center
                        justify-center
                        rounded-full
                        bg-[#00688b]
                        text-[12px]
                        font-bold
                        text-white
                      "
                    >
                      {initials(
                        selectedGuest.full_name
                      )}
                    </span>

                    <div className="min-w-0">

                      <h3 className="truncate text-[16px] font-semibold text-[#121c21]">
                        {selectedGuest.full_name}
                      </h3>

                      <p className="mt-0.5 truncate text-[12px] text-[#70818a]">
                        {selectedGuest.email}
                      </p>

                    </div>

                  </div>

                  <div className="mt-4">

                    <p className="cf-mono text-[10px] font-medium uppercase tracking-[0.16em] text-[#8a989d]">
                      Product access
                    </p>

                    <p className="mt-1 text-[13px] text-[#61757e]">
                      Control which published products
                      this guest can access.
                    </p>

                  </div>

                </div>

                <button
                  type="button"
                  onClick={closeAccessModal}
                  className="
                    flex
                    h-8
                    w-8
                    shrink-0
                    items-center
                    justify-center
                    rounded-full
                    text-[#8b989d]
                    transition
                    hover:bg-[#f2f5f6]
                    hover:text-[#1c252a]
                  "
                >
                  <X size={17} />
                </button>

              </div>

              {/* =================================================
                  MODAL CONTENT
              ================================================= */}

              <div className="max-h-[60vh] overflow-y-auto px-6 py-5">

                {/* ERROR */}

                {accessError && (
                  <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3">

                    <p className="text-[13px] text-red-700">
                      {accessError}
                    </p>

                  </div>
                )}

                {/* LOADING */}

                {accessLoading ? (

                  <div className="space-y-3">

                    {Array.from({
                      length: 5,
                    }).map((_, index) => (

                      <div
                        key={index}
                        className="
                          flex
                          items-center
                          justify-between
                          rounded-xl
                          border
                          border-[#e5eaec]
                          px-4
                          py-4
                        "
                      >

                        <div className="space-y-2">

                          <div className="h-4 w-40 animate-pulse rounded bg-[#eef2f3]" />

                          <div className="h-3 w-56 animate-pulse rounded bg-[#f1f4f5]" />

                        </div>

                        <div className="h-7 w-12 animate-pulse rounded-full bg-[#eef2f3]" />

                      </div>

                    ))}

                  </div>

                ) : products.length === 0 ? (

                  /* NO PRODUCTS */

                  <div className="py-10 text-center">

                    <PackageOpen
                      size={25}
                      className="mx-auto text-[#9cabb1]"
                    />

                    <p className="mt-3 text-[14px] font-medium text-[#52646b]">
                      No published products
                    </p>

                    <p className="mt-1 text-[12px] text-[#8a989d]">
                      Published products will appear
                      here.
                    </p>

                  </div>

                ) : (

                  /* PRODUCTS */

                  <div className="space-y-2">

                    {products.map((product) => {

                      const actionKey =
                        `${selectedGuest.id}-${product.id}`;

                      const actionLoading =
                        accessActionLoading ===
                        actionKey;

                      return (

                        <div
                          key={product.id}
                          className="
                            flex
                            items-center
                            justify-between
                            gap-4
                            rounded-xl
                            border
                            border-[#e1e7e9]
                            bg-white
                            px-4
                            py-3.5
                            transition
                            hover:bg-[#fafcfc]
                          "
                        >

                          {/* PRODUCT INFO */}

                          <div className="flex min-w-0 items-center gap-3">

                            <div
                              className="
                                flex
                                h-9
                                w-9
                                shrink-0
                                items-center
                                justify-center
                                rounded-lg
                                bg-[#eaf4f7]
                              "
                            >
                              <PackageOpen
                                size={16}
                                className="text-[#0097c1]"
                              />
                            </div>

                            <div className="min-w-0">

                              <p className="truncate text-[13px] font-semibold text-[#172127]">
                                {product.name}
                              </p>

                              {product.one_liner && (
                                <p className="mt-0.5 truncate text-[11px] text-[#7a8990]">
                                  {product.one_liner}
                                </p>
                              )}

                            </div>

                          </div>

                          {/* TOGGLE */}

{/* TOGGLE */}

<button
  type="button"
  disabled={actionLoading}
  onClick={() => toggleProductAccess(product)}
  className="group flex shrink-0 items-center gap-2.5 disabled:cursor-wait"
  aria-label={
    product.hasAccess
      ? `Remove ${product.name} access`
      : `Grant ${product.name} access`
  }
>
  {/* STATUS TEXT */}

  <span
    className={`text-[10px] font-semibold uppercase tracking-[0.08em] transition-colors ${
      product.hasAccess
        ? "text-[#18724d]"
        : "text-[#8a989d]"
    }`}
  >
    {actionLoading
      ? "Updating"
      : product.hasAccess
        ? "Enabled"
        : "Disabled"}
  </span>

  {/* SWITCH */}

  <span
    className={`
      relative
      flex
      h-6
      w-11
      shrink-0
      items-center
      rounded-full
      border
      transition-all
      duration-200
      ease-out
      ${
        product.hasAccess
          ? "border-[#0088ae] bg-[#0097c1]"
          : "border-[#cbd5d9] bg-[#e5eaec]"
      }
      ${
        actionLoading
          ? "opacity-60"
          : "group-hover:shadow-sm"
      }
    `}
  >
    {/* KNOB */}

    <span
      className={`
        absolute
        h-4
        w-4
        rounded-full
        bg-white
        shadow-[0_1px_3px_rgba(0,0,0,0.18)]
        transition-transform
        duration-200
        ease-out
        ${
          product.hasAccess
            ? "translate-x-[22px]"
            : "translate-x-[3px]"
        }
      `}
    />

    {/* LOADING */}

    {actionLoading && (
      <span
        className={`
          absolute
          inset-0
          flex
          items-center
          justify-center
          text-[8px]
          font-bold
          ${
            product.hasAccess
              ? "text-white"
              : "text-[#718087]"
          }
        `}
      >
        •
      </span>
    )}
  </span>
</button>

                        </div>

                      );
                    })}

                  </div>

                )}

              </div>

              {/* =================================================
                  MODAL FOOTER
              ================================================= */}

              <div className="flex items-center justify-between border-t border-[#e5eaec] bg-[#fafbfb] px-6 py-4">

                <p className="cf-mono text-[10px] uppercase tracking-[0.12em] text-[#8a989d]">

                  {
                    products.filter(
                      (product) =>
                        product.hasAccess
                    ).length
                  }{" "}

                  of {products.length} products enabled

                </p>

                <button
                  type="button"
                  onClick={closeAccessModal}
                  className="
                    rounded-lg
                    bg-[#1c252a]
                    px-4
                    py-2
                    text-[12px]
                    font-semibold
                    text-white
                    transition
                    hover:bg-[#10181c]
                  "
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