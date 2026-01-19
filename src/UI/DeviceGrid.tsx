import React from "react";

// Import REAL images instead of emojis
import IphoneImg from "../assets/Iphone.jpeg";
import AndroidImg from "../assets/Andriod.jpeg";
import TabletImg from "../assets/Tablet.jpeg";
import ComputerImg from "../assets/Computer.jpeg";
import WatchImg from "../assets/AppleWatch.jpeg";
import ConsoleImg from "../assets/Console.jpg";

// Updated type: unchanged
export interface DeviceItem {
  name: string;
  image: string;
}

interface Props {
  devices: DeviceItem[];
  onSelect: (name: string) => void;
}

// Map device names → actual imported images
const IMAGE_MAP: Record<string, string> = {
  iPhone: IphoneImg,
  Android: AndroidImg,
  "Tablet / iPad": TabletImg,
  Computer: ComputerImg,
  "Smart Watch": WatchImg,
  "Game Console": ConsoleImg,
};

// 🔑 UI label → Firestore key mapping (unchanged)
const DEVICE_NAME_MAP: Record<string, string> = {
  "Smart Watch": "Apple Watch",
};

const DeviceGrid: React.FC<Props> = ({ devices, onSelect }) => {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 max-w-4xl mx-auto">
      {devices.map((d) => (
        <button
          key={d.name}
          onClick={() => {
            const deviceKey = DEVICE_NAME_MAP[d.name] ?? d.name;
            onSelect(deviceKey);
          }}
          className="
            bg-white border border-gray-300 text-black rounded-xl p-6
            shadow-sm transition-all duration-300
            hover:shadow-xl hover:border-black
            hover:-translate-y-1
            cursor-pointer
            flex flex-col items-center
          "
        >
          {/* DEVICE IMAGE */}
          <img
            src={IMAGE_MAP[d.name]}
            alt={d.name}
            className="h-16 w-auto md:h-20 object-contain mb-3"
          />

          <p className="font-medium">{d.name}</p>
        </button>
      ))}
    </div>
  );
};

export default DeviceGrid;
