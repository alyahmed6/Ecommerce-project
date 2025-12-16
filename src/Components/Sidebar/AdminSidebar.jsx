import { FaChartBar, FaPlus, FaUserCog } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

const AdminSidebar = () => {
  const navigate = useNavigate();

  return (
    <aside className="w-full md:w-64 bg-white shadow-lg p-6 mt-16 md:mt-0">
      <h2 className="text-2xl font-bold mb-6">Menu</h2>
      <nav className="flex flex-col gap-4">
        {/* Dashboard */}
        <button
          onClick={() => navigate("/admin/dashboard")}
          className="flex items-center gap-2 w-full text-left px-4 py-2 rounded-lg hover:bg-gray-100"
        >
          <FaChartBar /> Dashboard
        </button>

        {/* Add Product */}
        <button
          onClick={() => navigate("/Admin/add-product")}
          className="flex items-center gap-2 w-full text-left px-4 py-2 rounded-lg hover:bg-gray-100"
        >
          <FaPlus /> Add Product
        </button>

        {/* Profile */}
        <button
          onClick={() => navigate("/Admin/profile")}
          className="flex items-center gap-2 w-full text-left px-4 py-2 rounded-lg hover:bg-gray-100"
        >
          <FaUserCog /> Profile
        </button>
      </nav>
    </aside>
  );
};

export default AdminSidebar;
