import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { supabase } from "../../supabaseClient/supabaseClient";
import { createProduct, updateProduct } from "../../Store/ProductSlice";
import toast from "react-hot-toast";
import { FaPlus, FaUpload, FaTrash } from "react-icons/fa";

const categories = ["Mens", "Womens", "New Arrivals", "On Sale"];

const AdminProductForm = ({ productId = null, onSaved }) => {
  const dispatch = useDispatch();
  const { loading } = useSelector((state) => state.products);

  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [stock, setStock] = useState("");
  const [category, setCategory] = useState(categories[0]);
  const [description, setDescription] = useState([""]);
  const [additionalInfo, setAdditionalInfo] = useState([{ label: "", value: "" }]);
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

      const formattedAdditionalInfo = additionalInfo
        .filter(item => item.label.trim() && item.value.trim())
        .map(item => `${item.label}: ${item.value}`)
        .join('\n');

      const formattedDescription = description
        .filter(para => para.trim())
        .join('\n\n');

      const payload = {
        name,
        price: Number(price),
        stock: Number(stock),
        category,
        description: formattedDescription,
        additional_info: formattedAdditionalInfo || null,
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
        setDescription([""]);
        setAdditionalInfo([{ label: "", value: "" }]);
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

  const addInfoField = () => {
    setAdditionalInfo([...additionalInfo, { label: "", value: "" }]);
  };

  const removeInfoField = (index) => {
    setAdditionalInfo(additionalInfo.filter((_, i) => i !== index));
  };

  const updateInfoField = (index, field, value) => {
    const updated = [...additionalInfo];
    updated[index][field] = value;
    setAdditionalInfo(updated);
  };

  const addDescriptionField = () => {
    setDescription([...description, ""]);
  };

  const removeDescriptionField = (index) => {
    setDescription(description.filter((_, i) => i !== index));
  };

  const updateDescriptionField = (index, value) => {
    const updated = [...description];
    updated[index] = value;
    setDescription(updated);
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

        if (data.description) {
          const parsed = data.description.split(/\n\n|\r\n\r\n/).filter(para => para.trim());
          setDescription(parsed.length > 0 ? parsed : [""]);
        }

        if (data.additional_info) {
          const parsed = data.additional_info.split('\n').map(line => {
            const colonIndex = line.indexOf(':');
            if (colonIndex !== -1) {
              return {
                label: line.substring(0, colonIndex).trim(),
                value: line.substring(colonIndex + 1).trim()
              };
            }
            return { label: "", value: line };
          }).filter(item => item.label || item.value);
          
          setAdditionalInfo(parsed.length > 0 ? parsed : [{ label: "", value: "" }]);
        }

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
    <div className="mt-[88px] max-w-3xl mx-auto bg-white p-8 rounded-2xl shadow-lg">
      <h2 className="text-3xl font-bold mb-8 flex items-center gap-3 text-gray-900">
        <FaPlus />
        {productId ? "Edit Product" : "Add Product"}
      </h2>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid md:grid-cols-2 gap-5">
          <input
            className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
            placeholder="Product name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />

          <input
            type="number"
            className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
            placeholder="Price"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
          />
        </div>

        <div className="grid md:grid-cols-2 gap-5">
          <input
            type="number"
            className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
            placeholder="Stock"
            value={stock}
            onChange={(e) => setStock(e.target.value)}
          />

          <select
            className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          >
            {categories.map((c) => (
              <option key={c}>{c}</option>
            ))}
          </select>
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-sm font-bold text-gray-700 uppercase tracking-wider">
              Description
            </label>
            <button
              type="button"
              onClick={addDescriptionField}
              className="flex items-center gap-2 px-4 py-2 bg-gray-900 text-white rounded-lg text-sm font-semibold hover:bg-gray-800 transition"
            >
              <FaPlus /> Add Paragraph
            </button>
          </div>

          <div className="space-y-3 bg-gray-50 p-4 rounded-xl border border-gray-200">
            {description.map((para, index) => (
              <div key={index} className="flex gap-3 items-start">
                <textarea
                  className="flex-1 px-4 py-3 rounded-lg bg-white border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                  placeholder={`Paragraph ${index + 1}`}
                  rows={3}
                  value={para}
                  onChange={(e) => updateDescriptionField(index, e.target.value)}
                />
                {description.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeDescriptionField(index)}
                    className="p-3 bg-red-500 text-white rounded-lg hover:bg-red-600 transition"
                  >
                    <FaTrash />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-sm font-bold text-gray-700 uppercase tracking-wider">
              Additional Information
            </label>
            <button
              type="button"
              onClick={addInfoField}
              className="flex items-center gap-2 px-4 py-2 bg-gray-900 text-white rounded-lg text-sm font-semibold hover:bg-gray-800 transition"
            >
              <FaPlus /> Add Field
            </button>
          </div>

          <div className="space-y-3 bg-gray-50 p-4 rounded-xl border border-gray-200">
            {additionalInfo.map((item, index) => (
              <div key={index} className="flex gap-3 items-start">
                <input
                  className="flex-1 px-4 py-3 rounded-lg bg-white border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                  placeholder="Label (e.g., Material)"
                  value={item.label}
                  onChange={(e) => updateInfoField(index, "label", e.target.value)}
                />
                <input
                  className="flex-1 px-4 py-3 rounded-lg bg-white border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                  placeholder="Value (e.g., Premium Cotton)"
                  value={item.value}
                  onChange={(e) => updateInfoField(index, "value", e.target.value)}
                />
                {additionalInfo.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeInfoField(index)}
                    className="p-3 bg-red-500 text-white rounded-lg hover:bg-red-600 transition"
                  >
                    <FaTrash />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        <label className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed border-gray-300 rounded-xl cursor-pointer hover:border-blue-500 transition-colors bg-gray-50">
          {imagePreviews.length ? (
            <div className="grid grid-cols-4 gap-3 w-full h-full p-4">
              {imagePreviews.map((img, i) => (
                <img key={i} src={img} className="object-cover rounded-lg w-full h-full" />
              ))}
            </div>
          ) : (
            <div className="text-gray-400 flex flex-col items-center gap-2">
              <FaUpload size={32} />
              <span className="font-semibold">Upload Product Images</span>
              <span className="text-sm">Click to browse files</span>
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
          className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white py-4 rounded-xl font-bold text-lg hover:from-blue-700 hover:to-blue-800 disabled:opacity-60 transition-all shadow-lg"
        >
          {loading ? "Saving..." : productId ? "Update Product" : "Create Product"}
        </button>
      </form>
    </div>
  );
};

export default AdminProductForm;