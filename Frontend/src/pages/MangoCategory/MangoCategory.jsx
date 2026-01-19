import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import AOS from "aos";
import "aos/dist/aos.css";
import usePageTitle from "../../hooks/usePageTitle";

const MangoCategory = () => {
  usePageTitle("Fresh Mangoes Collection");

  const [mangoes, setMangoes] = useState([]);
  const [filteredMangoes, setFilteredMangoes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState(""); // none, price-asc, price-desc
  const [selectedMangoForReviews, setSelectedMangoForReviews] = useState(null);
  const [reviewsData, setReviewsData] = useState(null);
  const [loadingReviews, setLoadingReviews] = useState(false);
  const navigate = useNavigate();

  // Function to cycle through sort states
  const cycleSortBy = () => {
    if (sortBy === "") {
      setSortBy("price-desc"); // First click: High to Low
    } else if (sortBy === "price-desc") {
      setSortBy("price-asc"); // Second click: Low to High
    } else {
      setSortBy(""); // Third click: Default
    }
  };

  useEffect(() => {
    AOS.init({
      duration: 800,
      easing: "ease-in-out",
      once: true,
      offset: 50,
    });
  }, []);

  useEffect(() => {
    fetch("http://127.0.0.1:8000/api/mangoes/")
      .then((res) => res.json())
      .then((data) => {
        setMangoes(data);
        setFilteredMangoes(data);
      })
      .catch(() => setError("Failed to load mangoes"))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    let filtered = mangoes.filter(
      (mango) =>
        mango.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        mango.description.toLowerCase().includes(searchTerm.toLowerCase()),
    );

    // Apply sorting
    if (sortBy === "price-asc") {
      filtered = filtered.sort(
        (a, b) => parseFloat(a.price) - parseFloat(b.price),
      );
    } else if (sortBy === "price-desc") {
      filtered = filtered.sort(
        (a, b) => parseFloat(b.price) - parseFloat(a.price),
      );
    }

    setFilteredMangoes(filtered);
  }, [searchTerm, mangoes, sortBy]);

  const handleAddToCart = async (mango) => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/auth/login");
      return;
    }

    try {
      const response = await fetch("http://127.0.0.1:8000/api/add-to-cart/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Token ${token}`,
        },
        body: JSON.stringify({
          mango_id: mango.id,
          quantity: 1,
        }),
      });

      if (response.ok) {
        toast.success(`${mango.name} added to cart successfully!`);
        navigate("/dashboard");
      } else {
        const errorData = await response.json();
        toast.error(errorData.error || "Failed to add item to cart");
      }
    } catch (error) {
      console.error("Network error:", error);
      toast.error("Network error. Please try again.");
    }
  };

  const handleViewReviews = async (mango) => {
    setSelectedMangoForReviews(mango);
    setLoadingReviews(true);

    try {
      const response = await fetch(
        `http://127.0.0.1:8000/api/mango/${mango.id}/feedbacks/`,
      );

      if (response.ok) {
        const data = await response.json();
        setReviewsData(data);
      } else {
        toast.error("Failed to load reviews");
      }
    } catch (error) {
      console.error("Error loading reviews:", error);
      toast.error("Failed to load reviews");
    } finally {
      setLoadingReviews(false);
    }
  };

  const closeReviewsModal = () => {
    setSelectedMangoForReviews(null);
    setReviewsData(null);
  };

  if (loading) return <div className="text-center mt-10">Loading...</div>;
  if (error)
    return <div className="text-red-600 text-center mt-10">{error}</div>;

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-yellow-50 to-orange-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-[#339059] to-[#2d7a4f] text-white py-16">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <h1
            className="text-4xl md:text-5xl font-bold mb-4"
            data-aos="fade-down"
          >
            Premium Mango Collection
          </h1>
          <p
            className="text-xl text-green-100 mb-8 max-w-2xl mx-auto"
            data-aos="fade-up"
            data-aos-delay="200"
          >
            Discover our handpicked selection of the finest mangoes from premium
            orchards. Fresh, sweet, and delivered with care.
          </p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-12">
        {/* Search and Filter Section */}
        <div className="p-8 mb-12">
          <div className="flex flex-col lg:flex-row gap-6 items-end">
            {/* Search Bar */}
            <div className="relative flex-1 w-full">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search mangoes..."
                  className="w-full px-5 py-4 pl-12 border border-gray-200 rounded-full focus:outline-none focus:ring-2 focus:ring-[#339059] focus:border-[#339059] transition-all duration-200 bg-white shadow-sm"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                <div className="absolute left-4 top-4 text-gray-400">
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
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                    />
                  </svg>
                </div>
                {searchTerm && (
                  <button
                    onClick={() => setSearchTerm("")}
                    className="absolute right-4 top-4 text-gray-400 hover:text-gray-600 transition-colors"
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
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                )}
              </div>
            </div>

            {/* Sort By Price Button */}
            <div className="w-full lg:w-auto">
              <button
                onClick={cycleSortBy}
                className="w-full lg:w-auto px-6 py-4 bg-white border border-[#339059] text-[#339059] rounded-full font-medium flex items-center gap-2 justify-center hover:bg-[#339059] hover:text-white transition-all duration-200 shadow-sm"
                title={
                  sortBy === ""
                    ? "Click to sort by High to Low price"
                    : sortBy === "price-desc"
                      ? "Click to sort by Low to High price"
                      : "Click to reset to default order"
                }
              >
                <span>Sort By Price</span>
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
                    d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4"
                  />
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Mango Cards Grid */}
        {filteredMangoes.length === 0 ? (
          <div className="text-center py-16">
            <div className="bg-white rounded-2xl shadow-xl p-12 max-w-md mx-auto">
              <svg
                className="w-16 h-16 mx-auto mb-4 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M9.172 16.172a4 4 0 015.656 0M9 12l6 6m-3-6v6"
                />
              </svg>
              <h3 className="text-xl font-semibold text-gray-700 mb-2">
                No mangoes found
              </h3>
              <p className="text-gray-500 mb-6">
                Try adjusting your search terms or reset filters to see all
                mangoes.
              </p>
              <button
                onClick={() => {
                  setSearchTerm("");
                  setSortBy("");
                }}
                className="bg-[#339059] text-white px-6 py-3 rounded-lg hover:bg-[#287346] transition-colors"
              >
                Reset Filters
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 max-w-5xl mx-auto">
            {filteredMangoes.map((mango, index) => (
              <div
                key={mango.id}
                data-aos="fade-up"
                data-aos-delay={100 + (index % 6) * 100}
                className="group bg-white rounded-lg shadow-md hover:shadow-lg transition-all duration-300 overflow-hidden border border-gray-200 flex flex-col sm:flex-row p-3 justify-center items-center"
              >
                {/* Image Section */}
                <div className="relative w-full sm:w-48 h-48 sm:h-32 flex-shrink-0 overflow-hidden">
                  <img
                    src={
                      mango.image && mango.image.startsWith("http")
                        ? mango.image
                        : `http://127.0.0.1:8000${mango.image}`
                    }
                    alt={mango.name}
                    className="w-full h-full object-cover transition-transform duration-300 rounded-md"
                  />
                </div>

                {/* Content Section */}
                <div className="flex-1 p-4 flex flex-col sm:flex-row justify-between w-full">
                  <div className="flex-1 text-center sm:text-left">
                    <h3 className="text-lg font-semibold text-gray-800 mb-2">
                      {mango.name}
                    </h3>

                    {/* Rating Display */}
                    {mango.average_rating > 0 && (
                      <div className="flex items-center justify-center sm:justify-start gap-2 mb-2">
                        <div className="flex items-center">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <svg
                              key={star}
                              className={`w-4 h-4 ${
                                star <= Math.round(mango.average_rating)
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
                        <span className="text-sm text-gray-600">
                          {mango.average_rating.toFixed(1)} (
                          {mango.total_ratings}{" "}
                          {mango.total_ratings === 1 ? "review" : "reviews"})
                        </span>
                        <button
                          onClick={() => handleViewReviews(mango)}
                          className="text-xs text-[#339059] hover:text-[#287346] font-medium underline ml-1"
                        >
                          View Reviews
                        </button>
                      </div>
                    )}

                    <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                      {mango.description}
                    </p>

                    {/* Stock Info */}
                    <div className="flex items-center justify-center sm:justify-start text-sm text-gray-500 mb-3">
                      <svg
                        className="w-4 h-4 mr-1 text-green-500"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                          clipRule="evenodd"
                        />
                      </svg>
                      <span>{mango.stock_quantity} kg in stock</span>
                    </div>
                  </div>

                  {/* Right Section: Price and Button */}
                  <div className="flex flex-col justify-between items-center sm:items-end sm:ml-4 w-full sm:w-auto">
                    <div className="text-center sm:text-right mb-4">
                      <div className="text-2xl font-bold text-[#339059]">
                        ৳{mango.price}
                        <span className="text-sm text-gray-500 font-normal ml-1">
                          /kg
                        </span>
                      </div>
                    </div>

                    {/* Add to Cart Button */}
                    <button
                      onClick={() => handleAddToCart(mango)}
                      className="flex items-center justify-center px-6 py-2 bg-[#339059] text-white font-medium rounded-lg hover:bg-[#287346] transition-colors duration-200 w-full sm:w-auto"
                    >
                      <svg
                        className="w-4 h-4 mr-2"
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
                      Add to Cart
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Reviews Modal */}
      {selectedMangoForReviews && (
        <div className="fixed inset-0 bg-[#000000a0] backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              {/* Header */}
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h3 className="text-2xl font-bold text-[#339059]">
                    Customer Reviews
                  </h3>
                  <p className="text-gray-600 mt-1">
                    {selectedMangoForReviews.name}
                  </p>
                </div>
                <button
                  onClick={closeReviewsModal}
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

              {/* Rating Summary */}
              {reviewsData && (
                <div className="mb-6 p-4 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-lg border border-yellow-200">
                  <div className="flex items-center gap-4">
                    <div className="text-center">
                      <div className="text-4xl font-bold text-[#339059]">
                        {reviewsData.average_rating.toFixed(1)}
                      </div>
                      <div className="flex items-center justify-center mt-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <svg
                            key={star}
                            className={`w-5 h-5 ${
                              star <= Math.round(reviewsData.average_rating)
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
                      <p className="text-sm text-gray-600 mt-1">
                        {reviewsData.total_ratings}{" "}
                        {reviewsData.total_ratings === 1 ? "review" : "reviews"}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Reviews List */}
              {loadingReviews ? (
                <div className="text-center py-8">
                  <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-[#339059]"></div>
                  <p className="text-gray-600 mt-2">Loading reviews...</p>
                </div>
              ) : reviewsData && reviewsData.feedbacks.length > 0 ? (
                <div className="space-y-4">
                  {reviewsData.feedbacks.map((review) => (
                    <div
                      key={review.id}
                      className="p-4 bg-gray-50 rounded-lg border border-gray-200"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 bg-[#339059] text-white rounded-full flex items-center justify-center font-semibold text-sm">
                            {review.user_name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="font-semibold text-gray-800">
                              {review.user_name}
                            </p>
                            <div className="flex items-center gap-1">
                              {[1, 2, 3, 4, 5].map((star) => (
                                <svg
                                  key={star}
                                  className={`w-4 h-4 ${
                                    star <= review.rating
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
                          </div>
                        </div>
                        <p className="text-xs text-gray-500">
                          {new Date(review.created_at).toLocaleDateString(
                            "en-US",
                            {
                              year: "numeric",
                              month: "short",
                              day: "numeric",
                            },
                          )}
                        </p>
                      </div>
                      {review.comment && (
                        <p className="text-sm text-gray-700 mt-2 ml-10">
                          {review.comment}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
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
                      d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                    />
                  </svg>
                  <p className="text-gray-600">No reviews yet</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MangoCategory;
