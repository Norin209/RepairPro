import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom"; // ✅ Import

interface DeviceItem {
  name: string;
  emoji: string;
}

const AdminDevices = () => {
  const navigate = useNavigate(); // ✅ Init
  const [devices, setDevices] = useState<DeviceItem[]>([]);
  const [newName, setNewName] = useState("");
  const [newEmoji, setNewEmoji] = useState("");

  // 🔒 SECURITY CHECK
  useEffect(() => {
    const isAuth = localStorage.getItem("adminAuth") === "true";
    if (!isAuth) navigate("/admin-portal-9831");
  }, [navigate]);

  useEffect(() => {
    const saved = localStorage.getItem("devices");
    if (saved) {
      setDevices(JSON.parse(saved));
    } else {
      fetch("/data/devices.json")
        .then((res) => res.json())
        .then((data) => setDevices(data));
    }
  }, []);

  const saveChanges = () => {
    localStorage.setItem("devices", JSON.stringify(devices));
    alert("Devices updated!");
  };

  const addDevice = () => {
    if (!newName || !newEmoji) return alert("Please fill name & emoji");
    const updated = [...devices, { name: newName, emoji: newEmoji }];
    setDevices(updated);
    setNewName("");
    setNewEmoji("");
  };

  const deleteDevice = (index: number) => {
    const updated = devices.filter((_, i) => i !== index);
    setDevices(updated);
  };

  const updateDevice = (index: number, field: "name" | "emoji", value: string) => {
    const updated = [...devices];
    updated[index][field] = value;
    setDevices(updated);
  };

  return (
    <section className="w-full bg-white pt-28 pb-10 px-4">
      <div className="max-w-3xl mx-auto">
        
        {/* ✅ BACK BUTTON */}
        <button
          onClick={() => navigate("/admin-panel")}
          className="mb-6 px-4 py-2 text-sm font-medium border border-gray-300 rounded-full hover:bg-gray-100 transition inline-flex items-center gap-2"
        >
          ← Back to Dashboard
        </button>

        <h1 className="text-3xl font-bold mb-10">Edit Devices</h1>

        <div className="space-y-6">
          {devices.map((device, index) => (
            <div key={index} className="border p-4 rounded-xl shadow-sm">
              <div className="flex gap-4">
                <input
                  className="flex-1 border p-2 rounded"
                  value={device.name}
                  onChange={(e) => updateDevice(index, "name", e.target.value)}
                />
                <input
                  className="w-24 border p-2 rounded"
                  value={device.emoji}
                  onChange={(e) => updateDevice(index, "emoji", e.target.value)}
                />
                <button
                  onClick={() => deleteDevice(index)}
                  className="px-4 py-2 bg-red-600 text-white rounded-xl"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>

        <h2 className="text-xl font-semibold mt-12 mb-3">Add New Device</h2>
        <div className="flex gap-4 mb-6">
          <input
            className="flex-1 border p-2 rounded"
            placeholder="Device Name"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
          />

          <input
            className="w-24 border p-2 rounded"
            placeholder="Emoji"
            value={newEmoji}
            onChange={(e) => setNewEmoji(e.target.value)}
          />

          <button onClick={addDevice} className="px-4 py-2 bg-black text-white rounded-xl">
            Add
          </button>
        </div>

        <button
          onClick={saveChanges}
          className="w-full mt-10 bg-black text-white py-3 rounded-full font-semibold"
        >
          Save Changes
        </button>
      </div>
    </section>
  );
};

export default AdminDevices;