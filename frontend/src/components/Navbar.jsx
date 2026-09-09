import { Link } from "react-router-dom";

function Navbar() {
  return (
    <header className="sticky top-0 z-50 border-b border-[#e4d7c4] bg-[#f8f3ea]/95 backdrop-blur">
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-5 lg:px-8">

        <Link to="/shop" className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-full border border-[#b88935] bg-[#731f2b] text-xl text-[#f4d99b]">
            ॐ
          </div>

          <div className="leading-none">
            <h1 className="text-2xl font-bold tracking-tight text-[#5c1823]">
              Made in My India
            </h1>

            <p className="mt-1 text-[10px] uppercase tracking-[0.25em] text-[#98734a]">
              Crafted with heritage
            </p>
          </div>
        </Link>

        <nav className="hidden items-center gap-8 md:flex">
          <Link
            to="/shop"
            className="text-sm font-semibold text-[#5c1823] hover:text-[#a65d25]"
          >
            Shop
          </Link>

          <Link
            to="/sell"
            className="text-sm font-semibold text-[#5c1823] hover:text-[#a65d25]"
          >
            Sell
          </Link>
        </nav>

        <div className="flex items-center gap-2 sm:gap-4">

          <button
            type="button"
            className="hidden text-xl text-[#5c1823] sm:block"
            aria-label="Search"
          >
            ⌕
          </button>

          <button
            type="button"
            className="text-xl text-[#5c1823]"
            aria-label="Wishlist"
          >
            ♡
          </button>

          <Link
            to="/cart"
            className="text-xl text-[#5c1823]"
            aria-label="Cart"
          >
            🛒
          </Link>

        </div>
      </div>

      <div className="h-1 bg-[#731f2b]" />
    </header>
  );
}

export default Navbar;