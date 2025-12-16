import React from "react";
import { FaFacebookF, FaTwitter, FaInstagram, FaLinkedinIn } from "react-icons/fa";

const Footer = () => {
  return (
    <footer className="bg-gray-900 text-white py-12 ">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-4 gap-8">
        
        <div>
          <h3 className="text-xl font-bold mb-4">APP</h3>
          <p className="text-gray-400">
            Your one-stop shop for the latest fashion trends. Quality products,
            fast delivery, and excellent customer service.
          </p>
        </div>

        <div>
          <h3 className="text-xl font-bold mb-4">Quick Links</h3>
          <ul className="space-y-2">
            <li><a href="/" className="hover:text-blue-500 transition">Home</a></li>
            <li><a href="/wishlist" className="hover:text-blue-500 transition">Wishlist</a></li>
            <li><a href="#products-section" className="hover:text-blue-500 transition">Products</a></li>
            <li><a href="#contact" className="hover:text-blue-500 transition">Contact</a></li>
          </ul>
        </div>

        <div>
          <h3 className="text-xl font-bold mb-4">Contact</h3>
          <p className="text-gray-400">123 Fashion Street, Gilgit, Pakistan</p>
          <p className="text-gray-400">Email: support@app.com</p>
          <p className="text-gray-400">Phone: +1 234 567 890</p>
        </div>

        <div>
          <h3 className="text-xl font-bold mb-4">Follow Us</h3>
          <div className="flex gap-4">
            <a href="#" className="p-2 bg-blue-600 rounded-full hover:bg-blue-500 transition">
              <FaFacebookF />
            </a>
            <a href="#" className="p-2 bg-blue-400 rounded-full hover:bg-blue-300 transition">
              <FaTwitter />
            </a>
            <a href="#" className="p-2 bg-pink-600 rounded-full hover:bg-pink-500 transition">
              <FaInstagram />
            </a>
            <a href="#" className="p-2 bg-blue-800 rounded-full hover:bg-blue-700 transition">
              <FaLinkedinIn />
            </a>
          </div>
        </div>

      </div>

      <div className="border-t border-gray-700 mt-8 pt-6 text-center text-gray-500 text-sm">
        &copy; {new Date().getFullYear()} APP. All rights reserved.
      </div>
    </footer>
  );
};

export default Footer;
