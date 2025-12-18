  import { Routes, Route } from "react-router-dom";

  import Home from "./Components/Home/Home";
  import Wishlist from "./Components/Wishlist/Wishlist";
  import ProductPage from "./Components/ProductPage/ProductPage";
  import Login from "./Components/Login/Login";
  import Profile from "./Components/Profile/Profile";

  import MainLayout from "./Layout/MainLayout";
  import AdminLayout from "./Layout/AdminLayout";
  import Dashboard from "./Components/Dashboard/Dashboard";
  import AdminProductForm from "./Components/form/AdminProductForm";
  import AdminProfile from "./Components/AdminProfile/Admin-Profile";
  import Signup from "./Components/Sign-up/Signup";
  import AboutUs from "./Components/AboutUs/AboutUs";

  const App = () => {
    return (
      <Routes>
        {/* ---------- USER LAYOUT ---------- */}
        <Route element={<MainLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/Sign-up" element={<Signup />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/wishlist" element={<Wishlist />} />
          <Route path="/About-Us" element={<AboutUs />} />
          <Route path="/product" element={<ProductPage />} />
        </Route>

        {/* ---------- ADMIN LAYOUT ---------- */}
        <Route element={<AdminLayout />}>
          <Route path="/admin/dashboard" element={<Dashboard />} />
          <Route path="/admin/add-product" element={<AdminProductForm />} />
          <Route path="/Admin/profile" element={<AdminProfile />} />
        </Route>
      </Routes>
    );
  };

  export default App;
