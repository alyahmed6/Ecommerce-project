import { useState, useEffect } from "react";
import { supabase } from "../../supabaseClient/supabaseClient";
import toast from "react-hot-toast";
import { FaPlus, FaUpload } from "react-icons/fa";

const AdminProductForm = ({ categories = ["Mens", "Womens", "New Arrivals", "On Sale"], productId = null, onSaved = null }) => {
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [category, setCategory] = useState(categories[0]);
  const [imageFiles, setImageFiles] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);
  const [description, setDescription] = useState("");
  const [additionalInfo, setAdditionalInfo] = useState("");
  const [loading, setLoading] = useState(false);

  const uploadImages = async () => {
    if (!imageFiles || !imageFiles.length) return [];
    const urls = [];
    for (const file of imageFiles) {
      const fileExt = file.name.split(".").pop();
      const fileName = `product-${Date.now()}-${Math.floor(Math.random() * 10000)}.${fileExt}`;
      const { error } = await supabase.storage.from("product-images").upload(fileName, file);
      if (error) throw error;
      const { data } = supabase.storage.from("product-images").getPublicUrl(fileName);
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
    setLoading(true);
    try {
      const uploaded = await uploadImages();
      const imageUrl = uploaded && uploaded.length ? uploaded[0] : null;
      const imagesField = uploaded.length ? JSON.stringify(uploaded) : null;

      const slugBase = name
        .toString()
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "");
      const slug = `${slugBase}-${Date.now().toString().slice(-5)}`;

      const payload = {
        name,
        price: Number(price),
        category,
        image_url: imageUrl,
        images: imagesField,
        description,
        additional_info: additionalInfo,
        slug,
       
      };

      try {
        const maybeGet = supabase.auth.getUser ? await supabase.auth.getUser() : null;
        const maybeUser = maybeGet?.data?.user ?? (supabase.auth.user ? supabase.auth.user() : null);
        const userId = maybeUser?.id ?? null;
        if (userId) payload.user_id = userId;
      } catch (e) {
        console.warn("Could not resolve current user id", e);
      }

      let error = null;
      if (productId) {
      
        const { error: upErr } = await supabase.from("products").update(payload, { returning: "minimal" }).eq("id", productId);
        error = upErr;
      } else {
       
        const { error: insErr } = await supabase.from("products").insert([payload], { returning: "minimal" });
        error = insErr;
      }
      if (error) throw error;
      toast.success(productId ? "Product updated!" : "Product uploaded!");

      if (!productId) {
        setName("");
        setPrice("");
        setCategory(categories[0]);
        setImageFiles([]);
        setImagePreviews([]);
        setDescription("");
        setAdditionalInfo("");
        setVariants("");
        setSku("");
        setStock(0);
        setOriginalPrice("");
      } else if (onSaved) {
        onSaved();
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to upload product");
    }
    setLoading(false);
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    setImageFiles(files);
    setImagePreviews(files.map((f) => URL.createObjectURL(f)));
  };

  useEffect(() => {
    if (!productId) return;
    let mounted = true;
    const load = async () => {
      try {
        const { data, error } = await supabase.from("products").select("*").eq("id", productId).single();
        if (error) throw error;
        if (!mounted) return;
        const p = data;
        setName(p.name || "");
        setPrice(p.price || "");
        setCategory(p.category || categories[0]);
        setDescription(p.description || "");
        setAdditionalInfo(p.additional_info || "");
        

        setImagePreviews(
          p.images
            ? Array.isArray(p.images)
              ? p.images
              : (() => {
                  try {
                    return JSON.parse(p.images);
                  } catch {
                    return [];
                  }
                })()
            : p.image_url
            ? [p.image_url]
            : []
        );
        setImageFiles([]);
        setVariants(
          p.variants
            ? typeof p.variants === "string"
              ? (() => {
                  try {
                    const v = JSON.parse(p.variants);
                    return Array.isArray(v) ? v.join(",") : p.variants;
                  } catch {
                    return p.variants;
                  }
                })()
              : Array.isArray(p.variants)
              ? p.variants.join(",")
              : p.variants
            : ""
        );
      } catch (e) {
        console.error(e);
      }
    };
    load();
    return () => {
      mounted = false;
    };
  }, [productId]);

  return (
    <div className=" mt-[88px] bg-white shadow-lg rounded-2xl p-8 w-full max-w-xl mx-auto">
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


        <textarea
          className="w-full px-4 py-3 rounded-xl bg-gray-50 focus:ring-2 focus:ring-blue-400 outline-none"
          placeholder="Short Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={3}
        />

        <textarea
          className="w-full px-4 py-3 rounded-xl bg-gray-50 focus:ring-2 focus:ring-blue-400 outline-none"
          placeholder="Additional Information (details, specs)"
          value={additionalInfo}
          onChange={(e) => setAdditionalInfo(e.target.value)}
          rows={3}
        />


        <label className="flex flex-col items-center justify-center w-full h-40 border-2 border-dashed border-gray-300 rounded-xl cursor-pointer hover:border-blue-400 transition-colors bg-gray-50">
          {imagePreviews && imagePreviews.length ? (
            <div className="w-full h-full grid grid-cols-3 gap-1 p-1">
              {imagePreviews.map((p, i) => (
                <img key={i} src={p} alt={`preview-${i}`} className="w-full h-full object-cover rounded" />
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center text-gray-400">
              <FaUpload size={30} className="mb-2" />
              <span>Click or drag images to upload (multiple allowed)</span>
            </div>
          )}
          <input type="file" accept="image/*" className="hidden" multiple onChange={handleImageChange} />
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