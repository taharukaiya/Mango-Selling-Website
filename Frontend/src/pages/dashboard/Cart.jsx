import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import usePageTitle from "../../hooks/usePageTitle";

const Cart = () => {
  usePageTitle("Shopping Cart");

  const navigate = useNavigate();
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/auth/login");
      return;
    }
    fetchCartItems();
  }, [navigate]);

  const fetchCartItems = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch("http://127.0.0.1:8000/api/cart/", {
        headers: {
          Authorization: `Token ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setCartItems(data);
      } else {
        setError("Failed to fetch cart items");
      }
    } catch (error) {
      console.error("Error fetching cart items:", error);
      setError("Failed to connect to server");
    } finally {
      setLoading(false);
    }
  };

  const updateQuantity = async (cartItemId, newQuantity, stockQuantity) => {
    if (newQuantity < 1) {
      toast.error("Quantity cannot be less than 1");
      return;
    }

    if (newQuantity > stockQuantity) {
      toast.error(`Cannot exceed available stock (${stockQuantity} kg)`);
      return;
    }

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `http://127.0.0.1:8000/api/cart-items/${cartItemId}/`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Token ${token}`,
          },
          body: JSON.stringify({ quantity: newQuantity }),
        }
      );

      if (response.ok) {
        fetchCartItems(); // Refresh cart items
        toast.success("Quantity updated successfully");
      } else {
        setError("Failed to update quantity");
        toast.error("Failed to update quantity");
      }
    } catch (error) {
      console.error("Error updating quantity:", error);
      setError("Failed to connect to server");
      toast.error("Failed to connect to server");
    }
  };

  const removeItem = async (cartItemId) => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `http://127.0.0.1:8000/api/cart-items/${cartItemId}/`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Token ${token}`,
          },
        }
      );

      if (response.ok) {
        fetchCartItems(); // Refresh cart items
        toast.success("Item removed from cart");
      } else {
        setError("Failed to remove item");
        toast.error("Failed to remove item");
      }
    } catch (error) {
      console.error("Error removing item:", error);
      setError("Failed to connect to server");
      toast.error("Failed to connect to server");
    }
  };

  const getTotalPrice = () => {
    return cartItems
      .reduce(
        (total, item) => total + item.mango_category.price * item.quantity,
        0
      )
      .toFixed(2);
  };

  const handleProceedToCheckout = () => {
    if (cartItems.length === 0) {
      toast.error("Your cart is empty!");
      return;
    }

    // Navigate to standalone checkout page
    toast.success("Proceeding to checkout...");
    navigate("/checkout");
  };

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto p-6">
        <div className="text-center">Loading cart items...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-6xl mx-auto p-6">
        <div className="text-center text-red-500">{error}</div>
        <div className="text-center mt-4">
          <button
            onClick={() => window.location.reload()}
            className="bg-[#FF5722] text-white px-4 py-2 rounded hover:bg-[#E64A19]"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-11/12 sm:w-10/12 mx-auto p-6">
      <h1 className="text-3xl font-bold text-[#339059] mb-8 text-center">
        Your Cart
      </h1>

      {cartItems.length === 0 ? (
        <div className="text-center py-12">
          <h2 className="text-xl text-gray-600 mb-4">Your cart is empty</h2>
          <button
            onClick={() => navigate("/mango-category")}
            className="bg-[#339059] text-white px-6 py-3 rounded-lg hover:bg-[#2E7D4F] transition-colors"
          >
            Continue Shopping
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {cartItems.map((item) => (
            <div
              key={item.id}
              className="bg-white rounded-lg shadow-md p-6 flex items-center space-x-6"
            >
              <img
                src={`http://127.0.0.1:8000${item.mango_category.image}`}
                alt={item.mango_category.name}
                className="w-24 h-24 object-cover rounded-lg"
              />

              <div className="flex-1">
                <h3 className="text-xl font-semibold text-[#339059]">
                  {item.mango_category.name}
                </h3>
                <p className="text-gray-600 mt-1">
                  {item.mango_category.description}
                </p>
                <p className="text-lg font-semibold text-[#FF5722] mt-2">
                  ৳{item.mango_category.price} per kg
                </p>
                <p className="text-sm text-gray-500 mt-1">
                  Stock: {item.mango_category.stock_quantity} kg available
                </p>
              </div>

              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() =>
                      updateQuantity(
                        item.id,
                        item.quantity - 1,
                        item.mango_category.stock_quantity
                      )
                    }
                    className="bg-gray-200 text-gray-700 w-8 h-8 rounded-full flex items-center justify-center hover:bg-gray-300"
                  >
                    -
                  </button>
                  <span className="text-lg font-semibold w-12 text-center">
                    {item.quantity}
                  </span>
                  <button
                    onClick={() =>
                      updateQuantity(
                        item.id,
                        item.quantity + 1,
                        item.mango_category.stock_quantity
                      )
                    }
                    className="bg-gray-200 text-gray-700 w-8 h-8 rounded-full flex items-center justify-center hover:bg-gray-300"
                  >
                    +
                  </button>
                </div>

                <div className="text-lg font-bold text-[#339059]">
                  ৳{(item.mango_category.price * item.quantity).toFixed(2)}
                </div>

                <button
                  onClick={() => removeItem(item.id)}
                  className="bg-red-500 text-white p-3 rounded-lg hover:bg-red-600 transition-colors flex items-center justify-center"
                  title="Remove item"
                >
                  <svg
                    className="w-5 h-5"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            </div>
          ))}

          <div className="bg-white shadow-sm rounded-lg p-6 border border-gray-100">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-bold">Total: ৳ {getTotalPrice()}</h2>
              <button
                onClick={handleProceedToCheckout}
                className="bg-[#339059] text-white px-8 py-3 rounded-lg hover:bg-[#1f5d39] transition-colors text-lg font-semibold"
              >
                Proceed to Checkout
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Cart;
