import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const FindMangoes = () => {
  const [mangoes, setMangoes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    fetch("http://localhost:8000/api/mangoes/")
      .then((res) => res.json())
      .then((data) => setMangoes(data.slice(0, 3)))
      .catch(() => setError("Failed to load mangoes"))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="w-11/12 sm:w-10/12 mx-auto py-16 px-4">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-[#339059]"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-11/12 sm:w-10/12 mx-auto py-16 px-4">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded text-center">
          {error}
        </div>
      </div>
    );
  }

  return (
    <section className="py-16 bg-gradient-to-br from-green-50 to-yellow-50">
      <div className="w-11/12 sm:w-10/12 mx-auto">
        {/* Header Section */}
        <div className="text-center mb-12" data-aos="fade-up">
          <div
            className="inline-flex items-center justify-center w-16 h-16 bg-[#339059] text-white rounded-full mb-4"
            data-aos="zoom-in"
            data-aos-delay="200"
          >
            <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM6.293 6.707a1 1 0 010-1.414l3-3a1 1 0 011.414 0l3 3a1 1 0 11-1.414 1.414L11 5.414V13a1 1 0 11-2 0V5.414L7.707 6.707a1 1 0 01-1.414 0z"
                clipRule="evenodd"
              />
            </svg>
          </div>
          <h2
            className="text-4xl font-bold text-gray-800 mb-4"
            data-aos="fade-up"
            data-aos-delay="300"
          >
            Find <span className="text-[#339059]">Best Mangoes</span>
          </h2>
          <p
            className="text-lg text-gray-600 max-w-2xl mx-auto"
            data-aos="fade-up"
            data-aos-delay="400"
          >
            Discover our premium selection of fresh, juicy mangoes directly from
            the finest orchards. Each mango is handpicked for exceptional
            quality and taste.
          </p>
        </div>

        {/* Mangoes Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
          {mangoes.map((mango, index) => (
            <div
              key={mango.id}
              data-aos="fade-up"
              data-aos-delay={500 + index * 150}
              className="group relative bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 overflow-hidden"
            >
              {/* Image Container */}
              <div className="relative h-64 overflow-hidden">
                <img
                  src={
                    mango.image && mango.image.startsWith("http")
                      ? mango.image
                      : `http://localhost:8000${mango.image}`
                  }
                  alt={mango.name}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </div>

              {/* Content */}
              <div className="p-6">
                <h3 className="text-xl font-bold text-gray-800 mb-2 group-hover:text-[#339059] transition-colors">
                  {mango.name}
                </h3>

                <p className="text-gray-600 text-sm mb-4 line-clamp-3 leading-relaxed">
                  {mango.description}
                </p>

                {/* Price and Stock */}
                <div className="flex items-center justify-between mb-4">
                  <div className="text-2xl font-bold text-[#339059]">
                    ৳ {mango.price}
                    <span className="text-sm text-gray-500 font-normal">
                      /kg
                    </span>
                  </div>
                  <div className="flex items-center text-sm text-gray-500">
                    <svg
                      className="w-4 h-4 mr-1"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M5 2a1 1 0 011 1v1h1a1 1 0 010 2H6v1a1 1 0 01-2 0V6H3a1 1 0 010-2h1V3a1 1 0 011-1zm0 10a1 1 0 011 1v1h1a1 1 0 110 2H6v1a1 1 0 11-2 0v-1H3a1 1 0 110-2h1v-1a1 1 0 011-1zM12 2a1 1 0 01.967.744L14.146 7.2 17.5 9.134a1 1 0 010 1.732L14.146 12.8l-1.179 4.456a1 1 0 01-1.934 0L9.854 12.8 6.5 10.866a1 1 0 010-1.732L9.854 7.2l1.179-4.456A1 1 0 0112 2z"
                        clipRule="evenodd"
                      />
                    </svg>
                    {mango.stock_quantity} kg in stock
                  </div>
                </div>

                {/* Features */}
                <div className="flex flex-wrap gap-2">
                  <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-medium">
                    Fresh
                  </span>
                  <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full text-xs font-medium">
                    Premium Quality
                  </span>
                  <span className="bg-orange-100 text-orange-800 px-2 py-1 rounded-full text-xs font-medium">
                    Sweet & Juicy
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Call to Action */}
        <div className="text-center" data-aos="fade-up" data-aos-delay="900">
          <div className="inline-flex flex-col items-center">
            <p className="text-gray-600 mb-6 text-lg">
              Explore our complete collection of premium mangoes
            </p>
            <button
              className="group relative inline-flex items-center justify-center px-8 py-4 bg-[#339059] text-white font-semibold text-lg rounded-full hover:bg-[#287346] transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
              onClick={() => navigate("/mango-category")}
            >
              <span className="mr-2">View All Mangoes</span>
              <svg
                className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 8l4 4m0 0l-4 4m4-4H3"
                />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FindMangoes;
