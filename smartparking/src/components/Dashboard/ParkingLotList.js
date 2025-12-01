import React from 'react';
import LiveOccupancyIndicator from '../common/LiveOccupancyIndicator';

const ParkingLotList = ({ parkingLots, loading, selectedLot, onSelectLot, onAdd }) => {
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
            <li 
              key={lot.id} 
              className={`list-group-item ${selectedLot?.id === lot.id ? 'active' : ''}`}
              onClick={() => onSelectLot(lot)}
              style={{ cursor: 'pointer' }}
            >
              <div className="d-flex justify-content-between align-items-start">
                <div className="flex-grow-1">
                  <div className="d-flex align-items-center gap-2">
                    <strong>{lot.name}</strong>
                    <span className="badge bg-info" style={{ fontSize: '0.7rem' }}>
                      <i className="bi bi-broadcast"></i> Live
                    </span>
                  </div>
                  <small className={selectedLot?.id === lot.id ? 'text-white-50' : 'text-muted'}>
                    {lot.address}
                  </small>
                  <div className="mt-2">
                    <LiveOccupancyIndicator 
                      parkingLotId={lot.id}
                      variant="full"
                      showLiveBadge={false}
                      showPercentage={true}
                      isActive={selectedLot?.id === lot.id}
                    />
                  </div>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default ParkingLotList;