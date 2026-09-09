import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

const API_URL =
  import.meta.env.VITE_API_URL ||
  "http://localhost:5000";

const DRAFT_KEY = "made-in-my-india-sell-draft";
const DRAFT_EXPIRY = 12 * 60 * 60 * 1000;

const EMPTY_FORM = {
  name: "",
  description: "",
  craft: "",
  category: "",
  state: "",
  district: "",
  material: "",

  artisan_name: "",
  making_method: "",
  heritage_info: "",

  gi_info: "",
  gi_reference: "",

  dimensions: "",
  weight: "",
  variants: "",

  price: "",
  stock: "",

  shipping_info: "",
  dispatch_time: "",

  seller_phone: "",
  seller_email: "",
};

function Sell() {
  const [form, setForm] = useState(EMPTY_FORM);

  const [images, setImages] = useState([]);
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);
  const [verificationResult, setVerificationResult] = useState(null);

  // Restore a saved draft if it is less than 12 hours old.
  useEffect(() => {
    try {
      const savedDraft = localStorage.getItem(DRAFT_KEY);

      if (!savedDraft) return;

      const parsed = JSON.parse(savedDraft);
      const isValid =
        parsed?.savedAt &&
        Date.now() - parsed.savedAt < DRAFT_EXPIRY &&
        parsed?.form;

      if (isValid) {
        setForm({
          ...EMPTY_FORM,
          ...parsed.form,
        });
        setStatus("Your saved draft has been restored.");
      } else {
        localStorage.removeItem(DRAFT_KEY);
      }
    } catch (error) {
      console.error("Could not restore saved draft:", error);
      localStorage.removeItem(DRAFT_KEY);
    }
  }, []);

  // Automatically save text fields for 12 hours.
  useEffect(() => {
    const hasFormData = Object.values(form).some(
      (value) => String(value).trim() !== ""
    );

    if (!hasFormData) return;

    try {
      localStorage.setItem(
        DRAFT_KEY,
        JSON.stringify({
          savedAt: Date.now(),
          form,
        })
      );
    } catch (error) {
      console.error("Could not save draft:", error);
    }
  }, [form]);

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

