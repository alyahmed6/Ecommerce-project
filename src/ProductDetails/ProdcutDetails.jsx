import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "../supabaseClient/supabaseClient";
import { useDispatch } from "react-redux";
import { addToCart } from "../Store/CardSlice";
import { addToWishlist } from "../Store/HeartSlice";

export default function ProdcutDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [mainImage, setMainImage] = useState(null);

  useEffect(() => {
    if (!id) return;

    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const { data, error } = await supabase
          .from("products")
          .select("*")
          .eq("id", id)
          .single();
        if (error) throw error;
        setProduct(data);
        const parsedImages = parseImagesField(data);
        const img = (parsedImages && parsedImages.length && parsedImages[0]) || data?.image_url || null;
        setMainImage(img);
      } catch (err) {
        setError(err.message || String(err));
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [id]);

  const parseImagesField = (prod) => {
    if (!prod) return [];
    const raw = prod.images;
    if (!raw) return prod.image_url ? [prod.image_url] : [];
    try {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed;
      if (typeof parsed === "string") return parsed ? [parsed] : [];
    } catch (e) {
      return raw.split(",").map((s) => s.trim()).filter(Boolean);
    }
    return [];
  };

  const handleAddToCart = () => {
    if (!product) return;
    try {
      dispatch(addToCart({ id: product.id, title: product.title, price: product.price, image: mainImage, quantity: 1 }));
    } catch (err) {
      console.error(err);
    }
  };

  const handleWishlist = () => {
    if (!product) return;
    try {
      dispatch(addToWishlist({ id: product.id, title: product.title, price: product.price, image: mainImage }));
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading product...</div>;
  if (error) return <div className="min-h-screen flex items-center justify-center text-red-600">{error}</div>;
  if (!product) return <div className="min-h-screen flex items-center justify-center">Product not found</div>;

  const images = Array.isArray(product.images)
    ? product.images
    : parseImagesField(product);

  return (
    <div className="min-h-screen mt-[150px] bg-gray-50 py-16">
      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8 p-4">
        <div>
          <div className="bg-white rounded shadow p-4">
            <div className="w-full h-96 flex items-center justify-center overflow-hidden">
              {mainImage ? (
                <img src={mainImage} alt={product.name} className="max-h-full object-contain" />
              ) : (
                <div className="text-gray-400">No image</div>
              )}
            </div>

            {images.length > 1 && (
              <div className="mt-3 flex gap-2 overflow-x-auto">
                {images.map((src, i) => (
                  <button key={i} onClick={() => setMainImage(src)} className="w-20 h-20 rounded overflow-hidden border">
                    <img src={src} alt={`${product.name || 'product'}-${i}`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        <div>
          <div className="bg-white rounded shadow p-6 space-y-4">
            <div className="flex items-start justify-between">
              <h1 className="text-2xl font-semibold">{product.name}</h1>
              <div className="text-2xl font-bold text-green-600">${(Number(product.price) || 0).toFixed(2)}</div>
            </div>

            <div className="text-sm text-gray-600">{product.category || ""}</div>

            <div className="text-gray-800 leading-relaxed">{product.description}</div>

            <div className="flex gap-3 items-center">
              <button onClick={handleAddToCart} className="px-4 py-2 bg-blue-600 text-white rounded">Add to cart</button>
              <button onClick={handleWishlist} className="px-4 py-2 border rounded">Add to wishlist</button>
              <button onClick={() => navigate(-1)} className="px-4 py-2 text-sm text-gray-600">Back</button>
            </div>

            <div className="pt-4 border-t text-sm text-gray-500">
              <div>SKU: {product.sku || "—"}</div>
              <div>Stock: {product.stock ?? "—"}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
