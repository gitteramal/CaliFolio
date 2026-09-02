import React, { useEffect, useState } from "react";
import {
  ArrowLeft,
  Eye,
  EyeOff,
  Save,
} from "lucide-react";
import {
  useNavigate,
  useParams,
} from "react-router-dom";

const API_URL = import.meta.env.VITE_API_URL;

export default function ProductEditPage() {
  const navigate = useNavigate();
  const { productId } = useParams();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [name, setName] = useState("");
  const [version, setVersion] = useState("");
  const [oneLiner, setOneLiner] = useState("");
  const [stage, setStage] = useState("ideation");
  const [origin, setOrigin] = useState("in_house");

  const [visibility, setVisibility] = useState({
    name: true,
    version: true,
    one_liner: true,
    stage: true,
    origin: true,
  });

  const API_URL = import.meta.env.VITE_API_URL;

  useEffect(() => {
    async function loadProduct() {
      try {
      const token = sessionStorage.getItem("access_token");

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

        if (!response.ok) {
          throw new Error("Product not found.");
        }

        const product = await response.json();

        setName(product.name || "");
        setVersion(product.version || "");
        setOneLiner(product.one_liner || "");
        setStage(product.stage || "ideation");
        setOrigin(product.origin || "in_house");

        setVisibility({
          name: product.guest_visibility?.name ?? true,
          version: product.guest_visibility?.version ?? true,
          one_liner:
            product.guest_visibility?.one_liner ?? true,
          stage: product.guest_visibility?.stage ?? true,
          origin:
            product.guest_visibility?.origin ?? true,
        });

      } catch (err) {
        setError(
          err.message || "Failed to load product."
        );
      } finally {
        setLoading(false);
      }
    }

    loadProduct();
  }, [productId]);

  function toggleVisibility(field) {
    setVisibility((current) => ({
      ...current,
      [field]: !current[field],
    }));
  }

  async function handleSave(e) {
    e.preventDefault();

    setError("");
    setSaving(true);

    try {
      const response = await fetch(
        `${API_URL}/products/${productId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name,
            version: version || null,
            one_liner: oneLiner,
            stage,
            origin,
            guest_visibility: visibility,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.detail || "Failed to save changes."
        );
      }

      navigate(`/admin/software/${productId}`);

    } catch (err) {
      setError(
        err.message ||
        "Something went wrong while saving."
      );
    } finally {
      setSaving(false);
    }
  }

  function formatStage(stage) {
    const stages = {
      ideation: "Ideation",
      in_development: "In Development",
      ready: "Ready",
    };

    return stages[stage] || stage;
  }

  function formatOrigin(origin) {
    const origins = {
      in_house: "In House",
      acquired: "Acquired",
      whitelabeled: "Whitelabeled",
      hosted: "Hosted",
    };

    return origins[origin] || origin;
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[500px]">
        <p className="text-sm text-gray-500">
          Loading product...
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">

      {/* Top bar */}
      <div className="flex items-center justify-between mb-6">

        <button
          onClick={() =>
            navigate(`/admin/software/${productId}`)
          }
          className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900"
        >
          <ArrowLeft size={16} />
          Back to software
        </button>

        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white px-5 py-2.5 rounded-lg text-sm font-semibold disabled:opacity-50"
        >
          <Save size={16} />

          {saving
            ? "Saving..."
            : "Save changes"}
        </button>

      </div>

      {/* Title */}
      <div className="flex items-center justify-between mb-6">

        <div>
          <p className="text-xs uppercase tracking-[0.18em] text-gray-400 font-semibold">
            Editing
          </p>

          <h1 className="cf-display text-3xl font-bold text-gray-900 mt-1">
            {name || "Product"}
          </h1>
        </div>

      </div>

      {error && (
        <div className="mb-6 rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6">

        {/* =========================
            MAIN EDITOR
        ========================== */}

        <form
          onSubmit={handleSave}
          className="space-y-6"
        >

          {/* BASICS */}
          <section className="bg-white rounded-xl border border-gray-200 p-7">

            <p className="text-[11px] font-semibold tracking-[0.18em] text-gray-400 uppercase mb-6">
              Basics
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

              {/* Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Name
                </label>

                <input
                  value={name}
                  onChange={(e) =>
                    setName(e.target.value)
                  }
                  className="w-full px-3.5 py-2.5 rounded-lg border border-gray-300 bg-gray-50 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                />
              </div>

              {/* Version */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Version
                </label>

                <input
                  value={version}
                  onChange={(e) =>
                    setVersion(e.target.value)
                  }
                  className="w-full px-3.5 py-2.5 rounded-lg border border-gray-300 bg-gray-50 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                />
              </div>

              {/* Stage */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Stage
                </label>

                <select
                  value={stage}
                  onChange={(e) =>
                    setStage(e.target.value)
                  }
                  className="w-full px-3.5 py-2.5 rounded-lg border border-gray-300 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
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
              </div>

              {/* Origin */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Origin
                </label>

                <select
                  value={origin}
                  onChange={(e) =>
                    setOrigin(e.target.value)
                  }
                  className="w-full px-3.5 py-2.5 rounded-lg border border-gray-300 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="in_house">
                    In House
                  </option>

                  <option value="acquired">
                    Acquired
                  </option>

                  <option value="whitelabeled">
                    Whitelabeled
                  </option>

                  <option value="hosted">
                    Hosted
                  </option>
                </select>
              </div>

            </div>

            {/* One-liner */}
            <div className="mt-5">

              <label className="block text-sm font-medium text-gray-700 mb-2">
                One-liner — this is what a guest reads first
              </label>

              <input
                value={oneLiner}
                onChange={(e) =>
                  setOneLiner(e.target.value)
                }
                className="w-full px-3.5 py-2.5 rounded-lg border border-gray-300 bg-gray-50 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              />

            </div>

          </section>

        </form>

        {/* =========================
            GUEST VISIBILITY
        ========================== */}

        <aside>

          <section className="bg-white rounded-xl border border-gray-200 p-6">

            <p className="text-[11px] font-semibold tracking-[0.18em] text-gray-400 uppercase mb-2">
              Guest Visibility
            </p>

            <p className="text-sm text-gray-500 leading-relaxed mb-5">
              Turn a field off and guests will not see
              it on the product page.
            </p>

            <p className="text-xs text-gray-400 mb-4">
              {
                Object.values(visibility).filter(Boolean).length
              } of {Object.keys(visibility).length} visible
            </p>

            {/* Name */}
            <VisibilityRow
              label="Product name"
              description="Product name shown to guests"
              enabled={visibility.name}
              onClick={() =>
                toggleVisibility("name")
              }
            />

            {/* Version */}
            <VisibilityRow
              label="Version"
              description="Product version"
              enabled={visibility.version}
              onClick={() =>
                toggleVisibility("version")
              }
            />

            {/* Stage */}
            <VisibilityRow
              label="Stage"
              description="Ideation, development or ready"
              enabled={visibility.stage}
              onClick={() =>
                toggleVisibility("stage")
              }
            />

            {/* Origin */}
            <VisibilityRow
              label="Origin"
              description="How the product originated"
              enabled={visibility.origin}
              onClick={() =>
                toggleVisibility("origin")
              }
            />

            {/* One-liner */}
            <VisibilityRow
              label="One-liner"
              description="The first description guests read"
              enabled={visibility.one_liner}
              onClick={() =>
                toggleVisibility("one_liner")
              }
            />

          </section>

        </aside>

      </div>

    </div>
  );
}


/* =========================
   VISIBILITY ROW
========================= */

function VisibilityRow({
  label,
  description,
  enabled,
  onClick,
}) {
  return (
    <div className="flex items-center justify-between gap-4 py-4 border-t border-gray-100">

      <div className="min-w-0">

        <p className="text-sm font-semibold text-gray-900">
          {label}
        </p>

        <p className="text-xs text-gray-500 mt-1">
          {description}
        </p>

      </div>

      <button
        type="button"
        onClick={onClick}
        aria-label={`Toggle ${label}`}
        className={
          "relative shrink-0 w-11 h-6 rounded-full transition-colors " +
          (enabled
            ? "bg-cyan-500"
            : "bg-gray-300")
        }
      >

        <span
          className={
            "absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform " +
            (enabled
              ? "translate-x-6"
              : "translate-x-1")
          }
        />

      </button>

    </div>
  );
}