import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import usePageTitle from "../../hooks/usePageTitle";
import FeedbackModal from "../../components/FeedbackModal";

const Orders = () => {
  usePageTitle("My Orders");

  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [feedbackModalItem, setFeedbackModalItem] = useState(null);

  const statusOptions = [
    {
      value: "pending",
      label: "Pending",
      color: "bg-yellow-100 text-yellow-800",
    },
    {
      value: "confirmed",
      label: "Confirmed",
      color: "bg-blue-100 text-blue-800",
    },
    {
      value: "in_transit",
      label: "In Transit",
      color: "bg-purple-100 text-purple-800",
    },
    {
      value: "out_for_delivery",
      label: "Out for Delivery",
      color: "bg-indigo-100 text-indigo-800",
    },
    {
      value: "delivered",
      label: "Delivered",
      color: "bg-green-100 text-green-800",
    },
    {
      value: "cancelled",
      label: "Cancelled",
      color: "bg-red-100 text-red-800",
    },
  ];

  const paymentMethods = [
    { value: "cash_on_delivery", label: "Cash on Delivery" },
    { value: "mobile_banking", label: "Mobile Banking" },
    { value: "bank_transfer", label: "Bank Transfer" },
    { value: "card", label: "Card Payment" },
  ];

  const fetchOrders = useCallback(async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");

      if (!token) {
        setError("Authentication required. Please log in.");
        navigate("/auth/login");
        return;
      }

      const response = await fetch(
        "http://127.0.0.1:8000/api/user-orders-with-items/",
        {
          headers: {
            Authorization: `Token ${token}`,
          },
        },
      );

      if (response.ok) {
        const data = await response.json();
        setOrders(data);
        setError(""); // Clear any previous errors
      } else if (response.status === 401) {
        // Token might be expired or invalid
        localStorage.removeItem("token");
        navigate("/auth/login");
      } else {
        const errorText = await response.text();
        console.error("API Error:", response.status, errorText);
        setError(`Failed to fetch orders (${response.status})`);
      }
    } catch (error) {
      setError("Failed to connect to server");
      console.error("Network Error:", error);
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  const fetchOrderDetails = async (orderId) => {
    // Since user orders now already include items, just find and set the selected order
    const order = orders.find((o) => o.id === orderId);
    if (order) {
      setSelectedOrder(order);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const handleFeedbackSubmitted = () => {
    fetchOrders();
    if (selectedOrder) {
      const updatedOrder = orders.find((o) => o.id === selectedOrder.id);
      if (updatedOrder) {
        setSelectedOrder(updatedOrder);
      }
    }
  };

  const StarDisplay = ({ rating }) => {
    return (
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <svg
            key={star}
            className={`w-5 h-5 ${
              star <= rating ? "text-yellow-400" : "text-gray-300"
            }`}
            fill="currentColor"
            viewBox="0 0 24 24"
          >
            <path d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
          </svg>
        ))}
      </div>
    );
  };

  const getStatusColor = (status) => {
    const option = statusOptions.find((opt) => opt.value === status);
    return option ? option.color : "bg-gray-100 text-gray-800";
  };

  const getPaymentMethodLabel = (method) => {
    const pm = paymentMethods.find((p) => p.value === method);
    return pm ? pm.label : method || "Cash on Delivery";
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-[#339059]"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-[#339059] mb-2">My Orders</h1>
        <p className="text-gray-600">View and track all your mango orders</p>
      </div>

      {orders.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-gray-500 mb-4">
            <svg
              className="w-16 h-16 mx-auto mb-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
              />
            </svg>
          </div>
          <h3 className="text-xl font-semibold text-gray-700 mb-2">
            No Orders Found
          </h3>
          <p className="text-gray-500">You haven't placed any orders yet.</p>
        </div>
      ) : (
        <div className="grid gap-6">
          {orders.map((order) => (
            <div
              key={order.id}
              className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden"
            >
              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800">
                      Order #{order.id}
                    </h3>
                    <p className="text-sm text-gray-600">
                      {formatDate(order.order_date)}
                    </p>
                  </div>
                  <div className="text-right">
                    <span
                      className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(
                        order.status,
                      )}`}
                    >
                      {statusOptions.find((opt) => opt.value === order.status)
                        ?.label ||
                        order.status.charAt(0).toUpperCase() +
                          order.status.slice(1)}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <div>
                    <p className="text-sm text-gray-600">Total Amount</p>
                    <p className="font-bold text-lg text-[#339059]">
                      ৳{order.total_amount}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Payment Method</p>
                    <p className="font-medium">
                      {getPaymentMethodLabel(order.payment_method)}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Items</p>
                    <p className="font-medium">
                      {order.items?.length || 0} item(s)
                    </p>
                  </div>
                </div>

                <div className="flex justify-between items-center pt-4 border-t border-gray-200">
                  <div className="text-sm text-gray-600">
                    {order.items && order.items.length > 0 && (
                      <span>
                        {order.items.slice(0, 2).map((item, index) => (
                          <span key={index}>
                            {item.mango_category} ({item.quantity}kg)
                            {index < Math.min(1, order.items.length - 1)
                              ? ", "
                              : ""}
                          </span>
                        ))}
                        {order.items.length > 2 &&
                          ` +${order.items.length - 2} more`}
                      </span>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => fetchOrderDetails(order.id)}
                      className="bg-[#339059] text-white px-4 py-2 rounded hover:bg-[#2E7D4F] transition-colors text-sm"
                    >
                      View Details
                    </button>
                  </div>
                </div>

                {/* Show existing feedback if available - removed from main list */}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Order Details Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-[#000000a0] backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-2xl font-bold text-[#339059]">
                  Order #{selectedOrder.id}
                </h3>
                <button
                  onClick={() => setSelectedOrder(null)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Order Information */}
                <div className="space-y-4">
                  <h4 className="text-lg font-semibold text-gray-800 border-b pb-2">
                    Order Information
                  </h4>
                  <div>
                    <p className="text-sm text-gray-600">Order Date</p>
                    <p className="font-medium">
                      {formatDate(selectedOrder.order_date)}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Order Status</p>
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                        selectedOrder.status,
                      )}`}
                    >
                      {statusOptions.find(
                        (opt) => opt.value === selectedOrder.status,
                      )?.label || selectedOrder.status}
                    </span>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Payment Method</p>
                    <p className="font-medium">
                      {getPaymentMethodLabel(selectedOrder.payment_method)}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Total Amount</p>
                    <p className="font-bold text-lg text-[#339059]">
                      ৳{selectedOrder.total_amount}
                    </p>
                  </div>
                </div>

                {/* Contact Information */}
                <div className="space-y-4">
                  <h4 className="text-lg font-semibold text-gray-800 border-b pb-2">
                    Contact Information
                  </h4>
                  <div>
                    <p className="text-sm text-gray-600">Phone Number</p>
                    <p className="font-medium">
                      {selectedOrder.phone_number || "Not provided"}
                    </p>
                  </div>
                  {selectedOrder.additional_phone && (
                    <div>
                      <p className="text-sm text-gray-600">Additional Phone</p>
                      <p className="font-medium">
                        {selectedOrder.additional_phone}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Addresses */}
              <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                {selectedOrder.billing_address && (
                  <div>
                    <h4 className="text-lg font-semibold text-gray-800 border-b pb-2 mb-2">
                      Billing Address
                    </h4>
                    <p className="text-sm whitespace-pre-line">
                      {selectedOrder.billing_address}
                    </p>
                  </div>
                )}
                {selectedOrder.shipping_address && (
                  <div>
                    <h4 className="text-lg font-semibold text-gray-800 border-b pb-2 mb-2">
                      Shipping Address
                    </h4>
                    <p className="text-sm whitespace-pre-line">
                      {selectedOrder.shipping_address}
                    </p>
                  </div>
                )}
              </div>

              {/* Order Items */}
              {selectedOrder.items && selectedOrder.items.length > 0 ? (
                <div className="mt-6">
                  <h4 className="text-lg font-semibold text-gray-800 border-b pb-2 mb-4 flex items-center gap-2">
                    <svg
                      className="w-5 h-5 text-[#339059]"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                      />
                    </svg>
                    Ordered Items ({selectedOrder.items.length})
                  </h4>
                  <div className="space-y-4">
                    {selectedOrder.items.map((item, index) => (
                      <div key={index}>
                        <div className="flex items-center gap-4 p-4 bg-gradient-to-r from-green-50 to-yellow-50 rounded-lg border border-green-200 hover:shadow-md transition-shadow">
                          <div className="flex-shrink-0">
                            <div className="w-16 h-16 bg-[#339059] text-white rounded-full flex items-center justify-center font-bold text-lg">
                              {index + 1}
                            </div>
                          </div>

                          {item.mango_image ? (
                            <img
                              src={`http://127.0.0.1:8000${item.mango_image}`}
                              alt={item.mango_category}
                              className="w-16 h-16 object-cover rounded-lg shadow-md"
                              onError={(e) => {
                                e.target.style.display = "none";
                              }}
                            />
                          ) : (
                            <div className="w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center">
                              <svg
                                className="w-8 h-8 text-gray-400"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                                />
                              </svg>
                            </div>
                          )}

                          <div className="flex-1">
                            <h5 className="text-lg font-bold text-gray-800 mb-1">
                              {item.mango_category ||
                                item.mango_name ||
                                "Mango"}
                            </h5>
                            {item.description && (
                              <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                                {item.description}
                              </p>
                            )}
                            <div className="flex items-center gap-4 text-sm">
                              <div className="flex items-center gap-1">
                                <svg
                                  className="w-4 h-4 text-[#339059]"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M20 7l-8-4-8 4m16 0l-8 4-8-4m16 0v10l-8 4-8-4V7"
                                  />
                                </svg>
                                <span className="font-medium text-gray-700">
                                  Quantity: {item.quantity} kg
                                </span>
                              </div>
                              <div className="flex items-center gap-1">
                                <svg
                                  className="w-4 h-4 text-[#339059]"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"
                                  />
                                </svg>
                                <span className="font-medium text-gray-700">
                                  ৳{item.price || 0} per kg
                                </span>
                              </div>
                            </div>
                          </div>

                          <div className="text-right">
                            <div className="text-xl font-bold text-[#339059] mb-1">
                              ৳
                              {item.subtotal ||
                                (item.quantity * (item.price || 0)).toFixed(2)}
                            </div>
                            <div className="text-xs text-gray-500">
                              Item Total
                            </div>
                          </div>
                        </div>

                        {/* Feedback section for each item */}
                        {selectedOrder.status.toLowerCase() === "delivered" && (
                          <div className="mt-2 ml-20">
                            {item.feedback ? (
                              <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                                <div className="flex items-center justify-between mb-2">
                                  <div className="flex items-center gap-2">
                                    <span className="text-sm font-semibold text-gray-700">
                                      Your Rating:
                                    </span>
                                    <StarDisplay
                                      rating={item.feedback.rating}
                                    />
                                  </div>
                                  <button
                                    onClick={() => setFeedbackModalItem(item)}
                                    className="text-xs bg-yellow-600 text-white px-2 py-1 rounded hover:bg-yellow-700 transition-colors"
                                  >
                                    Edit
                                  </button>
                                </div>
                                {item.feedback.comment && (
                                  <p className="text-xs text-gray-700 mt-1">
                                    {item.feedback.comment}
                                  </p>
                                )}
                              </div>
                            ) : (
                              <button
                                onClick={() => setFeedbackModalItem(item)}
                                className="w-full bg-blue-600 text-white px-3 py-2 rounded hover:bg-blue-700 transition-colors text-sm"
                              >
                                Rate this product
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                    ))}

                    {/* Order Summary */}
                    <div className="mt-6 p-4 bg-gradient-to-r from-[#339059] to-[#2d7a4f] text-white rounded-lg">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm opacity-90">Subtotal:</span>
                        <span className="font-medium">
                          ৳{(selectedOrder.total_amount * 0.9).toFixed(2)}
                        </span>
                      </div>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm opacity-90">Shipping:</span>
                        <span className="font-medium">
                          {selectedOrder.total_amount >= 1000
                            ? "Free"
                            : "৳50.00"}
                        </span>
                      </div>
                      <div className="border-t border-white/20 pt-2">
                        <div className="flex justify-between items-center">
                          <span className="text-lg font-semibold">
                            Total Amount:
                          </span>
                          <span className="text-2xl font-bold">
                            ৳{selectedOrder.total_amount}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="mt-6 p-8 bg-gray-50 rounded-lg text-center">
                  <svg
                    className="w-16 h-16 mx-auto mb-4 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2 2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
                    />
                  </svg>
                  <h5 className="text-lg font-semibold text-gray-600 mb-2">
                    No Items Found
                  </h5>
                  <p className="text-gray-500">
                    Order details are being processed...
                  </p>
                </div>
              )}

              <div className="mt-6 flex justify-end">
                <button
                  onClick={() => setSelectedOrder(null)}
                  className="bg-gray-500 text-white px-6 py-2 rounded hover:bg-gray-600 transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Feedback Modal */}
      {feedbackModalItem && (
        <FeedbackModal
          orderItem={feedbackModalItem}
          onClose={() => setFeedbackModalItem(null)}
          onFeedbackSubmitted={handleFeedbackSubmitted}
        />
      )}
    </div>
  );
};

export default Orders;
