import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import usePageTitle from "../../hooks/usePageTitle";

const Checkout = () => {
  usePageTitle("Checkout");

  const navigate = useNavigate();
  const [cartItems, setCartItems] = useState([]);
  const [profile, setProfile] = useState({});
  const [orderData, setOrderData] = useState({
    phone_number: "",
    additional_phone: "",
    billing_address: "",
    shipping_address: "",
    payment_method: "cash_on_delivery",
  });
  const [loading, setLoading] = useState(true);
  const [placing, setPlacing] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/auth/login");
      return;
    }
    fetchData();
  }, [navigate]);

  const fetchData = async () => {
    try {
      const token = localStorage.getItem("token");

      // Fetch cart items
      const cartResponse = await fetch("http://127.0.0.1:8000/api/cart/", {
        headers: { Authorization: `Token ${token}` },
      });
      const cartData = await cartResponse.json();
      setCartItems(cartData);

      // Fetch profile data
      const profileResponse = await fetch(
        "http://127.0.0.1:8000/api/profile/",
        {
          headers: { Authorization: `Token ${token}` },
        }
      );
      const profileData = await profileResponse.json();

      if (profileData.profile) {
        setProfile(profileData.profile);
        setOrderData((prev) => ({
          ...prev,
          phone_number: profileData.profile.phone_number || "",
          additional_phone: profileData.profile.additional_phone || "",
          billing_address: profileData.profile.billing_address || "",
          shipping_address: profileData.profile.shipping_address || "",
        }));
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      toast.error("Failed to load checkout data");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setOrderData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const getTotalPrice = () => {
    return cartItems
      .reduce(
        (total, item) => total + item.mango_category.price * item.quantity,
        0
      )
      .toFixed(2);
  };

  const getShippingCost = () => {
    const total = parseFloat(getTotalPrice());
    return total >= 1000 ? 0 : 50; // Free shipping for orders over ৳1000
  };

  const getFinalTotal = () => {
    return (parseFloat(getTotalPrice()) + getShippingCost()).toFixed(2);
  };

  const handlePlaceOrder = async (e) => {
    e.preventDefault();

    if (
      !orderData.phone_number ||
      !orderData.billing_address ||
      !orderData.shipping_address
    ) {
      toast.error("Please fill in all required fields");
      return;
    }

    setPlacing(true);

    try {
      const token = localStorage.getItem("token");
      const response = await fetch("http://127.0.0.1:8000/api/create-order/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Token ${token}`,
        },
        body: JSON.stringify(orderData),
      });

      if (response.ok) {
        toast.success("Order placed successfully!");
        navigate("/dashboard/orders");
      } else {
        const errorData = await response.json();
        toast.error(errorData.error || "Failed to place order");
      }
    } catch (error) {
      console.error("Error placing order:", error);
      toast.error("Failed to connect to server");
    } finally {
      setPlacing(false);
    }
  };

  if (loading) {
    return (
      <div className="w-11/12 sm:w-10/12 mx-auto p-6">
        <div className="text-center">Loading checkout...</div>
      </div>
    );
  }

  if (cartItems.length === 0) {
    return (
      <div className="w-11/12 sm:w-10/12 mx-auto p-6">
        <div className="text-center py-12">
          <h2 className="text-xl text-gray-600 mb-4">Your cart is empty</h2>
          <button
            onClick={() => navigate("/mango-category")}
            className="bg-[#339059] text-white px-6 py-3 rounded-lg hover:bg-[#2E7D4F] transition-colors"
          >
            Continue Shopping
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-yellow-50 to-orange-50">
      {/* Header Section */}
      <div className="bg-gradient-to-r from-[#339059] to-[#2d7a4f] text-white py-12">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Complete Your Order
            </h1>
            <p className="text-xl text-green-100">
              Review your order details and complete your purchase
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-12">
        {/* User Information Header */}
        {profile && profile.user && (
          <div className="bg-white p-6 rounded-2xl shadow-lg mb-8">
            <div className="flex items-center gap-4">
              <div className="bg-[#339059] text-white rounded-full p-3">
                <svg
                  className="w-8 h-8"
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
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-800">
                  Welcome, {profile.user.first_name} {profile.user.last_name}
                </h2>
                <p className="text-gray-600">{profile.user.email}</p>
              </div>
            </div>
          </div>
        )}

        {/* Order Summary Section */}
        <div className="bg-white p-6 rounded-2xl shadow-lg mb-8">
          <h2 className="text-2xl font-semibold text-[#339059] mb-6 flex items-center gap-2">
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
                d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
              />
            </svg>
            Order Summary
          </h2>

          <div className="space-y-4">
            {cartItems.map((item, index) => (
              <div
                key={item.id}
                className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg"
              >
                <div className="text-2xl font-bold text-[#339059] bg-white rounded-full w-10 h-10 flex items-center justify-center">
                  {index + 1}
                </div>
                <img
                  src={`http://127.0.0.1:8000${item.mango_category.image}`}
                  alt={item.mango_category.name}
                  className="w-16 h-16 object-cover rounded-lg shadow-md"
                />
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-800">
                    {item.mango_category.name}
                  </h3>
                  <p className="text-gray-600 text-sm">
                    {item.mango_category.description.slice(0, 80)}...
                  </p>
                  <div className="flex items-center gap-4 mt-2">
                    <span className="bg-[#339059] text-white px-3 py-1 rounded-full text-sm font-medium">
                      Quantity: {item.quantity} kg
                    </span>
                    <span className="text-lg font-bold text-[#339059]">
                      ৳{item.mango_category.price} per kg
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-xl font-bold text-gray-800">
                    ৳{(item.mango_category.price * item.quantity).toFixed(2)}
                  </div>
                  <div className="text-sm text-gray-500">Total</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Order Form */}
          <div className="bg-white p-6 rounded-2xl shadow-lg">
            <h2 className="text-2xl font-semibold text-[#339059] mb-6 flex items-center gap-2">
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
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
              Order Information
            </h2>

            <form onSubmit={handlePlaceOrder} className="space-y-6">
              {/* Contact Information */}
              <div>
                <h3 className="text-lg font-semibold mb-4 text-gray-700">
                  Contact Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-gray-700 font-medium mb-2">
                      Phone Number *
                    </label>
                    <input
                      type="tel"
                      name="phone_number"
                      value={orderData.phone_number}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#339059]"
                      placeholder="+880 1234567890"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-700 font-medium mb-2">
                      Additional Phone
                    </label>
                    <input
                      type="tel"
                      name="additional_phone"
                      value={orderData.additional_phone}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#339059]"
                      placeholder="+880 1234567890"
                    />
                  </div>
                </div>
              </div>

              {/* Addresses */}
              <div>
                <h3 className="text-lg font-semibold mb-4 text-gray-700">
                  Address Information
                </h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-gray-700 font-medium mb-2">
                      Billing Address *
                    </label>
                    <textarea
                      name="billing_address"
                      value={orderData.billing_address}
                      onChange={handleInputChange}
                      required
                      rows="3"
                      className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#339059]"
                      placeholder="Enter your billing address..."
                    />
                  </div>
                  <div>
                    <label className="block text-gray-700 font-medium mb-2">
                      Shipping Address *
                    </label>
                    <textarea
                      name="shipping_address"
                      value={orderData.shipping_address}
                      onChange={handleInputChange}
                      required
                      rows="3"
                      className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#339059]"
                      placeholder="Enter your shipping address..."
                    />
                  </div>
                </div>
              </div>

              {/* Payment Method */}
              <div>
                <h3 className="text-lg font-semibold mb-4 text-gray-700">
                  Payment Method
                </h3>
                <div className="space-y-2">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="payment_method"
                      value="cash_on_delivery"
                      checked={orderData.payment_method === "cash_on_delivery"}
                      onChange={handleInputChange}
                      className="mr-2"
                    />
                    Cash on Delivery
                  </label>
                  <label className="flex items-center opacity-50">
                    <input
                      type="radio"
                      name="payment_method"
                      value="ssl_commerz"
                      disabled
                      className="mr-2"
                    />
                    SSL Commerz (Coming Soon)
                  </label>
                </div>
              </div>

              <button
                type="submit"
                disabled={placing}
                className="w-full bg-[#339059] text-white py-3 rounded-lg hover:bg-[#287346] transition-colors font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {placing ? "Placing Order..." : "Place Order"}
              </button>
            </form>
          </div>

          {/* Order Summary */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-2xl font-semibold text-[#339059] mb-6">
              Order Summary
            </h2>

            <div className="space-y-4">
              {cartItems.map((item) => (
                <div
                  key={item.id}
                  className="flex justify-between items-center py-2 border-b"
                >
                  <div className="flex items-center space-x-3">
                    <img
                      src={`http://127.0.0.1:8000${item.mango_category.image}`}
                      alt={item.mango_category.name}
                      className="w-12 h-12 object-cover rounded"
                    />
                    <div>
                      <h4 className="font-medium">
                        {item.mango_category.name}
                      </h4>
                      <p className="text-sm text-gray-600">
                        Qty: {item.quantity}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">
                      ৳{(item.mango_category.price * item.quantity).toFixed(2)}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 pt-4 border-t space-y-3">
              <div className="flex justify-between text-lg">
                <span>Subtotal:</span>
                <span>৳{getTotalPrice()}</span>
              </div>
              <div className="flex justify-between text-lg">
                <span>Shipping:</span>
                <span>
                  {getShippingCost() === 0 ? (
                    <span className="text-green-600 font-medium">Free</span>
                  ) : (
                    `৳${getShippingCost().toFixed(2)}`
                  )}
                </span>
              </div>
              {getShippingCost() === 0 && (
                <p className="text-sm text-green-600 text-right">
                  🎉 Free shipping on orders over ৳1000!
                </p>
              )}
              <div className="border-t pt-3">
                <div className="flex justify-between text-xl font-bold text-[#339059]">
                  <span>Total:</span>
                  <span>৳{getFinalTotal()}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
