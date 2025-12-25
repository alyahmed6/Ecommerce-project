import React, { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { supabase } from "../../supabaseClient/supabaseClient";
import { useDispatch } from "react-redux";
import { addToCart,removeFromCart }  from "../../Store/CardSlice";
import ProductDetailLoader from "../Loader/ProductDetailLoader";
import { toast } from "react-hot-toast";
import  {useSelector} from "react-redux";



export default function ProdcutDetails() {
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

                
                try {
                    const rev = await supabase.from("reviews").select("id,product_id,rating,comment,name,created_at").eq("product_id", data.id).order("created_at", { ascending: false });
                    if (!rev.error && rev.data) setReviews(rev.data);
                } catch (e) {
                
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
            alert("Please provide a rating and review text.");
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
            
        } catch (e) {
            console.error(e);
            alert("Failed to submit review.");
        } finally {
            setSubmittingReview(false);
        }
    };

if (loading) return <ProductDetailLoader/>;
    if (error) return <div className="min-h-screen flex items-center justify-center text-red-600">{error}</div>;
    if (!product) return <div className="min-h-screen flex items-center justify-center">Product not found</div>;


   
    const isInCart = cartItems.some(
                (i) => i.id === product.id
              );

    const images = Array.isArray(product.images) ? product.images : parseImagesField(product);

    const rating =
    reviews.length > 0
        ? Math.round(
            reviews.reduce((sum, r) => sum + Number(r.rating || 0), 0) /
            reviews.length
          )
        : Number(product?.rating) || 0;
    const originalPrice = product?.original_price || null;
    const onSale = originalPrice && Number(originalPrice) > Number(product?.price || 0);

    return (
        <div className="min-h-screen mt-15 bg-gray-50 py-12">
            <div className="p-4 max-w-[1500px] mx-auto">
                
                <nav className="text-sm text-gray-600 mb-3" aria-label="Breadcrumb">
                    <ol className="list-none p-0 inline-flex items-center gap-2">
                        <li>
                            <Link to="/" className="text-gray-600 hover:underline">Home</Link>
                        </li>
                        <li className="text-gray-400">/</li>
                        <li>
                            {product?.category ? (
                                <Link to={`/product?category=${encodeURIComponent(product.category)}`} className="text-gray-600 hover:underline">{product.category}</Link>
                            ) : (
                                <span className="text-gray-600">Products</span>
                            )}
                        </li>
                        <li className="text-gray-400">/</li>
                        <li className="text-gray-800 font-medium truncate max-w-[500px]">{product?.name}</li>
                    </ol>
                </nav>
                <div className="bg-white rounded shadow p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div>
                            <div className="relative h-88 rounded overflow-hidden ">
                                {onSale && (
                                    <div className="absolute top-3 left-3 bg-red-500 text-white px-3 py-1 rounded-full text-sm font-semibold">SALE</div>
                                )}
                                <div className="w-full h-full flex items-center justify-center bg-white border border-gray-200 overflow-hidden">
                                    {mainImage ? (
                                        <img src={mainImage} alt={product.name} className="w-full h-full object-contain" />
                                    ) : (
                                        <div className="text-gray-400">No image</div>
                                    )}
                                </div>
                            </div>

                            {images.length > 1 && (
                                <div className="mt-3 flex gap-3 overflow-x-auto items-center">
                                    {images.map((src, i) => (
                                        <button
                                            key={i}
                                            onClick={() => setMainImage(src)}
                                            className={`w-20 h-20 rounded overflow-hidden border ${mainImage===src? 'ring-2 ring-blue-500':''}  transform transition`}>
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
                                        <div className="flex items-center">
  {Array.from({ length: 5 }).map((_, i) => (
    <svg
      key={i}
      className={`w-4 h-4 ${
        i < rating ? "text-yellow-400" : "text-gray-300"
      }`}
      viewBox="0 0 20 20"
      fill="currentColor"
    >
      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.286 3.955a1 1 0 00.95.69h4.162c.969 0 1.371 1.24.588 1.81l-3.37 2.447a1 1 0 00-.364 1.118l1.287 3.955c.3.921-.755 1.688-1.54 1.118L10 13.347l-3.37 2.447c-.784.57-1.84-.197-1.54-1.118l1.287-3.955a1 1 0 00-.364-1.118L2.643 9.382c-.783-.57-.38-1.81.588-1.81h4.162a1 1 0 00.95-.69L9.049 2.927z" />
    </svg>
  ))}
</div>
                                        <div className="text-sm text-gray-500">({reviews.length} reviews)</div>
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

                                            <div className="flex flex-wrap gap-3 items-center mb-6">
                                                <button onClick={() => {
                                                                        if (isInCart) {
                                                                          dispatch(removeFromCart(product.id));
                                                                          toast.error("Removed from cart");
                                                                        } else {
                                                                          dispatch(addToCart(product));
                                                                          toast.success("Added to cart");
                                                                        }
                                                                      }}
                                                className={`px-6 py-3 bg-black hover:bg-black-600 text-white rounded text-sm 
                                                font-semibold shadow ${isInCart ? "bg-red-600" : "bg-blue-600"}`}>
                                                    {isInCart ? "Remove from Cart" : "Add to Cart"}
                                                    </button>
                                                <button onClick={() => { navigate(`/checkout?product=${product.id}`) }} className="px-6 py-3 bg-blue-600 hover:bg-blue-500 rounded text-white font-semibold text-sm shadow">Buy Now</button>
                                                <button onClick={() => navigator.share ? navigator.share({ title: product.name, url: window.location.href }) : navigate("/share")} className="px-3 py-2 text-sm text-gray-600">Share</button>
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
                                <button onClick={() => setActiveTab("reviews")} className={`px-6 py-3 ${activeTab === "reviews" ? "border-b-2 border-black" : "text-gray-600"}`}>Reviews ({reviews.length})</button>
                            </nav>
                        </div>

                        <div className="mt-6">
                            {activeTab === "description" && (
                                <div className="text-gray-700">{product.description|| "No description information."}</div>
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
                                <div className="text-gray-700">
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                        <div className="md:col-span-1 bg-white p-4 rounded shadow">
                                            <div className="text-center">
                                                <div className="text-4xl font-bold">{reviews && reviews.length ? ( (reviews.reduce((s,r)=>s+r.rating,0)/reviews.length).toFixed(1) ) : (product.rating ? Number(product.rating).toFixed(1) : '0.0')}</div>
                                                <div className="text-sm text-gray-500">Average Rating</div>
                                            </div>

                                            <div className="mt-4 space-y-2">
                                                {Array.from({ length: 5 }).map((_, i) => {
                                                    const star = 5 - i;
                                                    const count = reviews ? reviews.filter(r => Number(r.rating) === star).length : 0;
                                                    const pct = reviews && reviews.length ? Math.round((count / reviews.length) * 100) : 0;
                                                    return (
                                                        <div key={star} className="flex items-center gap-3">
                                                            <div className="w-8 text-sm">{star}★</div>
                                                            <div className="flex-1 bg-gray-100 h-3 rounded overflow-hidden">
                                                                <div style={{ width: `${pct}%` }} className="h-3 bg-yellow-400"></div>
                                                            </div>
                                                            <div className="w-8 text-sm text-gray-600 text-right">{count}</div>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </div>

                                        <div className="md:col-span-2 bg-white p-4 rounded shadow">
                                            <div className="mb-4">
                                                <div className="text-lg font-semibold mb-2">Write a review</div>
                                                <div className="flex items-center gap-2 mb-2">
                                                    {Array.from({ length: 5 }).map((_, i) => {
                                                        const val = i + 1;
                                                        return (
                                                            <button key={i} onClick={() => setReviewRating(val)} className={`text-2xl ${reviewRating >= val ? 'text-yellow-400' : 'text-gray-300'}`}>
                                                                ★
                                                            </button>
                                                        );
                                                    })}
                                                </div>
                                                <input value={reviewName} onChange={(e)=>setReviewName(e.target.value)} placeholder="Your name" className="w-full mb-2 p-2 border rounded" />
                                                <textarea value={reviewText} onChange={(e)=>setReviewText(e.target.value)} placeholder="Write your review" className="w-full p-2 border rounded mb-2" rows={4} />
                                                <div className="flex items-center justify-between">
                                                    <div className="text-sm text-gray-500">{reviews && reviews.length ? `${reviews.length} review(s)` : 'No reviews yet'}</div>
                                                    <button onClick={submitReview} disabled={submittingReview} className="px-4 py-2 bg-blue-600 text-white rounded">{submittingReview ? 'Submitting...' : 'Submit Review'}</button>
                                                </div>
                                            </div>

                                            <div className="mt-4 space-y-4">
                                                {loadingReviews ? (
                                                    <div>Loading reviews...</div>
                                                ) : reviews && reviews.length ? (
                                                    reviews.map(r => (
                                                        <div key={r.id} className="border rounded p-3">
                                                            <div className="flex items-center justify-between">
                                                                <div className="font-medium">{r.name || 'Anonymous'}</div>
                                                                <div className="text-sm text-gray-600">{new Date(r.created_at).toLocaleDateString()}</div>
                                                            </div>
                                                            <div className="text-yellow-400">{Array.from({length: r.rating}).map((_,i)=>(<span key={i}>★</span>))}</div>
                                                            <div className="mt-2 text-gray-700">{r.comment}</div>
                                                        </div>
                                                    ))
                                                ) : (
                                                    <div className="text-gray-500">No reviews yet — be the first to write one.</div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
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
