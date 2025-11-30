import React from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import SearchField from "./SearchField";
import { DEFAULT_MAP_CENTER, DEFAULT_MAP_ZOOM } from "../../constants/parkingConstants";
import "leaflet/dist/leaflet.css";

const ParkingMap = ({ token, filteredSpots }) => {
  return (
    <MapContainer
      center={DEFAULT_MAP_CENTER}
      zoom={DEFAULT_MAP_ZOOM}
      style={{ height: "500px", marginTop: "20px" }}
    >
      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
      {token && <SearchField token={token} />}

      {token &&
        filteredSpots.map((spot) => (
          <Marker
            key={spot.spot_id}
            position={[
              51.505 + spot.spot_id * 0.001,
              -0.09 + spot.spot_id * 0.001,
            ]}
          >
            <Popup>
              Spot {spot.spot_id}: {spot.status}
            </Popup>
          </Marker>
        ))}
    </MapContainer>
  );
};

export default ParkingMap;
