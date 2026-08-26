import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Plus,
  Boxes,
  X,
  ArrowRight,
  Clock3,
  Users,
  Package,
} from "lucide-react";

const BRAND = "#0097c1";

export default function OverviewPage() {
  const navigate = useNavigate();
  const [showModal, setShowModal] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    version: "",
    one_liner: "",
    stage: "ideation",
    origin: "in_house",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [founders, setFounders] = useState([]);
  const [founderId, setFounderId] = useState("");

  const [pendingProducts, setPendingProducts] = useState([]);
  const [pendingLoading, setPendingLoading] = useState(false);

  const [draftProducts, setDraftProducts] = useState([]);
  const [draftLoading, setDraftLoading] = useState(false);

  const [publishedProductsCount, setPublishedProductsCount] = useState(0);

  // =========================================================
  // LOAD FOUNDERS
  // =========================================================
 useEffect(() => {
  loadPublishedProductsCount();
}, []);

async function loadPublishedProductsCount() {
  try {
    const token = localStorage.getItem("access_token");

    if (!token) return;

    const res = await fetch(
      "http://127.0.0.1:8000/products/admin/published",
      {
        method: "GET",
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (!res.ok) {
      throw new Error("Failed to load published products.");
    }

    const data = await res.json();

    setPublishedProductsCount(data.length);
  } catch (error) {
    console.error(
      "Failed to load published products count:",
      error
    );
  }
}

  useEffect(() => {
    async function loadFounders() {
      try {
        const response = await fetch(
          "http://127.0.0.1:8000/users/founders",
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem(
                "access_token"
              )}`,
            },
          }
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data.detail || "Failed to load founders."
          );
        }

        setFounders(data);
      } catch (error) {
        console.error("Failed to load founders:", error);
      }
    }

    loadFounders();
  }, []);

  // =========================================================
  // LOAD PENDING PRODUCTS
  // =========================================================

useEffect(() => {
  fetchPendingProducts();
  fetchDraftProducts();
}, []);

  async function fetchPendingProducts() {
    setPendingLoading(true);

    try {
      const token = localStorage.getItem("access_token");

      const res = await fetch(
        "http://127.0.0.1:8000/products/admin/pending-review",
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
          data.detail || "Unable to load pending products."
        );
      }

      setPendingProducts(data);
    } catch (err) {
      console.error("Pending products error:", err);
    } finally {
      setPendingLoading(false);
    }
  }


  async function fetchDraftProducts() {
  setDraftLoading(true);

  try {
    const token = localStorage.getItem("access_token");

    const res = await fetch(
      "http://127.0.0.1:8000/products/admin/drafts",
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
        data.detail || "Unable to load draft products."
      );
    }

    setDraftProducts(data);
  } catch (err) {
    console.error("Draft products error:", err);
  } finally {
    setDraftLoading(false);
  }
}


  // =========================================================
  // FORM CHANGE
  // =========================================================

  function handleChange(e) {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  }

  // =========================================================
  // CREATE PRODUCT DRAFT
  // =========================================================

  async function handleCreateDraft(e) {
    e.preventDefault();

    setError("");
    setSuccess("");

    if (!founderId) {
      setError("Please select a founder.");
      return;
    }

    setLoading(true);

    try {
      // =====================================================
      // STEP 1: CREATE PRODUCT DRAFT
      // =====================================================

      const res = await fetch(
        "http://127.0.0.1:8000/products/admin/",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem(
              "access_token"
            )}`,
          },
          body: JSON.stringify({
            name: formData.name,
            version: formData.version || null,
            one_liner: formData.one_liner || null,
            stage: formData.stage,
            origin: formData.origin,
          }),
        }
      );

      const data = await res.json();

      if (!res.ok) {
        throw new Error(
          data.detail || "Failed to create product."
        );
      }

      console.log("Created draft:", data);

      // =====================================================
      // STEP 2: ASSIGN FOUNDER
      // =====================================================

      const assignResponse = await fetch(
        `http://127.0.0.1:8000/products/admin/${data.id}/assign-founder`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem(
              "access_token"
            )}`,
          },
          body: JSON.stringify({
            founder_id: Number(founderId),
          }),
        }
      );

      const assignedProduct = await assignResponse.json();

      if (!assignResponse.ok) {
        throw new Error(
          assignedProduct.detail ||
            "Draft created, but founder assignment failed."
        );
      }

      console.log(
        "Draft assigned to founder:",
        assignedProduct
      );

      // =====================================================
      // SUCCESS
      // =====================================================

      setSuccess(
        "Product draft created and assigned successfully."
      );

      setFormData({
        name: "",
        version: "",
        one_liner: "",
        stage: "ideation",
        origin: "in_house",
      });

      setFounderId("");

      setTimeout(() => {
        setShowModal(false);
        setSuccess("");
      }, 1000);
    } catch (err) {
      setError(err.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  // =========================================================
  // OPEN MODAL
  // =========================================================

  function openCreateModal() {
    setError("");
    setSuccess("");
    setShowModal(true);
  }

  return (
    <div className="w-full">

      {/* =====================================================
          PAGE HEADER
      ====================================================== */}

      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-5 mb-7">

        <div>
          <div className="flex items-center gap-2 mb-2">
            <span
              className="w-2 h-2 rounded-full"
              style={{ backgroundColor: BRAND }}
            />

            <span className="cf-mono text-[10px] tracking-[0.16em] text-gray-400 uppercase">
              Platform Overview
            </span>
          </div>

          <h2 className="cf-display font-bold text-[25px] sm:text-[28px] tracking-[-0.03em] text-gray-900">
            Admin Dashboard
          </h2>

          <p className="text-[13px] sm:text-[14px] text-gray-500 mt-1.5">
            Overview of your CaliFolio platform performance and metrics.
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="
            inline-flex
            items-center
            justify-center
            gap-2
            bg-[#071015]
            hover:bg-[#172126]
            text-white
            px-4
            py-2.5
            rounded-lg
            text-[13px]
            font-semibold
            transition
            shadow-sm
          "
        >
          <Plus size={16} strokeWidth={2.3} />
          Add Product
        </button>

      </div>


      {/* =====================================================
          PENDING REVIEW
      ====================================================== */}

      <section className="bg-white border border-gray-200 rounded-xl shadow-[0_2px_8px_rgba(15,23,42,0.04)] overflow-hidden">

        {/* Header */}

        <div className="px-5 sm:px-6 py-5 border-b border-gray-100 flex items-center justify-between gap-4">

          <div>
            <div className="flex items-center gap-2.5">

              <h2 className="cf-display text-[16px] sm:text-[17px] font-bold text-gray-900">
                Pending Review
              </h2>

              <span className="inline-flex items-center justify-center min-w-6 h-6 px-2 rounded-full bg-[#eef8fa] text-[#087e9e] text-[11px] font-bold">
                {pendingProducts.length}
              </span>

            </div>

            <p className="text-[12px] sm:text-[13px] text-gray-500 mt-1">
              Products submitted by founders for your review.
            </p>
          </div>

          <span className="hidden sm:inline-flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-gray-400">
            <Clock3 size={13} />
            Review queue
          </span>

        </div>


        {/* Content */}

        <div className="p-4 sm:p-5">

          {pendingLoading ? (

            <div className="py-12 text-center">
              <p className="text-[13px] text-gray-500">
                Loading pending products...
              </p>
            </div>

          ) : pendingProducts.length === 0 ? (

            <div className="py-12 px-4 text-center border border-dashed border-gray-200 rounded-lg">

              <div className="mx-auto w-10 h-10 rounded-full bg-gray-50 border border-gray-200 flex items-center justify-center mb-3">
                <Package
                  size={18}
                  className="text-gray-400"
                />
              </div>

              <p className="text-[13px] font-semibold text-gray-700">
                No products waiting for review.
              </p>

              <p className="text-[12px] text-gray-400 mt-1">
                Products submitted by founders will appear here.
              </p>

            </div>

          ) : (

            <div className="space-y-2.5">

              {pendingProducts.map((product) => (

                <div
                  key={product.id}
                  className="
                    group
                    flex
                    flex-col
                    sm:flex-row
                    sm:items-center
                    justify-between
                    gap-4
                    p-4
                    rounded-lg
                    border
                    border-gray-200
                    bg-white
                    hover:border-gray-300
                    hover:shadow-[0_3px_12px_rgba(15,23,42,0.05)]
                    transition
                  "
                >

                  {/* Product information */}

                  <div className="min-w-0">

                    <div className="flex flex-wrap items-center gap-2.5">

                      <h3 className="cf-display text-[14px] sm:text-[15px] font-bold text-gray-900">
                        {product.name}
                      </h3>

                      <span className="inline-flex items-center px-2 py-1 rounded-md bg-[#fff8e7] border border-[#f3e4bb] text-[#98701d] text-[10px] font-semibold">
                        Pending review
                      </span>

                    </div>

                    {product.one_liner && (
                      <p className="text-[12px] sm:text-[13px] text-gray-500 mt-1.5 truncate max-w-2xl">
                        {product.one_liner}
                      </p>
                    )}

                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-2.5 text-[11px] text-gray-400">

                      {product.version && (
                        <span>
                          v{product.version}
                        </span>
                      )}

                      {product.stage && (
                        <span>
                          {product.stage}
                        </span>
                      )}

                      {product.founder_id && (
                        <span>
                          Founder #{product.founder_id}
                        </span>
                      )}

                    </div>

                  </div>


                  {/* Review button */}

                  <button
                    type="button"
                    onClick={() =>
                      navigate(
                        `/admin/products/${product.id}/review`
                      )
                    }
                    className="
                      shrink-0
                      inline-flex
                      items-center
                      justify-center
                      gap-2
                      px-3.5
                      py-2
                      rounded-lg
                      bg-[#071015]
                      text-white
                      text-[12px]
                      font-semibold
                      hover:bg-[#162126]
                      transition
                    "
                  >
                    Review
                    <ArrowRight size={13} />
                  </button>

                </div>

              ))}

            </div>

          )}

        </div>

      </section>

{/* =====================================================
    DRAFT PRODUCTS
====================================================== */}

<section className="mt-5 bg-white border border-gray-200 rounded-xl shadow-[0_2px_8px_rgba(15,23,42,0.04)] overflow-hidden">

  {/* Header */}
  <div className="px-5 sm:px-6 py-4 border-b border-gray-100 flex items-center justify-between">

    <div>
      <div className="flex items-center gap-2.5">

        <h2 className="cf-display text-[16px] font-bold text-gray-900">
          Draft Products
        </h2>

        <span className="inline-flex items-center justify-center min-w-6 h-6 px-2 rounded-full bg-gray-100 text-gray-600 text-[11px] font-bold">
          {draftProducts.length}
        </span>

      </div>

      <p className="text-[12px] text-gray-500 mt-1">
        Products currently being prepared.
      </p>
    </div>

  </div>


  {/* Content */}
  <div className="p-4">

    {draftLoading ? (

      <div className="py-6 text-center">
        <p className="text-[12px] text-gray-500">
          Loading draft products...
        </p>
      </div>

    ) : draftProducts.length === 0 ? (

      <div className="py-7 text-center border border-dashed border-gray-200 rounded-lg">

        <div className="mx-auto w-9 h-9 rounded-full bg-gray-50 border border-gray-200 flex items-center justify-center mb-2">
          <Boxes
            size={16}
            className="text-gray-400"
          />
        </div>

        <p className="text-[12px] font-semibold text-gray-700">
          No draft products
        </p>

        <p className="text-[11px] text-gray-400 mt-1">
          New drafts will appear here.
        </p>

      </div>

    ) : (

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">

        {draftProducts.map((product) => (

          <div
            key={product.id}
            className="
              rounded-lg
              border
              border-gray-200
              bg-gray-50/50
              px-4
              py-3.5
              transition
              hover:border-gray-300
            "
          >

            {/* Top row */}
            <div className="flex items-start justify-between gap-3">

              <div className="min-w-0">

                <h3 className="cf-display text-[13px] font-bold text-gray-900 truncate">
                  {product.name}
                </h3>

                {product.version && (
                  <p className="text-[10px] text-gray-400 mt-0.5">
                    v{product.version}
                  </p>
                )}

              </div>

              <span className="shrink-0 inline-flex items-center px-2 py-1 rounded-md bg-white border border-gray-200 text-gray-500 text-[9px] font-semibold uppercase tracking-wide">
                Draft
              </span>

            </div>


            {/* One liner */}
            {product.one_liner && (
              <p className="text-[11px] text-gray-500 leading-5 mt-2 line-clamp-2">
                {product.one_liner}
              </p>
            )}


            {/* Metadata */}
            <div className="flex items-center gap-3 mt-2.5 text-[10px] text-gray-400">

              {product.stage && (
                <span>
                  {product.stage}
                </span>
              )}

              {product.founder_id && (
                <span>
                  Founder #{product.founder_id}
                </span>
              )}

            </div>

          </div>

        ))}

      </div>

    )}

  </div>

</section>
      {/* =====================================================
          STATS
      ====================================================== */}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-5">

        {/* Products */}

<StatCard
  icon={<Boxes size={18} />}
  label="Products"
  value={publishedProductsCount}
  description="Published products in your portfolio"
/>

        {/* Pending */}

        <StatCard
          icon={<Clock3 size={18} />}
          label="Pending Review"
          value={pendingProducts.length}
          description="Products waiting for review"
        />

        {/* Founders */}

        <StatCard
          icon={<Users size={18} />}
          label="Founders"
          value={founders.length}
          description="Founders in your platform"
        />

      </div>


      {/* =====================================================
          QUICK ACTIONS
      ====================================================== */}

      <section className="mt-5 bg-white border border-gray-200 rounded-xl shadow-[0_2px_8px_rgba(15,23,42,0.04)]">

        <div className="px-5 sm:px-6 py-5 border-b border-gray-100">

          <h3 className="cf-display font-bold text-[16px] text-gray-900">
            Quick Actions
          </h3>

          <p className="text-[12px] sm:text-[13px] text-gray-500 mt-1">
            Common actions for managing your portfolio.
          </p>

        </div>

        <div className="p-5 sm:p-6">

          <button
            onClick={openCreateModal}
            className="
              group
              w-full
              sm:w-auto
              inline-flex
              items-center
              gap-3
              px-4
              py-3
              rounded-lg
              border
              border-gray-200
              bg-white
              hover:border-gray-300
              hover:bg-gray-50
              transition
              text-left
            "
          >

            <span
              className="
                w-8
                h-8
                rounded-md
                flex
                items-center
                justify-center
                bg-[#eaf7fa]
                text-[#0084a8]
              "
            >
              <Plus size={16} />
            </span>

            <span>
              <span className="block text-[13px] font-semibold text-gray-800">
                Add Product
              </span>

              <span className="block text-[11px] text-gray-400 mt-0.5">
                Create a new product draft
              </span>
            </span>

            <ArrowRight
              size={14}
              className="ml-2 text-gray-300 group-hover:text-gray-600 transition"
            />

          </button>

        </div>

      </section>


      {/* =====================================================
          ADD PRODUCT MODAL
      ====================================================== */}

      {showModal && (

        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-[2px] px-4">

          <div className="bg-white w-full max-w-[560px] max-h-[90vh] overflow-y-auto rounded-xl shadow-2xl border border-gray-200">

            {/* Modal Header */}

            <div className="sticky top-0 z-10 bg-white flex items-center justify-between px-5 sm:px-6 py-5 border-b border-gray-200">

              <div>

                <div className="flex items-center gap-2 mb-1.5">

                  <span
                    className="w-1.5 h-1.5 rounded-full"
                    style={{
                      backgroundColor: BRAND,
                    }}
                  />

                  <span className="cf-mono text-[9px] tracking-[0.15em] uppercase text-gray-400">
                    New Product
                  </span>

                </div>

                <h3 className="cf-display font-bold text-[18px] text-gray-900">
                  Add Product
                </h3>

                <p className="text-[12px] text-gray-500 mt-1">
                  Create a new product draft.
                </p>

              </div>

              <button
                onClick={() => setShowModal(false)}
                className="
                  w-8
                  h-8
                  flex
                  items-center
                  justify-center
                  rounded-lg
                  text-gray-400
                  hover:bg-gray-100
                  hover:text-gray-700
                  transition
                "
              >
                <X size={18} />
              </button>

            </div>


            {/* Form */}

            <form
              onSubmit={handleCreateDraft}
              className="p-5 sm:p-6 space-y-5"
            >

              {/* Founder */}

              <div>

                <label className="block text-[12px] font-semibold text-gray-700 mb-1.5">
                  Founder
                </label>

                <select
                  value={founderId}
                  onChange={(e) =>
                    setFounderId(e.target.value)
                  }
                  className="
                    w-full
                    rounded-lg
                    border
                    border-gray-200
                    bg-white
                    px-3.5
                    py-2.5
                    text-[13px]
                    text-gray-700
                    focus:outline-none
                    focus:ring-2
                    focus:ring-[#0097c1]/20
                    focus:border-[#0097c1]
                  "
                >

                  <option value="">
                    Select Founder
                  </option>

                  {founders.map((founder) => (
                    <option
                      key={founder.id}
                      value={founder.id}
                    >
                      {founder.full_name} — {founder.email}
                    </option>
                  ))}

                </select>

              </div>


              {/* Product Name */}

              <FormField label="Product Name">

                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  placeholder="e.g. GridSense"
                  className={inputClass}
                />

              </FormField>


              {/* Version */}

              <FormField label="Version">

                <input
                  type="text"
                  name="version"
                  value={formData.version}
                  onChange={handleChange}
                  placeholder="e.g. 1.0.0"
                  className={inputClass}
                />

              </FormField>


              {/* One Liner */}

              <FormField label="One-liner">

                <textarea
                  name="one_liner"
                  value={formData.one_liner}
                  onChange={handleChange}
                  rows={3}
                  placeholder="What does this product do?"
                  className={`${inputClass} resize-none`}
                />

                <p className="text-[11px] text-gray-400 mt-1.5">
                  This is what guests will read first.
                </p>

              </FormField>


              {/* Stage + Origin */}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

                {/* Stage */}

                <FormField label="Stage">

                  <select
                    name="stage"
                    value={formData.stage}
                    onChange={handleChange}
                    className={inputClass}
                  >

                    <option value="ideation">
                      Ideation
                    </option>

                    <option value="in_development">
                      In Development
                    </option>

                    <option value="ready">
                      Ready
                    </option>

                  </select>

                </FormField>


                {/* Origin */}

                <FormField label="Origin">

                  <select
                    name="origin"
                    value={formData.origin}
                    onChange={handleChange}
                    className={inputClass}
                  >

                    <option value="in_house">
                      In House
                    </option>

                    <option value="acquired">
                      Acquired
                    </option>

                    <option value="whitelabelled">
                      Whitelabelled
                    </option>

                    <option value="hosted">
                      Hosted
                    </option>

                  </select>

                </FormField>

              </div>


              {/* Error */}

              {error && (

                <div className="bg-red-50 border border-red-200 text-red-600 text-[12px] rounded-lg px-4 py-3">
                  {error}
                </div>

              )}


              {/* Success */}

              {success && (

                <div className="bg-[#edf9f5] border border-[#cceee1] text-[#167653] text-[12px] rounded-lg px-4 py-3">
                  {success}
                </div>

              )}


              {/* Buttons */}

              <div className="flex justify-end gap-2.5 pt-2 border-t border-gray-100">

                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="
                    px-4
                    py-2.5
                    rounded-lg
                    border
                    border-gray-200
                    text-[12px]
                    font-semibold
                    text-gray-600
                    hover:bg-gray-50
                    transition
                  "
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={loading}
                  className="
                    px-5
                    py-2.5
                    rounded-lg
                    bg-[#071015]
                    hover:bg-[#162126]
                    text-white
                    text-[12px]
                    font-semibold
                    disabled:opacity-50
                    transition
                  "
                >
                  {loading
                    ? "Creating..."
                    : "Create Draft"}
                </button>

              </div>

            </form>

          </div>

        </div>

      )}

    </div>
  );
}


// =============================================================
// STAT CARD
// =============================================================

function StatCard({
  icon,
  label,
  value,
  description,
}) {
  return (
    <div
      className="
        bg-white
        border
        border-gray-200
        rounded-xl
        p-5
        shadow-[0_2px_8px_rgba(15,23,42,0.04)]
      "
    >

      <div className="flex items-start justify-between">

        <div
          className="
            w-9
            h-9
            rounded-lg
            bg-[#eaf7fa]
            text-[#0084a8]
            flex
            items-center
            justify-center
          "
        >
          {icon}
        </div>

        <span className="cf-mono text-[8px] tracking-[0.12em] text-gray-300">
          CALIFOLIO
        </span>

      </div>

      <p className="text-[12px] text-gray-500 mt-5">
        {label}
      </p>

      <p className="cf-display text-[25px] font-bold text-gray-900 mt-0.5">
        {value}
      </p>

      <p className="text-[11px] text-gray-400 mt-1">
        {description}
      </p>

    </div>
  );
}


// =============================================================
// FORM FIELD
// =============================================================

function FormField({ label, children }) {
  return (
    <div>

      <label className="block text-[12px] font-semibold text-gray-700 mb-1.5">
        {label}
      </label>

      {children}

    </div>
  );
}


// =============================================================
// INPUT STYLE
// =============================================================

const inputClass = `
  w-full
  px-3.5
  py-2.5
  border
  border-gray-200
  rounded-lg
  bg-white
  text-[13px]
  text-gray-700
  placeholder:text-gray-400
  focus:outline-none
  focus:ring-2
  focus:ring-[#0097c1]/20
  focus:border-[#0097c1]
  transition
`;