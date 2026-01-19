import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import usePageTitle from "../../hooks/usePageTitle";

const OrdersAdmin = () => {
  usePageTitle("Manage Orders");

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [updating, setUpdating] = useState(false);

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

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        "http://127.0.0.1:8000/api/admin-orders-details/",
        {
          headers: { Authorization: `Token ${token}` },
        },
      );
      if (response.ok) {
        const data = await response.json();
        setOrders(data);
      } else {
        setError("Failed to load orders");
      }
    } catch (error) {
      setError("Failed to load orders");
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  const updateOrderStatus = async (orderId, newStatus) => {
    setUpdating(true);
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `http://127.0.0.1:8000/api/orders/${orderId}/`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Token ${token}`,
          },
          body: JSON.stringify({ status: newStatus }),
        },
      );

      if (response.ok) {
        toast.success("Order status updated successfully!");
        fetchOrders();
        if (selectedOrder && selectedOrder.id === orderId) {
          setSelectedOrder({ ...selectedOrder, status: newStatus });
        }
      } else {
        toast.error("Failed to update order status");
      }
    } catch (error) {
      toast.error(error.message || "Failed to update order status");
    } finally {
      setUpdating(false);
    }
  };

  const updatePaymentMethod = async (orderId, newPaymentMethod) => {
    setUpdating(true);
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `http://127.0.0.1:8000/api/orders/${orderId}/`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Token ${token}`,
          },
          body: JSON.stringify({ payment_method: newPaymentMethod }),
        },
      );

      if (response.ok) {
        toast.success("Payment method updated successfully!");
        fetchOrders();
        if (selectedOrder && selectedOrder.id === orderId) {
          setSelectedOrder({
            ...selectedOrder,
            payment_method: newPaymentMethod,
          });
        }
      } else {
        toast.error("Failed to update payment method");
      }
    } catch (error) {
      toast.error(error.message || "Failed to update payment method");
    } finally {
      setUpdating(false);
    }
  };

  const cancelOrder = async (orderId) => {
    if (window.confirm("Are you sure you want to cancel this order?")) {
      await updateOrderStatus(orderId, "cancelled");
    }
  };

  const fetchOrderDetails = async (order) => {
    // Since admin orders already include items, just set the selected order
    setSelectedOrder(order);
  };

  const getStatusColor = (status) => {
    const option = statusOptions.find((opt) => opt.value === status);
    return option ? option.color : "bg-gray-100 text-gray-800";
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (loading)
    return <div className="w-11/12 sm:w-10/12 mx-auto p-6">Loading...</div>;
  if (error)
    return (
      <div className="w-11/12 sm:w-10/12 mx-auto p-6 text-red-600">{error}</div>
    );

  return (
    <div className="mx-auto">
      <h2 className="text-3xl font-bold text-[#339059] mb-8 text-center">
        Customer Orders
      </h2>

      <div className="overflow-x-auto bg-white rounded-lg shadow-lg">
        <table className="min-w-full">
          <thead className="bg-[#339059] text-white">
            <tr>
              <th className="px-3 py-3 text-left">Order ID</th>
              <th className="px-3 py-3 text-left">Customer</th>
              <th className="px-3 py-3 text-left">Phone</th>
              <th className="px-3 py-3 text-left">Total</th>
              <th className="px-3 py-3 text-left">Date</th>
              <th className="px-3 py-3 text-left">Status</th>
              <th className="px-3 py-3 text-left">Feedback</th>
              <th className="px-3 py-3 text-left">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {orders.map((order) => (
              <tr key={order.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 font-medium">#{order.id}</td>
                <td className="px-4 py-3">{order.user_name || order.user}</td>
                <td className="px-4 py-3">{order.phone_number || "N/A"}</td>
                <td className="px-4 py-3 font-semibold text-[#339059]">
                  ৳{order.total_amount}
                </td>
                <td className="px-4 py-3">{formatDate(order.order_date)}</td>
                <td className="px-4 py-3">
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                      order.status,
                    )}`}
                  >
                    {statusOptions.find((opt) => opt.value === order.status)
                      ?.label ||
                      order.status.charAt(0).toUpperCase() +
                        order.status.slice(1)}
                  </span>
                </td>
                <td className="px-4 py-3">
                  {order.items && order.items.some((item) => item.feedback) ? (
                    <div
                      className="flex items-center gap-1"
                      title="Has product reviews"
                    >
                      <svg
                        className="w-5 h-5 text-yellow-400"
                        fill="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                      </svg>
                      <span className="text-sm font-semibold text-gray-700">
                        {order.items.filter((item) => item.feedback).length}
                      </span>
                    </div>
                  ) : order.status.toLowerCase() === "delivered" ? (
                    <span className="text-xs text-gray-400">No feedback</span>
                  ) : (
                    <span className="text-xs text-gray-300">-</span>
                  )}
                </td>
                <td className="px-4 py-3">
                  <div className="flex gap-2">
                    <button
                      onClick={() => fetchOrderDetails(order)}
                      className="bg-[#339059] text-white px-3 py-1 rounded hover:bg-[#2d7a4f] transition-colors text-sm"
                    >
                      View Details
                    </button>
                    {order.status !== "cancelled" &&
                      order.status !== "delivered" && (
                        <button
                          onClick={() => cancelOrder(order.id)}
                          className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700 transition-colors text-sm"
                          disabled={updating}
                        >
                          Cancel
                        </button>
                      )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Order Details Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-[#00000091] backdrop-blur-sm flex items-center justify-center p-4 z-50">
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
                {/* Customer Information */}
                <div className="space-y-4">
                  <h4 className="text-lg font-semibold text-gray-800 border-b pb-2 flex items-center gap-2">
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
                        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                      />
                    </svg>
                    Customer Information
                  </h4>
                  <div className="bg-gradient-to-r from-blue-50 to-green-50 p-4 rounded-lg border border-blue-200">
                    <div className="grid grid-cols-1 gap-3">
                      <div className="flex items-center gap-2">
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
                            d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                          />
                        </svg>
                        <div>
                          <p className="text-xs text-gray-600">Customer Name</p>
                          <p className="font-semibold text-gray-800">
                            {selectedOrder.user_name || "N/A"}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
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
                            d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                          />
                        </svg>
                        <div>
                          <p className="text-xs text-gray-600">Primary Phone</p>
                          <p className="font-medium text-gray-800">
                            {selectedOrder.phone_number || "Not provided"}
                          </p>
                        </div>
                      </div>

                      {selectedOrder.additional_phone && (
                        <div className="flex items-center gap-2">
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
                              d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z"
                            />
                          </svg>
                          <div>
                            <p className="text-xs text-gray-600">
                              Additional Phone
                            </p>
                            <p className="font-medium text-gray-800">
                              {selectedOrder.additional_phone}
                            </p>
                          </div>
                        </div>
                      )}

                      {selectedOrder.user_email && (
                        <div className="flex items-center gap-2">
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
                              d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                            />
                          </svg>
                          <div>
                            <p className="text-xs text-gray-600">
                              Email Address
                            </p>
                            <p className="font-medium text-gray-800">
                              {selectedOrder.user_email}
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Order Information */}
                <div className="space-y-4">
                  <h4 className="text-lg font-semibold text-gray-800 border-b pb-2">
                    Order Management
                  </h4>
                  <div>
                    <p className="text-sm text-gray-600">Order Date</p>
                    <p className="font-medium">
                      {formatDate(selectedOrder.order_date)}
                    </p>
                  </div>

                  {/* Status Management */}
                  <div>
                    <p className="text-sm text-gray-600 mb-2">Order Status</p>
                    <div className="flex items-center gap-2">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                          selectedOrder.status,
                        )}`}
                      >
                        {statusOptions.find(
                          (opt) => opt.value === selectedOrder.status,
                        )?.label || selectedOrder.status}
                      </span>
                      {selectedOrder.status !== "cancelled" &&
                        selectedOrder.status !== "delivered" && (
                          <select
                            value={selectedOrder.status}
                            onChange={(e) =>
                              updateOrderStatus(
                                selectedOrder.id,
                                e.target.value,
                              )
                            }
                            className="text-xs border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-[#339059]"
                            disabled={updating}
                          >
                            {statusOptions
                              .filter((opt) => opt.value !== "cancelled")
                              .map((option) => (
                                <option key={option.value} value={option.value}>
                                  {option.label}
                                </option>
                              ))}
                          </select>
                        )}
                    </div>
                  </div>

                  {/* Payment Management */}
                  <div>
                    <p className="text-sm text-gray-600 mb-2">Payment Method</p>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">
                        {paymentMethods.find(
                          (pm) => pm.value === selectedOrder.payment_method,
                        )?.label ||
                          selectedOrder.payment_method ||
                          "Cash on Delivery"}
                      </span>
                      {selectedOrder.status !== "cancelled" && (
                        <select
                          value={
                            selectedOrder.payment_method || "cash_on_delivery"
                          }
                          onChange={(e) =>
                            updatePaymentMethod(
                              selectedOrder.id,
                              e.target.value,
                            )
                          }
                          className="text-xs border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-[#339059]"
                          disabled={updating}
                        >
                          {paymentMethods.map((option) => (
                            <option key={option.value} value={option.value}>
                              {option.label}
                            </option>
                          ))}
                        </select>
                      )}
                    </div>
                  </div>

                  <div>
                    <p className="text-sm text-gray-600">Total Amount</p>
                    <p className="font-bold text-lg text-[#339059]">
                      ৳{selectedOrder.total_amount}
                    </p>
                  </div>
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

                        {/* Show feedback for this product if available */}
                        {item.feedback && (
                          <div className="mt-2 ml-20 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                            <div className="flex items-center gap-2 mb-2">
                              <span className="text-sm font-semibold text-gray-700">
                                Customer Rating:
                              </span>
                              <div className="flex items-center gap-1">
                                {[1, 2, 3, 4, 5].map((star) => (
                                  <svg
                                    key={star}
                                    className={`w-4 h-4 ${
                                      star <= item.feedback.rating
                                        ? "text-yellow-400"
                                        : "text-gray-300"
                                    }`}
                                    fill="currentColor"
                                    viewBox="0 0 24 24"
                                  >
                                    <path d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                                  </svg>
                                ))}
                              </div>
                              <span className="text-xs text-gray-600">
                                ({item.feedback.rating}/5)
                              </span>
                            </div>
                            {item.feedback.comment && (
                              <p className="text-xs text-gray-700 mt-1">
                                {item.feedback.comment}
                              </p>
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

              <div className="mt-6 flex justify-between">
                <div className="flex gap-2">
                  {selectedOrder.status !== "cancelled" &&
                    selectedOrder.status !== "delivered" && (
                      <button
                        onClick={() => cancelOrder(selectedOrder.id)}
                        className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition-colors flex items-center gap-2"
                        disabled={updating}
                      >
                        <svg
                          className="w-4 h-4"
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
                        Cancel Order
                      </button>
                    )}
                </div>
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
    </div>
  );
};

export default OrdersAdmin;
