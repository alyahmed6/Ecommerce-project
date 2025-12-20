import React, { useEffect, useState } from "react";

import { supabase } from "../../supabaseClient/supabaseClient";
import { useNavigate } from "react-router-dom";

const Dashboard = ( ) => {
  const [myProducts, setMyProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const loadMyProducts = async () => {
      setLoading(true);
      try {
        const maybeGet = supabase.auth.getUser ? await supabase.auth.getUser() : null;
        const maybeUser = maybeGet?.data?.user ?? (supabase.auth.user ? supabase.auth.user() : null);
        const userId = maybeUser?.id ?? null;
        if (!userId) {
          setMyProducts([]);
          return;
        }

        const { data, error } = await supabase
          .from("products")
          .select("id,name,slug,image_url,images,price,created_at,stock,category")
          .eq("user_id", userId)
          .order("created_at", { ascending: false });

        if (error) throw error;
        setMyProducts(data || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    loadMyProducts();
  }, []);
const handleDelete = async (id) => {
  if (!window.confirm("Are you sure you want to delete this product?")) return;

  const { error } = await supabase.from("products").delete().eq("id", id);
  if (!error) {
    setMyProducts((prev) => prev.filter((p) => p.id !== id));
  }
};

return (
  <div className="flex-1 flex flex-col gap-8 mt-16 md:mt-0 p-4 md:p-8 bg-gray-50">
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-800">My Products</h2>
        <span className="text-sm text-gray-500">{myProducts.length} items</span>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20 text-gray-400">
          Loading products...
        </div>
      ) : myProducts.length ? (
        <div className="space-y-5">
          {myProducts.map((p) => {
            const imgs = Array.isArray(p.images)
              ? p.images
              : (() => {
                  try {
                    return JSON.parse(p.images || "[]");
                  } catch {
                    return [];
                  }
                })();

            const thumb = imgs?.[0] || p.image_url || "";

            return (
              <div
                key={p.id}
                className="group flex flex-col md:flex-row gap-5 p-5 rounded-2xl border border-gray-100 hover:shadow-md transition bg-white"
              >
                <div className="w-full md:w-32 h-32 rounded-xl bg-gray-100 overflow-hidden flex items-center justify-center">
                  {thumb ? (
                    <img
                      src={thumb}
                      alt={p.name}
                      className="w-full h-full object-contain group-hover:scale-105 transition"
                    />
                  ) : (
                    <span className="text-sm text-gray-400">No image</span>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h3 className="text-xl font-semibold text-gray-800 truncate">
                        {p.name}
                      </h3>
                      <p className="text-sm text-gray-500 mt-1">
                        Added on {new Date(p.created_at).toLocaleDateString()}
                      </p>
                    </div>

                    <div className="text-xl font-bold text-gray-900">
                      ${(Number(p.price) || 0).toFixed(2)}
                    </div>
                  </div>

                  <div className="mt-4 flex flex-wrap gap-3 text-sm">
                    <span className="px-3 py-1 rounded-full bg-gray-100 text-gray-600">
                      Category: {p.category || "—"}
                    </span>

                    <span
                      className={`px-3 py-1 rounded-full ${
                        p.stock > 0
                          ? "bg-green-100 text-green-700"
                          : "bg-red-100 text-red-600"
                      }`}
                    >
                      Stock: {p.stock ?? "—"}
                    </span>
                  </div>
                </div>

                <div className="flex md:flex-col gap-2 md:items-end">
                  <button
                    onClick={() => navigate(`/product/${p.slug || p.id}`)}
                    className="px-4 py-2 rounded-lg border border-gray-300 text-sm hover:bg-gray-100 transition"
                  >
                    View
                  </button>
                  <button
                    onClick={() => navigate(`/admin/products/edit/${p.id}`)}
                    className="px-4 py-2 rounded-lg bg-blue-600 text-white text-sm hover:bg-blue-700 transition"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(p.id)}
                    className="px-4 py-2 rounded-lg bg-red-500 text-white text-sm hover:bg-red-700 transition"
                  >
                    Delete
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="py-20 text-center text-gray-400">
          You haven’t added any products yet.
        </div>
      )}
    </div>
  </div>
);
};
export default Dashboard;

