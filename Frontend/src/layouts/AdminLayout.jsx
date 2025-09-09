import { useEffect, useState } from "react";
import { useNavigate, useLocation, NavLink, Outlet } from "react-router-dom";
import { toast } from "react-toastify";
import LogoutConfirmationModal from "../components/LogoutConfirmationModal";

const tabs = [
  { label: "Mango Category", path: "/admin/mango-category" },
  { label: "Orders", path: "/admin/orders" },
];

const AdminLayout = () => {
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    setShowLogoutModal(true);
  };

  const confirmLogout = () => {
    localStorage.removeItem("token");
    setShowLogoutModal(false);
    toast.success("Logged out successfully!");
    navigate("/auth/login");
  };

  const cancelLogout = () => {
    setShowLogoutModal(false);
  };

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/auth/login");
      return;
    }
    fetch("http://127.0.0.1:8000/api/profile/", {
      headers: { Authorization: `Token ${token}` },
    })
      .then((res) => res.json())
      .then((data) => {
        if (data && (data.is_staff || data.is_superuser)) {
          setIsAdmin(true);
        } else {
          navigate("/auth/login");
        }
      })
      .catch(() => navigate("/auth/login"))
      .finally(() => setLoading(false));
  }, [navigate]);

  if (loading) return <div className="text-center mt-10">Loading...</div>;
  if (!isAdmin) return null;

  return (
    <div className="min-h-screen bg-gray-100">
      <div className=" shadow">
        <div className="w-11/12 sm:10/12 mx-auto p-4 flex justify-between items-center">
          <div className="flex gap-4">
            {tabs.map((tab) => (
              <NavLink
                key={tab.path}
                to={tab.path}
                className={({ isActive }) =>
                  isActive || location.pathname === tab.path
                    ? "text-[#339059] font-bold border-b-2 border-[#339059] pb-1"
                    : "text-gray-600 hover:text-[#339059]"
                }
              >
                {tab.label}
              </NavLink>
            ))}
          </div>
          <button
            onClick={handleLogout}
            className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-colors flex items-center gap-2"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
              />
            </svg>
            Logout
          </button>
        </div>
      </div>
      <div className="p-6 w-11/12 sm:w-10/12 mx-auto">
        <Outlet />
      </div>

      {/* Logout Confirmation Modal */}
      <LogoutConfirmationModal
        isOpen={showLogoutModal}
        onConfirm={confirmLogout}
        onCancel={cancelLogout}
      />
    </div>
  );
};

export default AdminLayout;
