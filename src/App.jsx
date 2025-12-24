  import { Routes, Route } from "react-router-dom";

  import Home from "./Components/Home/Home";
  import Wishlist from "./Components/Wishlist/Wishlist";
  import ProductPage from "./Components/ProductPage/ProductPage";
  import ProdcutDetails from "./Components/ProductDetails/ProdcutDetails";
  import Login from "./Components/Login/Login";
  import Profile from "./Components/Profile/Profile";

  import MainLayout from "./Layout/MainLayout";
  import AdminLayout from "./Layout/AdminLayout";
  import Dashboard from "./Components/Dashboard/Dashboard";
  import AdminProductForm from "./Components/form/AdminProductForm";
  import AdminEditProduct from "./Components/form/AdminEditProduct";
  import AdminProfile from "./Components/AdminProfile/Admin-Profile";
  import Signup from "./Components/Sign-up/Signup";
  import AboutUs from "./Components/AboutUs/AboutUs";
  import ScrollToTop from "./Components/ScrollToTop/ScrollToTop";

  import { UserProvider } from "./Context/UserContext";

  const App = () => {
  return (
    <UserProvider>
      <ScrollToTop /> 

      <Routes>
        {/* ---------- USER LAYOUT ---------- */}
        <Route element={<MainLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/Sign-up" element={<Signup />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/product/:slug" element={<ProdcutDetails />} />
          <Route path="/wishlist" element={<Wishlist />} />
          <Route path="/About-Us" element={<AboutUs />} />
          <Route path="/product" element={<ProductPage />} />
        </Route>

        {/* ---------- ADMIN LAYOUT ---------- */}
        <Route element={<AdminLayout />}>
          <Route path="/admin/dashboard" element={<Dashboard />} />
          <Route path="/admin/add-product" element={<AdminProductForm />} />
          <Route path="/admin/products/edit/:id" element={<AdminEditProduct />} />
          <Route path="/Admin/profile" element={<AdminProfile />} />
        </Route>
      </Routes>
    </UserProvider>
  );
};

export default App;
