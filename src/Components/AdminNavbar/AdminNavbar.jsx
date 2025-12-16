import { FaSignOutAlt } from "react-icons/fa";

const AdminNavbar = () => {
  return (
    <header className="fixed top-0 left-0 right-0 bg-white shadow z-50 h-16">
      <div className="max-w-7xl mx-auto px-6 h-full flex justify-between items-center">
        <h1 className="text-xl font-bold">Admin Panel</h1>
        <div className="flex items-center gap-4">
          <button className="text-red-600 flex items-center gap-1">
            <FaSignOutAlt /> Logout
          </button>
        </div>
      </div>
    </header>
  );
};

export default AdminNavbar;