const handleImages = (e) => {
  const selectedFiles = Array.from(e.target.files);

  setImages((previousImages) => {
    const combined = [...previousImages, ...selectedFiles];

    if (combined.length > 10) {
      setStatus("You can upload a maximum of 10 images.");
      return combined.slice(0, 10);
    }

    setStatus("");

    return combined;
  });

  e.target.value = "";
};

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (images.length < 2) {
    setStatus("Please upload at least 2 product images for verification.");
    return;
    }

    if (images.length > 10) {
      setStatus("You can upload a maximum of 10 images.");
      return;
    }

    try {
      setLoading(true);
      setStatus("");

      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        throw new Error("Please log in before submitting a product.");
      }

      const formData = new FormData();

      Object.entries(form).forEach(([key, value]) => {
        formData.append(key, value);
      });

      images.forEach((image) => {
        formData.append("images", image);
      });

      const response = await fetch(`${API_URL}/api/products`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error || "Product submission failed"
        );
      }

      // The backend has finished ML + metadata verification.
      // Show the result in the verification popup.
      setVerificationResult(data.verification || data);
      setStatus("");

      setForm(EMPTY_FORM);
      localStorage.removeItem(DRAFT_KEY);
      setImages([]);
    } catch (error) {
      console.error(error);
      setStatus(error.message);
    } finally {
      setLoading(false);
    }
  };

  const getVerificationStatus = () => {
    const result = verificationResult || {};

    const value = String(
      result.authentication_status ||
      result.authenticationStatus ||
      result.status ||
      ""
    ).toLowerCase();

    return value === "verified" || value === "published"
      ? "verified"
      : "not_verified";
  };

  const getVerificationMessage = () => {
    if (getVerificationStatus() === "verified") {
      return {
        title: "Product Verified",
        message:
          "Your product has passed our image and product-detail verification checks.",
        detail: "Your listing is now live on Made in My India.",
        icon: "✓",
      };
    }

    return {
      title: "Product Not Verified",
      message:
        "The submitted images and product details could not be verified as a supported traditional craft product.",
      detail: "Your listing has not been published.",
      icon: "×",
    };
  };

  const verificationMessage = verificationResult
    ? getVerificationMessage()
    : null;

  const closeVerificationPopup = () => {
    const statusValue = getVerificationStatus();

    setVerificationResult(null);

    if (statusValue === "verified") {
      setStatus("Product verified and published successfully.");
    } else {
      setStatus("Product was not verified and has not been published.");
    }
  };


  return (
    <main className="min-h-screen bg-[#f8f3ea]">

      {/* VERIFICATION POPUP */}
      {(loading || verificationResult) && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[#39251f]/55 px-5 backdrop-blur-sm">
          <div
            className="w-full max-w-md overflow-hidden rounded-3xl border border-[#e2d3bd] bg-[#fffdf8] shadow-2xl"
            role="dialog"
            aria-modal="true"
            aria-labelledby="verification-title"
          >
            {loading ? (
              <div className="px-7 py-10 text-center">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full border border-[#d7bd7a] bg-[#f8f0df]">
                  <span className="verification-spinner h-8 w-8 rounded-full border-4 border-[#d9c9b2] border-t-[#731f2b]" />
                </div>

                <p className="mt-6 text-xs font-bold uppercase tracking-[0.25em] text-[#98734a]">
                  Made in My India
                </p>

                <h2
                  id="verification-title"
                  className="mt-2 text-3xl font-bold text-[#39251f]"
                >
                  Checking your product
                </h2>

                <p className="mx-auto mt-3 max-w-sm text-sm leading-6 text-[#806e5e]">
                  Please wait while we check your product images and listing details.
                </p>

                <div className="mt-7 space-y-3 text-left">
                  <div className="verification-step">
                    <span className="step-dot">1</span>
                    <span>Analyzing product images</span>
                  </div>
                  <div className="verification-step">
                    <span className="step-dot">2</span>
                    <span>Checking craft and product details</span>
                  </div>
                  <div className="verification-step">
                    <span className="step-dot">3</span>
                    <span>Running consistency verification</span>
                  </div>
                </div>

                <p className="mt-6 text-xs text-[#98734a]">
                  This may take a few moments. Please don't close this page.
                </p>
              </div>
            ) : (
              <div className="px-7 py-9 text-center">
                <div
                  className={`mx-auto flex h-16 w-16 items-center justify-center rounded-full border text-3xl font-bold ${
                    getVerificationStatus() === "verified"
                      ? "border-[#8da06b] bg-[#edf3e5] text-[#58713a]"
                      : "border-[#c98d82] bg-[#f8e9e6] text-[#8d3328]"
                  }`}
                >
                  {verificationMessage.icon}
                </div>

                <p className="mt-6 text-xs font-bold uppercase tracking-[0.25em] text-[#98734a]">
                  Verification result
                </p>

                <h2
                  id="verification-title"
                  className="mt-2 text-3xl font-bold text-[#39251f]"
                >
                  {verificationMessage.title}
                </h2>

                <p className="mx-auto mt-4 max-w-sm text-sm leading-6 text-[#806e5e]">
                  {verificationMessage.message}
                </p>

                <div className="mt-5 rounded-2xl border border-[#e2d3bd] bg-[#f8f3ea] px-5 py-4 text-sm font-semibold text-[#731f2b]">
                  {verificationMessage.detail}
                </div>

                {verificationResult?.predictedClass && (
                  <div className="mt-4 text-xs text-[#806e5e]">
                    Detected craft: {verificationResult.predictedClass}
                  </div>
                )}

                <button
                  type="button"
                  onClick={closeVerificationPopup}
                  className="mt-7 w-full rounded-full bg-[#731f2b] px-6 py-3.5 text-sm font-bold text-white transition hover:bg-[#5d1823]"
                >
                  Done
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Header */}
      <section className="bg-[#731f2b] px-6 py-16 text-[#fff8eb]">
        <div className="mx-auto max-w-5xl">

          <p className="text-xs font-bold uppercase tracking-[0.35em] text-[#e7c77e]">
            Sell on Made in My India
          </p>

          <h1 className="mt-4 text-5xl font-bold md:text-7xl">
            Tell us about
            <br />
            <span className="text-[#e5bd68]">
              your craft.
            </span>
          </h1>

          <p className="mt-6 max-w-2xl text-[#f1dfc5]">
            Share your handmade product with buyers across India.
            Every listing goes through our verification process.
          </p>

        </div>
      </section>

      {/* Form */}
      <section className="mx-auto max-w-5xl px-6 py-12">

        <form
          onSubmit={handleSubmit}
          className="rounded-3xl border border-[#e2d3bd] bg-[#fffdf8] p-6 md:p-10"
        >

          {/* PRODUCT INFORMATION */}
          <h2 className="text-3xl font-bold text-[#39251f]">
            Product information
          </h2>

          <p className="mt-2 text-sm text-[#806e5e]">
            Tell us about the product you are listing.
          </p>

          <div className="mt-8">
            <label className="label">
              Product Name *
            </label>

            <input
              name="name"
              value={form.name}
              onChange={handleChange}
              required
              placeholder="e.g. Madhubani Folk Painting"
              className="input"
            />
          </div>

          <div className="mt-6">
            <label className="label">
              Description *
            </label>

            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              required
              rows={5}
              placeholder="Describe your product..."
              className="input resize-none"
            />
          </div>

          <div className="mt-6 grid gap-6 md:grid-cols-2">

            <div>
              <label className="label">
                Craft / Tradition *
              </label>

              <input
                name="craft"
                value={form.craft}
                onChange={handleChange}
                required
                placeholder="e.g. Madhubani"
                className="input"
              />
            </div>

            <div>
              <label className="label">
                Category *
              </label>

              <select
                name="category"
                value={form.category}
                onChange={handleChange}
                required
                className="input"
              >
                <option value="">Select category</option>
                <option>Paintings</option>
                <option>Textiles</option>
                <option>Pottery</option>
                <option>Wood Craft</option>
                <option>Metal Craft</option>
                <option>Jewellery</option>
                <option>Home Decor</option>
                <option>Other</option>
              </select>
            </div>

          </div>

          {/* LOCATION */}
          <h2 className="section-title">
            Origin & location
          </h2>

          <div className="mt-6 grid gap-6 md:grid-cols-2">

            <div>
              <label className="label">
                State *
              </label>

              <input
                name="state"
                value={form.state}
                onChange={handleChange}
                required
                placeholder="e.g. Bihar"
                className="input"
              />
            </div>

            <div>
              <label className="label">
                District / City
              </label>

              <input
                name="district"
                value={form.district}
                onChange={handleChange}
                placeholder="e.g. Madhubani"
                className="input"
              />
            </div>

          </div>

          <div className="mt-6">
            <label className="label">
              Material *
            </label>

            <input
              name="material"
              value={form.material}
              onChange={handleChange}
              required
              placeholder="e.g. Handmade paper and natural colours"
              className="input"
            />
          </div>

          {/* ARTISAN */}
          <h2 className="section-title">
            Artisan & making process
          </h2>

          <div className="mt-6">
            <label className="label">
              Artisan / Creator Name *
            </label>

            <input
              name="artisan_name"
              value={form.artisan_name}
              onChange={handleChange}
              required
              placeholder="Name of the artisan or maker"
              className="input"
            />
          </div>

          <div className="mt-6">
            <label className="label">
              How is it made? *
            </label>

            <textarea
              name="making_method"
              value={form.making_method}
              onChange={handleChange}
              required
              rows={5}
              placeholder="Describe the handmade process, tools, techniques and materials used..."
              className="input resize-none"
            />
          </div>

          <div className="mt-6">
            <label className="label">
              Heritage / Cultural Information
            </label>

            <textarea
              name="heritage_info"
              value={form.heritage_info}
              onChange={handleChange}
              rows={5}
              placeholder="Tell us about the history, tradition or cultural significance of this craft..."
              className="input resize-none"
            />
          </div>

          {/* GI */}
          <h2 className="section-title">
            GI information
          </h2>

          <div className="mt-6">
            <label className="label">
              Is this craft/product associated with a GI tag?
            </label>

            <select
              name="gi_info"
              value={form.gi_info}
              onChange={handleChange}
              className="input"
            >
              <option value="">
                Select
              </option>
              <option value="Yes">
                Yes
              </option>
              <option value="No">
                No
              </option>
              <option value="Not sure">
                Not sure
              </option>
            </select>
          </div>

          <div className="mt-6">
            <label className="label">
              GI Registration / Reference
            </label>

            <input
              name="gi_reference"
              value={form.gi_reference}
              onChange={handleChange}
              placeholder="If applicable"
              className="input"
            />
          </div>

          {/* PRODUCT DETAILS */}
          <h2 className="section-title">
            Product details
          </h2>

          <div className="mt-6 grid gap-6 md:grid-cols-2">

            <div>
              <label className="label">
                Dimensions
              </label>

              <input
                name="dimensions"
                value={form.dimensions}
                onChange={handleChange}
                placeholder="e.g. 12 × 18 inches"
                className="input"
              />
            </div>

            <div>
              <label className="label">
                Weight
              </label>

              <input
                name="weight"
                value={form.weight}
                onChange={handleChange}
                placeholder="e.g. 500 g"
                className="input"
              />
            </div>

          </div>

          <div className="mt-6">
            <label className="label">
              Variants
            </label>

            <textarea
              name="variants"
              value={form.variants}
              onChange={handleChange}
              rows={3}
              placeholder="Mention available sizes, colours, designs or other variants..."
              className="input resize-none"
            />
          </div>

          {/* PRICE */}
          <div className="mt-6 grid gap-6 md:grid-cols-2">

            <div>
              <label className="label">
                Price (₹) *
              </label>

              <input
                type="number"
                name="price"
                value={form.price}
                onChange={handleChange}
                required
                min="1"
                placeholder="1800"
                className="input"
              />
            </div>

            <div>
              <label className="label">
                Stock *
              </label>

              <input
                type="number"
                name="stock"
                value={form.stock}
                onChange={handleChange}
                required
                min="0"
                placeholder="5"
                className="input"
              />
            </div>

          </div>

          {/* SHIPPING */}
          <h2 className="section-title">
            Shipping information
          </h2>

          <div className="mt-6">
            <label className="label">
              Shipping Information
            </label>

            <textarea
              name="shipping_info"
              value={form.shipping_info}
              onChange={handleChange}
              rows={4}
              placeholder="Mention anything buyers should know about shipping..."
              className="input resize-none"
            />
          </div>

          <div className="mt-6">
            <label className="label">
              Preparation / Dispatch Time
            </label>

            <input
              name="dispatch_time"
              value={form.dispatch_time}
              onChange={handleChange}
              placeholder="e.g. Ships within 5–7 days"
              className="input"
            />
          </div>

    {/* IMAGES */}
    <h2 className="section-title">
      Product images
    </h2>

    <div className="mt-6 rounded-2xl border-2 border-dashed border-[#d9c9b2] bg-[#fffaf2] p-8 text-center">

      <p className="text-3xl">
        📷
      </p>

      <p className="mt-3 font-semibold text-[#39251f]">
        Upload clear images of your product
      </p>

      <p className="mt-1 text-sm text-[#806e5e]">
        Upload at least 2 images. Front, back, close-up and detail
        images help with verification.
      </p>

      {/* Custom upload button */}
      <label
        htmlFor="product-images"
        className="mt-5 inline-block cursor-pointer rounded-full bg-[#731f2b] px-6 py-3 text-sm font-bold text-white transition hover:bg-[#5d1823]"
      >
        Choose Photos
      </label>

      <input
        id="product-images"
        type="file"
        accept="image/*"
        multiple
        onChange={handleImages}
        className="hidden"
      />

      {/* Selected images */}
      {images.length > 0 && (
        <div className="mt-6">

          <p className="mb-4 text-sm font-semibold text-[#731f2b]">
            {images.length} photo{images.length > 1 ? "s" : ""} selected
          </p>

          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">

            {images.map((image, index) => (
              <div
                key={`${image.name}-${index}`}
                className="group relative overflow-hidden rounded-xl border border-[#dccdb7] bg-white"
              >

                <img
                  src={URL.createObjectURL(image)}
                  alt={`Product ${index + 1}`}
                  className="h-32 w-full object-cover"
                />

                <button
                  type="button"
                  onClick={() => {
                    setImages((current) =>
                      current.filter((_, i) => i !== index)
                    );
                  }}
                  className="absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-full bg-[#731f2b] text-sm font-bold text-white shadow"
                >
                  ×
                </button>

              </div>
            ))}

          </div>

        </div>
      )}

    </div>

          {/* CONTACT */}
          <h2 className="section-title">
            Contact for verification
          </h2>

          <div className="mt-6 rounded-2xl border border-[#e2d3bd] bg-[#efe3d0] p-5">

            <p className="text-sm leading-6 text-[#725f50]">
              We may contact you to verify your product,
              craftsmanship, origin or other listing details.
              These details are for verification and will not
              be publicly displayed on your product listing.
            </p>

          </div>

          <div className="mt-6 grid gap-6 md:grid-cols-2">

            <div>
              <label className="label">
                Phone Number *
              </label>

              <input
                type="tel"
                name="seller_phone"
                value={form.seller_phone}
                onChange={handleChange}
                required
                placeholder="Your phone number"
                className="input"
              />
            </div>

            <div>
              <label className="label">
                Email Address *
              </label>

              <input
                type="email"
                name="seller_email"
                value={form.seller_email}
                onChange={handleChange}
                required
                placeholder="Your email address"
                className="input"
              />
            </div>

          </div>

          {/* VERIFICATION */}
          <div className="mt-8 rounded-2xl border border-[#e2d3bd] bg-[#efe3d0] p-5">

            <h3 className="font-bold text-[#39251f]">
              Authentication & verification
            </h3>

            <p className="mt-2 text-sm leading-6 text-[#725f50]">
              Your product information and images will be checked
              before the listing is published. Products may be
              marked as Verified, Under Review, or Not Verified.
            </p>

          </div>

          {/* STATUS */}
          {status && (
            <div className="mt-6 rounded-xl border border-[#e2d3bd] bg-[#fffaf2] p-4 text-sm font-semibold text-[#731f2b]">
              {status}
            </div>
          )}

          {/* SUBMIT */}
          <button
            type="submit"
            disabled={loading}
            className="mt-8 w-full rounded-full bg-[#731f2b] px-6 py-4 text-sm font-bold text-white transition hover:bg-[#5d1823] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading
              ? "Submitting..."
              : "Submit Product"}
          </button>

        </form>

      </section>

      <style>{`
        .label {
          display: block;
          margin-bottom: 8px;
          font-size: 0.75rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.12em;
          color: #98734a;
        }

        .input {
          width: 100%;
          border-radius: 12px;
          border: 1px solid #dccdb7;
          background: #fffaf2;
          padding: 12px 14px;
          font-size: 0.9rem;
          color: #4c382d;
          outline: none;
        }

        .input:focus {
          border-color: #731f2b;
        }

        .section-title {
          margin-top: 48px;
          font-size: 1.875rem;
          font-weight: 700;
          color: #39251f;
        }

        .verification-spinner {
          display: block;
          animation: verification-spin 0.9s linear infinite;
        }

        .verification-step {
          display: flex;
          align-items: center;
          gap: 12px;
          border: 1px solid #e2d3bd;
          border-radius: 12px;
          background: #fffaf2;
          padding: 11px 13px;
          font-size: 0.875rem;
          font-weight: 600;
          color: #5c4639;
        }

        .step-dot {
          display: flex;
          height: 25px;
          width: 25px;
          flex-shrink: 0;
          align-items: center;
          justify-content: center;
          border-radius: 9999px;
          background: #731f2b;
          color: white;
          font-size: 0.7rem;
          font-weight: 700;
        }

        @keyframes verification-spin {
          to {
            transform: rotate(360deg);
          }
        }
      `}</style>

    </main>
  );
}

export default Sell;