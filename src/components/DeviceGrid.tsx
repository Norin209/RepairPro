import { useEffect, useState } from "react";

// Images
import IphoneImg from "../assets/Iphone.jpeg";
import AndroidImg from "../assets/Andriod.jpeg";
import TabletImg from "../assets/Tablet.jpeg";
import ComputerImg from "../assets/Computer.jpeg";
import WatchImg from "../assets/AppleWatch.jpeg";
import ConsoleImg from "../assets/Console.jpg";

export interface DeviceItem {
  name: string;
  img: string;
}

const DeviceGrid = () => {
  const [devices, setDevices] = useState<DeviceItem[]>([]);

  useEffect(() => {
    setDevices([
      { name: "iPhone", img: IphoneImg },
      { name: "Android", img: AndroidImg },
      { name: "Tablet / iPad", img: TabletImg },
      { name: "Computer", img: ComputerImg },
      { name: "Smart Watch", img: WatchImg },
      { name: "Game Console", img: ConsoleImg },
    ]);
  }, []);

  return (
    <section className="py-12 md:py-20 bg-white">
      <div className="container mx-auto px-4">

        <h2 className="text-2xl md:text-4xl font-bold text-center mb-12">
          Choose Your Device
        </h2>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
          {devices.map((device) => (
            <a
              key={device.name}
              href="/repair-a-device"
              className="
                bg-white border border-gray-200 rounded-xl
                p-6 md:p-10
                flex flex-col items-center justify-center
                text-black font-semibold text-sm md:text-lg
                cursor-pointer

                transform transition-all duration-300 ease-out
                hover:-translate-y-2 hover:scale-105
                hover:shadow-2xl
                hover:border-red-500
                hover:ring-2 hover:ring-red-100
              "
            >
              <img
                src={device.img}
                alt={device.name}
                className="h-16 md:h-24 object-contain mb-4"
              />

              {device.name}
            </a>
          ))}
        </div>
      </div>
    </section>
  );
};

export default DeviceGrid;
