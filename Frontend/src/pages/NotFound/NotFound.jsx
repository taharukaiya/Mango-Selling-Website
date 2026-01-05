import { Link } from "react-router-dom";
import usePageTitle from "../../hooks/usePageTitle";

const NotFound = () => {
  usePageTitle("Page Not Found");

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-yellow-50 to-orange-50 flex items-center justify-center px-4">
      <div className="max-w-2xl mx-auto text-center">
        {/* 404 Illustration */}
        <div className="mb-8">
          <div className="relative">
            {/* Large 404 Text */}
            <h1 className="text-9xl md:text-[12rem] font-bold text-gray-200 leading-none select-none">
              404
            </h1>

            {/* Mango Illustration */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="relative">
                <svg
                  className="w-32 h-32 md:w-40 md:h-40 text-[#339059] opacity-80"
                  fill="currentColor"
                  viewBox="0 0 100 100"
                >
                  {/* Mango Shape */}
                  <path d="M50 15 C30 15, 15 30, 15 50 C15 70, 30 85, 50 85 C55 85, 60 83, 64 80 C70 75, 75 68, 78 60 C82 50, 85 38, 85 30 C85 22, 82 15, 75 15 C65 15, 55 15, 50 15 Z" />
                  {/* Mango Leaf */}
                  <path
                    d="M50 15 Q45 10, 40 12 Q38 14, 40 16 Q45 18, 50 15"
                    fill="#4ade80"
                  />
                </svg>

                {/* Confused Face */}
                <div className="absolute inset-0 flex items-center justify-center text-white">
                  <div className="text-center">
                    <div className="flex justify-center gap-2 mb-1">
                      {/* Eyes */}
                      <div className="w-2 h-2 bg-white rounded-full"></div>
                      <div className="w-2 h-2 bg-white rounded-full"></div>
                    </div>
                    {/* Mouth */}
                    <div className="w-6 h-3 border-2 border-white border-t-0 rounded-b-full"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Error Message */}
        <div className="mb-8">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">
            Oops! Page Not Found
          </h2>
          <p className="text-lg text-gray-600 mb-6 leading-relaxed">
            Looks like this mango rolled away! The page you're looking for
            doesn't exist or has been moved to a different branch.
          </p>

          {/* Fun message */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg mb-8">
            <p className="text-[#339059] font-medium">
              🥭 Don't worry! There are plenty of delicious mangoes waiting for
              you on our homepage.
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Link
            to="/home"
            className="inline-flex items-center gap-2 bg-[#339059] text-white px-8 py-4 rounded-xl hover:bg-[#287346] transition-all duration-300 transform hover:scale-105 font-semibold shadow-lg"
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
                d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
              />
            </svg>
            Go to Homepage
          </Link>
        </div>

        {/* Footer Note */}
        <div className="mt-8 text-sm text-gray-500">
          Error Code: 404 | Page Not Found
        </div>
      </div>
    </div>
  );
};

export default NotFound;
