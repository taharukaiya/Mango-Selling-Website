import { useState, useEffect } from "react";
import { toast } from "react-toastify";

const FeedbackModal = ({ orderItem, onClose, onFeedbackSubmitted }) => {
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [existingFeedback, setExistingFeedback] = useState(null);

  useEffect(() => {
    // Load existing feedback if any
    if (orderItem?.feedback) {
      setExistingFeedback(orderItem.feedback);
      setRating(orderItem.feedback.rating);
      setComment(orderItem.feedback.comment || "");
    }
  }, [orderItem]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (rating === 0) {
      toast.error("Please select a rating");
      return;
    }

    setSubmitting(true);

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `http://127.0.0.1:8000/api/order-item/${orderItem.id}/feedback/`,
        {
          method: existingFeedback ? "PUT" : "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Token ${token}`,
          },
          body: JSON.stringify({
            rating,
            comment,
          }),
        },
      );

      if (response.ok) {
        const data = await response.json();
        toast.success(data.message || "Feedback submitted successfully!");
        if (onFeedbackSubmitted) {
          onFeedbackSubmitted();
        }
        onClose();
      } else {
        const errorData = await response.json();
        toast.error(errorData.error || "Failed to submit feedback");
      }
    } catch (error) {
      console.error("Error submitting feedback:", error);
      toast.error("Failed to submit feedback");
    } finally {
      setSubmitting(false);
    }
  };

  const StarIcon = ({ filled, onHover, onClick, index }) => (
    <svg
      className={`w-10 h-10 cursor-pointer transition-all duration-200 ${
        filled ? "text-yellow-400" : "text-gray-300"
      } hover:scale-110`}
      fill={filled ? "currentColor" : "none"}
      stroke="currentColor"
      viewBox="0 0 24 24"
      onMouseEnter={() => onHover(index)}
      onMouseLeave={() => onHover(0)}
      onClick={() => onClick(index)}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
      />
    </svg>
  );

  return (
    <div className="fixed inset-0 bg-[#000000a0] backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          {/* Header */}
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-2xl font-bold text-[#339059]">
              {existingFeedback ? "Update Your Feedback" : "Rate This Product"}
            </h3>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 transition-colors"
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

          {/* Product Info */}
          <div className="mb-6 p-4 bg-green-50 rounded-lg border border-green-200">
            <div className="flex items-center gap-4">
              {orderItem.mango_image && (
                <img
                  src={`http://127.0.0.1:8000${orderItem.mango_image}`}
                  alt={orderItem.mango_name}
                  className="w-20 h-20 object-cover rounded-lg"
                />
              )}
              <div>
                <p className="font-bold text-lg text-[#339059]">
                  {orderItem.mango_name}
                </p>
                <p className="text-sm text-gray-600">
                  Quantity: {orderItem.quantity} kg | Price: ৳{orderItem.price}
                  /kg
                </p>
                <p className="text-sm font-semibold text-gray-700">
                  Subtotal: ৳{orderItem.subtotal}
                </p>
              </div>
            </div>
          </div>

          {/* Feedback Form */}
          <form onSubmit={handleSubmit}>
            {/* Star Rating */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-3">
                How would you rate your experience?
              </label>
              <div className="flex justify-center gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <StarIcon
                    key={star}
                    filled={star <= (hoveredRating || rating)}
                    onHover={setHoveredRating}
                    onClick={setRating}
                    index={star}
                  />
                ))}
              </div>
              {rating > 0 && (
                <p className="text-center mt-2 text-sm text-gray-600">
                  {rating === 1 && "Poor"}
                  {rating === 2 && "Fair"}
                  {rating === 3 && "Good"}
                  {rating === 4 && "Very Good"}
                  {rating === 5 && "Excellent"}
                </p>
              )}
            </div>

            {/* Comment */}
            <div className="mb-6">
              <label
                htmlFor="comment"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Your Comments (Optional)
              </label>
              <textarea
                id="comment"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#339059] focus:border-transparent"
                placeholder="Tell us about your experience with the product..."
              />
            </div>

            {/* Buttons */}
            <div className="flex gap-3">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 bg-gray-500 text-white px-6 py-3 rounded-lg hover:bg-gray-600 transition-colors font-medium"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting || rating === 0}
                className="flex-1 bg-[#339059] text-white px-6 py-3 rounded-lg hover:bg-[#2E7D4F] transition-colors font-medium disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                {submitting
                  ? "Submitting..."
                  : existingFeedback
                    ? "Update Feedback"
                    : "Submit Feedback"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default FeedbackModal;
