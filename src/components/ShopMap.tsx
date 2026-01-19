// src/components/ShopMap.tsx

import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet'; 

// CORRECTED: Updated Interface to match RepairPage.tsx
interface Location {
  id: string; 
  name: string;
  address: string;
  mapUrl: string;
  lat: number;
  lng: number;
  // ADDED THESE TWO TO MATCH PARENT COMPONENT:
  phone: string;
  hours: string;
}

interface ShopMapProps {
  locations: Location[];
  onLocationSelect: (location: Location) => void; 
  activeCenter: [number, number] | null; 
}

// Helper component to force map view change when center prop changes
const ChangeView: React.FC<{ center: [number, number] | null; zoom: number }> = ({ center, zoom }) => {
  const map = useMap();
  useEffect(() => {
    if (center) {
      // Fly to the new coordinates smoothly
      map.flyTo(center, zoom);
    }
  }, [center, zoom, map]);
  return null;
};

// Custom Icon Definition
const customIcon = new L.Icon({
    iconUrl: 'https://cdn-icons-png.flaticon.com/512/684/684908.png', 
    iconSize: [35, 35],
    iconAnchor: [17, 33],
    popupAnchor: [0, -35]
});

// Component that renders the map
const ShopMapLeaflet: React.FC<ShopMapProps> = ({ locations, onLocationSelect, activeCenter }) => {
    
    // Default center for initial load (Melbourne CBD)
    const defaultCenter: [number, number] = [-37.8136, 144.9631]; 
    const defaultZoom = 11;
    
    return (
        <MapContainer 
            // Use default center for initial load, or activeCenter if set
            center={defaultCenter} 
            zoom={defaultZoom} 
            scrollWheelZoom={false} 
            // Setting a higher z-index to help prevent issues with other absolute elements
            style={{ width: '100%', height: '100%', borderRadius: '12px', zIndex: 1 }} 
        >
            {/* Component to handle map recentering */}
            <ChangeView center={activeCenter} zoom={defaultZoom} /> 

            {/* Base map tiles from OpenStreetMap */}
            <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution='© <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
            />

            {/* Loop through locations to add markers */}
            {locations.map((loc) => (
                <Marker 
                    key={loc.id} 
                    position={[loc.lat, loc.lng]} 
                    icon={customIcon}
                    eventHandlers={{
                        click: () => onLocationSelect(loc),
                    }}
                >
                    <Popup>
                        <strong className='text-black'>{loc.name}</strong>
                        <br />
                        <span className='text-sm'>{loc.address}</span>
                        <br/>
                        <button 
                            className="text-black font-semibold text-xs mt-2 p-1 border rounded"
                            onClick={() => onLocationSelect(loc)}
                        >
                            Select Shop
                        </button>
                    </Popup>
                </Marker>
            ))}
        </MapContainer>
    );
};

export default ShopMapLeaflet;