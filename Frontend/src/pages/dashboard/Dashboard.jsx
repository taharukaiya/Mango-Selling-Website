import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Cart from "./Cart";
import Orders from "./Orders";
import usePageTitle from "../../hooks/usePageTitle";

function Dashboard() {
  usePageTitle("Dashboard");

  const location = useLocation();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState(() => {
    if (location.pathname.includes("orders")) return "orders";
    return "cart";
  });

  // Update activeTab when location changes
  useEffect(() => {
    if (location.pathname.includes("orders")) {
      setActiveTab("orders");
    } else if (location.pathname.includes("cart")) {
      setActiveTab("cart");
    }
  }, [location.pathname]);

  const handleTabClick = (tab) => {
    setActiveTab(tab);
    if (tab === "orders") {
      navigate("/dashboard/orders");
    } else {
      navigate("/dashboard/cart");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-yellow-50 to-orange-50">
      {/* Header Section */}
      <div className="bg-gradient-to-r from-[#339059] to-[#2d7a4f] text-white py-12">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Welcome to Your Dashboard
            </h1>
            <p className="text-xl text-green-100 mb-8">
              Manage your cart, track orders, and enjoy premium mangoes
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-12">
        {/* Tab Navigation */}
        <div className="bg-white rounded-2xl shadow-xl p-2 mb-8 max-w-md mx-auto">
          <div className="flex">
            <button
              onClick={() => handleTabClick("cart")}
              className={`flex-1 flex items-center justify-center gap-2 py-4 px-6 font-semibold text-sm rounded-xl transition-all duration-300 ${
                activeTab === "cart"
                  ? "bg-[#339059] text-white shadow-lg transform scale-105"
                  : "text-gray-600 hover:text-gray-800 hover:bg-gray-50"
              }`}
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
                  d="M3 3h2l.4 2M7 13h10l4-8H5.4m1.6 8L6 5H3m4 8a2 2 0 100 4 2 2 0 000-4zm10 0a2 2 0 100 4 2 2 0 000-4z"
                />
              </svg>
              Cart
            </button>

            <button
              onClick={() => handleTabClick("orders")}
              className={`flex-1 flex items-center justify-center gap-2 py-4 px-6 font-semibold text-sm rounded-xl transition-all duration-300 ${
                activeTab === "orders"
                  ? "bg-[#339059] text-white shadow-lg transform scale-105"
                  : "text-gray-600 hover:text-gray-800 hover:bg-gray-50"
              }`}
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
                  d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
                />
              </svg>
              Orders
            </button>
          </div>
        </div>

        {/* Tab Content */}
        <div className="mt-6">
          {activeTab === "cart" && <Cart />}
          {activeTab === "orders" && <Orders />}
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
