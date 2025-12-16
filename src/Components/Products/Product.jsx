import { useEffect, useState } from 'react';
import { supabase } from '../../supabaseClient/supabaseClient';
import { CiHeart } from "react-icons/ci";
import toast from "react-hot-toast";
import { useSelector, useDispatch } from "react-redux";
import { addToCart, removeFromCart } from "../../Store/CardSlice";
import { addToWishlist, removeFromWishlist } from "../../Store/HeartSlice";
import { Link, useNavigate } from 'react-router-dom';


function Product({ limit }) {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setactiveTab] = useState('All');

    const categories = ['All', 'Mens', 'Womens', 'New Arrivals', 'On Sale'];

    const searchTerm = useSelector((state) => state.search.searchTerm);
    const wishlistItems = useSelector((state) => state.wishlist.items);
    const cartItems = useSelector((state) => state.cart.items);

    const dispatch = useDispatch();
    const navigate = useNavigate();

    const filteredProducts = products.filter(product =>
        product.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const displayedProducts = limit ? filteredProducts.slice(0, limit) : filteredProducts;

    // Load products
    async function loadProducts(category) {
        setLoading(true);

        let query = supabase
            .from('products')
            .select('id, name, image_url, price, category');

        if (category !== 'All') {
            query = query.eq('category', category);
        }

        const { data, error } = await query;

        if (error) {
            console.error('Error:', error);
        } else {
            setProducts(data);
        }

        setLoading(false);
    }

    useEffect(() => {
        loadProducts(activeTab);
    }, [activeTab]);

    return (
        <section id="products-section">
            <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8">


                <div className="flex gap-3 justify-center items-center pb-10">
                    {categories.map(category => (
                        <button
                            key={category}
                            className={`px-8 py-2 rounded-full text-xl font-bold cursor-pointer
                                ${activeTab === category ? 'bg-blue-600 text-white' : 'bg-zinc-100 text-zinc-800'}`}
                            onClick={() => setactiveTab(category)}
                        >
                            {category}
                        </button>
                    ))}
                </div>


                <div className="max-w-7xl mx-auto">
                    {loading ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                            {Array.from({ length: limit || 8 }).map((_, i) => (
                                <div key={i} className="bg-gray-200 animate-pulse rounded-lg overflow-hidden flex flex-col">
                                    <div className="pb-[100%] bg-gray-300"></div>
                                    <div className="p-4 flex flex-col gap-2">
                                        <div className="h-6 bg-gray-300 rounded w-3/4"></div>
                                        <div className="h-6 bg-gray-300 rounded w-1/2"></div>
                                        <div className="h-10 bg-gray-300 rounded mt-auto"></div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                            {displayedProducts.map(product => {
                                const isInWishlist = wishlistItems.some(i => i.id === product.id);
                                const isInCart = cartItems.some(i => i.id === product.id);

                                return (
                                    <div
                                        key={product.id}
                                        className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow duration-300 flex flex-col"
                                    >
                                        <div className="relative pb-[100%] bg-gray-200">
                                            <img
                                                src={product.image_url}
                                                alt={product.name}
                                                className="absolute inset-0 w-full h-full object-cover"
                                            />

                                            <button
                                                className="absolute top-2 right-2 bg-white/80 hover:bg-white shadow-md w-10 h-10 rounded-full flex items-center justify-center backdrop-blur-sm transition"
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
                                                    className={isInWishlist ? "text-red-600" : "text-gray-700"}
                                                />
                                            </button>
                                        </div>

                                        <div className="p-4 flex flex-col">
                                            <h3 className="text-lg font-semibold text-gray-800 mb-2 line-clamp-2">
                                                {product.name}
                                            </h3>

                                            <div className="mt-auto flex items-center justify-between">
                                                <span className="text-2xl font-bold text-blue-600">
                                                    ${product.price}
                                                </span>


                                                {isInCart ? (
                                                    <button
                                                        className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors duration-200"
                                                        onClick={() => {
                                                            dispatch(removeFromCart(product.id));
                                                            toast.error("Removed from cart");
                                                        }}
                                                    >
                                                        Remove from Cart
                                                    </button>
                                                ) : (
                                                    <button
                                                        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors duration-200"
                                                        onClick={() => {
                                                            dispatch(addToCart(product));
                                                            toast.success("Add to cart");
                                                        }}
                                                    >
                                                        Add to Cart
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
                <div className="flex justify-center items-center mt-10">
                    <button
                    className="px-4 py-2 bg-blue-600 text-white rounded"
                        onClick={() => {
                            window.scrollTo(0, 0);
                            navigate("/product");
                        }}
                    >
                        View More
                    </button>

                </div>
            </div>
        </section>
    );
}

export default Product;
