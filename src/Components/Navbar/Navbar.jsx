import { useState, useRef, useEffect } from "react";
import { CiSearch } from "react-icons/ci";
import { FaHeart, FaShoppingBag, FaUser } from "react-icons/fa";
import { useSelector, useDispatch } from "react-redux";
import { setSearchTerm } from "../../Store/searchSlice";
import { toggleCart } from "../../Store/CartUiSlice";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "../../supabaseClient/supabaseClient";

const Navbar = ({ handleScroll }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const searchTerm = useSelector((state) => state.search.searchTerm);
  const cartItems = useSelector((state) => state.cart.items);
  const wishlistItems = useSelector((state) => state.wishlist.items);

  const cartCount = cartItems.length;
  const wishlistCount = wishlistItems.length;

  const [open, setOpen] = useState(false);
  const dropdownRef = useRef(null);

  const [user, setUser] = useState(null);
  const [avatarUrl, setAvatarUrl] = useState(null);

  const isLoggedIn = !!user;

  useEffect(() => {
    let mounted = true;

    const loadUser = async () => {
      try {
        const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
        if (sessionError) {
          console.error("Session error:", sessionError);
          return;
        }

        const u = sessionData?.session?.user ?? null;
        if (!mounted) return;
        setUser(u);

        if (u) {
          const { data: profile, error } = await supabase
            .from("profiles")
            .select("avatar_url")
            .eq("id", u.id)
            .single();

          if (!mounted) return;

          if (error) {
            console.error("Profile fetch error:", error);
            setAvatarUrl(null);
          } else {
            setAvatarUrl(profile?.avatar_url || null);
          }
        } else {
          setAvatarUrl(null);
        }
      } catch (err) {
        console.error("Auth load error:", err);
      }
    };

    loadUser();

    const { data: listener } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        const u = session?.user ?? null;
        if (!mounted) return;
        setUser(u);

        if (u) {
          const { data: profile, error } = await supabase
            .from("profiles")
            .select("avatar_url")
            .eq("id", u.id)
            .single();

          if (!mounted) return;

          if (error) {
            console.error("Profile fetch error:", error);
            setAvatarUrl(null);
          } else {
            setAvatarUrl(profile?.avatar_url || null);
          }
        } else {
          setAvatarUrl(null);
        }
      }
    );

    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      mounted = false;
      document.removeEventListener("mousedown", handleClickOutside);
      listener?.unsubscribe?.();
    };
  }, []);

  const handleSignOut = async () => {
    try {
      localStorage.clear();
      await supabase.auth.signOut();
      setUser(null);
      setAvatarUrl(null);
      setOpen(false);
      navigate("/");
    } catch (error) {
      console.error("Sign out error:", error);
    }
  };

  return (
    <header className="bg-white fixed top-0 left-0 right-0 shadow-md h-23 z-10">
      <nav className="flex max-w-7xl mx-auto py-5 px-6 h-full items-center justify-between ">

        <Link to="/">
          <h2 className="text-2xl font-extrabold text-zinc-900">APP</h2>
        </Link>

        <div className="hidden md:flex gap-8 text-lg font-semibold">
          <Link to="/" className="hover:text-blue-600">Home</Link>
          <Link to="/product" className="hover:text-blue-600">Products</Link>
          <Link to="/About-Us" className="hover:text-blue-600">About Us</Link>
        </div>

        <div className="flex items-center gap-6">

          <div className="flex items-center gap-2 px-4 py-2 bg-zinc-100 rounded-full border">
            <input
              type="text"
              placeholder="Search..."
              className="bg-transparent outline-none w-40"
              value={searchTerm}
              onChange={(e) => dispatch(setSearchTerm(e.target.value))}
              onFocus={handleScroll}
            />
            <button className="w-9 h-9 flex items-center justify-center rounded-full bg-blue-600 text-white">
              <CiSearch size={20} />
            </button>
          </div>

          <div className="flex items-center gap-4">
            <Link to="/wishlist" className="relative">
              <FaHeart size={24} />
              {wishlistCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-600 text-white text-xs w-5 h-5 flex items-center justify-center rounded-full">
                  {wishlistCount}
                </span>
              )}
            </Link>

            <button onClick={() => dispatch(toggleCart())} className="relative">
              <FaShoppingBag size={24} />
              {cartCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-600 text-white text-xs w-5 h-5 flex items-center justify-center rounded-full">
                  {cartCount}
                </span>
              )}
            </button>
          </div>

          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => {
                if (!isLoggedIn) {
                  navigate("/login");
                } else {
                  setOpen(!open);
                }
              }}
              className="w-9 h-9 rounded-full flex items-center"
            >
              {avatarUrl ? (
                <img
                  src={avatarUrl}
                  alt="avatar"
                  className="w-9 h-9 rounded-full object-cover"
                />
              ) : (
                <FaUser size={20} />
              )}
            </button>
            
            {open && isLoggedIn && (
              <div className="absolute right-0 mt-3 w-44 bg-white border rounded-xl shadow-lg py-2">
                <button
                  onClick={() => {
                    setOpen(false);
                    navigate("/profile");
                  }}
                  className="w-full text-left px-4 py-2 hover:bg-zinc-100"
                >
                  Profile
                </button>

                <button
                  onClick={handleSignOut}
                  className="w-full text-left px-4 py-2 hover:bg-zinc-100 text-red-500"
                >
                  Logout
                </button>
              </div>
            )}
          </div>

        </div>
      </nav>
    </header>
  );
};

export default Navbar;