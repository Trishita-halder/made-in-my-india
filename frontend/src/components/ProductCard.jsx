import { Link } from "react-router-dom";

function ProductCard({ product }) {
  const verified =
    product.authentication_status === "verified";

  const underReview =
    product.authentication_status === "review";

  return (
    <Link
      to={`/product/${product.id}`}
      className="group block"
    >
      <div className="overflow-hidden rounded-2xl border border-[#e3d5c1] bg-[#fffdf8] shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-xl">

        {/* Product image */}
        <div className="relative aspect-[4/5] overflow-hidden bg-[#eadfce]">

          <img
            src={
              product.image ||
              "/placeholder-product.jpg"
            }
            alt={product.name}
            className="h-full w-full object-cover transition duration-700 group-hover:scale-105"
          />

          {/* Verification badge */}
          <div className="absolute left-4 top-4">
            <span
              className={`rounded-full px-3 py-1.5 text-xs font-semibold backdrop-blur ${
                verified
                  ? "bg-[#285c3c]/90 text-white"
                  : underReview
                    ? "bg-[#b47720]/90 text-white"
                    : "bg-red-700/90 text-white"
              }`}
            >
              {verified
                ? "✓ Made in My India Verified"
                : underReview
                  ? "Under Review"
                  : "Not Verified"}
            </span>
          </div>

          {/* Wishlist */}
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
            }}
            className="absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-full bg-white/90 text-lg text-[#731f2b] shadow"
            aria-label="Add to wishlist"
          >
            ♡
          </button>
        </div>

        {/* Details */}
        <div className="p-5">

          <div className="flex items-center justify-between">

            <p className="text-xs font-bold uppercase tracking-widest text-[#a26e35]">
              {product.craft}
            </p>

            <p className="text-xs text-[#907b66]">
              {product.state}
            </p>

          </div>

          <h3 className="mt-2 text-2xl font-semibold leading-tight text-[#39251f]">
            {product.name}
          </h3>

          <p className="mt-2 text-sm text-[#78685b]">
            {product.material}
          </p>

          <div className="mt-5 flex items-end justify-between">

            <div>
              <p className="text-xs text-[#9a8978]">
                Price
              </p>

              <p className="text-xl font-bold text-[#731f2b]">
                ₹
                {Number(product.price).toLocaleString("en-IN")}
              </p>
            </div>

            <span
              className={`text-xs font-semibold ${
                Number(product.stock) > 0
                  ? "text-[#39704a]"
                  : "text-red-700"
              }`}
            >
              {Number(product.stock) > 0
                ? `${product.stock} available`
                : "Out of stock"}
            </span>

          </div>
        </div>
      </div>
    </Link>
  );
}

export default ProductCard;