import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import AdminProductForm from "./AdminProductForm";

const AdminEditProduct = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  return (
    <div className="mt-[88px]">
      <div className="max-w-3xl mx-auto">
        <h2 className="text-2xl font-semibold mb-4">Edit Product</h2>
        <AdminProductForm productId={id} onSaved={() => navigate('/admin/dashboard')} />
      </div>
    </div>
  );
};

export default AdminEditProduct;
