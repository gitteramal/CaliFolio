import { useEffect, useState } from "react";
import {
  ArrowLeft,
  Save,
  Send,
  ExternalLink,
  Video,
  FileText,
  Globe,
  Image as ImageIcon,
  Loader2,
} from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";

const API_URL = "http://127.0.0.1:8000";

export default function FounderProductPage() {
  const navigate = useNavigate();
  const { productId } = useParams();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
const [saving, setSaving] = useState(false);
const [submitting, setSubmitting] = useState(false);
const [error, setError] = useState("");
const [toast, setToast] = useState(null);

function showToast(message, type = "success") {
  setToast({
    message,
    type,
  });

  setTimeout(() => {
    setToast(null);
  }, 3000);
}


  const [formData, setFormData] = useState({
    description: "",
    problem: "",
    how_it_works: "",
    ideal_customer_profile: "",
    value_proposition: "",
    highlights: "",

    company: "",
    headquarters: "",
    founded: "",
    team_size: "",
    deployment: "",
    pricing: "",

    founders_team: "",
    key_clients: "",
    roadmap: "",
    compliance: "",
    integrations: "",

    users: "",
    customers: "",
    traction: "",
    funds_raised: "",

    demo_video_url: "",
    pitch_deck_url: "",
    website_url: "",
    thumbnail_url: "",
  });

  // =========================================================
  // GET PRODUCT
  // =========================================================

  useEffect(() => {
    fetchProduct();
  }, [productId]);

  async function fetchProduct() {
    setLoading(true);
    setError("");

    try {
      const token = sessionStorage.getItem("access_token");

      const res = await fetch(
        `${API_URL}/products/founder/${productId}`,
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
          data.detail || "Unable to load product."
        );
      }

      setProduct(data);

      setFormData({
        description: data.description || "",
        problem: data.problem || "",
        how_it_works: data.how_it_works || "",
        ideal_customer_profile:
          data.ideal_customer_profile || "",
        value_proposition: data.value_proposition || "",
        highlights: data.highlights || "",

        company: data.company || "",
        headquarters: data.headquarters || "",
        founded: data.founded || "",
        team_size: data.team_size || "",
        deployment: data.deployment || "",
        pricing: data.pricing || "",

        founders_team: data.founders_team || "",
        key_clients: data.key_clients || "",
        roadmap: data.roadmap || "",
        compliance: data.compliance || "",
        integrations: data.integrations || "",

        users: data.users || "",
        customers: data.customers || "",
        traction: data.traction || "",
        funds_raised: data.funds_raised || "",

        demo_video_url: data.demo_video_url || "",
        pitch_deck_url: data.pitch_deck_url || "",
        website_url: data.website_url || "",
        thumbnail_url: data.thumbnail_url || "",
      });
    } catch (err) {
      setError(
        err.message || "Something went wrong."
      );
    } finally {
      setLoading(false);
    }
  }

  // =========================================================
  // INPUT CHANGE
  // =========================================================
 const isPendingReview = product?.status === "pending_review";
const isSaving = saving || submitting;


function handleChange(e) {
  const { name, value } = e.target;

  setFormData((prev) => ({
    ...prev,
    [name]: value,
  }));

  setError("");
}



function getStatusLabel(status) {
  switch (status) {
    case "draft":
      return "Draft";

    case "pending_review":
      return "Pending review";

    case "changes_requested":
      return "Changes requested";

    case "approved":
      return "Approved";

    case "published":
      return "Published";

    default:
      return "Draft";
  }
}

function getStatusClasses(status) {
  switch (status) {
    case "pending_review":
      return "bg-yellow-50 border-yellow-200 text-yellow-700";

    case "changes_requested":
      return "bg-orange-50 border-orange-200 text-orange-700";

    case "approved":
      return "bg-blue-50 border-blue-200 text-blue-700";

    case "published":
      return "bg-green-50 border-green-200 text-green-700";

    case "draft":
    default:
      return "bg-amber-50 border-amber-200 text-amber-700";
  }
}
  // =========================================================
  // SAVE
  // =========================================================

