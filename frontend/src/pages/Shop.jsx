import { useEffect, useMemo, useState } from "react";
import ProductCard from "../components/ProductCard";

const API_URL = "http://localhost:5000/api";

function Shop() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedState, setSelectedState] = useState("All");
  const [selectedCraft, setSelectedCraft] = useState("All");
  const [selectedMaterial, setSelectedMaterial] = useState("All");

  useEffect(() => {
    async function loadProducts() {
      try {
        const response = await fetch(`${API_URL}/products`);

        if (!response.ok) {
          throw new Error("Failed to load products");
        }

        const data = await response.json();

        setProducts(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error("Product loading error:", error);
      } finally {
        setLoading(false);
      }
    }

    loadProducts();
  }, []);

  const categories = useMemo(() => {
    return [
      "All",
      ...Array.from(
        new Set(
          products
            .map((product) => product.category)
            .filter(Boolean)
        )
      ),
    ];
  }, [products]);

  const states = useMemo(() => {
    return [
      "All",
      ...Array.from(
        new Set(
          products
            .map((product) => product.state)
            .filter(Boolean)
        )
      ),
    ];
  }, [products]);

  const crafts = useMemo(() => {
    return [
      "All",
      ...Array.from(
        new Set(
          products
            .map((product) => product.craft)
            .filter(Boolean)
        )
      ),
    ];
  }, [products]);

  const materials = useMemo(() => {
    return [
      "All",
      ...Array.from(
        new Set(
          products
            .map((product) => product.material)
            .filter(Boolean)
        )
      ),
    ];
  }, [products]);

  const filteredProducts = useMemo(() => {
    const query = search.trim().toLowerCase();

    return products.filter((product) => {
      const matchesSearch =
        !query ||
        [
          product.name,
          product.description,
          product.craft,
          product.category,
          product.state,
          product.district,
          product.material,
          product.artisan_name,
        ]
          .filter(Boolean)
          .some((value) =>
            String(value).toLowerCase().includes(query)
          );

      const matchesCategory =
        selectedCategory === "All" ||
        product.category === selectedCategory;

      const matchesState =
        selectedState === "All" ||
        product.state === selectedState;

      const matchesCraft =
        selectedCraft === "All" ||
        product.craft === selectedCraft;

      const matchesMaterial =
        selectedMaterial === "All" ||
        product.material === selectedMaterial;

      return (
        matchesSearch &&
        matchesCategory &&
        matchesState &&
        matchesCraft &&
        matchesMaterial
      );
    });
  }, [
    products,
    search,
    selectedCategory,
    selectedState,
    selectedCraft,
    selectedMaterial,
  ]);

  function clearFilters() {
    setSearch("");
    setSelectedCategory("All");
    setSelectedState("All");
    setSelectedCraft("All");
    setSelectedMaterial("All");
  }

  return (
    <main className="min-h-screen bg-[#f8f3ea]">

      {/* ================================
          HERO
      ================================= */}
      <section className="bg-[#731f2b] text-white">
        <div className="mx-auto max-w-7xl px-5 py-16 lg:px-8 lg:py-20">

          <div className="max-w-4xl">

            <p className="text-xs font-bold uppercase tracking-[0.35em] text-[#f0c86e]">
              Made in My India
            </p>

            <h1 className="mt-5 text-5xl font-bold leading-[0.95] tracking-tight sm:text-6xl lg:text-8xl">
              Crafted by India.
              <br />
              Made to be remembered.
            </h1>

            <p className="mt-6 max-w-2xl text-base leading-7 text-[#f7e9d0] sm:text-lg">
              Discover handmade products rooted in India's
              traditions, materials and communities.
            </p>

            <a
              href="#collection"
              className="mt-8 inline-flex items-center rounded-full bg-[#f0c86e] px-6 py-3 text-sm font-bold text-[#5c1823] transition hover:bg-white"
            >
              Explore the collection
              <span className="ml-3">→</span>
            </a>

          </div>

        </div>

        <div className="h-2 bg-[#d6a847]" />
      </section>


      {/* ================================
          COLLECTION
      ================================= */}
      <section
        id="collection"
        className="mx-auto max-w-7xl px-5 py-12 lg:px-8"
      >

        {/* Heading */}
        <div className="flex flex-col gap-5 border-b border-[#dfd1bd] pb-7 md:flex-row md:items-end md:justify-between">

          <div>
            <p className="text-xs font-bold uppercase tracking-[0.25em] text-[#a26e35]">
              The collection
            </p>

            <h2 className="mt-2 text-4xl font-bold text-[#5c1823] sm:text-5xl">
              Shop Indian craft
            </h2>

            <p className="mt-2 max-w-xl text-sm text-[#78685b]">
              Explore handmade pieces from artisans and
              makers across India.
            </p>
          </div>

          <p className="text-sm font-semibold text-[#806e5e]">
            {filteredProducts.length}{" "}
            {filteredProducts.length === 1
              ? "product"
              : "products"}
          </p>

        </div>


        {/* ================================
            SEARCH
        ================================= */}
        <div className="mt-7">

          <div className="relative">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search products, crafts, places..."
              className="h-12 w-full rounded-full border border-[#d9c9b3] bg-[#fffdf8] px-5 pr-12 text-sm text-[#39251f] outline-none transition placeholder:text-[#a09182] focus:border-[#a26e35] focus:ring-2 focus:ring-[#d9a94f]/20"
            />

            <span className="pointer-events-none absolute right-5 top-1/2 -translate-y-1/2 text-xl text-[#806e5e]">
              ⌕
            </span>
          </div>

        </div>


        {/* ================================
            CATEGORY PILLS
        ================================= */}
        <div className="mt-5 flex gap-2 overflow-x-auto pb-2">

          {categories.map((category) => (
            <button
              key={category}
              type="button"
              onClick={() => setSelectedCategory(category)}
              className={`whitespace-nowrap rounded-full px-5 py-2.5 text-xs font-bold transition ${
                selectedCategory === category
                  ? "bg-[#731f2b] text-white"
                  : "border border-[#d9c9b3] bg-[#fffdf8] text-[#6c5749] hover:border-[#731f2b] hover:text-[#731f2b]"
              }`}
            >
              {category}
            </button>
          ))}

        </div>


        {/* ================================
            FILTERS
        ================================= */}
        <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">

          <select
            value={selectedState}
            onChange={(e) => setSelectedState(e.target.value)}
            className="h-11 rounded-xl border border-[#d9c9b3] bg-[#fffdf8] px-4 text-sm text-[#5e4b3e] outline-none focus:border-[#a26e35]"
          >
            {states.map((item) => (
              <option key={item} value={item}>
                {item === "All" ? "All States" : item}
              </option>
            ))}
          </select>

          <select
            value={selectedCraft}
            onChange={(e) => setSelectedCraft(e.target.value)}
            className="h-11 rounded-xl border border-[#d9c9b3] bg-[#fffdf8] px-4 text-sm text-[#5e4b3e] outline-none focus:border-[#a26e35]"
          >
            {crafts.map((item) => (
              <option key={item} value={item}>
                {item === "All" ? "All Crafts" : item}
              </option>
            ))}
          </select>

          <select
            value={selectedMaterial}
            onChange={(e) => setSelectedMaterial(e.target.value)}
            className="h-11 rounded-xl border border-[#d9c9b3] bg-[#fffdf8] px-4 text-sm text-[#5e4b3e] outline-none focus:border-[#a26e35]"
          >
            {materials.map((item) => (
              <option key={item} value={item}>
                {item === "All" ? "All Materials" : item}
              </option>
            ))}
          </select>

          <button
            type="button"
            onClick={clearFilters}
            className="h-11 rounded-xl border border-[#cdbb9f] bg-[#f3e5c9] px-4 text-sm font-semibold text-[#731f2b] transition hover:bg-[#731f2b] hover:text-white"
          >
            Clear filters
          </button>

        </div>


        {/* ================================
            PRODUCTS
        ================================= */}
        <div className="mt-10">

          {loading ? (
            <div className="grid grid-cols-2 gap-5 md:grid-cols-3 lg:grid-cols-4">

              {[1, 2, 3, 4].map((item) => (
                <div key={item}>
                  <div className="aspect-[4/5] animate-pulse rounded-2xl bg-[#eadfce]" />

                  <div className="mt-4 h-3 w-1/3 animate-pulse rounded bg-[#dfd1bd]" />

                  <div className="mt-3 h-5 w-3/4 animate-pulse rounded bg-[#dfd1bd]" />
                </div>
              ))}

            </div>
          ) : filteredProducts.length > 0 ? (

            <div className="grid grid-cols-2 gap-5 md:grid-cols-3 lg:grid-cols-4">

              {filteredProducts.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                />
              ))}

            </div>

          ) : (

            <div className="rounded-2xl border border-[#dfd1bd] bg-[#fffdf8] px-5 py-20 text-center">

              <p className="text-3xl font-bold text-[#5c1823]">
                No products found
              </p>

              <p className="mt-2 text-sm text-[#806e5e]">
                Try changing your search or filters.
              </p>

              <button
                type="button"
                onClick={clearFilters}
                className="mt-5 rounded-full bg-[#731f2b] px-5 py-2.5 text-xs font-bold text-white hover:bg-[#5c1823]"
              >
                Reset filters
              </button>

            </div>

          )}

        </div>

      </section>


      {/* ================================
          TRUST STRIP
      ================================= */}
      <section className="border-t border-[#dfd1bd] bg-[#fff8e9]">
        <div className="mx-auto grid max-w-7xl gap-6 px-5 py-8 sm:grid-cols-3 lg:px-8">

          <div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#731f2b]">
              Verified
            </p>

            <p className="mt-2 text-sm text-[#78685b]">
              Products are checked through our authenticity
              process.
            </p>
          </div>

          <div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#a26e35]">
              From India
            </p>

            <p className="mt-2 text-sm text-[#78685b]">
              Discover crafts, materials and makers from
              across the country.
            </p>
          </div>

          <div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#39704a]">
              Handmade
            </p>

            <p className="mt-2 text-sm text-[#78685b]">
              Every listing carries its craft and making
              story.
            </p>
          </div>

        </div>
      </section>

    </main>
  );
}

export default Shop;