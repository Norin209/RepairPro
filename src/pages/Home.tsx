import HeaderNav from "../components/HeaderNav";
import DeviceGrid from "../components/DeviceGrid";
import WhyUs from "../components/WhyUs";
import SecondaryCalls from "../components/SecondaryCalls";
import PromoBanners from "../components/PromoBanners";

const Home = () => {
  return (
    <>
      <HeaderNav />
      <div className="pt-20">
        <PromoBanners />
        <DeviceGrid />
        <WhyUs />
        <SecondaryCalls />
        {/* More sections will be added later */}
      </div>
    </>
  );
};

export default Home;
