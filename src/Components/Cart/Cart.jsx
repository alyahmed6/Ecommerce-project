import { useDispatch, useSelector } from "react-redux";
import { closeCart } from "../../Store/CartUiSlice";
import { increaseQty, decreaseQty, removeFromCart } from "../../Store/CardSlice";
import { toast } from "react-hot-toast";

function Cart() {
  const dispatch = useDispatch();
  const cartOpen = useSelector((state) => state.ui.cartOpen);
  const cartItems = useSelector((state) => state.cart.items);

  const total = cartItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  return (
    <>

      {cartOpen && (
        <div
          className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40"
          onClick={() => dispatch(closeCart())}
        ></div>
      )}

      <div
        className={`fixed top-0 right-0 h-full w-[350px] bg-white shadow-2xl z-50 p-5 
          transition-transform duration-300
          ${cartOpen ? "translate-x-0" : "translate-x-full"}`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-5 border-b pb-2">
          <h2 className="text-2xl font-bold">Your Cart</h2>
          <button
            onClick={() => dispatch(closeCart())}
            className="text-xl font-bold hover:text-red-600 transition"
          >
            ✕
          </button>
        </div>

        {cartItems.length === 0 ? (
          <p className="text-center text-gray-600 mt-20">Your cart is empty 😢</p>
        ) : (
          <div className="flex flex-col gap-4 overflow-y-auto h-[70vh] pr-2">
            {cartItems.map((item) => (
              <div
                key={item.id}
                className="flex items-center gap-3 bg-gray-50 p-3 rounded-lg  shadow-sm"
              >
              
                <img
                  src={item.image_url}
                  alt={item.name}
                  className="w-20 h-20 rounded object-cover"
                />

                <div className="flex flex-col flex-1">
                  <h3 className="font-semibold">{item.name}</h3>
                  <p className="text-blue-600 font-bold">
                    ${(item.price * item.quantity).toFixed(2)}
                  </p>

                  <div className="flex items-center gap-2 mt-2">
                    <button
                      className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300 transition"
                      onClick={() => dispatch(decreaseQty(item.id))}
                    >
                      -
                    </button>

                    <span className="px-2">{item.quantity}</span>

                    <button
                      className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300 transition"
                      onClick={() => dispatch(increaseQty(item.id))}
                    >
                      +
                    </button>
                  </div>
                </div>

                <button
                  onClick={() => {
                    dispatch(removeFromCart(item.id));
                    toast.error(`${item.name} removed from cart`, {
                      style: {
                        borderRadius: "10px",
                        background: "#fff",
                        color: "#333",
                        fontSize: "14px",
                      },
                    });
                  }}
                  className="text-red-600 font-bold text-lg border rounded px-2 hover:bg-red-100 transition"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        )}

        <div className="absolute bottom-0 left-0 w-full p-5 border-t bg-white">
          <div className="flex justify-between font-bold text-lg mb-4">
            <span>Total</span>
            <span>${total.toFixed(2)}</span>
          </div>

          <button className="w-full bg-blue-600 text-white py-3 rounded-lg text-lg font-semibold hover:bg-blue-700 transition">
            Checkout
          </button>
        </div>
      </div>
    </>
  );
}

export default Cart;
