import { useSelector, useDispatch } from "react-redux";
import { removeFromWishlist } from "../../Store/HeartSlice";
import { addToCart } from "../../Store/CardSlice";
import { toast } from "react-hot-toast";

function Wishlist() {
  const dispatch = useDispatch();

  const wishlistItems = useSelector((state) => state.wishlist.items);
  const cartItems = useSelector((state) => state.cart.items);

  return (
    <section className="min-h-screen mt-[150px] py-12 px-4 sm:px-6 lg:px-8">

      <h2 className="text-3xl font-bold mb-8 text-center">Your Wishlist</h2>

      {wishlistItems.length === 0 ? (
        <p className="text-center text-gray-600 mt-20">
          Your wishlist is empty 😢
        </p>
      ) : (
        <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {wishlistItems.map((item) => {
            const isInCart = cartItems.some((i) => i.id === item.id);

            return (
              <div
                key={item.id}
                className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow duration-300 flex flex-col"
              >
                <div className="relative pb-[100%] bg-gray-200">
                  <img
                    src={item.image_url}
                    alt={item.name}
                    className="absolute inset-0 w-full h-full object-cover"
                  />

                  <button
                    className="absolute top-2 right-2 bg-white/80 hover:bg-white shadow-md w-10 h-10 rounded-full flex items-center justify-center backdrop-blur-sm transition"
                    onClick={() => {
                      dispatch(removeFromWishlist(item.id));
                      toast.error(`${item.name} removed from wishlist`);
                    }}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5 text-red-600"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-10.707a1 1 0 00-1.414-1.414L10 8.586 7.707 6.293a1 1 0 00-1.414 1.414L8.586 10l-2.293 2.293a1 1 0 001.414 1.414L10 11.414l2.293 2.293a1 1 0 001.414-1.414L11.414 10l2.293-2.293z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </button>
                </div>

                <div className="p-4 flex flex-col">
                  <h3 className="text-lg font-semibold text-gray-800 mb-2 line-clamp-2">
                    {item.name}
                  </h3>

                  <div className="mt-auto flex items-center justify-between">
                    <span className="text-2xl font-bold text-blue-600">
                      ${item.price}
                    </span>

                    {isInCart ? (
                      <button
                        className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors duration-200"
                        disabled
                      >
                        In Cart
                      </button>
                    ) : (
                      <button
                        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors duration-200"
                        onClick={() => {
                          dispatch(addToCart(item));
                          toast.success(`${item.name} added to cart`);
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
    </section>
  );
}

export default Wishlist;
