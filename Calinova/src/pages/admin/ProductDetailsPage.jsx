import React, { useEffect, useState } from "react";
import {
  ArrowLeft,
  Play,
  ExternalLink,
  Pencil,
} from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";

const API_URL = "http://127.0.0.1:8000";

export default function ProductDetailsPage() {
  const navigate = useNavigate();
  const { productId } = useParams();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // =========================================================
  // LOAD PUBLISHED PRODUCT - ADMIN
  // =========================================================

  useEffect(() => {
    async function loadProduct() {
      try {
        setLoading(true);
        setError("");

        const token = localStorage.getItem("access_token");

        if (!token) {
          throw new Error("You are not authenticated.");
        }

        const response = await fetch(
          `${API_URL}/products/admin/published/${productId}`,
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
            data.detail || "Failed to load product."
          );
        }

        setProduct(data);
      } catch (err) {
        console.error("Failed to load product:", err);

        setError(
          err.message || "Failed to load product."
        );
      } finally {
        setLoading(false);
      }
    }

    loadProduct();
  }, [productId]);

  // =========================================================
  // HELPERS
  // =========================================================

  const isEmpty = (value) => {
    return (
      value === null ||
      value === undefined ||
      String(value).trim() === ""
    );
  };

  const displayValue = (value) => {
    return isEmpty(value) ? "" : String(value);
  };

  function formatStage(stage) {
    const stages = {
      ideation: "Ideation",
      in_development: "In Development",
      ready: "Ready",
    };

    return stages[stage] || displayValue(stage);
  }

  function formatOrigin(origin) {
    const origins = {
      in_house: "In-house",
      acquired: "Acquired",
      whitelabeled: "White-labeled",
      hosted: "Hosted",
    };

    return origins[origin] || displayValue(origin);
  }

  // =========================================================
  // LOADING
  // =========================================================

  if (loading) {
    return (
      <div className="min-h-[500px] flex items-center justify-center">
        <p className="text-sm text-gray-500">
          Loading product...
        </p>
      </div>
    );
  }

  // =========================================================
  // ERROR
  // =========================================================

  if (error) {
    return (
      <div className="max-w-[1300px] mx-auto">

        <button
          type="button"
          onClick={() => navigate("/admin/software")}
          className="
            inline-flex
            items-center
            gap-2
            mb-5
            px-3
            py-2
            rounded-lg
            border
            border-gray-200
            bg-white
            text-sm
            font-medium
            text-gray-600
            hover:bg-gray-50
            hover:text-gray-900
            transition
          "
        >
          <ArrowLeft size={15} />
          Back to Software Showcase
        </button>

        <div className="bg-white border border-red-200 rounded-xl p-6">
          <p className="text-sm text-red-600">
            {error}
          </p>
        </div>

      </div>
    );
  }

  if (!product) {
    return null;
  }

  return (
    <div className="w-full">

      <div className="max-w-[1300px] mx-auto">

        {/* ===================================================
            TOP ACTIONS
        ==================================================== */}

        <div className="flex flex-wrap items-center justify-between gap-3 mb-5">

          {/* BACK */}

          <button
            type="button"
            onClick={() => navigate("/admin/software")}
            className="
              inline-flex
              items-center
              gap-2
              px-3
              py-2
              rounded-lg
              border
              border-gray-200
              bg-white
              text-sm
              font-medium
              text-gray-600
              hover:bg-gray-50
              hover:text-gray-900
              transition
            "
          >
            <ArrowLeft size={15} />
            Back to Software Showcase
          </button>


          {/* EDIT */}

          <button
            type="button"
            onClick={() =>
              navigate(`/admin/software/${product.id}/edit`)
            }
            className="
              inline-flex
              items-center
              gap-2
              px-4
              py-2
              rounded-lg
              bg-black
              text-white
              text-sm
              font-medium
              hover:bg-gray-800
              transition
            "
          >
            <Pencil size={15} />
            Edit Product
          </button>

        </div>


        {/* ===================================================
            HERO
        ==================================================== */}

        <section
          className="
            relative
            overflow-hidden
            rounded-2xl
            border
            border-[#16494c]
            bg-[#061013]
            shadow-[0_4px_18px_rgba(15,23,42,0.10)]
          "
        >

          {/* Background */}

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
              right-[-80px]
              top-[-100px]
              w-[300px]
              h-[300px]
              rounded-full
              border
              border-white/[0.05]
            "
          />

          {/* Decorative lines */}

          <div
            className="
              absolute
              right-[-40px]
              top-[45px]
              w-[280px]
              h-px
              bg-white/[0.06]
              rotate-[27deg]
            "
          />

          <div
            className="
              absolute
              right-[-50px]
              top-[100px]
              w-[240px]
              h-px
              bg-white/[0.04]
              rotate-[27deg]
            "
          />


          {/* HERO CONTENT */}

          <div className="relative px-6 md:px-8 pt-7 pb-7">

            {/* Status */}

            <div className="flex flex-wrap items-center gap-2 mb-4">

              <span
                className="
                  inline-flex
                  items-center
                  gap-2
                  rounded-md
                  bg-[#143b3d]
                  border
                  border-[#286063]
                  px-2.5
                  py-1.5
                  text-[10px]
                  font-semibold
                  uppercase
                  tracking-[0.08em]
                  text-[#a0d9d4]
                "
              >
                <span className="w-1.5 h-1.5 rounded-full bg-[#5ee4c7]" />

                {formatStage(product.stage)}
              </span>


              <span
                className="
                  rounded-md
                  bg-white/[0.07]
                  border
                  border-white/[0.09]
                  px-2.5
                  py-1.5
                  text-[10px]
                  text-gray-300
                "
              >
                {formatOrigin(product.origin)}
              </span>


              {product.version && (
                <span
                  className="
                    rounded-md
                    bg-white/[0.07]
                    border
                    border-white/[0.09]
                    px-2.5
                    py-1.5
                    text-[10px]
                    text-gray-300
                  "
                >
                  {product.version}
                </span>
              )}

              {/* Published */}

              <span
                className="
                  rounded-md
                  bg-green-500/10
                  border
                  border-green-400/20
                  px-2.5
                  py-1.5
                  text-[10px]
                  font-semibold
                  text-green-300
                "
              >
                PUBLISHED
              </span>

            </div>


            {/* Product Name */}

            <h1
              className="
                cf-display
                text-[32px]
                md:text-[38px]
                leading-tight
                font-bold
                tracking-[-0.025em]
                text-white
              "
            >
              {displayValue(product.name)}
            </h1>


            {/* One liner */}

            <p
              className="
                mt-2
                max-w-[780px]
                text-[14px]
                md:text-[15px]
                leading-6
                text-gray-300
              "
            >
              {displayValue(product.one_liner)}
            </p>


            {/* Tags */}

            <div className="flex flex-wrap gap-2 mt-4">
              <SmallDarkTag text="Software" />
              <SmallDarkTag text="Product" />
              <SmallDarkTag text="Showcase" />
            </div>

          </div>


          {/* =================================================
              METRICS
          ================================================== */}

          <div
            className="
              relative
              grid
              grid-cols-2
              md:grid-cols-4
              border-t
              border-white/[0.08]
              bg-[#050b0e]/90
            "
          >

            <Metric
              label="USERS"
              value={product.users}
            />

            <Metric
              label="CUSTOMERS"
              value={product.customers}
            />

            <Metric
              label="TRACTION"
              value={product.traction}
            />

            <Metric
              label="FUNDS RAISED"
              value={product.funds_raised}
            />

          </div>

        </section>


        {/* ===================================================
            MAIN CONTENT
        ==================================================== */}

        <div
          className="
            grid
            grid-cols-1
            lg:grid-cols-[minmax(0,1fr)_300px]
            gap-5
            mt-5
          "
        >

          {/* =================================================
              LEFT COLUMN
          ================================================== */}

          <main className="min-w-0">

            {/* VIDEO */}

            <section
              className="
                bg-white
                rounded-xl
                border
                border-gray-200
                p-2.5
                shadow-[0_2px_10px_rgba(15,23,42,0.05)]
              "
            >

              <div
                className="
                  relative
                  aspect-[16/7]
                  rounded-lg
                  overflow-hidden
                  bg-[#061114]
                  border
                  border-[#152b2f]
                "
              >

                <div
                  className="
                    absolute
                    inset-0
                    bg-[radial-gradient(circle_at_center,#123f46_0%,#071a1e_38%,#050d10_78%)]
                  "
                />

                <div
                  className="
                    absolute
                    left-1/2
                    top-1/2
                    -translate-x-1/2
                    -translate-y-1/2
                    w-[220px]
                    h-[220px]
                    rounded-full
                    bg-[#0b6a76]/20
                    blur-3xl
                  "
                />

                <div
                  className="
                    absolute
                    left-1/2
                    top-1/2
                    -translate-x-1/2
                    -translate-y-1/2
                    w-16
                    h-16
                    rounded-full
                    bg-white/[0.10]
                    border
                    border-white/[0.25]
                    backdrop-blur-sm
                    flex
                    items-center
                    justify-center
                  "
                >
                  <Play
                    size={23}
                    fill="white"
                    className="text-white ml-1"
                  />
                </div>


                {product.demo_video_url && (
                  <a
                    href={product.demo_video_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="absolute inset-0 z-10"
                    aria-label="Watch product demo"
                  />
                )}

              </div>


              <div
                className="
                  flex
                  items-center
                  justify-between
                  px-1
                  pt-2
                  pb-1
                "
              >
                <span className="text-[12px] text-gray-400">
                  Product walkthrough
                </span>

                <span className="text-[12px] text-gray-400">
                  {product.demo_video_url
                    ? "Watch demo"
                    : "Demo video not provided"}
                </span>
              </div>

            </section>


            {/* DESCRIPTION */}

            <div className="space-y-4 mt-4">

              <ContentCard
                label="DESCRIPTION"
                value={product.description}
              />

              <ContentCard
                label="THE PROBLEM"
                value={product.problem}
              />

              <ContentCard
                label="HOW IT WORKS"
                value={product.how_it_works}
              />

              <ContentCard
                label="IDEAL CUSTOMER PROFILE"
                value={product.ideal_customer_profile}
              />

              <ContentCard
                label="VALUE PROPOSITION"
                value={product.value_proposition}
              />

              <ContentCard
                label="HIGHLIGHTS"
                value={product.highlights}
              />


              {/* COMPANY */}

              <section className="compact-card">

                <SectionTitle title="COMPANY" />

                <div
                  className="
                    grid
                    grid-cols-1
                    md:grid-cols-2
                    gap-x-8
                    gap-y-4
                  "
                >

                  <Info
                    label="Company"
                    value={product.company}
                  />

                  <Info
                    label="Headquarters"
                    value={product.headquarters}
                  />

                  <Info
                    label="Founded"
                    value={product.founded}
                  />

                  <Info
                    label="Team Size"
                    value={product.team_size}
                  />

                  <Info
                    label="Deployment"
                    value={product.deployment}
                  />

                  <Info
                    label="Pricing"
                    value={product.pricing}
                  />

                </div>

              </section>


              {/* FOUNDERS & BUSINESS */}

              <section className="compact-card">

                <SectionTitle title="FOUNDERS & BUSINESS" />

                <div className="space-y-4">

                  <Info
                    label="Founders & Team"
                    value={product.founders_team}
                    large
                  />

                  <Info
                    label="Key Clients"
                    value={product.key_clients}
                    large
                  />

                  <Info
                    label="Roadmap"
                    value={product.roadmap}
                    large
                  />

                  <Info
                    label="Compliance"
                    value={product.compliance}
                    large
                  />

                  <Info
                    label="Integrations"
                    value={product.integrations}
                    large
                  />

                </div>

              </section>


              {/* TRACTION */}

              <section className="compact-card">

                <SectionTitle title="TRACTION & METRICS" />

                <div
                  className="
                    grid
                    grid-cols-1
                    md:grid-cols-2
                    gap-x-8
                    gap-y-4
                  "
                >

                  <Info
                    label="Users"
                    value={product.users}
                  />

                  <Info
                    label="Customers"
                    value={product.customers}
                  />

                  <Info
                    label="Traction"
                    value={product.traction}
                  />

                  <Info
                    label="Funds Raised"
                    value={product.funds_raised}
                  />

                </div>

              </section>


              {/* MEDIA */}

              <section className="compact-card">

                <SectionTitle title="MEDIA & LINKS" />

                <div className="space-y-3">

                  <LinkField
                    label="Demo Video"
                    value={product.demo_video_url}
                  />

                  <LinkField
                    label="Pitch Deck"
                    value={product.pitch_deck_url}
                  />

                  <LinkField
                    label="Website"
                    value={product.website_url}
                  />

                  <LinkField
                    label="Thumbnail"
                    value={product.thumbnail_url}
                  />

                </div>

              </section>

            </div>

          </main>


          {/* =================================================
              RIGHT SIDEBAR
          ================================================== */}

          <aside className="space-y-4">

            {/* AT A GLANCE */}

            <section className="compact-card">

              <SectionTitle title="AT A GLANCE" />

              <div className="space-y-3">

                <SideInfo
                  label="Stage"
                  value={formatStage(product.stage)}
                />

                <SideInfo
                  label="Origin"
                  value={formatOrigin(product.origin)}
                />

                <SideInfo
                  label="Version"
                  value={product.version}
                />

                <SideInfo
                  label="Company"
                  value={product.company}
                />

                <SideInfo
                  label="Headquarters"
                  value={product.headquarters}
                />

                <SideInfo
                  label="Founded"
                  value={product.founded}
                />

                <SideInfo
                  label="Team Size"
                  value={product.team_size}
                />

                <SideInfo
                  label="Deployment"
                  value={product.deployment}
                />

                <SideInfo
                  label="Pricing"
                  value={product.pricing}
                />

              </div>

            </section>


            {/* FOUNDERS */}

            <section className="compact-card">

              <SectionTitle title="FOUNDERS & TEAM" />

              <p
                className={`
                  text-[13px]
                  leading-6
                  whitespace-pre-line
                  ${
                    isEmpty(product.founders_team)
                      ? "text-gray-300"
                      : "text-gray-600"
                  }
                `}
              >
                {displayValue(product.founders_team)}
              </p>

            </section>


            {/* COMPLIANCE */}

            <section className="compact-card">

              <SectionTitle title="COMPLIANCE" />

              <TagContent
                value={product.compliance}
              />

            </section>


            {/* INTEGRATIONS */}

            <section className="compact-card">

              <SectionTitle title="INTEGRATIONS" />

              <TagContent
                value={product.integrations}
              />

            </section>

          </aside>

        </div>

      </div>


      {/* =====================================================
          LOCAL STYLES
      ====================================================== */}

      <style>{`
        .compact-card {
          background: white;
          border: 1px solid #e5e7eb;
          border-radius: 13px;
          padding: 20px;
          box-shadow: 0 2px 10px rgba(15, 23, 42, 0.05);
        }
      `}</style>

    </div>
  );
}


// =============================================================
// SMALL DARK TAG
// =============================================================

function SmallDarkTag({ text }) {
  return (
    <span
      className="
        inline-flex
        items-center
        rounded-md
        bg-white/[0.07]
        border
        border-white/[0.09]
        px-2.5
        py-1.5
        text-[10px]
        text-gray-300
      "
    >
      {text}
    </span>
  );
}


// =============================================================
// METRIC
// =============================================================

function Metric({ label, value }) {
  const empty =
    value === null ||
    value === undefined ||
    String(value).trim() === "";

  return (
    <div
      className="
        px-5
        py-4
        border-r
        border-white/[0.08]
        last:border-r-0
      "
    >
      <p
        className="
          text-[9px]
          tracking-[0.18em]
          font-semibold
          text-gray-500
        "
      >
        {label}
      </p>

      <p className="text-base font-bold text-white mt-1.5">
        {empty ? " " : value}
      </p>
    </div>
  );
}


// =============================================================
// CONTENT CARD
// =============================================================

function ContentCard({ label, value }) {
  const empty =
    value === null ||
    value === undefined ||
    String(value).trim() === "";

  return (
    <section className="compact-card">

      <SectionTitle title={label} />

      <p
        className={`
          text-[14px]
          leading-7
          whitespace-pre-line
          ${
            empty
              ? "text-gray-300"
              : "text-gray-700"
          }
        `}
      >
        {empty ? " " : value}
      </p>

    </section>
  );
}


// =============================================================
// SECTION TITLE
// =============================================================

function SectionTitle({ title }) {
  return (
    <p
      className="
        text-[11px]
        tracking-[0.20em]
        font-semibold
        text-gray-400
        uppercase
        mb-4
      "
    >
      {title}
    </p>
  );
}


// =============================================================
// INFO
// =============================================================

function Info({
  label,
  value,
  large = false,
}) {
  const empty =
    value === null ||
    value === undefined ||
    String(value).trim() === "";

  return (
    <div className="border-b border-gray-100 pb-3">

      <p
        className="
          text-[10px]
          tracking-[0.12em]
          uppercase
          font-semibold
          text-gray-400
          mb-1
        "
      >
        {label}
      </p>

      <p
        className={`
          ${large ? "text-[13px]" : "text-[13px]"}
          leading-6
          whitespace-pre-line
          ${
            empty
              ? "text-gray-300"
              : "text-gray-700"
          }
        `}
      >
        {empty ? " " : value}
      </p>

    </div>
  );
}


// =============================================================
// SIDEBAR INFO
// =============================================================

function SideInfo({ label, value }) {
  const empty =
    value === null ||
    value === undefined ||
    String(value).trim() === "";

  return (
    <div
      className="
        flex
        items-start
        justify-between
        gap-4
        border-b
        border-dashed
        border-gray-200
        pb-3
      "
    >

      <span className="text-[12px] text-gray-500">
        {label}
      </span>

      <span
        className={`
          text-[12px]
          font-semibold
          text-right
          leading-5
          max-w-[165px]
          ${
            empty
              ? "text-gray-300"
              : "text-gray-800"
          }
        `}
      >
        {empty ? " " : value}
      </span>

    </div>
  );
}


// =============================================================
// TAG CONTENT
// =============================================================

function TagContent({ value }) {
  const empty =
    value === null ||
    value === undefined ||
    String(value).trim() === "";

  if (empty) {
    return (
      <div className="min-h-[24px] text-[12px] text-gray-300">
        &nbsp;
      </div>
    );
  }

  const items = String(value)
    .split(/[,|\n]/)
    .map((item) => item.trim())
    .filter(Boolean);

  return (
    <div className="flex flex-wrap gap-1.5">

      {items.map((item, index) => (
        <span
          key={`${item}-${index}`}
          className="
            inline-flex
            px-2
            py-1
            rounded-md
            bg-gray-100
            border
            border-gray-200
            text-[11px]
            text-gray-500
          "
        >
          {item}
        </span>
      ))}

    </div>
  );
}


// =============================================================
// LINK FIELD
// =============================================================

function LinkField({ label, value }) {
  const empty =
    value === null ||
    value === undefined ||
    String(value).trim() === "";

  return (
    <div
      className="
        flex
        items-center
        justify-between
        gap-4
        border-b
        border-gray-100
        pb-3
      "
    >

      <div className="min-w-0">

        <p
          className="
            text-[10px]
            uppercase
            tracking-[0.12em]
            font-semibold
            text-gray-400
          "
        >
          {label}
        </p>

        <p
          className={`
            text-[12px]
            mt-1
            truncate
            ${
              empty
                ? "text-gray-300"
                : "text-gray-500"
            }
          `}
        >
          {empty ? " " : value}
        </p>

      </div>


      {!empty && (
        <a
          href={value}
          target="_blank"
          rel="noopener noreferrer"
          className="
            shrink-0
            inline-flex
            items-center
            gap-1.5
            px-2.5
            py-1.5
            rounded-md
            border
            border-gray-200
            text-[11px]
            font-semibold
            text-gray-600
            hover:bg-gray-50
            transition
          "
        >
          Open
          <ExternalLink size={11} />
        </a>
      )}

    </div>
  );
}