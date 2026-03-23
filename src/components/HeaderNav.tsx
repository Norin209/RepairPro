import { useState } from "react";
import { Link } from "react-router-dom";
// Ensure this path matches where your logo is actually located
import logo from "../assets/logo.png"; 

const navLinks = [
  { path: "/booking", label: "Repair Device" },
  { path: "/buy-back", label: "Buy Back" }, // Points to new SellPage
  { path: "/coming-soon", label: "Shop" },         // Points to new BuyPage
  { path: "/location", label: "Location" },
  { path: "/about", label: "About Us" },
  { path: "/contact", label: "Contact" },
];

const HeaderNav = () => {
  const [open, setOpen] = useState(false);
  const handleLinkClick = () => setOpen(false);

  return (
    <nav className="w-full bg-white shadow-sm fixed top-0 left-0 z-50">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">

        {/* LOGO AREA */}
        <div className="flex items-center space-x-4">
          <Link to="/home" onClick={handleLinkClick} className="flex-shrink-0">
            <img
              src={logo}
              alt="RepairPro Logo"
              className="h-16 w-auto object-contain cursor-pointer"
            />
          </Link>

          <Link
            to="/home"
            onClick={handleLinkClick}
            className="text-lg font-medium text-black hover:text-gray-700 transition"
          >
            Repair Pro
          </Link>
        </div>

        {/* DESKTOP MENU */}
        <ul className="hidden xl:flex flex-row space-x-8 text-lg text-black font-medium">
          {navLinks.map((link) => (
            <li key={link.path}>
              <Link to={link.path} className="hover:text-red-600 transition">
                {link.label}
              </Link>
            </li>
          ))}
        </ul>

        {/* DESKTOP CTA BUTTON */}
        <Link
          to="/booking"
          className="
            hidden lg:inline-block
            bg-red-600 text-white border border-red-600
            px-6 py-3 rounded-full font-semibold text-lg
            transition-all duration-300
            hover:bg-red-700 hover:border-red-700
            hover:scale-105
          "
        >
          Get Instant Quote
        </Link>

        {/* MOBILE HAMBURGER ICON */}
        <button
          onClick={() => setOpen(!open)}
          className="xl:hidden p-2 relative z-50 focus:outline-none"
        >
          <div className="w-6 h-5 flex flex-col justify-between">
            <span 
              className={`block w-full h-[3px] bg-black transition-all duration-300 ${open ? 'rotate-45 translate-y-[8px]' : ''}`} 
            />
            <span 
              className={`block w-full h-[3px] bg-black transition-all duration-300 ${open ? 'opacity-0' : ''}`} 
            />
            <span 
              className={`block w-full h-[3px] bg-black transition-all duration-300 ${open ? '-rotate-45 -translate-y-[8px]' : ''}`} 
            />
          </div>
        </button>

      </div>

      {/* MOBILE MENU DROPDOWN */}
      <div
        className={`
          xl:hidden bg-white shadow-md px-6 text-black text-lg font-medium
          transition-all duration-300
          ${open ? 'max-h-screen opacity-100 py-4' : 'max-h-0 opacity-0 overflow-hidden'}
        `}
      >
        <ul className="flex flex-col space-y-4">
          {navLinks.map((link) => (
            <li key={link.path}>
              <Link 
                to={link.path}
                onClick={handleLinkClick}
                className="block py-1 hover:text-red-600"
              >
                {link.label}
              </Link>
            </li>
          ))}

          {/* MOBILE CTA */}
          <li className="pt-4">
            <Link
              to="/booking"
              onClick={handleLinkClick}
              className="
                block bg-red-600 text-white border border-red-600
                text-center px-6 py-3 rounded-full font-semibold
                transition-all duration-300
                hover:bg-red-700 hover:border-red-700
                hover:scale-105
              "
            >
              Get Instant Quote
            </Link>
          </li>
        </ul>
      </div>
    </nav>
  );
};

export default HeaderNav;