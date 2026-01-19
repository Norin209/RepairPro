const HeroSection = () => {
  return (
    <section className="w-full bg-white pt-32 pb-20 px-4">
      <div className="max-w-4xl mx-auto text-center">

        <h1 className="text-3xl md:text-5xl font-bold text-gray-900 leading-tight">
          Premier Device Repair Services
        </h1>

        <p className="text-gray-600 text-base md:text-xl mt-4 mx-auto max-w-2xl">
          Fast, reliable, and professional repairs for all your devices — because your tech deserves the best.
        </p>

        {/* Updated Button */}
        <a
          href="/booking"
          className="
            inline-block 
            mt-8 
            px-5 md:px-8 
            py-3 md:py-3.5
            bg-white 
            text-black 
            border border-black 
            rounded-full 
            font-semibold 
            text-base md:text-lg
            transition-all duration-300 ease-in-out
            hover:!bg-black hover:!text-white hover:!border-black
            shadow-sm hover:shadow-md
          "
        >
          Start Your Repair
        </a>

      </div>
    </section>
  );
};

export default HeroSection;
