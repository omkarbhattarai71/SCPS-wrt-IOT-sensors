import React, { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, useMap } from "react-leaflet";
import { doc, onSnapshot } from 'firebase/firestore';
import { firestore } from '../../Firebase';
import L from "leaflet";
import { DEFAULT_MAP_CENTER, DEFAULT_MAP_ZOOM } from "../../constants/parkingConstants";
import "leaflet/dist/leaflet.css";
import "../Dashboard/ParkingMap.css";

// Fix for default marker icon
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
  iconUrl: require('leaflet/dist/images/marker-icon.png'),
  shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
});

// Helper function to get dollar sign indicator based on price
const getPriceIndicator = (price) => {
  if (!price || price === 0) return ''; // Free
  if (price <= 10) return '$';
  if (price <= 25) return '$$';
  if (price <= 50) return '$$$';
  return '$$$'; // Over 50 DKK
};

// Create custom marker icon with occupancy indicator
const createOccupancyMarkerIcon = (occupied, total, isSelected, pricePerHour) => {
  const percentage = total > 0 ? (occupied / total) * 100 : 0;
  const color = percentage > 80 ? '#dc3545' : percentage > 50 ? '#ffc107' : '#28a745';
  const selectedStyle = isSelected ? 'border: 3px solid #0d6efd; box-shadow: 0 0 15px rgba(13, 110, 253, 0.6);' : '';
  const size = isSelected ? 48 : 40;
  const priceIndicator = getPriceIndicator(pricePerHour);

  const html = `
    <div style="
      position: relative;
      width: ${size}px;
      height: ${size}px;
    ">
      ${priceIndicator ? `
        <div style="
          position: absolute;
          top: -20px;
          left: 50%;
          transform: translateX(-50%);
          background: rgba(0, 0, 0, 0.75);
          color: #FFD700;
          padding: 2px 6px;
          border-radius: 10px;
          font-size: ${isSelected ? '12px' : '10px'};
          font-weight: bold;
          white-space: nowrap;
          box-shadow: 0 2px 6px rgba(0,0,0,0.3);
        ">
          ${priceIndicator}
        </div>
      ` : ''}
      <div style="
        width: ${size}px;
        height: ${size}px;
        background: ${color};
        border-radius: 50% 50% 50% 0;
        transform: rotate(-45deg);
        ${selectedStyle}
        box-shadow: 0 3px 10px rgba(0,0,0,0.3);
        display: flex;
        align-items: center;
        justify-content: center;
      ">
        <div style="
          transform: rotate(45deg);
          color: white;
          font-weight: bold;
          font-size: ${isSelected ? '14px' : '12px'};
          text-shadow: 0 1px 2px rgba(0,0,0,0.3);
        ">
          ${total > 0 ? `${occupied}/${total}` : 'P'}
        </div>
      </div>
      <div style="
        position: absolute;
        bottom: -4px;
        left: 50%;
        transform: translateX(-50%);
        width: 0;
        height: 0;
        border-left: 4px solid transparent;
        border-right: 4px solid transparent;
        border-top: 6px solid ${color};
      "></div>
    </div>
  `;

  return L.divIcon({
    html: html,
    className: 'custom-marker-icon',
    iconSize: [size, size + 6],
    iconAnchor: [size / 2, size + 6],
    popupAnchor: [0, -(size + 6)]
  });
};

// Component to fit map bounds to markers
const FitBounds = ({ parkingLots }) => {
  const map = useMap();

  useEffect(() => {
    if (parkingLots && parkingLots.length > 0) {
      const bounds = L.latLngBounds(
        parkingLots.map(lot => [lot.location.latitude, lot.location.longitude])
      );
      map.fitBounds(bounds, { padding: [50, 50] });
    }
  }, [parkingLots, map]);

  return null;
};

// Component for individual marker with live occupancy
const LiveMarker = ({ lot, isSelected, onSelectLot }) => {
  const [occupiedCount, setOccupiedCount] = useState(0);

  useEffect(() => {
    let unsubscribeFirestore;

    // Subscribe to Firestore for occupancy
    const eventlistRef = doc(firestore, 'eventlists', String(lot.id));
    unsubscribeFirestore = onSnapshot(
      eventlistRef,
      (docSnapshot) => {
        if (docSnapshot.exists()) {
          const data = docSnapshot.data();
          const events = data.events || [];
          const latestEvent = events[events.length - 1];

          if (latestEvent) {
            const occupiedSpots = latestEvent.occupied_spots || [];
            setOccupiedCount(occupiedSpots.length);
          }
        }
      },
      (error) => {
        console.error(`Error listening to eventlist for lot ${lot.id}:`, error);
      }
    );

    return () => {
      if (unsubscribeFirestore) unsubscribeFirestore();
    };
  }, [lot.id]);

  // Use capacity from the lot object (already fetched in parking lots API)
  const total = lot.capacity || 0;
  const pricePerHour = lot.price_per_hour || 0;

  const markerIcon = createOccupancyMarkerIcon(
    occupiedCount,
    total,
    isSelected,
    pricePerHour
  );

  return (
    <Marker
      position={[lot.location.latitude, lot.location.longitude]}
      icon={markerIcon}
      eventHandlers={{
        click: () => onSelectLot(lot)
      }}
    />
  );
};

/**
 * Common ParkingMap component for displaying parking lots with live occupancy
 * 
 * @param {Array} parkingLots - Array of parking lot objects (must include capacity field)
 * @param {Object} selectedLot - Currently selected parking lot
 * @param {Function} onSelectLot - Callback when a parking lot is selected
 * @param {Object} style - Additional styles for the map container
 */
const ParkingMapCommon = ({
  parkingLots,
  selectedLot,
  onSelectLot,
  style = {}
}) => {
  const defaultStyle = {
    height: "100%",
    width: "100%",
    ...style
  };

  return (
    <MapContainer
      center={DEFAULT_MAP_CENTER}
      zoom={DEFAULT_MAP_ZOOM}
      style={defaultStyle}
    >
      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
      <FitBounds parkingLots={parkingLots} />
      {parkingLots.map((lot) => (
        <LiveMarker
          key={lot.id}
          lot={lot}
          isSelected={selectedLot?.id === lot.id}
          onSelectLot={onSelectLot}
        />
      ))}
    </MapContainer>
  );
};

export default ParkingMapCommon;
