import { useState } from "react";
import { supabase } from "../../supabaseClient/supabaseClient";
import toast from "react-hot-toast";
import { FaPlus, FaUpload } from "react-icons/fa";

const AdminProductForm = ({ categories = ["Mens", "Womens", "New Arrivals", "On Sale"] }) => {
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [category, setCategory] = useState(categories[0]);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [loading, setLoading] = useState(false);

  const uploadImage = async () => {
    if (!imageFile) return null;
    const fileExt = imageFile.name.split(".").pop();
    const fileName = `${Date.now()}.${fileExt}`;
    const { error } = await supabase.storage.from("product-images").upload(fileName, imageFile);
    if (error) throw error;
    const { data } = supabase.storage.from("product-images").getPublicUrl(fileName);
    return data.publicUrl;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name || !price || !imageFile) {
      toast.error("All fields are required");
      return;
    }
    setLoading(true);
    try {
      const imageUrl = await uploadImage();
      const { error } = await supabase.from("products").insert([
        { name, price: Number(price), category, image_url: imageUrl },
      ]);
      if (error) throw error;
      toast.success("Product uploaded!");
      setName("");
      setPrice("");
      setCategory(categories[0]);
      setImageFile(null);
      setImagePreview(null);
    } catch (err) {
      console.error(err);
      toast.error("Failed to upload product");
    }
    setLoading(false);
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  return (
    <div className=" mt-[88px] bg-white shadow-lg rounded-2xl p-8 w-full max-w-lg mx-auto">
      <h2 className="text-2xl font-bold mb-6 flex items-center gap-2 text-gray-800">
        <FaPlus /> Add Product
      </h2>
      <form onSubmit={handleSubmit} className="grid gap-5">
        <input
          type="text"
          className="w-full px-4 py-3 rounded-xl bg-gray-50 focus:ring-2 focus:ring-blue-400 outline-none"
          placeholder="Product Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />

        <input
          type="number"
          className="w-full px-4 py-3 rounded-xl bg-gray-50 focus:ring-2 focus:ring-blue-400 outline-none"
          placeholder="Price"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
        />


        <select
          className="w-full px-4 py-3 rounded-xl bg-gray-50 focus:ring-2 focus:ring-blue-400 outline-none"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
        >
          {categories.map((c) => (
            <option key={c}>{c}</option>
          ))}
        </select>

        {/* Image upload box */}
        <label className="flex flex-col items-center justify-center w-full h-40 border-2 border-dashed border-gray-300 rounded-xl cursor-pointer hover:border-blue-400 transition-colors bg-gray-50">
          {imagePreview ? (
            <img src={imagePreview} alt="Preview" className="h-full w-full object-cover rounded-xl" />
          ) : (
            <div className="flex flex-col items-center justify-center text-gray-400">
              <FaUpload size={30} className="mb-2" />
              <span>Click or drag image to upload</span>
            </div>
          )}
          <input type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
        </label>

        <button
          type="submit"
          disabled={loading}
          className="bg-blue-600 text-white py-3 rounded-xl font-semibold hover:bg-blue-700 transition"
        >
          {loading ? "Uploading..." : "Upload Product"}
        </button>
      </form>
    </div>
  );
};

export default AdminProductForm;
