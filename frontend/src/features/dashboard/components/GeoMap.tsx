import { MapContainer, TileLayer, Marker, Popup, ZoomControl } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { mapMarkers, type MapMarker } from "@/features/dashboard/api/mockData";

const BALI_CENTER: [number, number] = [-8.4095, 115.1889];

function markerIcon(type: MapMarker["type"]) {
  const color = type === "illegal_dumping" ? "#ef4444" : "#16a34a";
  return L.divIcon({
    className: "",
    html: `<span style="display:block;width:14px;height:14px;border-radius:9999px;background:${color};border:2px solid white;box-shadow:0 0 0 1px rgba(0,0,0,0.1)"></span>`,
    iconSize: [14, 14],
    iconAnchor: [7, 7],
  });
}

export function GeoMap() {
  return (
    <div className="h-80 overflow-hidden rounded-lg">
      <MapContainer
        center={BALI_CENTER}
        zoom={9}
        zoomControl={false}
        scrollWheelZoom={false}
        className="h-full w-full"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <ZoomControl position="bottomright" />
        {mapMarkers.map((marker) => (
          <Marker key={marker.id} position={[marker.lat, marker.lng]} icon={markerIcon(marker.type)}>
            <Popup>{marker.label}</Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}
