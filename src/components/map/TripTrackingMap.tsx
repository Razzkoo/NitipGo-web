import { useEffect, useRef, useMemo, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from "react-leaflet";
import L from "leaflet";

// Fix leaflet default icon
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

const travelerIcon = L.divIcon({
  className: "",
  iconSize: [40, 40],
  iconAnchor: [20, 20],
  popupAnchor: [0, -24],
  html: `
    <div style="
      width: 40px; height: 40px;
      background: #10b981;
      border-radius: 50%;
      display: flex; align-items: center; justify-content: center;
      box-shadow: 0 2px 8px rgba(16,185,129,0.4), 0 0 0 3px white;
      animation: pulse-ring 2s ease-out infinite;
    ">
      <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M14 18V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v11a1 1 0 0 0 1 1h2"/>
        <path d="M15 18h2a1 1 0 0 0 1-1v-3.65a1 1 0 0 0-.22-.624l-3.48-4.35A1 1 0 0 0 13.52 9H14"/>
        <circle cx="17" cy="18" r="2"/>
        <circle cx="7" cy="18" r="2"/>
      </svg>
    </div>
    <style>
      @keyframes pulse-ring {
        0% { box-shadow: 0 2px 8px rgba(16,185,129,0.4), 0 0 0 3px white; }
        70% { box-shadow: 0 2px 8px rgba(16,185,129,0.4), 0 0 0 8px rgba(16,185,129,0); }
        100% { box-shadow: 0 2px 8px rgba(16,185,129,0.4), 0 0 0 3px white; }
      }
    </style>
  `,
});

interface TrackingPoint {
  latitude: number;
  longitude: number;
  recorded_at: string;
}

interface TripTrackingMapProps {
  route: TrackingPoint[];
  latest: TrackingPoint | null;
  isTracking: boolean;
  travelerName?: string;
}

function isValidCoord(lat: number, lng: number): boolean {
  return (
    Number.isFinite(lat) &&
    Number.isFinite(lng) &&
    lat !== 0 &&
    lng !== 0 &&
    lat >= -90 &&
    lat <= 90 &&
    lng >= -180 &&
    lng <= 180
  );
}

// Komponen untuk update view tanpa remount MapContainer
function MapController({ latest, center }: { latest: [number, number] | null; center: [number, number] }) {
  const map = useMap();
  const hasSetInitial = useRef(false);

  // Invalidate size setelah mount
  useEffect(() => {
    const timer = setTimeout(() => {
      map.invalidateSize();
    }, 300);
    return () => clearTimeout(timer);
  }, [map]);

  // Set initial view
  useEffect(() => {
    if (!hasSetInitial.current) {
      map.setView(center, 14);
      hasSetInitial.current = true;
    }
  }, [center, map]);

  // Follow latest position
  useEffect(() => {
    if (latest && isValidCoord(latest[0], latest[1])) {
      map.setView(latest, map.getZoom(), { animate: true });
    }
  }, [latest, map]);

  return null;
}

export default function TripTrackingMap({ route, latest, isTracking, travelerName }: TripTrackingMapProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // Delay render to avoid hydration issues
    const timer = setTimeout(() => setMounted(true), 100);
    return () => clearTimeout(timer);
  }, []);

  const validRoute = useMemo(
    () => route.filter((p) => isValidCoord(p.latitude, p.longitude)),
    [route]
  );

  const defaultCenter: [number, number] = [-7.25, 112.75]; // Surabaya

  const center: [number, number] =
    latest && isValidCoord(latest.latitude, latest.longitude)
      ? [latest.latitude, latest.longitude]
      : validRoute.length > 0
      ? [validRoute[0].latitude, validRoute[0].longitude]
      : defaultCenter;

  const polylinePositions: [number, number][] = validRoute.map((p) => [p.latitude, p.longitude]);

  const latestPosition: [number, number] | null =
    latest && isValidCoord(latest.latitude, latest.longitude)
      ? [latest.latitude, latest.longitude]
      : null;

  if (!mounted) {
    return <div className="h-[400px] rounded-xl bg-muted animate-pulse" />;
  }

  return (
    <div className="rounded-xl overflow-hidden border border-zinc-200" style={{ height: 400 }}>
      <MapContainer
        center={defaultCenter}
        zoom={14}
        style={{ height: "100%", width: "100%" }}
        scrollWheelZoom
      >
        <MapController center={center} latest={latestPosition} />

        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* Polyline rute */}
        {polylinePositions.length > 1 && (
          <Polyline positions={polylinePositions} color="#10b981" weight={4} opacity={0.8} />
        )}

        {/* Marker posisi terakhir */}
        {latestPosition && (
          <Marker position={latestPosition} icon={travelerIcon}>
            <Popup>
              <div className="text-sm">
                <p className="font-semibold">{travelerName ?? "Traveler"}</p>
                <p className="text-xs text-gray-500">
                  {isTracking ? "Sedang dalam perjalanan" : "Tracking selesai"}
                </p>
                {latest && (
                  <p className="text-xs text-gray-400 mt-1">
                    Update: {new Date(latest.recorded_at).toLocaleTimeString("id-ID")}
                  </p>
                )}
              </div>
            </Popup>
          </Marker>
        )}
      </MapContainer>
    </div>
  );
}