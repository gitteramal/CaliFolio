import React, { useEffect, useState } from "react";
import {
  ArrowLeft,
  CheckCircle,
  XCircle,
  ExternalLink,
  Video,
  FileText,
  Globe,
  Image as ImageIcon,
  Loader2,
} from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";

const API_URL = "http://127.0.0.1:8000";

export default function AdminProductReviewPage() {
  const navigate = useNavigate();
  const { productId } = useParams();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showChangesModal, setShowChangesModal] = useState(false);
const [reviewNote, setReviewNote] = useState("");
const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    fetchProduct();
  }, [productId]);

async function handleRequestChanges() {
  try {
    const token = localStorage.getItem("access_token");

    const res = await fetch(
      `${API_URL}/products/admin/${productId}/request-changes`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          review_note: reviewNote,
        }),
      }
    );

    const data = await res.json();

    if (!res.ok) {
      throw new Error(
        data.detail || "Unable to request changes."
      );
    }

    // Product successfully changed back to draft
    navigate("/admin/overview");

  } catch (err) {
    setError(
      err.message || "Something went wrong."
    );
  }
}

async function handleApprove() {
  setActionLoading(true);
  setError("");
  setSuccess("");

  try {
    const token = localStorage.getItem("access_token");

    const res = await fetch(
      `${API_URL}/products/admin/${productId}/approve`,
      {
        method: "PATCH",
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    );

    const data = await res.json();

    if (!res.ok) {
      throw new Error(
        data.detail || "Unable to approve product."
      );
    }

    setSuccess("Product approved successfully.");

    setTimeout(() => {
      navigate("/admin/overview");
    }, 1500);

  } catch (err) {
    setError(
      err.message || "Something went wrong while approving."
    );
    setActionLoading(false);
  }
}

  async function fetchProduct() {
    setLoading(true);
    setError("");

    try {
      const token = localStorage.getItem("access_token");

      const response = await fetch(
        `${API_URL}/products/admin/${productId}/review`,
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
          data.detail || "Unable to load product."
        );
      }

      setProduct(data);
    } catch (err) {
      setError(
        err.message || "Something went wrong."
      );
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#eef2f3] flex items-center justify-center">
        <div className="flex items-center gap-3 text-gray-600">
          <Loader2
            size={20}
            className="animate-spin"
          />
          Loading product...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#eef2f3] p-8">
        <div className="max-w-5xl mx-auto">
          <button
            onClick={() => navigate("/admin/overview")}
            className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 mb-6"
          >
            <ArrowLeft size={16} />
            Back to overview
          </button>

          <div className="bg-white rounded-2xl border border-red-200 p-6">
            <p className="text-sm text-red-600">
              {error}
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return null;
  }

  return (
    <div className="min-h-screen bg-[#eef2f3]">

            {success && (
      <div className="fixed top-6 right-6 z-[9999]">
        <div className="rounded-lg bg-[#071015] px-5 py-3 text-sm font-semibold text-white shadow-xl">
          {success}
        </div>
      </div>
    )}

    {/* ERROR POPUP */}
    {error && (
      <div className="fixed top-6 right-6 z-[9999]">
        <div className="rounded-lg bg-red-600 px-5 py-3 text-sm font-semibold text-white shadow-xl">
          {error}
        </div>
      </div>
    )}

      {/* =================================================
          TOP BAR
      ================================================= */}

      <div className="bg-white border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-6 py-4">

          <button
            onClick={() => navigate("/admin/overview")}
            className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 transition"
          >
            <ArrowLeft size={16} />
            Back to overview
          </button>

        </div>
      </div>


      {/* =================================================
          MAIN
      ================================================= */}

      <main className="max-w-6xl mx-auto px-6 py-8">

        {/* Header */}

        <div className="mb-8">

          <div className="flex items-start justify-between gap-6">

            <div>

              <div className="flex items-center gap-3 mb-3">

                <span className="px-3 py-1 rounded-full bg-amber-50 text-amber-700 text-xs font-semibold">
                  Pending Review
                </span>

                {product.stage && (
                  <span className="px-3 py-1 rounded-full bg-gray-100 text-gray-600 text-xs font-medium">
                    {product.stage}
                  </span>
                )}

              </div>

              <h1 className="text-3xl font-bold text-[#071015]">
                {product.name}
              </h1>

              {product.one_liner && (
                <p className="text-gray-500 mt-2 max-w-2xl">
                  {product.one_liner}
                </p>
              )}

            </div>


            {/* Review actions */}

            <div className="flex items-center gap-3">

              <button
  type="button"
  onClick={() => setShowChangesModal(true)}
  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg border border-gray-300 bg-white text-sm font-semibold text-gray-700 hover:bg-gray-50 transition"
>
  <XCircle size={16} />
  Request changes
</button>

<button
  type="button"
  onClick={handleApprove}
  disabled={actionLoading}
  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-[#071015] text-white text-sm font-semibold hover:bg-[#162126] transition disabled:opacity-50 disabled:cursor-not-allowed"
>
  <CheckCircle size={16} />

  {actionLoading ? "Approving..." : "Approve"}
</button>

            </div>

          </div>
          {showChangesModal && (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">

    <div className="w-full max-w-lg rounded-xl bg-white shadow-xl">

      {/* Header */}
      <div className="flex items-center justify-between px-6 py-5 border-b border-gray-200">
        <div>
          <h2 className="text-lg font-semibold text-[#071015]">
            Request Changes
          </h2>

          <p className="text-sm text-gray-500 mt-1">
            Tell the founder what needs to be updated.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setShowChangesModal(false)}
          className="text-gray-400 hover:text-gray-700"
        >
          <XCircle size={20} />
        </button>
      </div>

      {/* Body */}
      <div className="p-6">

        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Review note
        </label>

        <textarea
          value={reviewNote}
          onChange={(e) => setReviewNote(e.target.value)}
          rows={5}
          placeholder="Example: Please update the pricing information and add your latest traction numbers."
          className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm outline-none focus:border-[#071015] resize-none"
        />

      </div>

      {/* Footer */}
      <div className="flex justify-end gap-3 px-6 py-4 border-t border-gray-200">

        <button
          type="button"
          onClick={() => {
            setShowChangesModal(false);
            setReviewNote("");
          }}
          className="px-4 py-2.5 rounded-lg border border-gray-300 bg-white text-sm font-semibold text-gray-700 hover:bg-gray-50"
        >
          Cancel
        </button>

<button
  type="button"
  onClick={handleRequestChanges}
  disabled={actionLoading || !reviewNote.trim()}
  className="px-4 py-2.5 rounded-lg bg-[#071015] text-white text-sm font-semibold hover:bg-[#162126] disabled:opacity-50 disabled:cursor-not-allowed"
>
  {actionLoading ? "Sending..." : "Request Changes"}
</button>

      </div>

    </div>
  </div>
)}

        </div>


        {/* =================================================
            BASIC INFORMATION
        ================================================= */}

        <section className="bg-white rounded-2xl border border-gray-200 shadow-sm mb-6">

          <div className="px-6 py-5 border-b border-gray-100">

            <h2 className="text-lg font-semibold text-gray-900">
              Basic Information
            </h2>

          </div>

          <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">

            <InfoField
              label="Product name"
              value={product.name}
            />

            <InfoField
              label="Version"
              value={product.version}
            />

            <InfoField
              label="Stage"
              value={product.stage}
            />

            <InfoField
              label="Origin"
              value={product.origin}
            />

          </div>

        </section>


        {/* =================================================
            PRODUCT DETAILS
        ================================================= */}

        <ProductSection
          title="Product Details"
          fields={[
            ["Description", product.description],
            ["The Problem", product.problem],
            ["How It Works", product.how_it_works],
            [
              "Ideal Customer Profile",
              product.ideal_customer_profile,
            ],
            [
              "Value Proposition",
              product.value_proposition,
            ],
            ["Highlights", product.highlights],
          ]}
        />


        {/* =================================================
            COMPANY
        ================================================= */}

        <ProductSection
          title="Company"
          fields={[
            ["Company", product.company],
            ["Headquarters", product.headquarters],
            ["Founded", product.founded],
            ["Team Size", product.team_size],
            ["Deployment", product.deployment],
            ["Pricing", product.pricing],
          ]}
        />


        {/* =================================================
            FOUNDERS & BUSINESS
        ================================================= */}

        <ProductSection
          title="Founders & Business"
          fields={[
            ["Founders & Team", product.founders_team],
            ["Key Clients", product.key_clients],
            ["Roadmap", product.roadmap],
            ["Compliance", product.compliance],
            ["Integrations", product.integrations],
          ]}
        />


        {/* =================================================
            METRICS
        ================================================= */}

        <ProductSection
          title="Metrics"
          fields={[
            ["Users", product.users],
            ["Customers", product.customers],
            ["Traction", product.traction],
            ["Funds Raised", product.funds_raised],
          ]}
        />


        {/* =================================================
            MEDIA & LINKS
        ================================================= */}

        <section className="bg-white rounded-2xl border border-gray-200 shadow-sm mb-6">

          <div className="px-6 py-5 border-b border-gray-100">

            <h2 className="text-lg font-semibold text-gray-900">
              Media & Links
            </h2>

          </div>

          <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">

            <MediaLink
              icon={<Video size={18} />}
              label="Demo Video"
              value={product.demo_video_url}
            />

            <MediaLink
              icon={<FileText size={18} />}
              label="Pitch Deck"
              value={product.pitch_deck_url}
            />

            <MediaLink
              icon={<Globe size={18} />}
              label="Website"
              value={product.website_url}
            />

            <MediaLink
              icon={<ImageIcon size={18} />}
              label="Thumbnail"
              value={product.thumbnail_url}
            />

          </div>

        </section>


        {/* =================================================
            WORKFLOW
        ================================================= */}

        <section className="bg-white rounded-2xl border border-gray-200 shadow-sm mb-10">

          <div className="px-6 py-5 border-b border-gray-100">

            <h2 className="text-lg font-semibold text-gray-900">
              Workflow
            </h2>

          </div>

          <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">

            <InfoField
              label="Status"
              value={product.status}
            />

            <InfoField
              label="Founder ID"
              value={product.founder_id}
            />

          </div>

        </section>

      </main>

    </div>
  );
}


/* =========================================================
   INFO FIELD
========================================================= */

function InfoField({ label, value }) {
  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">
        {label}
      </p>

      <p className="mt-2 text-sm text-gray-800 whitespace-pre-wrap">
        {value || "Not provided"}
      </p>
    </div>
  );
}


