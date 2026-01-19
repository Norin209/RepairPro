// src/googlemaps.d.ts

// Declare the global Google namespace
declare namespace google {
    namespace maps {
      // Basic types for Map initialization
      interface LatLngLiteral {
        lat: number;
        lng: number;
      }
      interface LatLng {}
  
      // Map Class declaration (for new google.maps.Map)
      class Map {
        constructor(mapDiv: HTMLElement, opts?: MapOptions);
      }
      interface MapOptions {
        center?: LatLng | LatLngLiteral;
        zoom?: number;
        // Add other options as needed
      }
  
      // Marker Class declaration (for new google.maps.Marker)
      class Marker {
        constructor(opts?: MarkerOptions);
      }
      interface MarkerOptions {
        position?: LatLng | LatLngLiteral;
        map?: Map;
        title?: string;
        // Add other options as needed
      }
      
      // Add other services (like InfoWindow) if you need them later
    }
  }