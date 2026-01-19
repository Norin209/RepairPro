export interface Location {
  id: string;
  name: string;
  address: string;
  mapUrl: string;
  lat: number;
  lng: number;
  phone: string;
  hours: string;
  order?: number; // ✅ This optional field fixes your sorting error
}

export type DeviceName =
  | "iPhone"
  | "Android"
  | "Tablet / iPad"
  | "Computer"
  | "Apple Watch" // ⚠️ Note: Ensure your DB/App uses "Apple Watch" or "Smart Watch" consistently here
  | "Smart Watch" // I added this just in case your app uses "Smart Watch" in the code
  | "Game Console";

export interface RepairData {
  models: Record<DeviceName, string[]>;
  issues: string[];
  pricing: Record<DeviceName, Record<string, Record<string, number>>>;
}