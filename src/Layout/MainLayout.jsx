import { Toaster } from "react-hot-toast";
import Navbar from "../Components/Navbar/Navbar";
import Footer from "../Components/Footer/Footer";
import Cart from "../Components/Cart/Cart";
import { Outlet } from "react-router-dom";

const MainLayout = () => {
  return (
    <>
      <Navbar />
      <Toaster position="top-right" />
      <Cart />
      <Outlet />
      <Footer />
    </>
  );
};

export default MainLayout;
