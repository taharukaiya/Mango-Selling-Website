import { useEffect } from "react";
import AOS from "aos";
import "aos/dist/aos.css";
import FindMangoes from "../../components/home/FindMangoes";
import Slider from "../../components/home/slider";
import usePageTitle from "../../hooks/usePageTitle";

const Home = () => {
  usePageTitle("Premium Bangladeshi Mangoes");

  useEffect(() => {
    AOS.init({
      duration: 1000,
      easing: "ease-in-out",
      once: true,
      offset: 100,
    });
  }, []);

  return (
    <>
      <Slider />
      <FindMangoes />
    </>
  );
};

export default Home;
