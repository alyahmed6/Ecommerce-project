import { useState, useRef, useEffect } from "react";
import { CiSearch } from "react-icons/ci";
import { FaHeart, FaShoppingBag, FaUser } from "react-icons/fa";
import { useSelector, useDispatch } from "react-redux";
import { setSearchTerm } from "../../Store/searchSlice";
import { toggleCart } from "../../Store/CartUiSlice";
import { Link, useNavigate } from "react-router-dom";

const Navbar = ({ handleScroll }) => {
  const dispatch = useDispatch();
  const searchTerm = useSelector((state) => state.search.searchTerm);
  const cartItems = useSelector((state) => state.cart.items);
  const wishlistItems = useSelector((state) => state.wishlist.items);

  const cartCount = cartItems.length;
  const wishlistCount = wishlistItems.length;

  const [open, setOpen] = useState(false);
  const dropdownRef = useRef(null);

  const isLoggedIn = false;

  const navigate = useNavigate();

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setOpen(false);
      }
    };

    const handleScroll = () => {
      if (open) setOpen(false);
    };

    document.addEventListener("mousedown", handleClickOutside);
    window.addEventListener("scroll", handleScroll);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      window.removeEventListener("scroll", handleScroll);
    };
  }, [open]);

  return (
    <header className="bg-white fixed top-0 left-0 right-0 shadow-md z-10">
      <nav className="flex min-h-[14vh] max-w-[1500px] mx-auto items-center justify-between px-8">

        {/* Logo */}
        <Link to="/">
          <h2 className="text-2xl font-extrabold text-zinc-900 tracking-wide">
            APP
          </h2>
        </Link>


        <div className="pl-18 hidden md:flex gap-8 text-lg font-semibold">
          <Link to="/" className="hover:text-blue-600 transition">Home</Link>
          <Link to="/product" className="hover:text-blue-600 transition">Products</Link>
          <Link to="/contact" className="hover:text-blue-600 transition">Contact Us</Link>
        </div>


        <div className="flex items-center gap-6">


          <div className="flex items-center gap-2 px-4 py-2 bg-zinc-100 rounded-full shadow-inner border border-zinc-300">
            <input
              type="text"
              placeholder="Search..."
              autoComplete="off"
              className="bg-transparent outline-none w-40 placeholder-zinc-500"
              value={searchTerm}
              onChange={(e) => dispatch(setSearchTerm(e.target.value))}
              onFocus={handleScroll}
            />
            <button className="w-9 h-9 flex items-center justify-center rounded-full bg-blue-600 text-white hover:bg-blue-700 transition">
              <CiSearch size={20} />
            </button>
          </div>

          <div className="flex items-center gap-4 relative">
            <Link to="/wishlist" className="flex justify-center">
              <button className="text-[1.7rem] text-zinc-700 hover:text-red-500 transition relative">
                <FaHeart />
                {wishlistCount > 0 && (
                  <span className="flex justify-center items-center bg-red-600 text-white w-5 h-5 rounded-full text-[12px] absolute -top-1 -right-2 border-2 border-white">
                    {wishlistCount}
                  </span>
                )}
              </button>
            </Link>

            <button
              onClick={() => dispatch(toggleCart())}
              className="relative text-[1.7rem] text-zinc-700 hover:text-blue-600 transition"
            >
              <FaShoppingBag />
              {cartCount > 0 && (
                <span className="flex justify-center items-center bg-red-600 text-white w-5 h-5 rounded-full text-[12px] absolute -top-1 -right-2 border-2 border-white">
                  {cartCount}
                </span>
              )}
            </button>
          </div>

          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setOpen(!open)}
              className="flex items-center h-5 w-5 text-zinc-700 hover:text-black scale-105 transition"
            >
              <FaUser size={24} />
            </button>

            {open && (
              <div className="absolute right-0 mt-3 w-44 bg-white border border-zinc-200 rounded-xl shadow-lg py-2 z-50 animate-fadeIn">
                <button className="w-full text-left px-4 py-2 text-zinc-700 hover:bg-zinc-100 transition">Profile</button>
                <button className="w-full text-left px-4 py-2 text-zinc-700 hover:bg-zinc-100 transition">Settings</button>
                {isLoggedIn ? (
                  <button
                    onClick={() => {
                      navigate("/");
                    }}
                    className="w-full text-left px-4 py-2 text-zinc-700 hover:bg-zinc-100 transition"
                  >
                    Logout
                  </button>
                ) : (
                  <button
                    onClick={() => {
                      navigate("/login");
                    }}
                    className="w-full text-left px-4 py-2 text-zinc-700 hover:bg-zinc-100 transition"
                  >
                    Login
                  </button>
                )}
              </div>
            )}
          </div>

        </div>

      </nav>
    </header>
  );
};

export default Navbar;
