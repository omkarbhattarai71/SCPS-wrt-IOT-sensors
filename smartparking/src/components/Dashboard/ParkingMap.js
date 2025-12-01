import React from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import { DEFAULT_MAP_CENTER, DEFAULT_MAP_ZOOM } from "../../constants/parkingConstants";
import "leaflet/dist/leaflet.css";

// Fix for default marker icon
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
  iconUrl: require('leaflet/dist/images/marker-icon.png'),
  shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
});

const ParkingMap = ({ token, parkingLots }) => {
  return (
    <MapContainer
      center={DEFAULT_MAP_CENTER}
      zoom={DEFAULT_MAP_ZOOM}
      style={{ height: "500px", marginTop: "20px" }}
    >
      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
      {token &&
        parkingLots.map((lot) => (
          <Marker
            key={lot.id}
            position={[lot.location.latitude, lot.location.longitude]}
          >
            <Popup>
              <strong>{lot.name}</strong><br />
              {lot.address}
            </Popup>
          </Marker>
        ))}
    </MapContainer>
  );
};

export default ParkingMap;
