import React, { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { supabase } from "../../supabaseClient/supabaseClient";
import { useDispatch } from "react-redux";
import { addToCart, removeFromCart } from "../../Store/CardSlice";
import ProductDetailLoader from "../Loader/ProductDetailLoader";
import { toast } from "react-hot-toast";
import { useSelector } from "react-redux";
import { FaShoppingCart, FaHeart, FaShare, FaTruck, FaShieldAlt, FaUndo, FaStar, FaStarHalfAlt } from "react-icons/fa";

export default function ProductDetails() {
    const { slug } = useParams();
    const navigate = useNavigate();
    const dispatch = useDispatch();

    const cartItems = useSelector((state) => state.cart.items);

    const [product, setProduct] = useState(null);
    const [related, setRelated] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [mainImage, setMainImage] = useState(null);
    const [quantity, setQuantity] = useState(1);
    const [selectedVariant, setSelectedVariant] = useState(null);
    const [activeTab, setActiveTab] = useState("description");
    const [reviews, setReviews] = useState([]);
    const [loadingReviews, setLoadingReviews] = useState(false);
    const [reviewName, setReviewName] = useState("");
    const [reviewText, setReviewText] = useState("");
    const [reviewRating, setReviewRating] = useState(0);
    const [submittingReview, setSubmittingReview] = useState(false);
    const [imageZoom, setImageZoom] = useState(false);

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

                try {
                    const rev = await supabase.from("reviews").select("id,product_id,rating,comment,name,created_at").eq("product_id", data.id).order("created_at", { ascending: false });
                    if (!rev.error && rev.data) setReviews(rev.data);
                } catch (e) {}
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

    const fetchReviews = async (productId) => {
        setLoadingReviews(true);
        try {
            const { data, error } = await supabase.from("reviews").select("id,product_id,rating,comment,name,created_at").eq("product_id", productId).order("created_at", { ascending: false });
            if (!error && data) setReviews(data);
        } catch (e) {
        } finally {
            setLoadingReviews(false);
        }
    };

    const submitReview = async () => {
        if (!product) return;
        if (!reviewRating || !reviewText.trim()) {
            toast.error("Please provide a rating and review text.");
            return;
        }
        setSubmittingReview(true);
        try {
            const maybeGet = supabase.auth.getUser ? await supabase.auth.getUser() : null;
            const maybeUser = maybeGet?.data?.user ?? (supabase.auth.user ? supabase.auth.user() : null);
            const userId = maybeUser?.id ?? null;

            const payload = {
                product_id: product.id,
                rating: Number(reviewRating),
                comment: reviewText,
                name: reviewName || (maybeUser?.email ?? "Anonymous"),
                user_id: userId,
            };

            const { error } = await supabase.from("reviews").insert([payload], { returning: "minimal" });
            if (error) throw error;

            await fetchReviews(product.id);
            setReviewName("");
            setReviewText("");
            setReviewRating(0);
            toast.success("Review submitted successfully!");
        } catch (e) {
            toast.error("Failed to submit review.");
        } finally {
            setSubmittingReview(false);
        }
    };

    if (loading) return <ProductDetailLoader />;
    if (error) return <div className="min-h-screen flex items-center justify-center text-red-600">{error}</div>;
    if (!product) return <div className="min-h-screen flex items-center justify-center">Product not found</div>;

    const isInCart = cartItems.some((i) => i.id === product.id);
    const images = Array.isArray(product.images) ? product.images : parseImagesField(product);
    const rating = reviews.length > 0 ? Math.round(reviews.reduce((sum, r) => sum + Number(r.rating || 0), 0) / reviews.length) : Number(product?.rating) || 0;
    const originalPrice = product?.original_price || null;
    const onSale = originalPrice && Number(originalPrice) > Number(product?.price || 0);
    const discount = onSale ? Math.round(((originalPrice - product.price) / originalPrice) * 100) : 0;

    return (
        <div className="min-h-screen bg-zinc-50 mt-[14vh]">
            <div className="max-w-[1400px] mx-auto px-4 py-6">
                <div className="flex items-center gap-2 text-sm mb-6 text-zinc-600">
                    <Link to="/" className="hover:text-zinc-900 transition-colors">Home</Link>
                    <span>›</span>
                    <Link to="/product" className="hover:text-zinc-900 transition-colors">Shop</Link>
                    <span>›</span>
                    <span className="text-zinc-900 font-medium truncate">{product?.name}</span>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    <div className="lg:col-span-7">
                        <div className="sticky top-24">
                            <div className="relative bg-white rounded-3xl p-8 shadow-sm border border-zinc-200 overflow-hidden group">
                                {onSale && (
                                    <div className="absolute top-6 right-6 z-20">
                                        <div className="relative">
                                            <div className="absolute inset-0 bg-red-500 blur-xl opacity-50"></div>
                                            <div className="relative bg-gradient-to-br from-red-500 via-red-600 to-pink-600 text-white px-5 py-2.5 rounded-2xl font-bold text-sm shadow-2xl">
                                                -{discount}%
                                            </div>
                                        </div>
                                    </div>
                                )}
                                
                                <div 
                                    className={`relative aspect-square rounded-2xl overflow-hidden cursor-zoom-in transition-all duration-500 ${imageZoom ? 'scale-150' : 'scale-100'}`}
                                    onClick={() => setImageZoom(!imageZoom)}
                                >
                                    {mainImage ? (
                                        <img 
                                            src={mainImage} 
                                            alt={product.name} 
                                            className="w-full h-full object-contain transition-transform duration-700 group-hover:scale-110" 
                                        />
                                    ) : (
                                        <div className="flex items-center justify-center h-full text-zinc-400">No image</div>
                                    )}
                                </div>
                            </div>

                            {images.length > 1 && (
                                <div className="flex gap-3 mt-4 overflow-x-auto pb-2">
                                    {images.map((src, i) => (
                                        <button
                                            key={i}
                                            onClick={() => setMainImage(src)}
                                            className={`relative flex-shrink-0 w-20 h-20 rounded-xl overflow-hidden transition-all duration-300 ${
                                                mainImage === src 
                                                    ? 'ring-2 ring-zinc-900 scale-110' 
                                                    : 'ring-1 ring-zinc-200 hover:ring-zinc-400 opacity-70 hover:opacity-100'
                                            }`}
                                        >
                                            <img src={src} alt="" className="w-full h-full object-cover" />
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="lg:col-span-5">
                        <div className="lg:sticky lg:top-24 space-y-6">
                            <div>
                                <span className="inline-block px-4 py-1.5 bg-zinc-900 text-white text-xs font-semibold rounded-full mb-4 tracking-wide">
                                    {product.category || "PRODUCT"}
                                </span>
                                <h1 className="text-4xl font-bold text-zinc-900 mb-3 leading-tight">{product.name}</h1>
                                
                                <div className="flex items-center gap-4 mb-6">
                                    <div className="flex items-center gap-1">
                                        {Array.from({ length: 5 }).map((_, i) => (
                                            <FaStar
                                                key={i}
                                                className={`w-4 h-4 ${i < rating ? "text-amber-400" : "text-zinc-300"}`}
                                            />
                                        ))}
                                    </div>
                                    <span className="text-sm text-zinc-600">({reviews.length})</span>
                                </div>

                                <div className="flex items-baseline gap-4 mb-8">
                                    <span className="text-5xl font-black text-zinc-900">
                                        ${(Number(product.price) || 0).toFixed(2)}
                                    </span>
                                    {onSale && (
                                        <div className="flex flex-col">
                                            <span className="text-xl text-zinc-400 line-through">
                                                ${Number(originalPrice).toFixed(2)}
                                            </span>
                                            <span className="text-sm text-green-600 font-semibold">Save ${(originalPrice - product.price).toFixed(2)}</span>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4 p-6 bg-gradient-to-br from-zinc-100 to-zinc-50 rounded-2xl border border-zinc-200">
                                <div>
                                    <label className="block text-xs font-bold text-zinc-700 mb-2 uppercase tracking-wider">Color</label>
                                    <select
                                        value={selectedVariant || ""}
                                        onChange={(e) => setSelectedVariant(e.target.value)}
                                        className="w-full px-4 py-3 border-2 border-zinc-300 rounded-xl bg-white focus:border-zinc-900 focus:ring-0 transition-colors font-medium"
                                    >
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
                                            <option value="">Black</option>
                                        )}
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-zinc-700 mb-2 uppercase tracking-wider">Quantity</label>
                                    <div className="flex items-center  bg-white border-2 border-zinc-300 rounded-xl overflow-hidden">
                                        <button
                                            onClick={() => setQuantity((q) => Math.max(1, Number(q) - 1))}
                                            className="px-5 py-3 hover:bg-zinc-100 transition-colors font-bold text-zinc-700"
                                        >
                                            −
                                        </button>
                                        <input
                                            className="flex-1 text-center py-3 w-2 font-bold text-zinc-900 bg-transparent focus:outline-none"
                                            value={quantity}
                                            onChange={(e) => setQuantity(Math.max(1, Number(e.target.value || 1)))}
                                        />
                                        <button
                                            onClick={() => setQuantity((q) => Number(q) + 1)}
                                            className="px-5 py-3 hover:bg-zinc-100 transition-colors font-bold text-zinc-700"
                                        >
                                            +
                                        </button>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-3">
                                <button
                                    onClick={() => {
                                        if (isInCart) {
                                            dispatch(removeFromCart(product.id));
                                            toast.error("Removed from cart");
                                        } else {
                                            dispatch(addToCart(product));
                                            toast.success("Added to cart");
                                        }
                                    }}
                                    className={`w-full flex items-center justify-center gap-3 px-8 py-5 rounded-2xl font-bold text-lg shadow-lg transition-all duration-300 transform active:scale-95 ${
                                        isInCart 
                                            ? "bg-red-500 hover:bg-red-600 text-white" 
                                            : "bg-zinc-900 hover:bg-zinc-800 text-white"
                                    }`}
                                >
                                    <FaShoppingCart className="text-xl" />
                                    {isInCart ? "Remove from Cart" : "Add to Cart"}
                                </button>

                                <button
                                    onClick={() => navigate(`/checkout?product=${product.id}`)}
                                    className="w-full flex items-center justify-center gap-3 px-8 py-5 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-2xl font-bold text-lg shadow-lg transition-all duration-300 transform active:scale-95"
                                >
                                    Buy Now
                                </button>
                            </div>

                            <div className="grid grid-cols-3 gap-4 p-6 bg-white rounded-2xl border border-zinc-200">
                                <div className="text-center">
                                    <div className="w-12 h-12 mx-auto mb-2 flex items-center justify-center rounded-full bg-blue-100">
                                        <FaTruck className="text-blue-600 text-xl" />
                                    </div>
                                    <p className="text-xs font-semibold text-zinc-900">Free Delivery</p>
                                    <p className="text-xs text-zinc-500">On orders $50+</p>
                                </div>
                                <div className="text-center">
                                    <div className="w-12 h-12 mx-auto mb-2 flex items-center justify-center rounded-full bg-green-100">
                                        <FaShieldAlt className="text-green-600 text-xl" />
                                    </div>
                                    <p className="text-xs font-semibold text-zinc-900">Secure Pay</p>
                                    <p className="text-xs text-zinc-500">100% Protected</p>
                                </div>
                                <div className="text-center">
                                    <div className="w-12 h-12 mx-auto mb-2 flex items-center justify-center rounded-full bg-purple-100">
                                        <FaUndo className="text-purple-600 text-xl" />
                                    </div>
                                    <p className="text-xs font-semibold text-zinc-900">Easy Return</p>
                                    <p className="text-xs text-zinc-500">30 Days</p>
                                </div>
                            </div>

                            <div className="p-6 bg-zinc-100 rounded-2xl border border-zinc-200 space-y-2 text-sm">
                                <div className="flex justify-between">
                                    <span className="text-zinc-600 font-medium">SKU</span>
                                    <span className="text-zinc-900 font-bold">{product.sku || "N/A"}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-zinc-600 font-medium">Availability</span>
                                    <span className={`font-bold ${product.stock > 0 ? "text-green-600" : "text-red-600"}`}>
                                        {product.stock > 0 ? `${product.stock} In Stock` : "Out of Stock"}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="mt-16 bg-white rounded-3xl shadow-sm border border-zinc-200 overflow-hidden">
                    <div className="border-b border-zinc-200 bg-zinc-50">
                        <nav className="flex">
                            {["description", "additional", "reviews"].map((tab) => (
                                <button
                                    key={tab}
                                    onClick={() => setActiveTab(tab)}
                                    className={`flex-1 py-5 px-6 font-bold text-sm uppercase tracking-wider transition-all ${
                                        activeTab === tab
                                            ? "bg-white text-zinc-900 border-b-4 border-zinc-900"
                                            : "text-zinc-500 hover:text-zinc-700 hover:bg-zinc-100"
                                    }`}
                                >
                                    {tab === "reviews" ? `Reviews (${reviews.length})` : tab}
                                </button>
                            ))}
                        </nav>
                    </div>

                    <div className="p-8">
                        {activeTab === "description" && (
                            <div className="space-y-4">
                                {product.description ? (
                                    product.description.split(/\n\n|\r\n\r\n/).map((paragraph, index) => (
                                        <p key={index} className="text-zinc-700 leading-relaxed text-base">
                                            {paragraph}
                                        </p>
                                    ))
                                ) : (
                                    <div className="text-center py-8 text-zinc-500">No description available.</div>
                                )}
                            </div>
                        )}

                        {activeTab === "additional" && (
                            <div className="space-y-3">
                                {product.additional_info ? (
                                    product.additional_info.split(/\r?\n/).filter((line) => line.trim() !== "").map((line, index) => {
                                        const colonIndex = line.indexOf(':');
                                        const hasColon = colonIndex !== -1;
                                        const label = hasColon ? line.substring(0, colonIndex).trim() : '';
                                        const value = hasColon ? line.substring(colonIndex + 1).trim() : line;
                                        
                                        return (
                                            <div key={index} className="flex items-start gap-3 p-4 bg-zinc-50 rounded-xl">
                                                <div className="w-2 h-2 rounded-full bg-zinc-900 mt-2"></div>
                                                <span className="text-zinc-700">
                                                    {hasColon ? (
                                                        <>
                                                            <span className="font-bold text-zinc-900">{label}:</span>{' '}
                                                            <span className="font-normal">{value}</span>
                                                        </>
                                                    ) : (
                                                        <span className="font-normal">{line}</span>
                                                    )}
                                                </span>
                                            </div>
                                        );
                                    })
                                ) : (
                                    <div className="text-center py-8 text-zinc-500">No additional information available.</div>
                                )}
                            </div>
                        )}

                        {activeTab === "reviews" && (
                            <div className="space-y-8">
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl p-8 text-center border border-amber-200">
                                        <div className="text-7xl font-black text-zinc-900 mb-2">
                                            {reviews && reviews.length
                                                ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1)
                                                : product.rating
                                                ? Number(product.rating).toFixed(1)
                                                : "0.0"}
                                        </div>
                                        <div className="flex items-center justify-center gap-1 mb-2">
                                            {Array.from({ length: 5 }).map((_, i) => (
                                                <FaStar key={i} className="text-amber-400 text-lg" />
                                            ))}
                                        </div>
                                        <div className="text-sm text-zinc-600 font-medium">Based on {reviews.length} reviews</div>
                                    </div>

                                    <div className="md:col-span-2 space-y-3">
                                        {Array.from({ length: 5 }).map((_, i) => {
                                            const star = 5 - i;
                                            const count = reviews ? reviews.filter((r) => Number(r.rating) === star).length : 0;
                                            const pct = reviews && reviews.length ? Math.round((count / reviews.length) * 100) : 0;
                                            return (
                                                <div key={star} className="flex items-center gap-4">
                                                    <div className="flex items-center gap-1 w-24">
                                                        <span className="font-bold text-zinc-900">{star}</span>
                                                        <FaStar className="text-amber-400 text-sm" />
                                                    </div>
                                                    <div className="flex-1 h-3 bg-zinc-200 rounded-full overflow-hidden">
                                                        <div 
                                                            style={{ width: `${pct}%` }} 
                                                            className="h-full bg-gradient-to-r from-amber-400 to-orange-500 transition-all duration-500"
                                                        ></div>
                                                    </div>
                                                    <span className="w-12 text-sm font-bold text-zinc-600">{count}</span>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>

                                <div className="bg-zinc-50 rounded-2xl p-8 border border-zinc-200">
                                    <h3 className="text-2xl font-bold mb-6">Share Your Experience</h3>
                                    <div className="flex items-center gap-2 mb-6">
                                        {Array.from({ length: 5 }).map((_, i) => {
                                            const val = i + 1;
                                            return (
                                                <button
                                                    key={i}
                                                    onClick={() => setReviewRating(val)}
                                                    className={`text-4xl transition-all duration-200 ${
                                                        reviewRating >= val ? "text-amber-400 scale-110" : "text-zinc-300 hover:text-amber-200"
                                                    }`}
                                                >
                                                    ★
                                                </button>
                                            );
                                        })}
                                    </div>
                                    <input
                                        value={reviewName}
                                        onChange={(e) => setReviewName(e.target.value)}
                                        placeholder="Your name"
                                        className="w-full mb-4 p-4 border-2 border-zinc-300 rounded-xl focus:border-zinc-900 focus:ring-0 transition-colors font-medium"
                                    />
                                    <textarea
                                        value={reviewText}
                                        onChange={(e) => setReviewText(e.target.value)}
                                        placeholder="Tell us what you think..."
                                        className="w-full p-4 border-2 border-zinc-300 rounded-xl mb-4 focus:border-zinc-900 focus:ring-0 transition-colors font-medium"
                                        rows={4}
                                    />
                                    <button
                                        onClick={submitReview}
                                        disabled={submittingReview}
                                        className="px-8 py-4 bg-zinc-900 hover:bg-zinc-800 text-white rounded-xl font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {submittingReview ? "Submitting..." : "Post Review"}
                                    </button>
                                </div>

                                <div className="space-y-4">
                                    {loadingReviews ? (
                                        <div className="text-center py-12 text-zinc-500">Loading reviews...</div>
                                    ) : reviews && reviews.length ? (
                                        reviews.map((r) => (
                                            <div key={r.id} className="bg-white rounded-2xl p-6 border border-zinc-200 hover:shadow-md transition-shadow">
                                                <div className="flex items-start justify-between mb-3">
                                                    <div>
                                                        <div className="font-bold text-zinc-900 mb-1">{r.name || "Anonymous"}</div>
                                                        <div className="flex items-center gap-1">
                                                            {Array.from({ length: r.rating }).map((_, i) => (
                                                                <FaStar key={i} className="text-amber-400 text-sm" />
                                                            ))}
                                                        </div>
                                                    </div>
                                                    <span className="text-sm text-zinc-500">{new Date(r.created_at).toLocaleDateString()}</span>
                                                </div>
                                                <p className="text-zinc-700 leading-relaxed">{r.comment}</p>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="text-center py-12 text-zinc-500">
                                            No reviews yet. Be the first to share your thoughts!
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {related && related.length > 0 && (
                    <div className="mt-16">
                        <h2 className="text-3xl font-bold text-zinc-900 mb-8">You Might Also Like</h2>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                            {related.map((p) => {
                                const rImages = Array.isArray(p.images) ? p.images : (() => { try { return JSON.parse(p.images || "[]"); } catch { return []; } })();
                                const thumb = (rImages && rImages[0]) || p.image_url || "";
                                return (
                                    <div
                                        key={p.id}
                                        className="group bg-white rounded-2xl overflow-hidden cursor-pointer transition-all duration-300 hover:shadow-xl hover:-translate-y-2 border border-zinc-200"
                                        onClick={() => navigate(`/product/${p.slug || p.id}`)}
                                    >
                                        <div className="aspect-square bg-zinc-50 flex items-center justify-center p-6 overflow-hidden">
                                            {thumb ? (
                                                <img src={thumb} className="w-full h-full object-contain transition-transform duration-500 group-hover:scale-110" alt={p.name} />
                                            ) : (
                                                <div className="text-zinc-400">No image</div>
                                            )}
                                        </div>
                                        <div className="p-5">
                                            <h3 className="text-sm font-bold text-zinc-900 mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors">{p.name}</h3>
                                            <p className="text-xl font-black text-zinc-900">${(Number(p.price) || 0).toFixed(2)}</p>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}