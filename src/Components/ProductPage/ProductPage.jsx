import { useEffect, useState } from "react";
import { supabase } from "../../supabaseClient/supabaseClient";
import { CiHeart } from "react-icons/ci";
import toast from "react-hot-toast";
import { useSelector, useDispatch } from "react-redux";
import { addToCart, removeFromCart } from "../../Store/CardSlice";
import { addToWishlist, removeFromWishlist } from "../../Store/HeartSlice";
import { Link } from "react-router-dom";


const ProductSkeleton = () => {
  return (
    <div className="bg-white rounded-2xl shadow border border-gray-200 p-4 animate-pulse">
      <div className="pb-[110%] bg-gray-300 rounded-xl"></div>

      <div className="h-5 bg-gray-300 rounded mt-4 w-3/4"></div>
      <div className="h-6 bg-gray-300 rounded mt-2 w-1/3"></div>

      <div className="mt-4 space-y-3">
        <div className="h-10 bg-gray-300 rounded-xl"></div>
        <div className="h-10 bg-gray-300 rounded-xl"></div>
        <div className="h-10 bg-gray-300 rounded-xl"></div>
      </div>
    </div>
  );
};


const ProductPage = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  const [sortOrder, setSortOrder] = useState("");
  const [priceRange, setPriceRange] = useState([0, 5000]);
  const [activeCategory, setActiveCategory] = useState("All");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12;

  const categories = ["All", "Mens", "Womens", "New Arrivals", "On Sale"];

  const wishlistItems = useSelector((state) => state.wishlist.items);
  const cartItems = useSelector((state) => state.cart.items);
  const dispatch = useDispatch();

  
  async function loadProducts(category) {
    setLoading(true);

    let query = supabase
      .from("products")
      .select("id, slug, name, image_url, price, category");

    if (category !== "All") {
      query = query.eq("category", category);
    }

    const { data, error } = await query;

    if (error) console.error(error);
    else setProducts(data || []);

    setLoading(false);
  }

  useEffect(() => {
    loadProducts(activeCategory);
  }, [activeCategory]);

  
  const filteredProducts = products
    .filter(
      (p) => Number(p.price || 0) >= priceRange[0] && Number(p.price || 0) <= priceRange[1]
    )
    .sort((a, b) => {
      if (sortOrder === "asc") return Number(a.price || 0) - Number(b.price || 0);
      if (sortOrder === "desc") return Number(b.price || 0) - Number(a.price || 0);
      return 0;
    });

  const totalPages = Math.max(1, Math.ceil(filteredProducts.length / itemsPerPage));
  const visibleProducts = filteredProducts.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  useEffect(() => setCurrentPage(1), [activeCategory, sortOrder, priceRange[0], priceRange[1]]);

  return (
    <section className="mt-[200px] mb-10 px-6 flex gap-10">

    
      <aside className="w-64 mt-20 bg-white shadow-md rounded-xl p-5 h-fit sticky top-24">
        <h2 className="text-xl font-bold mb-4">Filters</h2>

        <p className="font-semibold mb-2">Category</p>
        <div className="flex flex-col gap-2">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-4 py-2 rounded-lg text-left transition ${
                activeCategory === cat
                  ? "bg-blue-600 text-white"
                  : "bg-gray-100 hover:bg-gray-200"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <hr className="my-4" />

        <p className="font-semibold mb-1">Price Range</p>
        <div className="flex gap-2">
          <input
            type="number"
            className="border rounded px-2 py-1 w-20"
            value={priceRange[0]}
            onChange={(e) =>
              setPriceRange([Number(e.target.value), priceRange[1]])
            }
          />
          <span>-</span>
          <input
            type="number"
            className="border rounded px-2 py-1 w-20"
            value={priceRange[1]}
            onChange={(e) =>
              setPriceRange([priceRange[0], Number(e.target.value)])
            }
          />
        </div>
      </aside>

 
      <div className="flex-1">

        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">All Products</h1>

          <div className="flex items-center gap-2">
            <label className="font-semibold">Sort by:</label>
            <select
              className="border px-3 py-2 rounded-lg"
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value)}
            >
              <option value="">None</option>
              <option value="asc">Price Low → High</option>
              <option value="desc">Price High → Low</option>
            </select>
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <ProductSkeleton key={i} />
            ))}
          </div>
        ) : filteredProducts.length === 0 ? (
          <p className="text-center text-gray-500">No products found</p>
        ) : (
          <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {visibleProducts.map((product) => {
              const isInWishlist = wishlistItems.some(
                (i) => i.id === product.id
              );
              const isInCart = cartItems.some(
                (i) => i.id === product.id
              );

              return (
                <div
                  key={product.id}
                  className="bg-white rounded-2xl shadow p-4 hover:shadow-2xl transition hover:-translate-y-2"
                >
                  <div className="relative pb-[110%] bg-gray-100 rounded-xl overflow-hidden">
                    <img
                      src={product.image_url}
                      alt={product.name}
                      className="absolute inset-0 w-full h-full object-cover hover:scale-110 transition"
                    />

                    <button
                      className="absolute top-2 right-2 bg-white w-10 h-10 rounded-full shadow flex items-center justify-center"
                      onClick={() => {
                        if (isInWishlist) {
                          dispatch(removeFromWishlist(product.id));
                          toast.error("Removed from wishlist");
                        } else {
                          dispatch(addToWishlist(product));
                          toast.success("Added to wishlist");
                        }
                      }}
                    >
                      <CiHeart
                        size={24}
                        className={
                          isInWishlist ? "text-red-600" : "text-gray-700"
                        }
                      />
                    </button>
                  </div>

                  <h3 className="text-lg font-semibold mt-4 line-clamp-2">
                    {product.name}
                  </h3>

                  <p className="text-xl font-bold text-blue-600">
                    ${product.price}
                  </p>

                  <div className="mt-4 flex flex-col gap-3">
                    <Link
                      to={`/product/${product.slug || product.id}`}
                      className="border py-2 rounded-xl text-center hover:bg-gray-100"
                       onClick={() => {
                            window.scrollTo(0, 0);
                            navigate("/product");
                        }}
                    >
                      View Product
                    </Link>

                    <button
                      className={`py-2 rounded-xl text-white ${
                        isInCart ? "bg-red-600" : "bg-blue-600"
                      }`}
                      onClick={() => {
                        if (isInCart) {
                          dispatch(removeFromCart(product.id));
                          toast.error("Removed from cart");
                        } else {
                          dispatch(addToCart(product));
                          toast.success("Added to cart");
                        }
                      }}
                    >
                      {isInCart ? "Remove from Cart" : "Add to Cart"}
                    </button>

                    <button
                      className="bg-black text-white py-2 rounded-xl"
                      onClick={() => {
                        dispatch(addToCart(product));
                        window.location.href = "/checkout";
                      }}
                    >
                      Buy Now
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          
          <div className="mt-6 flex items-center justify-center gap-2">
            {(() => {
              const pages = [];
              if (totalPages <= 7) {
                for (let i = 1; i <= totalPages; i++) pages.push(i);
              } else {
                pages.push(1);
                let left = Math.max(2, currentPage - 1);
                let right = Math.min(totalPages - 1, currentPage + 1);
                if (left > 2) pages.push("left-ellipsis");
                for (let i = left; i <= right; i++) pages.push(i);
                if (right < totalPages - 1) pages.push("right-ellipsis");
                pages.push(totalPages);
              }

              return (
                <nav aria-label="Pagination" className="flex items-center gap-2">
                  <button disabled={currentPage === 1} onClick={() => setCurrentPage((p) => Math.max(1, p - 1))} className="px-3 py-2 rounded bg-gray-100 hover:bg-gray-200 disabled:opacity-50">Prev</button>
                  {pages.map((p) =>
                    typeof p === "number" ? (
                      <button key={p} onClick={() => setCurrentPage(p)} className={`px-3 py-2 rounded-md border ${currentPage === p ? "bg-blue-600 text-white border-blue-600" : "bg-white hover:bg-gray-50"}`}>{p}</button>
                    ) : (
                      <span key={p} className="px-2 text-zinc-500">…</span>
                    )
                  )}
                  <button disabled={currentPage === totalPages} onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))} className="px-3 py-2 rounded bg-gray-100 hover:bg-gray-200 disabled:opacity-50">Next</button>
                </nav>
              );
            })()}
          </div>
          </>
        )}
      </div>
    </section>
  );
};

export default ProductPage;