/* =========================================================
   PRODUCT SECTION
========================================================= */

function ProductSection({ title, fields }) {
  const visibleFields = fields.filter(
    ([, value]) =>
      value !== null &&
      value !== undefined &&
      value !== ""
  );

  if (visibleFields.length === 0) {
    return null;
  }

  return (
    <section className="bg-white rounded-2xl border border-gray-200 shadow-sm mb-6">

      <div className="px-6 py-5 border-b border-gray-100">

        <h2 className="text-lg font-semibold text-gray-900">
          {title}
        </h2>

      </div>

      <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">

        {visibleFields.map(([label, value]) => (
          <InfoField
            key={label}
            label={label}
            value={value}
          />
        ))}

      </div>

    </section>
  );
}


/* =========================================================
   MEDIA LINK
========================================================= */

function MediaLink({ icon, label, value }) {
  return (
    <div className="flex items-center justify-between gap-4 border border-gray-200 rounded-xl p-4">

      <div className="flex items-center gap-3 min-w-0">

        <div className="w-9 h-9 rounded-lg bg-[#eef2f3] flex items-center justify-center text-[#071015]">
          {icon}
        </div>

        <div className="min-w-0">

          <p className="text-sm font-semibold text-gray-800">
            {label}
          </p>

          <p className="text-xs text-gray-400 truncate">
            {value || "Not provided"}
          </p>

        </div>

      </div>

      {value && (
        <a
          href={value}
          target="_blank"
          rel="noreferrer"
          className="shrink-0 inline-flex items-center gap-1 text-xs font-semibold text-[#0788b5] hover:underline"
        >
          Open
          <ExternalLink size={13} />
        </a>
      )}

    </div>
  );
}