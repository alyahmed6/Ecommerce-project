import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "../supabaseClient/supabaseClient";
import { useDispatch } from "react-redux";
import { addToCart } from "../Store/CardSlice";
import ReactMarkdown from "react-markdown";


export default function ProdcutDetails() {
    const { slug } = useParams();

    const navigate = useNavigate();
    const dispatch = useDispatch();

    const [product, setProduct] = useState(null);
    const [related, setRelated] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [mainImage, setMainImage] = useState(null);
    const [quantity, setQuantity] = useState(1);
    const [selectedVariant, setSelectedVariant] = useState(null);
    const [activeTab, setActiveTab] = useState("description");

    useEffect(() => {
        if (!slug) return;

        const load = async () => {
            setLoading(true);
            setError(null);
            try {
                let res = await supabase
                    .from("products")
                    .select("*")
                    .eq("slug", slug)
                    .single();

                
                if (res.error && /multiple rows/i.test(String(res.error.message || res.error))) {
                    console.warn("Multiple products with same slug found — using the first one.");
                    const list = await supabase.from("products").select("*").eq("slug", slug).limit(1);
                    if (list.error) throw list.error;
                    res = { data: list.data && list.data[0] ? list.data[0] : null };
                }

                const { data, error } = res;
                if (error) throw error;
                setProduct(data);
                const parsedImages = parseImagesField(data);
                const img = (parsedImages && parsedImages.length && parsedImages[0]) || data?.image_url || null;
                setMainImage(img);
               
                if (data && data.variants) {
                    try {
                        const v = typeof data.variants === "string" ? JSON.parse(data.variants) : data.variants;
                        setSelectedVariant(Array.isArray(v) && v.length ? v[0] : null);
                    } catch (e) {
                        setSelectedVariant(null);
                    }
                }

                
                if (data && data.category) {
                    const rel = await supabase
                        .from("products")
                        .select("id,name,slug,image_url,images,price")
                        .eq("category", data.category)
                        .neq("id", data.id)
                        .limit(4);
                    if (!rel.error && rel.data) setRelated(rel.data);
                }
            } catch (err) {
                setError(err.message || String(err));
            } finally {
                setLoading(false);
            }
        };

        load();
    }, [slug]);

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
            dispatch(
                addToCart({
                    id: product.id,
                    title: product.name,
                    price: product.price,
                    image: mainImage,
                    quantity: Number(quantity) || 1,
                    variant: selectedVariant,
                })
            );
        } catch (err) {
            console.error(err);
        }
    };


    if (loading) return <div className="min-h-screen flex items-center justify-center">Loading product...</div>;
    if (error) return <div className="min-h-screen flex items-center justify-center text-red-600">{error}</div>;
    if (!product) return <div className="min-h-screen flex items-center justify-center">Product not found</div>;

    const images = Array.isArray(product.images) ? product.images : parseImagesField(product);

    const rating = Number(product?.rating) || 0;
    const originalPrice = product?.original_price || null;
    const onSale = originalPrice && Number(originalPrice) > Number(product?.price || 0);

    return (
        <div className="min-h-screen mt-[120px] bg-gray-50 py-12">
            <div className="max-w-6xl mx-auto p-4">
                <div className="bg-white rounded shadow p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div>
                            <div className="relative h-full">
                                {onSale && (
                                    <div className="absolute top-3 left-3 bg-red-500 text-white px-3 py-1 rounded-full text-sm font-semibold">SALE</div>
                                )}
                                <div className=" flex items-center justify-center bg-gray-100 overflow-hidden">
                                    {mainImage ? (
                                        <img src={mainImage} alt={product.name} className="w-full object-fill" />
                                    ) : (
                                        <div className="text-gray-400">No image</div>
                                    )}
                                </div>
                            </div>

                            {images.length > 1 && (
                                <div className="mt-4 flex gap-3 overflow-x-auto">
                                    {images.map((src, i) => (
                                        <button
                                            key={i}
                                            onClick={() => setMainImage(src)}
                                            className="w-20 h-20 rounded overflow-hidden border hover:scale-105 transform transition">
                                            <img src={src} alt={`${product.name || "product"}-${i}`} className="w-full h-full object-cover" />
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>

                        <div>
                            <div className="flex items-start justify-between mb-2">
                                <div>
                                    <h1 className="text-3xl font-semibold">{product.name}</h1>
                                    <div className="mt-2 flex items-center gap-3">
                                        <div className="flex items-center text-yellow-400">
                                            {Array.from({ length: 5 }).map((_, i) => (
                                                <svg key={i} className={`w-4 h-4 ${i < rating ? "text-yellow-400" : "text-gray-300"}`} viewBox="0 0 20 20" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                                                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.286 3.955a1 1 0 00.95.69h4.162c.969 0 1.371 1.24.588 1.81l-3.37 2.447a1 1 0 00-.364 1.118l1.287 3.955c.3.921-.755 1.688-1.54 1.118L10 13.347l-3.37 2.447c-.784.57-1.84-.197-1.54-1.118l1.287-3.955a1 1 0 00-.364-1.118L2.643 9.382c-.783-.57-.38-1.81.588-1.81h4.162a1 1 0 00.95-.69L9.049 2.927z" />
                                                </svg>
                                            ))}
                                        </div>
                                        <div className="text-sm text-gray-500">({product.reviews_count || 0} reviews)</div>
                                    </div>
                                </div>
                                <div className="text-2xl font-bold text-gray-900">
                                    <div className="flex items-baseline gap-3">
                                        <div className="text-3xl text-black">${(Number(product.price) || 0).toFixed(2)}</div>
                                        {onSale && (
                                            <div className="text-sm text-gray-400 line-through">${Number(originalPrice).toFixed(2)}</div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div className="text-sm text-gray-600 mb-4">{product.category || ""}</div>

                            <div className="text-gray-800 leading-relaxed mb-4">{product.description}</div>

                            <div className="flex items-center gap-4 mb-4">
                                <div className="flex items-center gap-2">
                                    <label className="text-sm text-gray-600">Color</label>
                                    <select
                                        value={selectedVariant || ""}
                                        onChange={(e) => setSelectedVariant(e.target.value)}
                                        className="border rounded px-2 w-20 h-8 text-sm">
                                        {product?.variants ? (
                                            (() => {
                                                try {
                                                    const v = typeof product.variants === "string" ? JSON.parse(product.variants) : product.variants;
                                                    return Array.isArray(v) && v.length ? v.map((vv, i) => (
                                                        <option key={i} value={vv}>{vv}</option>
                                                    )) : <option value="">Default</option>;
                                                } catch (e) {
                                                    return <option value="">Default</option>;
                                                }
                                            })()
                                        ) : (
                                            <option value="">black</option>
                                        )}
                                    </select>
                                </div>

                                <div className="flex items-center gap-2">
                                    <label className="text-sm text-gray-600">Qty</label>
                                    <div className="flex items-center border w-20 h-8 rounded overflow-hidden">
                                        <button onClick={() => setQuantity((q) => Math.max(1, Number(q) - 1))} className="px-2">-</button>
                                        <input className="w-5 h-5 text-center" value={quantity} onChange={(e) => setQuantity(Math.max(1, Number(e.target.value || 1)))} />
                                        <button onClick={() => setQuantity((q) => Number(q) + 1)} className="px-2">+</button>
                                    </div>
                                </div>
                            </div>

                            <div className="flex gap-3 items-center mb-6">
                                <button onClick={handleAddToCart} className="px-6 py-3 bg-black text-white rounded text-sm font-semibold">ADD TO CART</button>
                                <button className="px-6 py-3 bg-blue-700 rounded text-white font-semibold text-sm">Buy Now</button>
                                <button onClick={() => navigator.share ? navigator.share({ title: product.name, url: window.location.href }) : navigate("/share")} className="px-3 py-3 text-sm text-gray-600">Share</button>
                            </div>

                            <div className="pt-4 border-t text-sm text-gray-500">
                                <div>SKU: {product.sku || "—"}</div>
                                <div>Stock: {product.stock ?? "—"}</div>
                            </div>
                        </div>
                    </div>

                    <div className="mt-8">
                        <div className="border-b">
                            <nav className="flex -mb-px">
                                <button onClick={() => setActiveTab("description")} className={`px-6 py-3 ${activeTab === "description" ? "border-b-2 border-black" : "text-gray-600"}`}>Description</button>
                                <button onClick={() => setActiveTab("additional")} className={`px-6 py-3 ${activeTab === "additional" ? "border-b-2 border-black" : "text-gray-600"}`}>Additional Information</button>
                                <button onClick={() => setActiveTab("reviews")} className={`px-6 py-3 ${activeTab === "reviews" ? "border-b-2 border-black" : "text-gray-600"}`}>Reviews ({product.reviews_count || 0})</button>
                            </nav>
                        </div>

                        <div className="mt-6">
                            {activeTab === "description" && (
                                <div className="text-gray-700">{product.description}</div>
                            )}

                            {activeTab === "additional" && (
                                <ul className="list-disc pl-5 text-gray-700">
                                    {(product.additional_info || "No additional information.")
                                        .split(/\r?\n/)
                                        .filter(line => line.trim() !== "")
                                        .map((line, index) => (
                                            <li key={index}>{line}</li>
                                        ))}
                                </ul>
                            )}
                            

                            {activeTab === "reviews" && (
                                <div className="text-gray-700">{product.reviews || "No reviews yet."}</div>
                            )}
                        </div>
                    </div>

                    {related && related.length > 0 && (
                        <div className="mt-8">
                            <h3 className="text-xl font-semibold mb-4">Related Products</h3>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                {related.map((p) => {
                                    const rImages = Array.isArray(p.images) ? p.images : (() => { try { return JSON.parse(p.images || "[]"); } catch { return []; } })();
                                    const thumb = (rImages && rImages[0]) || p.image_url || "";
                                    return (
                                        <div key={p.id} className="bg-white rounded shadow p-3 text-center cursor-pointer" onClick={() => navigate(`/product/${p.slug || p.id}`)}>
                                            <div className="w-full h-40 flex items-center justify-center overflow-hidden mb-3">
                                                {thumb ? <img src={thumb} className="object-contain h-full" alt={p.name} /> : <div className="text-gray-400">No image</div>}
                                            </div>
                                            <div className="text-sm font-medium">{p.name}</div>
                                            <div className="text-sm text-gray-600">${(Number(p.price) || 0).toFixed(2)}</div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div >
    );
}
