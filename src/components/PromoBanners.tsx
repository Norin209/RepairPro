import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Modal from "./Modal";

interface PromoItem {
  title: string;
  desc: string;
  img: string;
  color: "blue" | "green" | "orange";
}

// ------------------------------
// MODAL CONTENT
// ------------------------------
const MODAL_CONTENT = {
  franchising: {
    title: "Franchising Opportunities",
    subtitle: "Join the RepairPro family and start your own successful business.",
    content: (
      <>
        <p className="mb-3">
          We offer a proven business model, comprehensive support, and established supply chains.
        </p>
        <p className="mb-3 font-semibold">
          Minimum investment required. Contact us to receive our full franchise prospectus.
        </p>
        <Link
          to="/contact"
          className="inline-block mt-4 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Apply Now
        </Link>
      </>
    ),
  },
  training: {
    title: "Certified Technician Training",
    subtitle: "Master the art of device repair with our accredited training programs.",
    content: (
      <>
        <p className="mb-3">
          Our intensive training courses cover everything from screen replacements to advanced repairs.
        </p>
        <ul className="list-disc list-inside ml-4 space-y-1">
          <li>Hands-on practical experience</li>
          <li>Accredited certification</li>
          <li>Ongoing technical support</li>
        </ul>
        <Link
          to="/contact"
          className="inline-block mt-4 bg-black text-white px-4 py-2 rounded hover:bg-gray-800"
        >
          View Courses
        </Link>
      </>
    ),
  },
};

const CombinedHeroAndPromos = () => {
  const [promos, setPromos] = useState<PromoItem[]>([]);
  const [modalType, setModalType] =
    useState<keyof typeof MODAL_CONTENT | null>(null);

  const handleClose = () => setModalType(null);

  useEffect(() => {
    fetch("/data/promos.json")
      .then((res) => res.json())
      .then((data) => setPromos(data));
  }, []);

  if (promos.length < 1) {
    return (
      <section className="pt-20 pb-4 bg-white">
        <div className="container mx-auto px-4">Loading content…</div>
      </section>
    );
  }

  const heroItem = promos[0];

  // ------------------------------
  // SHARED CARD STYLE (same animation for all)
  // ------------------------------
  const cardBase =
    "bg-white rounded-xl border-2 border-gray-300 shadow-sm " +
    "transition-all duration-300 transform hover:scale-[1.02] hover:shadow-xl";

  // ------------------------------
  // MODAL TRIGGER CARD
  // ------------------------------
  const ModalTriggerCard = ({
    type,
  }: {
    type: "franchising" | "training";
  }) => {
    const data = MODAL_CONTENT[type];

    return (
      <div
        onClick={() => setModalType(type)}
        className={`${cardBase} cursor-pointer p-8 h-full flex flex-col items-center justify-center`}
      >
        <h3 className="font-extrabold text-gray-900 mb-3 text-xl md:text-2xl">
          {data.title}
        </h3>
        <p className="text-gray-600 text-center">{data.subtitle}</p>
        <span className="text-red-600 text-sm font-semibold mt-4 hover:underline">
          Learn More →
        </span>
      </div>
    );
  };

  // ------------------------------
  // HERO CARD
  // ------------------------------
  const HeroCard = ({ item }: { item: PromoItem }) => (
    <div className={`${cardBase} p-8 h-full flex flex-col justify-start`}>
      <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 leading-tight">
        Premier Device Repair Services
      </h1>

      <h2 className="text-xl md:text-2xl font-bold text-gray-900 mt-4">
        {item.title}
      </h2>

      <p className="text-gray-600 text-lg md:text-xl mt-2 max-w-lg">
        Fast, reliable, and professional repairs for all your devices.
      </p>

      {/* 🔴 RED CTA BUTTON */}
      <Link
        to="/booking"
        className="
          inline-block mt-8 w-fit
          px-8 py-3.5
          bg-red-600 text-white
          border border-red-600
          rounded-full font-semibold text-lg
          shadow-md
          transition-all duration-300 ease-out
          hover:bg-red-700 hover:border-red-700
          hover:shadow-xl hover:-translate-y-0.5
          active:translate-y-0 active:shadow-md
        "
      >
        Start Your Repair
      </Link>
    </div>
  );

  return (
    <section className="w-full bg-white pt-20 pb-20 px-4">
      <div className="container mx-auto max-w-7xl">

        {/* Mobile */}
        <div className="grid grid-cols-1 gap-6 md:hidden">
          <HeroCard item={heroItem} />
          <ModalTriggerCard type="franchising" />
          <ModalTriggerCard type="training" />
        </div>

        {/* Desktop */}
        <div className="hidden md:grid md:grid-cols-5 gap-6">
          <div className="col-span-3 row-span-2">
            <HeroCard item={heroItem} />
          </div>
          <div className="col-span-2">
            <ModalTriggerCard type="franchising" />
          </div>
          <div className="col-span-2">
            <ModalTriggerCard type="training" />
          </div>
        </div>
      </div>

      {/* MODALS */}
      <Modal
        isOpen={modalType === "franchising"}
        onClose={handleClose}
        title={MODAL_CONTENT.franchising.title}
      >
        {MODAL_CONTENT.franchising.content}
      </Modal>

      <Modal
        isOpen={modalType === "training"}
        onClose={handleClose}
        title={MODAL_CONTENT.training.title}
      >
        {MODAL_CONTENT.training.content}
      </Modal>
    </section>
  );
};

export default CombinedHeroAndPromos;