async function handleSave(e) {
  e.preventDefault();

  if (isPendingReview) {
    showToast("This product is already pending review.", "warning");
    return;
  }

  if (saving || submitting) {
    return;
  }

  setSaving(true);
  setError("");

  try {
    const token = sessionStorage.getItem("access_token");

    if (!token) {
      throw new Error("You are not authenticated. Please log in again.");
    }

    const res = await fetch(
      `${API_URL}/products/founder/${productId}/details`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      }
    );

    const data = await res.json();

    if (!res.ok) {
      throw new Error(
        data.detail || "Unable to save product."
      );
    }

    setProduct(data);

    showToast("Product saved as draft.", "success");

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  } catch (err) {
    setError(
      err.message || "Something went wrong while saving."
    );
  } finally {
    setSaving(false);
  }
}


async function handleSubmitForReview() {
  if (saving || submitting) {
    return;
  }

  if (isPendingReview) {
    showToast("This product is already pending review.", "warning");
    return;
  }

  setSubmitting(true);
  setError("");

  try {
    const token = sessionStorage.getItem("access_token");

    if (!token) {
      throw new Error("You are not authenticated. Please log in again.");
    }

    // ---------------------------------------------------------
    // STEP 1: Save the latest form data
    // ---------------------------------------------------------

    const saveRes = await fetch(
      `${API_URL}/products/founder/${productId}/details`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      }
    );

const savedData = await saveRes.json();

if (!saveRes.ok) {
  throw new Error(
    savedData.detail || "Unable to save product before submission."
  );
}

setProduct(savedData);

    // ---------------------------------------------------------
    // STEP 2: Submit the saved product for review
    // ---------------------------------------------------------

    const submitRes = await fetch(
      `${API_URL}/products/founder/${productId}/submit-review`,
      {
        method: "PATCH",
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    );

    const submittedData = await submitRes.json();

    if (!submitRes.ok) {
      throw new Error(
        submittedData.detail ||
          "Unable to submit product for review."
      );
    }

    // ---------------------------------------------------------
    // STEP 3: Update UI with returned product
    // ---------------------------------------------------------

    setProduct(submittedData);

    showToast(
      "Product submitted for review.",
      "success"
    );

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  } catch (err) {
    setError(
      err.message ||
        "Something went wrong while submitting."
    );
  } finally {
    setSubmitting(false);
  }
}

  // =========================================================
  // LOADING
  // =========================================================

  if (loading) {
    return (
      <div className="min-h-full flex items-center justify-center">
        <div className="flex items-center gap-3 text-gray-500">
          <Loader2
            size={20}
            className="animate-spin"
          />
          <span className="text-sm">
            Loading product...
          </span>
        </div>
      </div>
    );
  }

  // =========================================================
  // ERROR
  // =========================================================

  if (error && !product) {
    return (
      <div className="max-w-4xl mx-auto">
        <button
          onClick={() => navigate("/founder")}
          className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900 mb-6"
        >
          <ArrowLeft size={16} />
          Back to overview
        </button>

        <div className="bg-white border border-red-200 rounded-2xl p-8">
          <h2 className="text-lg font-bold text-gray-900">
            Unable to load product
          </h2>

          <p className="text-sm text-red-600 mt-2">
            {error}
          </p>
        </div>
      </div>
    );
  }

  // =========================================================
  // PAGE
  // =========================================================

  return (
    <div className="max-w-6xl mx-auto">

      {/* =====================================================
          TOP
      ====================================================== */}

      <div className="mb-8">

        {toast && (
  <div className="fixed top-6 right-6 z-[100]">
    <div className="flex items-center gap-3 px-5 py-3 rounded-xl bg-[#071015] text-white shadow-xl border border-white/10">

      <div className="flex items-center justify-center w-7 h-7 rounded-full bg-[#d8f3dc]">
        <span className="text-[#071015] text-sm font-bold">
          ✓
        </span>
      </div>

      <p className="text-sm font-medium">
        {toast.message}
      </p>

    </div>
  </div>
)}

        <button
          onClick={() => navigate("/founder")}
          className="inline-flex items-center gap-2 text-xs font-semibold text-gray-500 hover:text-gray-900 mb-6 transition-colors"
        >
          <ArrowLeft size={15} />
          Back to my products
        </button>

        <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-5">

          <div>

            <p className="text-[10px] uppercase tracking-[0.25em] text-cyan-600 font-semibold mb-2">
              Founder Workspace
            </p>

            <h1 className="cf-display text-4xl font-bold text-gray-950 tracking-tight">
              {product?.name}
            </h1>

            <p className="text-sm text-gray-500 mt-2 max-w-2xl">
              Complete your product profile. The CaliFolio
              admin team will review the information before
              publishing it to the showcase.
            </p>

          </div>

          <div className="flex items-center gap-3">

            <span
  className={`inline-flex items-center px-3 py-1.5 rounded-full border text-xs font-semibold ${getStatusClasses(
    product?.status
  )}`}
>
  {getStatusLabel(product?.status)}
</span>

            {product?.version && (
              <span className="inline-flex items-center px-3 py-1.5 rounded-full bg-gray-100 border border-gray-200 text-xs font-semibold text-gray-600">
                v{product.version}
              </span>
            )}

          </div>

        </div>

      </div>

      {/* =====================================================
          SUCCESS / ERROR
      ====================================================== */}


      {error && (
        <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3">
          <p className="text-sm font-medium text-red-700">
            {error}
          </p>
        </div>
      )}

      <form onSubmit={handleSave}>

        {/* =====================================================
            BASIC INFORMATION
        ====================================================== */}

        <Section
          eyebrow="Product"
          title="Basic information"
          description="These details were created by the CaliFolio admin."
        >

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

            <ReadOnlyField
              label="Product name"
              value={product?.name}
            />

            <ReadOnlyField
              label="Version"
              value={product?.version}
            />

            <ReadOnlyField
              label="Stage"
              value={product?.stage}
            />

            <ReadOnlyField
              label="Origin"
              value={product?.origin}
            />

            <div className="md:col-span-2">
              <ReadOnlyField
                label="One liner"
                value={product?.one_liner}
              />
            </div>

          </div>

        </Section>

        {/* =====================================================
            PRODUCT STORY
        ====================================================== */}

        <Section
          eyebrow="01"
          title="Product story"
          description="Tell guests what your product does and why it matters."
        >

          <div className="space-y-5">

            <TextareaField
              label="Description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Describe your product in detail..."
            />

            <TextareaField
              label="The problem"
              name="problem"
              value={formData.problem}
              onChange={handleChange}
              placeholder="What problem does your product solve?"
            />

            <TextareaField
              label="How it solves it"
              name="how_it_works"
              value={formData.how_it_works}
              onChange={handleChange}
              placeholder="Explain how your product solves the problem..."
            />

            <TextareaField
              label="Ideal customer profile"
              name="ideal_customer_profile"
              value={formData.ideal_customer_profile}
              onChange={handleChange}
              placeholder="Who is your ideal customer?"
            />

            <TextareaField
              label="Value proposition"
              name="value_proposition"
              value={formData.value_proposition}
              onChange={handleChange}
              placeholder="What value does your product provide?"
            />

            <TextareaField
              label="Highlights"
              name="highlights"
              value={formData.highlights}
              onChange={handleChange}
              placeholder="List your most important product highlights..."
            />

          </div>

        </Section>

        {/* =====================================================
            COMPANY
        ====================================================== */}

        <Section
          eyebrow="02"
          title="Company"
          description="Information about the company behind the product."
        >

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

            <InputField
              label="Company"
              name="company"
              value={formData.company}
              onChange={handleChange}
              placeholder="Company name"
            />

            <InputField
              label="Headquarters"
              name="headquarters"
              value={formData.headquarters}
              onChange={handleChange}
              placeholder="City, Country"
            />

            <InputField
              label="Founded"
              name="founded"
              value={formData.founded}
              onChange={handleChange}
              placeholder="2024"
            />

            <InputField
              label="Team size"
              name="team_size"
              value={formData.team_size}
              onChange={handleChange}
              placeholder="11-50"
            />

            <InputField
              label="Deployment"
              name="deployment"
              value={formData.deployment}
              onChange={handleChange}
              placeholder="SaaS, cloud, on-premise..."
            />

            <InputField
              label="Pricing"
              name="pricing"
              value={formData.pricing}
              onChange={handleChange}
              placeholder="Per seat, subscription..."
            />

          </div>

        </Section>

        {/* =====================================================
            FOUNDERS & BUSINESS
        ====================================================== */}

        <Section
          eyebrow="03"
          title="Founders & business"
          description="Help potential customers understand the people and businesses behind your product."
        >

          <div className="space-y-5">

            <TextareaField
              label="Founders & team"
              name="founders_team"
              value={formData.founders_team}
              onChange={handleChange}
              placeholder="Founder names, roles and team information..."
            />

            <TextareaField
              label="Key clients"
              name="key_clients"
              value={formData.key_clients}
              onChange={handleChange}
              placeholder="Your major customers or clients..."
            />

            <TextareaField
              label="Roadmap"
              name="roadmap"
              value={formData.roadmap}
              onChange={handleChange}
              placeholder="Upcoming product milestones..."
            />

            <TextareaField
              label="Compliance"
              name="compliance"
              value={formData.compliance}
              onChange={handleChange}
              placeholder="GDPR, SOC 2, ISO 27001..."
            />

            <TextareaField
              label="Integrations"
              name="integrations"
              value={formData.integrations}
              onChange={handleChange}
              placeholder="Jira, Azure DevOps, Slack..."
            />

          </div>

        </Section>

        {/* =====================================================
            METRICS
        ====================================================== */}

        <Section
          eyebrow="04"
          title="Metrics"
          description="Share the traction and numbers that demonstrate product progress."
        >

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

            <InputField
              label="Users"
              name="users"
              value={formData.users}
              onChange={handleChange}
              placeholder="1,240"
            />

            <InputField
              label="Customers"
              name="customers"
              value={formData.customers}
              onChange={handleChange}
              placeholder="25"
            />

            <InputField
              label="Traction"
              name="traction"
              value={formData.traction}
              onChange={handleChange}
              placeholder="$100K ARR"
            />

            <InputField
              label="Funds raised"
              name="funds_raised"
              value={formData.funds_raised}
              onChange={handleChange}
              placeholder="$1.2M seed"
            />

          </div>

        </Section>

        {/* =====================================================
            MEDIA & LINKS
        ====================================================== */}

        <Section
          eyebrow="05"
          title="Media & links"
          description="Add the resources guests can use to learn more about your product."
        >

          <div className="space-y-5">

            <LinkField
              icon={Video}
              label="Demo video URL"
              name="demo_video_url"
              value={formData.demo_video_url}
              onChange={handleChange}
              placeholder="https://youtube.com/..."
            />

            <LinkField
              icon={FileText}
              label="Pitch deck (PDF)"
              name="pitch_deck_url"
              value={formData.pitch_deck_url}
              onChange={handleChange}
              placeholder="https://..."
            />

            <LinkField
              icon={Globe}
              label="Website URL"
              name="website_url"
              value={formData.website_url}
              onChange={handleChange}
              placeholder="https://yourcompany.com"
            />

            <LinkField
              icon={ImageIcon}
              label="Thumbnail URL"
              name="thumbnail_url"
              value={formData.thumbnail_url}
              onChange={handleChange}
              placeholder="https://..."
            />

          </div>

        </Section>

        {/* =====================================================
            SAVE
        ====================================================== */}

<div className="sticky bottom-0 bg-[#eef2f3]/95 backdrop-blur border-t border-gray-200 py-5 mt-8">

  <div className="max-w-6xl mx-auto flex items-center justify-between gap-4">

<div>
  <p className="text-xs font-semibold text-gray-700">
    Product status
  </p>

  <div className="flex items-center gap-2 mt-1">
    <span
      className={`w-2 h-2 rounded-full ${
        product?.status === "draft"
          ? "bg-gray-400"
          : product?.status === "pending_review"
          ? "bg-yellow-500"
          : product?.status === "changes_requested"
          ? "bg-orange-500"
          : product?.status === "approved"
          ? "bg-blue-500"
          : product?.status === "published"
          ? "bg-green-500"
          : "bg-gray-400"
      }`}
    />

    <p className="text-xs font-semibold text-gray-700">
      {product?.status === "draft"
        ? "Draft"
        : product?.status === "pending_review"
        ? "Pending review"
        : product?.status === "changes_requested"
        ? "Changes requested"
        : product?.status === "approved"
        ? "Approved"
        : product?.status === "published"
        ? "Published"
        : "Draft"}
    </p>
  </div>

  <p className="text-xs text-gray-500 mt-1">
    {product?.status === "draft"
      ? "Continue adding details to your product."
      : product?.status === "pending_review"
      ? "Your product is waiting for admin review."
      : product?.status === "changes_requested"
      ? "Admin has requested changes to your product."
      : product?.status === "approved"
      ? "Your product has been approved by the admin."
      : product?.status === "published"
      ? "Your product is live on the showcase."
      : "Continue adding details to your product."}
  </p>
</div>

<div className="flex items-center gap-3">

  {/* SAVE DRAFT */}
<button
  type="submit"
  disabled={isSaving}
  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-[#071015] text-white text-sm font-semibold hover:bg-[#162126] transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
>
    {saving ? (
      <>
        <Loader2
          size={16}
          className="animate-spin"
        />
        Saving...
      </>
    ) : (
      <>
        <Save size={16} />
        Save draft
      </>
    )}
  </button>

  {/* SUBMIT FOR REVIEW */}
<button
  type="button"
  onClick={handleSubmitForReview}
  disabled={saving}
  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-[#071015] text-white text-sm font-semibold hover:bg-[#162126] transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
>
  {saving ? (
    <>
      <Loader2
        size={16}
        className="animate-spin"
      />
      Submitting...
    </>
  ) : (
    <>
      <Send size={16} />
      Submit for Review
    </>
  )}
</button>

</div>

  </div>

</div>

      </form>

    </div>
  );
}


/* =========================================================
   SECTION
========================================================= */

function Section({
  eyebrow,
  title,
  description,
  children,
}) {
  return (
    <section className="bg-white rounded-2xl border border-gray-200 shadow-sm p-7 mb-6">

      <div className="mb-6">

        <p className="text-[10px] uppercase tracking-[0.25em] text-gray-400 font-semibold">
          {eyebrow}
        </p>

        <h2 className="cf-display text-xl font-bold text-gray-900 mt-1">
          {title}
        </h2>

        <p className="text-sm text-gray-500 mt-1">
          {description}
        </p>

      </div>

      {children}

    </section>
  );
}


/* =========================================================
   INPUT
========================================================= */

function InputField({
  label,
  name,
  value,
  onChange,
  placeholder,
}) {
  return (
    <div>

      <label className="block text-xs font-semibold text-gray-700 mb-2">
        {label}
      </label>

      <input
        type="text"
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="w-full h-11 px-3.5 rounded-lg border border-gray-200 bg-gray-50 text-sm text-gray-900 placeholder:text-gray-400 outline-none focus:bg-white focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/10 transition"
      />

    </div>
  );
}


/* =========================================================
   TEXTAREA
========================================================= */

function TextareaField({
  label,
  name,
  value,
  onChange,
  placeholder,
}) {
  return (
    <div>

      <label className="block text-xs font-semibold text-gray-700 mb-2">
        {label}
      </label>

      <textarea
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        rows={4}
        className="w-full px-3.5 py-3 rounded-lg border border-gray-200 bg-gray-50 text-sm text-gray-900 placeholder:text-gray-400 outline-none focus:bg-white focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/10 transition resize-y"
      />

    </div>
  );
}


/* =========================================================
   READ ONLY FIELD
========================================================= */

function ReadOnlyField({
  label,
  value,
}) {
  return (
    <div>

      <label className="block text-xs font-semibold text-gray-500 mb-2">
        {label}
      </label>

      <div className="w-full min-h-11 px-3.5 py-3 rounded-lg border border-gray-200 bg-gray-100 text-sm text-gray-700">
        {value || "Not provided"}
      </div>

    </div>
  );
}


/* =========================================================
   LINK FIELD
========================================================= */

function LinkField({
  icon: Icon,
  label,
  name,
  value,
  onChange,
  placeholder,
}) {
  return (
    <div>

      <label className="block text-xs font-semibold text-gray-700 mb-2">
        {label}
      </label>

      <div className="relative">

        <Icon
          size={17}
          className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"
        />

        <input
          type="url"
          name={name}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          className="w-full h-11 pl-10 pr-3.5 rounded-lg border border-gray-200 bg-gray-50 text-sm text-gray-900 placeholder:text-gray-400 outline-none focus:bg-white focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/10 transition"
        />

        {value && (
          <a
            href={value}
            target="_blank"
            rel="noopener noreferrer"
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-cyan-600"
            onClick={(e) => e.stopPropagation()}
          >
            <ExternalLink size={15} />
          </a>
        )}

      </div>

    </div>
  );
}