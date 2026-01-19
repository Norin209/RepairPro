import React from "react";
import type { Location } from "../types/repairTypes";

interface Props {
  location: Location;
  onConfirm: (loc: Location) => void;
}

const LocationDetailPanel: React.FC<Props> = ({ location, onConfirm }) => {
  return (
    <div className="absolute right-4 top-4 max-w-[300px] bg-white p-6 rounded-xl shadow-2xl z-50 text-left border border-gray-300">
      <h3 className="text-xl font-bold mb-1">{location.name}</h3>
      <p className="text-sm text-gray-600 mb-4">{location.address}</p>

      <div className="space-y-1 text-sm mb-4">
        <p><strong>Phone:</strong> {location.phone}</p>
        <p><strong>Hours:</strong> {location.hours}</p>
      </div>

      <button
        onClick={() => onConfirm(location)}
        className="w-full py-3 bg-black text-white rounded-full font-semibold hover:bg-gray-800 transition"
      >
        Select Store
      </button>
    </div>
  );
};

export default LocationDetailPanel;
