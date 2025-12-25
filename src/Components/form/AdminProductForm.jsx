import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { supabase } from "../../supabaseClient/supabaseClient";
import { createProduct, updateProduct } from "../../Store/ProductSlice";
import toast from "react-hot-toast";
import { FaPlus, FaUpload } from "react-icons/fa";

const categories = ["Mens", "Womens", "New Arrivals", "On Sale"];

const AdminProductForm = ({ productId = null, onSaved }) => {
  const dispatch = useDispatch();
  const { loading } = useSelector((state) => state.products);

  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [stock, setStock] = useState("");
  const [category, setCategory] = useState(categories[0]);
  const [description, setDescription] = useState("");
  const [additionalInfo, setAdditionalInfo] = useState("");
  const [imageFiles, setImageFiles] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);

  const uploadImages = async () => {
    if (!imageFiles.length) return [];

    const urls = [];

    for (const file of imageFiles) {
      const ext = file.name.split(".").pop();
      const fileName = `product-${Date.now()}-${Math.random()
        .toString(36)
        .slice(2)}.${ext}`;

      const { error } = await supabase.storage
        .from("product-images")
        .upload(fileName, file);

      if (error) throw error;

      const { data } = supabase.storage
        .from("product-images")
        .getPublicUrl(fileName);

      urls.push(data.publicUrl);
    }

    return urls;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!name || !price) {
      toast.error("Name and price are required");
      return;
    }

    try {
      const images = await uploadImages();


      const res = await supabase.auth.getUser?.();
      const user = res?.data?.user ?? res?.user ?? (supabase.auth.user ? supabase.auth.user() : null);
      if (!user) throw new Error("User not logged in");

      const payload = {
        name,
        price: Number(price),
        stock: Number(stock),
        category,
        description,
        additional_info: additionalInfo,
        image_url: images[0] || null,
        images: images.length ? JSON.stringify(images) : null,
        slug: `${name
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/(^-|-$)/g, "")}-${Date.now().toString().slice(-5)}`,
        user_id: user.id, 
      };

      if (productId) {
        await dispatch(updateProduct({ id: productId, payload })).unwrap();
        toast.success("Product updated");
        onSaved?.();
      } else {
        await dispatch(createProduct(payload)).unwrap();
        toast.success("Product created");

        setName("");
        setPrice("");
        setStock("");
        setCategory(categories[0]);
        setDescription("");
        setAdditionalInfo("");
        setImageFiles([]);
        setImagePreviews([]);
      }
    } catch (err) {
      console.error(err);
      toast.error(err.message || "Failed to save product");
    }
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    setImageFiles(files);
    setImagePreviews(files.map((f) => URL.createObjectURL(f)));
  };

  useEffect(() => {
    if (!productId) return;

    const loadProduct = async () => {
      try {
        const { data, error } = await supabase
          .from("products")
          .select("*")
          .eq("id", productId)
          .single();

        if (error) throw error;

        setName(data.name || "");
        setPrice(data.price || "");
        setStock(data.stock || "");
        setCategory(data.category || categories[0]);
        setDescription(data.description || "");
        setAdditionalInfo(data.additional_info || "");

        if (data.images) {
          try {
            setImagePreviews(JSON.parse(data.images));
          } catch {
            setImagePreviews([]);
          }
        } else if (data.image_url) {
          setImagePreviews([data.image_url]);
        }
      } catch (err) {
        console.error(err);
        toast.error("Failed to load product");
      }
    };

    loadProduct();
  }, [productId]);

  return (
    <div className="mt-[88px] max-w-xl mx-auto bg-white p-8 rounded-2xl shadow">
      <h2 className="text-2xl font-bold mb-6 flex items-center gap-2 text-gray-800">
        <FaPlus />
        {productId ? "Edit Product" : "Add Product"}
      </h2>

      <form onSubmit={handleSubmit} className="grid gap-5">
        <input
          className="w-full px-4 py-3 rounded-xl bg-gray-50 focus:ring-2 focus:ring-blue-400 outline-none"
          placeholder="Product name"
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

        <input
          type="number"
          className="w-full px-4 py-3 rounded-xl bg-gray-50 focus:ring-2 focus:ring-blue-400 outline-none"
          placeholder="Stock"
          value={stock}
          onChange={(e) => setStock(e.target.value)}
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

        <textarea
          className="w-full px-4 py-3 rounded-xl bg-gray-50 focus:ring-2 focus:ring-blue-400 outline-none"
          placeholder="Description"
          rows={3}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />

        <textarea
          className="w-full px-4 py-3 rounded-xl bg-gray-50 focus:ring-2 focus:ring-blue-400 outline-none"
          placeholder="Additional information"
          rows={3}
          value={additionalInfo}
          onChange={(e) => setAdditionalInfo(e.target.value)}
        />

        <label className="flex flex-col items-center justify-center w-full h-40 border-2 border-dashed border-gray-300 rounded-xl cursor-pointer hover:border-blue-400 transition-colors bg-gray-50">
          {imagePreviews.length ? (
            <div className="grid grid-cols-3 gap-2 w-full h-full p-2">
              {imagePreviews.map((img, i) => (
                <img key={i} src={img} className="object-cover rounded" />
              ))}
            </div>
          ) : (
            <div className="text-gray-400 flex flex-col items-center">
              <FaUpload size={24} />
              <span>Upload images</span>
            </div>
          )}
          <input
            type="file"
            multiple
            accept="image/*"
            className="hidden"
            onChange={handleImageChange}
          />
        </label>

        <button
          disabled={loading}
          className="bg-blue-600 text-white py-3 rounded-xl font-semibold hover:bg-blue-700 disabled:opacity-60"
        >
          {loading ? "Saving..." : "Save Product"}
        </button>
      </form>
    </div>
  );
};

export default AdminProductForm;
