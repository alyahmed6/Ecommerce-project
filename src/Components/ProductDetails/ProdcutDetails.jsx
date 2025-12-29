import React, { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { supabase } from "../../supabaseClient/supabaseClient";
import { useDispatch, useSelector } from "react-redux";
import { addToCart, removeFromCart } from "../../Store/CardSlice";
import ProductDetailLoader from "../Loader/ProductDetailLoader";
import { toast } from "react-hot-toast";
import { FaShoppingCart, FaTruck, FaShieldAlt, FaUndo, FaStar, FaUserCircle } from "react-icons/fa";

export default function ProductDetails() {
    const { slug } = useParams();
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const cartItems = useSelector((s) => s.cart.items);

    const [product, setProduct] = useState(null);
    const [related, setRelated] = useState([]);
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [mainImage, setMainImage] = useState(null);
    const [activeTab, setActiveTab] = useState("description");
    const [reviewName, setReviewName] = useState("");
    const [reviewText, setReviewText] = useState("");
    const [reviewRating, setReviewRating] = useState(0);
    const [hoverRating, setHoverRating] = useState(0);
    const [submitting, setSubmitting] = useState(false);

    const parseImages = (p) => {
        if (!p) return [];
        if (Array.isArray(p.images)) return p.images;
        if (!p.images) return p.image_url ? [p.image_url] : [];
        try {
            const v = JSON.parse(p.images);
            return Array.isArray(v) ? v : [];
        } catch {
            return p.images.split(",").map(s => s.trim()).filter(Boolean);
        }
    };

    const fetchReviews = async (id) => {
        try {
            const { data, error } = await supabase
                .from("reviews")
                .select("id,product_id,rating,comment,name,created_at")
                .eq("product_id", id)
                .order("created_at", { ascending: false });
            
            if (error) {
                console.error("Reviews fetch error:", error);
                return;
            }
            
            if (data) setReviews(data);
        } catch (e) {
            console.error("Error fetching reviews:", e);
        }
    };

    useEffect(() => {
        if (!slug) return;

        let cancelled = false;

        const load = async () => {
            if (cancelled) return;

            setLoading(true);
            setError(null);
            setProduct(null);
            setReviews([]);

            const timeoutId = setTimeout(() => {
                if (!cancelled) {
                    setError("Request timed out. Please refresh the page.");
                    setLoading(false);
                }
            }, 15000);

            try {

               
                const { data: authData } = await supabase.auth.getSession();
                

               
                const { data: productData, error: productError } = await supabase
                    .from("products")
                    .select("*")
                    .eq("slug", slug)
                    .maybeSingle();

               

                clearTimeout(timeoutId);

                if (cancelled) return;

                if (productError) {
                    
                    throw new Error(productError.message || "Failed to load product");
                }
                
                if (!productData) {
                    throw new Error("Product not found");
                }

               
                setProduct(productData);

                const imgs = parseImages(productData);
                setMainImage(imgs[0] || null);

                await fetchReviews(productData.id);

                if (cancelled) return;

                
                const { data: relatedData, error: relatedError } = await supabase
                    .from("products")
                    .select("id,name,slug,image_url,images,price")
                    .eq("category", productData.category)
                    .neq("id", productData.id)
                    .limit(4);

                if (relatedError) {
                   
                } else if (!cancelled && relatedData) {
                    setRelated(relatedData);
                }

            } catch (e) {
                clearTimeout(timeoutId);
                if (!cancelled) {
                    
                    setError(e.message || "Failed to load product");
                }
            } finally {
                if (!cancelled) {
                    setLoading(false);
                  
                }
            }
        };

        load();

        return () => {
            cancelled = true;
        };
    }, [slug]);

    const submitReview = async () => {
        if (!reviewRating) {
            toast.error("Please select a rating");
            return;
        }
        if (!reviewText.trim()) {
            toast.error("Please write a review");
            return;
        }

        setSubmitting(true);
        try {
            const { data: auth } = await supabase.auth.getUser();
            const payload = {
                product_id: product.id,
                rating: reviewRating,
                comment: reviewText.trim(),
                name: reviewName.trim() || auth?.user?.email || "Anonymous",
                user_id: auth?.user?.id || null,
            };

            const { error } = await supabase.from("reviews").insert([payload]);
            if (error) {
                throw error;
            }

            setReviewName("");
            setReviewText("");
            setReviewRating(0);
            setHoverRating(0);
            await fetchReviews(product.id);
            toast.success("Review submitted successfully!");
            setActiveTab("reviews");
        } catch (e) {
           
            toast.error("Failed to submit review. Please try again.");
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) return <ProductDetailLoader />;
    
    if (error) return (
        <div className="min-h-screen flex items-center justify-center bg-zinc-50">
            <div className="text-center bg-white p-8 rounded-2xl shadow-lg max-w-md">
                <div className="text-red-600 text-xl mb-4 font-semibold">{error}</div>
                <p className="text-zinc-600 mb-6 text-sm">
                    This might be a temporary issue. Please try refreshing or check your connection.
                </p>
                <div className="flex gap-3 justify-center">
                    <button 
                        onClick={() => window.location.reload()} 
                        className="px-6 py-3 bg-zinc-900 text-white rounded-xl font-bold hover:bg-zinc-800 transition"
                    >
                        Refresh Page
                    </button>
                    <button 
                        onClick={() => navigate('/')} 
                        className="px-6 py-3 bg-zinc-200 text-zinc-900 rounded-xl font-bold hover:bg-zinc-300 transition"
                    >
                        Go Home
                    </button>
                </div>
            </div>
        </div>
    );
    
    if (!product) return (
        <div className="min-h-screen flex items-center justify-center bg-zinc-50">
            <div className="text-center">
                <div className="text-zinc-600 text-xl mb-4">Product not found</div>
                <button 
                    onClick={() => navigate('/')} 
                    className="px-6 py-3 bg-zinc-900 text-white rounded-xl font-bold hover:bg-zinc-800 transition"
                >
                    Back to Home
                </button>
            </div>
        </div>
    );

    const images = parseImages(product);
    const isInCart = cartItems.some(i => i.id === product.id);
    const avgRating = reviews.length
        ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length
        : 0;
    const roundedRating = Math.round(avgRating);

    const getRatingBreakdown = () => {
        const breakdown = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
        reviews.forEach(r => breakdown[r.rating]++);
        return breakdown;
    };

    const ratingBreakdown = getRatingBreakdown();

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
    };

    return (
        <div className="min-h-screen bg-zinc-50 mt-[14vh]">
            <div className="max-w-[1400px] mx-auto px-4 py-6">

                <div className="flex gap-2 text-sm mb-6 text-zinc-600">
                    <Link to="/" className="hover:text-zinc-900 transition">Home</Link>
                    <span>›</span>
                    <span className="text-zinc-900 font-medium">{product.name}</span>
                </div>

                <div className="grid lg:grid-cols-12 gap-8">
                    <div className="lg:col-span-7">
                        <div className="bg-white rounded-3xl p-8 border shadow-sm">
                            {mainImage
                                ? <img src={mainImage} alt={product.name} className="w-full h-[400px] object-contain" />
                                : <div className="h-[400px] flex items-center justify-center text-zinc-400">No image available</div>
                            }
                        </div>

                        {images.length > 1 && (
                            <div className="flex gap-3 mt-4 overflow-x-auto pb-2">
                                {images.map((i, idx) => (
                                    <img 
                                        key={idx} 
                                        src={i} 
                                        alt={`${product.name} ${idx + 1}`}
                                        onClick={() => setMainImage(i)} 
                                        className={`w-20 h-20 object-cover rounded-xl border-2 cursor-pointer transition flex-shrink-0 ${
                                            mainImage === i ? 'border-zinc-900' : 'border-zinc-200 hover:border-zinc-400'
                                        }`}
                                    />
                                ))}
                            </div>
                        )}
                    </div>

                    <div className="lg:col-span-5 space-y-6">
                        <h1 className="text-4xl font-bold text-zinc-900">{product.name}</h1>

                        <div className="flex gap-2 items-center">
                            <div className="flex gap-1">
                                {Array.from({ length: 5 }).map((_, i) => (
                                    <FaStar key={i} className={`${i < roundedRating ? "text-amber-400" : "text-zinc-300"} text-lg`} />
                                ))}
                            </div>
                            <span className="text-sm text-zinc-600 font-medium">
                                {avgRating > 0 ? avgRating.toFixed(1) : '0.0'} ({reviews.length} {reviews.length === 1 ? 'review' : 'reviews'})
                            </span>
                        </div>

                        <div className="text-4xl font-black text-zinc-900">${Number(product.price).toFixed(2)}</div>

                        <div className="bg-zinc-100 rounded-xl p-4 space-y-3 text-sm">
                            <div className="flex justify-between items-center">
                                <span className="text-zinc-600">SKU</span>
                                <span className="font-bold text-zinc-900">{product.sku || "N/A"}</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-zinc-600">Stock</span>
                                <span className={`font-bold ${product.stock > 0 ? "text-green-600" : "text-red-600"}`}>
                                    {product.stock > 0 ? `${product.stock} In Stock` : "Out of Stock"}
                                </span>
                            </div>
                        </div>

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
                            disabled={product.stock === 0}
                            className={`w-full py-4 rounded-xl font-bold transition flex items-center justify-center gap-2 ${
                                product.stock === 0 
                                    ? 'bg-zinc-300 text-zinc-500 cursor-not-allowed' 
                                    : 'bg-zinc-900 text-white hover:bg-zinc-800'
                            }`}
                        >
                            <FaShoppingCart />
                            {product.stock === 0 ? 'Out of Stock' : (isInCart ? "Remove from Cart" : "Add to Cart")}
                        </button>

                        <button
                            onClick={() => navigate(`/checkout?product=${product.id}`)}
                            disabled={product.stock === 0}
                            className={`w-full py-4 rounded-xl font-bold transition ${
                                product.stock === 0 
                                    ? 'bg-zinc-300 text-zinc-500 cursor-not-allowed' 
                                    : 'bg-blue-600 text-white hover:bg-blue-700'
                            }`}
                        >
                            Buy Now
                        </button>

                        <div className="grid grid-cols-3 gap-4 text-center text-sm pt-4 border-t">
                            <div className="space-y-2">
                                <FaTruck className="mx-auto text-xl text-zinc-700" />
                                <div className="font-medium text-zinc-700">Free Delivery</div>
                            </div>
                            <div className="space-y-2">
                                <FaShieldAlt className="mx-auto text-xl text-zinc-700" />
                                <div className="font-medium text-zinc-700">Secure Pay</div>
                            </div>
                            <div className="space-y-2">
                                <FaUndo className="mx-auto text-xl text-zinc-700" />
                                <div className="font-medium text-zinc-700">Easy Return</div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="mt-16 bg-white rounded-3xl border shadow-sm overflow-hidden">
                    <div className="flex border-b">
                        {["description", "additional", "reviews"].map(t => (
                            <button
                                key={t}
                                onClick={() => setActiveTab(t)}
                                className={`flex-1 py-4 font-bold uppercase text-sm transition ${
                                    activeTab === t 
                                        ? "border-b-4 border-zinc-900 text-zinc-900" 
                                        : "text-zinc-500 hover:text-zinc-700"
                                }`}
                            >
                                {t === "reviews" ? `Reviews (${reviews.length})` : t}
                            </button>
                        ))}
                    </div>

                    <div className="p-8">
                        {activeTab === "description" && (
                            <div className="text-zinc-700 whitespace-pre-line leading-relaxed">
                                {product.description || "No description available."}
                            </div>
                        )}

                        {activeTab === "additional" && (
                            <div className="text-zinc-700 whitespace-pre-line leading-relaxed">
                                {product.additional_info || "No additional information available."}
                            </div>
                        )}

                        {activeTab === "reviews" && (
                            <div className="space-y-8">
                                
                                {reviews.length > 0 && (
                                    <div className="bg-zinc-50 rounded-2xl p-6 grid md:grid-cols-2 gap-8">
                                        <div className="flex flex-col items-center justify-center border-r border-zinc-200">
                                            <div className="text-6xl font-black text-zinc-900 mb-2">
                                                {avgRating.toFixed(1)}
                                            </div>
                                            <div className="flex gap-1 mb-2">
                                                {Array.from({ length: 5 }).map((_, i) => (
                                                    <FaStar key={i} className={`${i < roundedRating ? "text-amber-400" : "text-zinc-300"} text-xl`} />
                                                ))}
                                            </div>
                                            <div className="text-sm text-zinc-600">
                                                Based on {reviews.length} {reviews.length === 1 ? 'review' : 'reviews'}
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            {[5, 4, 3, 2, 1].map(star => {
                                                const count = ratingBreakdown[star];
                                                const percentage = reviews.length > 0 ? (count / reviews.length) * 100 : 0;
                                                return (
                                                    <div key={star} className="flex items-center gap-3">
                                                        <div className="flex items-center gap-1 w-12">
                                                            <span className="text-sm font-medium">{star}</span>
                                                            <FaStar className="text-amber-400 text-xs" />
                                                        </div>
                                                        <div className="flex-1 h-2 bg-zinc-200 rounded-full overflow-hidden">
                                                            <div 
                                                                className="h-full bg-amber-400 transition-all"
                                                                style={{ width: `${percentage}%` }}
                                                            />
                                                        </div>
                                                        <span className="text-sm text-zinc-600 w-12 text-right">{count}</span>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                )}

                                
                                <div className="border rounded-2xl p-6 bg-zinc-50">
                                    <h3 className="text-xl font-bold mb-4 text-zinc-900">Write a Review</h3>
                                    
                                    <div className="mb-4">
                                        <label className="block text-sm font-medium text-zinc-700 mb-2">Your Rating</label>
                                        <div className="flex gap-2">
                                            {Array.from({ length: 5 }).map((_, i) => (
                                                <button 
                                                    key={i} 
                                                    type="button"
                                                    onClick={() => setReviewRating(i + 1)}
                                                    onMouseEnter={() => setHoverRating(i + 1)}
                                                    onMouseLeave={() => setHoverRating(0)}
                                                    className="text-4xl transition-transform hover:scale-110"
                                                >
                                                    <FaStar className={`${
                                                        (hoverRating || reviewRating) >= i + 1 
                                                            ? "text-amber-400" 
                                                            : "text-zinc-300"
                                                    }`} />
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="mb-4">
                                        <label className="block text-sm font-medium text-zinc-700 mb-2">Your Name</label>
                                        <input 
                                            type="text"
                                            value={reviewName} 
                                            onChange={e => setReviewName(e.target.value)} 
                                            placeholder="Enter your name (optional)" 
                                            className="w-full p-3 border border-zinc-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-zinc-900 transition"
                                        />
                                    </div>

                                    <div className="mb-4">
                                        <label className="block text-sm font-medium text-zinc-700 mb-2">Your Review</label>
                                        <textarea 
                                            value={reviewText} 
                                            onChange={e => setReviewText(e.target.value)} 
                                            placeholder="Share your experience with this product..." 
                                            rows={4}
                                            className="w-full p-3 border border-zinc-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-zinc-900 transition resize-none"
                                        />
                                    </div>

                                    <button 
                                        type="button"
                                        onClick={submitReview} 
                                        disabled={submitting}
                                        className="px-8 py-3 bg-zinc-900 text-white rounded-xl font-bold hover:bg-zinc-800 transition disabled:bg-zinc-400 disabled:cursor-not-allowed"
                                    >
                                        {submitting ? "Submitting..." : "Submit Review"}
                                    </button>
                                </div>

                            
                                <div className="space-y-4">
                                    <h3 className="text-xl font-bold text-zinc-900">Customer Reviews</h3>
                                    {reviews.length > 0 ? (
                                        reviews.map(r => (
                                            <div key={r.id} className="border rounded-2xl p-6 bg-white hover:shadow-md transition">
                                                <div className="flex items-start gap-4">
                                                    <div className="w-12 h-12 rounded-full bg-zinc-200 flex items-center justify-center flex-shrink-0">
                                                        <FaUserCircle className="text-3xl text-zinc-500" />
                                                    </div>
                                                    <div className="flex-1">
                                                        <div className="flex items-center justify-between mb-2">
                                                            <div>
                                                                <div className="font-bold text-zinc-900">{r.name}</div>
                                                                <div className="text-xs text-zinc-500">{formatDate(r.created_at)}</div>
                                                            </div>
                                                            <div className="flex gap-1">
                                                                {Array.from({ length: 5 }).map((_, i) => (
                                                                    <FaStar 
                                                                        key={i} 
                                                                        className={`${i < r.rating ? "text-amber-400" : "text-zinc-300"} text-sm`} 
                                                                    />
                                                                ))}
                                                            </div>
                                                        </div>
                                                        <p className="text-zinc-700 leading-relaxed">{r.comment}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="text-center py-12 text-zinc-500 bg-zinc-50 rounded-2xl">
                                            <FaStar className="mx-auto text-4xl text-zinc-300 mb-3" />
                                            <div className="font-medium">No reviews yet</div>
                                            <div className="text-sm">Be the first to review this product!</div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                </div>

            </div>
        </div>
    );
}