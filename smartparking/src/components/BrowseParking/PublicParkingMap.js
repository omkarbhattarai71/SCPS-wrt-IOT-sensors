import React from "react";
import ParkingMapCommon from "../common/ParkingMapCommon";

const PublicParkingMap = ({ parkingLots, selectedLot, onSelectLot }) => {
  return (
    <ParkingMapCommon
      parkingLots={parkingLots}
      selectedLot={selectedLot}
      onSelectLot={onSelectLot}
      style={{ height: "100%", width: "100%", borderRadius: "8px" }}
    />
  );
};

export default PublicParkingMap;

