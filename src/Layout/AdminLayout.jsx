import { Outlet } from "react-router-dom";
import AdminNavbar from "../Components/AdminNavbar/AdminNavbar";
import AdminSidebar from "../Components/Sidebar/AdminSidebar";

const AdminLayout = () => {
  return (
    <div className="flex bg-gray-100">
      {/* Sidebar */}
      <AdminSidebar />

      <div className="flex-1 flex flex-col">
        {/* Navbar */}
        <AdminNavbar />

        {/* Main content */}
        <main className="flex-1 h-screen p-4 md:p-8 mt-16 md:mt-0">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
