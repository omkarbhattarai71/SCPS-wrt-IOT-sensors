import { useAdminParkingLots } from "../../hooks/useAdminParkingLots";
import ParkingLotActions from "./ParkingLotActions";

const ParkingLotList = ({ onSelectLot, onAdd, onDelete, onManage }) => {
  const { parkingLots, loading } = useAdminParkingLots();
    return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h2>Parking Lots</h2>
        <button className="btn btn-success" onClick={onAdd}>
          + Add Parking Lot
        </button>
      </div>
      {loading ? (
        <p>Loading parking lots...</p>
      ) :
        parkingLots.length === 0 ? (
        <p>No parking lots available.</p>
      ) :
      (
        <ul className="list-group">
          {Array.isArray(parkingLots) && parkingLots.map((lot) => (
            <li key={lot.id} className="list-group-item d-flex justify-content-between align-items-center">
              <span onClick={() => onSelectLot(lot)} style={{ cursor: 'pointer', flex: 1 }}>
                {lot.name}
                <br />
                <small className="text-muted">{lot.address}</small>
              </span>
              <ParkingLotActions 
                parkingLot={lot}
                onDelete={onDelete}
                onManage={onManage}
              />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default ParkingLotList;