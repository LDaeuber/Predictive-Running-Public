"use client";

import { useState } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Polyline,
  useMapEvents,
} from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import {
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
  Button,
} from "@heroui/react";

delete (L.Icon.Default.prototype as any)._getIconUrl;

L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

const ORS_API_KEY =
  "eyJvcmciOiI1YjNjZTM1OTc4NTExMTAwMDFjZjYyNDgiLCJpZCI6IjQ3MmQ3YmEwOGNhYTQxODNiOTc4NmIyMjg3NWE5YmYzIiwiaCI6Im11cm11cjY0In0=";

interface ORSResponse {
  features: Array<{
    geometry: {
      coordinates: [number, number, number?][];
    };
    properties: {
      summary: {
        distance: number;
      };
      extras: {
        elevation: {
          values: [number, number, number][];
        };
      };
    };
  }>;
}

type Point = { lat: number; lng: number };
export type Route = {
  path: [number, number][];
  distance: number;
  distanceDisplay: string;
  minElevation: number;
  maxElevation: number;
};

function MapClickHandler({
  onMapClick,
}: {
  onMapClick: (point: Point) => void;
}) {
  useMapEvents({
    click(e) {
      onMapClick(e.latlng);
    },
  });
  return null;
}

interface RouteTrackerMapProps {
  onShowRuns: () => void;
  onShowStats: () => void;
  onPredict: (route: Route) => void;
}

export default function RouteTrackerMap({
  onShowRuns,
  onShowStats,
  onPredict,
}: RouteTrackerMapProps) {
  const [startPoint, setStartPoint] = useState<Point | null>(null);
  const [endPoint, setEndPoint] = useState<Point | null>(null);
  const [route, setRoute] = useState<Route | null>(null);

  const handleMapClick = (clickedPoint: Point) => {
    if (!startPoint) {
      setStartPoint(clickedPoint);
    } else if (!endPoint) {
      setEndPoint(clickedPoint);
      calculateRoute(startPoint!, clickedPoint);
    }
  };

  const calculateRoute = async (a: Point, b: Point) => {
    const coords = [
      [a.lng, a.lat],
      [b.lng, b.lat],
    ];

    try {
      const response = await fetch(
        "https://api.openrouteservice.org/v2/directions/foot-walking/geojson",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${ORS_API_KEY}`,
          },
          body: JSON.stringify({
            coordinates: coords,
            elevation: true,
          }),
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Fehlerantwort von ORS:", errorText);
        throw new Error("Fehler bei der Routen-Abfrage");
      }

      const data: ORSResponse = await response.json();
      const feature = data.features[0];

      const distanceInMeters = feature.properties.summary.distance;
      const distanceInKm = (distanceInMeters / 1000).toFixed(2);

      const hoehen = feature.geometry.coordinates
        .map((p) => p[2])
        .filter((h): h is number => typeof h === "number");

      let minHoehe = 0;
      let maxHoehe = 0;

      if (hoehen.length > 0) {
        minHoehe = Math.min(...hoehen);
        maxHoehe = Math.max(...hoehen);
      }

      const path: [number, number][] = feature.geometry.coordinates.map((p) => [
        p[1],
        p[0],
      ]);

      setRoute({
        path: feature.geometry.coordinates.map((p) => [p[1], p[0]]),
        distance: distanceInMeters,
        distanceDisplay: `${distanceInKm} km`,
        minElevation: minHoehe,
        maxElevation: maxHoehe,
      });

      setStartPoint(null);
      setEndPoint(null);
    } catch (err) {
      console.error(err);
      alert("Route konnte nicht berechnet werden.");
      reset();
    }
  };

  const reset = () => {
    setStartPoint(null);
    setEndPoint(null);
    setRoute(null);
  };

  const handlePredictClick = () => {
    if (!route) {
      alert("Bitte wählen Sie zuerst eine Route auf der Karte aus.");
      return;
    }
    onPredict(route);
  };

  return (
    <div className="w-full h-full flex flex-col">
      <div className="relative p-4 bg-[#121212] text-zinc-50 grid grid-cols-3 gap-4 items-center">
        <div>
          <strong>Distance: </strong>
          <span className="text-[#9B5DE0]">
            {route?.distanceDisplay ?? "-"}
          </span>
        </div>

        <div>
          <strong>Min. Height: </strong>
          <span className="text-[#9B5DE0]">
            {route ? `${route.minElevation.toFixed(2)} m` : "-"}
          </span>
        </div>

        <div>
          <strong>Max. Height: </strong>
          <span className="text-[#9B5DE0]">
            {route ? `${route.maxElevation.toFixed(2)} m` : "-"}
          </span>
        </div>

        <Button
          onClick={handlePredictClick}
          className="absolute right-4 top-1/2 -translate-y-1/2 px-6 py-2 bg-[#62109F] text-white rounded-lg font-bold text-sm"
          variant="shadow"
        >
          Predict
        </Button>
      </div>

      <div className="w-full flex-1 rounded-lg overflow-hidden relative">
        <MapContainer
          center={[49.4883, 8.4647]}
          zoom={11}
          className="w-full h-full"
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          />

          <MapClickHandler onMapClick={handleMapClick} />
          {startPoint && <Marker position={startPoint} />}
          {endPoint && <Marker position={endPoint} />}
          {route && <Polyline positions={route.path} color="blue" />}
        </MapContainer>

        <Dropdown backdrop="blur" placement="top-end">
          <DropdownTrigger>
            <Button
              className="absolute bottom-16 right-4 z-[1000] px-6 py-2 bg-[#62109F] text-white rounded-lg font-bold text-sm"
              variant="shadow"
            >
              Menu
            </Button>
          </DropdownTrigger>
          <DropdownMenu
            aria-label="Menu Actions"
            classNames={{
              base: "w-48 bg-[#1f1f1f] rounded shadow-lg p-0",
              list: "p-0",
            }}
            variant="shadow"
          >
            <DropdownItem
              onClick={onShowStats}
              key="diagram"
              className="text-[#9B5DE0] py-1.5 px-4 hover:bg-[#2c2c2c]"
            >
              Activity Diagram
            </DropdownItem>
            <DropdownItem
              onClick={onShowRuns}
              key="activities"
              className="text-[#9B5DE0] py-1.5 px-4 hover:bg-[#2c2c2c]"
            >
              All Activities
            </DropdownItem>
          </DropdownMenu>
        </Dropdown>

        <Button
          onClick={reset}
          className="absolute bottom-4 right-4 z-[1000] px-6 py-2 bg-[#62109F] text-white rounded-lg font-bold text-sm"
          variant="shadow"
        >
          Reset
        </Button>
      </div>
    </div>
  );
}
