import React from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import { DEFAULT_MAP_CENTER, DEFAULT_MAP_ZOOM } from "../../constants/parkingConstants";
import "leaflet/dist/leaflet.css";

const ParkingMap = ({ token, spots }) => {
  return (
    <MapContainer
      center={DEFAULT_MAP_CENTER}
      zoom={DEFAULT_MAP_ZOOM}
      style={{ height: "500px", marginTop: "20px" }}
    >
      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
      {token &&
        spots.map((spot) => (
          <Marker
            key={spot.spot_id}
            position={[spot.latitude, spot.longitude]}
          >
            <Popup>
              <strong>Spot ID:</strong> {spot.spot_id}<br />
            </Popup>
          </Marker>
        ))}
    </MapContainer>
  );
};

export default ParkingMap;
