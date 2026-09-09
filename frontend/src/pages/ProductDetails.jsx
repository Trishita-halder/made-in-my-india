import { Link, useParams } from "react-router-dom";
import { useEffect, useState } from "react";

const API_URL = import.meta.env.VITE_API_URL;

function ProductDetails() {
  const { id } = useParams();

  const [product, setProduct] = useState(null);
  const [selectedImage, setSelectedImage] =
    useState(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // --------------------------------------------------
  // LOAD PRODUCT
  // --------------------------------------------------

  useEffect(() => {
    const loadProduct = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await fetch(
          `${API_URL}/api/products/${id}`
        );

        if (!response.ok) {
          throw new Error(
            "Product not found"
          );
        }

        const data = await response.json();

        setProduct(data);

        if (data.image) {
          setSelectedImage(data.image);
        }
      } catch (err) {
        console.error(err);

        setError("Product not found");
      } finally {
        setLoading(false);
      }
    };

    loadProduct();
  }, [id]);

  // --------------------------------------------------
  // LOADING
  // --------------------------------------------------

  if (loading) {
    return (
      <main className="min-h-screen bg-[#f8f3ea] px-6 py-24">

        <div className="mx-auto max-w-7xl text-center">

          <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-[#dfd0ba] border-t-[#731f2b]" />

          <p className="mt-4 text-sm text-[#78685b]">
            Loading product...
          </p>

        </div>

      </main>
    );
  }

  // --------------------------------------------------
  // NOT FOUND
  // --------------------------------------------------

  if (!product || error) {
    return (
      <main className="min-h-screen bg-[#f8f3ea] px-6 py-24 text-center">

        <h1 className="text-5xl font-bold text-[#731f2b]">
          Product not found
        </h1>

        <p className="mt-4 text-[#78685b]">
          This product may no longer be available.
        </p>

        <Link
          to="/shop"
          className="mt-6 inline-block rounded-full bg-[#731f2b] px-7 py-3 text-white"
        >
          Back to Shop
        </Link>

      </main>
    );
  }

  const verified =
    product.authentication_status ===
    "verified";

  const underReview =
    product.authentication_status ===
    "review";

  const images =
    product.images?.length > 0
      ? product.images
      : product.image
        ? [{ image_url: product.image }]
        : [];

  const mainImage =
    selectedImage ||
    images[0]?.image_url ||
    "/placeholder-product.jpg";

  return (
    <main className="min-h-screen bg-[#f8f3ea]">

      <div className="mx-auto max-w-7xl px-6 py-10 lg:px-8">

        {/* BACK */}

        <Link
          to="/shop"
          className="text-sm font-semibold text-[#8b633d]"
        >
          ← Back to collection
        </Link>

        <div className="mt-8 grid gap-12 lg:grid-cols-2">

          {/* ---------------------------------------- */}
          {/* IMAGES */}
          {/* ---------------------------------------- */}

          <div>

            <div className="overflow-hidden rounded-3xl border border-[#e2d3bd] bg-[#eadfce]">

              <img
                src={mainImage}
                alt={product.name}
                className="aspect-square h-full w-full object-cover"
              />

            </div>

            {images.length > 1 && (
              <div className="mt-4 grid grid-cols-4 gap-3">

                {images.map((image, index) => (
                  <button
                    key={
                      image.id ||
                      `${image.image_url}-${index}`
                    }
                    onClick={() =>
                      setSelectedImage(
                        image.image_url
                      )
                    }
                    className={`overflow-hidden rounded-xl border-2 bg-[#eadfce] ${
                      selectedImage ===
                      image.image_url
                        ? "border-[#731f2b]"
                        : "border-[#dfd0ba]"
                    }`}
                  >
                    <img
                      src={image.image_url}
                      alt={`${product.name} ${
                        index + 1
                      }`}
                      className="aspect-square h-full w-full object-cover"
                    />
                  </button>
                ))}

              </div>
            )}

          </div>

          {/* ---------------------------------------- */}
          {/* PRODUCT INFORMATION */}
          {/* ---------------------------------------- */}

          <div className="py-3">

            {/* BADGES */}

            <div className="flex flex-wrap gap-2">

              {product.craft && (
                <span className="rounded-full bg-[#ead9bd] px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-[#815b32]">
                  {product.craft}
                </span>
              )}

              <span
                className={`rounded-full px-4 py-1.5 text-xs font-bold text-white ${
                  verified
                    ? "bg-[#285c3c]"
                    : underReview
                      ? "bg-[#b47720]"
                      : "bg-red-700"
                }`}
              >
                {verified
                  ? "✓ Made in My India Verified"
                  : underReview
                    ? "Under Review"
                    : "Not Verified"}
              </span>

            </div>

            {/* NAME */}

            <h1 className="mt-6 text-6xl font-bold leading-[0.9] text-[#39251f]">
              {product.name}
            </h1>

            {/* PRICE */}

            <p className="mt-6 text-3xl font-bold text-[#731f2b]">
              ₹
              {Number(
                product.price
              ).toLocaleString("en-IN")}
            </p>

            <div className="my-8 h-px bg-[#dfd0ba]" />

            {/* DESCRIPTION */}

            <p className="leading-8 text-[#665548]">
              {product.description ||
                `A traditional Indian craft product from ${product.state}, representing the craftsmanship and cultural traditions of its region.`}
            </p>

            {/* -------------------------------------- */}
            {/* CRAFT DETAILS */}
            {/* -------------------------------------- */}

            <div className="mt-8 rounded-2xl border border-[#dfd0ba] bg-[#fffdf8] p-6">

              <h2 className="text-3xl font-bold text-[#39251f]">
                About the craft
              </h2>

              <div className="mt-5 grid grid-cols-2 gap-x-6 gap-y-5 text-sm">

                <Detail
                  label="Craft"
                  value={
                    product.craft
                  }
                />

                <Detail
                  label="Origin"
                  value={
                    product.state
                  }
                />

                <Detail
                  label="District"
                  value={
                    product.district ||
                    "Not specified"
                  }
                />

                <Detail
                  label="Material"
                  value={
                    product.material
                  }
                />

                <Detail
                  label="Maker"
                  value={
                    product.artisan_name ||
                    "Artisan"
                  }
                />

                <Detail
                  label="Category"
                  value={
                    product.category
                  }
                />

                {product.dimensions && (
                  <Detail
                    label="Dimensions"
                    value={
                      product.dimensions
                    }
                  />
                )}

                {product.weight && (
                  <Detail
                    label="Weight"
                    value={
                      product.weight
                    }
                  />
                )}

              </div>

            </div>

            {/* -------------------------------------- */}
            {/* HERITAGE */}
            {/* -------------------------------------- */}

            {product.heritage_info && (
              <div className="mt-5 rounded-2xl border border-[#d9c6a9] bg-[#efe3d0] p-6">

                <p className="text-xs font-bold uppercase tracking-widest text-[#98734a]">
                  Heritage
                </p>

                <h2 className="mt-2 text-2xl font-bold text-[#39251f]">
                  The story behind the craft
                </h2>

                <p className="mt-3 text-sm leading-7 text-[#725f50]">
                  {product.heritage_info}
                </p>

              </div>
            )}

            {/* -------------------------------------- */}
            {/* MAKING METHOD */}
            {/* -------------------------------------- */}

            {product.making_method && (
              <div className="mt-5 rounded-2xl border border-[#dfd0ba] bg-[#fffdf8] p-6">

                <p className="text-xs font-bold uppercase tracking-widest text-[#98734a]">
                  Crafting process
                </p>

                <p className="mt-3 text-sm leading-7 text-[#725f50]">
                  {product.making_method}
                </p>

              </div>
            )}

            {/* -------------------------------------- */}
            {/* GI INFORMATION */}
            {/* -------------------------------------- */}

            {(product.gi_info ||
              product.gi_reference) && (
              <div className="mt-5 rounded-2xl border border-[#dfd0ba] bg-[#fffdf8] p-6">

                <p className="text-xs font-bold uppercase tracking-widest text-[#98734a]">
                  Geographical Indication
                </p>

                {product.gi_info && (
                  <p className="mt-3 text-sm leading-7 text-[#725f50]">
                    {product.gi_info}
                  </p>
                )}

                {product.gi_reference && (
                  <p className="mt-3 text-sm font-semibold text-[#4b382c]">
                    Reference:{" "}
                    {product.gi_reference}
                  </p>
                )}

              </div>
            )}

            {/* -------------------------------------- */}
            {/* AUTHENTICATION */}
            {/* -------------------------------------- */}

            <div className="mt-5 rounded-2xl border border-[#d9c6a9] bg-[#efe3d0] p-6">

              <p className="text-xs font-bold uppercase tracking-widest text-[#98734a]">
                Authentication
              </p>

              <h2 className="mt-2 text-2xl font-bold text-[#39251f]">
                {verified
                  ? "Verified traditional craft"
                  : underReview
                    ? "Additional review required"
                    : "Not verified"}
              </h2>

              <p className="mt-2 text-sm leading-6 text-[#725f50]">
                {verified
                  ? "This product has passed the current verification process."
                  : underReview
                    ? "This product is currently undergoing additional review."
                    : "This product has not passed the current verification process."}
              </p>

            </div>

            {/* -------------------------------------- */}
            {/* SHIPPING */}
            {/* -------------------------------------- */}

            {(product.shipping_info ||
              product.dispatch_time) && (
              <div className="mt-5 rounded-2xl border border-[#dfd0ba] bg-[#fffdf8] p-6">

                <h2 className="text-2xl font-bold text-[#39251f]">
                  Shipping
                </h2>

                {product.shipping_info && (
                  <p className="mt-3 text-sm leading-7 text-[#725f50]">
                    {product.shipping_info}
                  </p>
                )}

                {product.dispatch_time && (
                  <p className="mt-3 text-sm font-semibold text-[#4b382c]">
                    Dispatch:{" "}
                    {product.dispatch_time}
                  </p>
                )}

              </div>
            )}

            {/* -------------------------------------- */}
            {/* PURCHASE */}
            {/* -------------------------------------- */}

            <div className="mt-8">

              {Number(product.stock) > 0 ? (
                <>
                  <p className="mb-4 text-sm font-semibold text-[#39704a]">
                    ✓ {product.stock} available
                  </p>

                  <button className="w-full rounded-full bg-[#731f2b] py-4 font-bold text-white transition hover:bg-[#5c1823]">
                    Add to Cart
                  </button>
                </>
              ) : (
                <button
                  disabled
                  className="w-full cursor-not-allowed rounded-full bg-[#d7cec1] py-4 font-bold text-[#8b8075]"
                >
                  Out of Stock
                </button>
              )}

            </div>

          </div>
        </div>
      </div>
    </main>
  );
}

// --------------------------------------------------
// DETAIL COMPONENT
// --------------------------------------------------

function Detail({ label, value }) {
  return (
    <div>
      <p className="text-xs uppercase tracking-wider text-[#9b8875]">
        {label}
      </p>

      <p className="mt-1 font-semibold text-[#4b382c]">
        {value || "Not specified"}
      </p>
    </div>
  );
}

export default ProductDetails;