import { useState, useEffect } from "react";
import slider1 from "../../assets/slider/slider-1.jpg";
import slider2 from "../../assets/slider/slider-2.jpg";
import slider3 from "../../assets/slider/slider-3.jpg";
import slider4 from "../../assets/slider/slider-4.jpg";

import { NavLink } from "react-router-dom";

const Slider = () => {
  const [currentSlide, setCurrentSlide] = useState(0);

  const slides = [
    {
      id: 1,
      image: slider1,
      title: "Fresh Juicy Mangoes",
      subtitle: "Handpicked from the best orchards, delivered to your door.",
    },
    {
      id: 2,
      image: slider2,
      title: "Taste the Summer",
      subtitle: "Premium quality mangoes, bursting with flavor.",
    },
    {
      id: 3,
      image: slider3,
      title: "Order Now, Enjoy Fast Delivery",
      subtitle: "Get your favorite mango varieties quickly and safely.",
    },
    {
      id: 4,
      image: slider4,
      title: "Special Mango Offers",
      subtitle: "Exclusive deals on bulk and gift mango boxes!",
    },
  ];

  // Auto-slide functionality
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000); // Change slide every 5 seconds

    return () => clearInterval(interval);
  }, [slides.length]);

  const goToSlide = (index) => {
    setCurrentSlide(index);
  };

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  };

  return (
    <div
      className="relative w-full h-[400px] md:h-[500px] lg:h-[600px] overflow-hidden shadow-lg"
      data-aos="fade-in"
    >
      {/* Slides Container */}
      <div
        className="flex transition-transform duration-500 ease-in-out h-full"
        style={{ transform: `translateX(-${currentSlide * 100}%)` }}
      >
        {slides.map((slide) => (
          <div key={slide.id} className="w-full flex-shrink-0 relative">
            <img
              src={slide.image}
              alt={slide.title}
              className="w-full h-full object-cover"
            />
            {/* Overlay */}
            <div className="absolute inset-0 bg-[#00000084] backdrop-blur-xs flex items-center justify-center">
              <div
                className="text-center text-white px-4"
                data-aos="fade-up"
                data-aos-delay="500"
              >
                <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4">
                  {slide.title}
                </h2>
                <p className="text-lg md:text-xl lg:text-2xl opacity-90">
                  {slide.subtitle}
                </p>
                <NavLink
                  to="/mango-category"
                  className="inline-block mt-6 bg-[#339059] hover:bg-[#287346] text-white font-bold py-3 px-8 rounded-full transition-colors duration-300 shadow-lg text-lg"
                >
                  Shop Mangoes
                </NavLink>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Navigation Arrows */}
      <button
        onClick={prevSlide}
        className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-[#00000099] text-white p-2 rounded-full transition-all duration-300 shadow-lg z-10"
        aria-label="Previous slide"
      >
        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
          <path d="M15.41 16.59L10.83 12l4.58-4.59L14 6l-6 6 6 6 1.41-1.41z" />
        </svg>
      </button>

      <button
        onClick={nextSlide}
        className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-[#00000099] text-white p-2 rounded-full transition-all duration-300 shadow-lg z-10"
        aria-label="Next slide"
      >
        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
          <path d="M8.59 16.59L13.17 12L8.59 7.41L10 6l6 6-6 6-1.41-1.41z" />
        </svg>
      </button>

      {/* Dots Indicator */}
      <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 flex space-x-3 z-10">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => goToSlide(index)}
            className={`w-2 h-2 rounded-full transition-all duration-300 border-2 ${
              currentSlide === index
                ? "bg-white border-white scale-110 shadow-lg"
                : "bg-transparent border-white border-opacity-60 hover:border-opacity-100 hover:scale-105"
            }`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
};

export default Slider;
