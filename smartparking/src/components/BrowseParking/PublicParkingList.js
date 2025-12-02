import React from 'react';
import LiveOccupancyIndicator from '../common/LiveOccupancyIndicator';

const PublicParkingList = ({ parkingLots, loading, selectedLot, onSelectLot }) => {
  if (loading) {
    return (
      <div className="text-center py-4">
        <div className="spinner-border" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
        <p className="mt-2 text-muted">Finding parking lots...</p>
      </div>
    );
  }

  if (parkingLots.length === 0) {
    return (
      <div className="alert alert-info">
        <i className="bi bi-info-circle me-2"></i>
        No parking lots found. Try adjusting your filters.
      </div>
    );
  }

  return (
    <div>
      <h5 className="mb-3">
        <i className="bi bi-p-circle me-2"></i>
        Available Parking ({parkingLots.length})
      </h5>
      <ul className="list-group">
        {parkingLots.map((lot) => (
          <li
            key={lot.id}
            className={`list-group-item ${selectedLot?.id === lot.id ? 'active' : ''}`}
            onClick={() => onSelectLot(lot)}
            style={{ cursor: 'pointer' }}
          >
            <div className="d-flex justify-content-between align-items-start">
              <div className="flex-grow-1">
                <div className="d-flex align-items-center gap-2 mb-1">
                  <strong>{lot.name}</strong>
                  <span className="badge bg-info" style={{ fontSize: '0.7rem' }}>
                    <i className="bi bi-broadcast"></i> Live
                  </span>
                  {lot.distance !== undefined && lot.distance !== null && (
                    <span className={selectedLot?.id === lot.id ? 'text-white-50' : 'text-muted'} style={{ fontSize: '0.875rem' }}>
                      <i className="bi bi-compass me-1"></i>
                      {lot.distance.toFixed(2)} km
                    </span>
                  )}
                </div>
                <small className={selectedLot?.id === lot.id ? 'text-white-50' : 'text-muted'}>
                  <i className="bi bi-geo-alt me-1"></i>
                  {lot.address}
                </small>
                
                {lot.price_per_hour !== undefined && lot.price_per_hour !== null && (
                  <div className="mt-1">
                    <small className={selectedLot?.id === lot.id ? 'text-white' : 'text-success'}>
                      <i className="bi bi-currency-dollar me-1"></i>
                      {lot.price_per_hour} DKK/hour
                    </small>
                  </div>
                )}

                <div className="mt-2">
                  <LiveOccupancyIndicator
                    parkingLotId={lot.id}
                    totalSpots={lot.capacity}
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
    </div>
  );
};

export default PublicParkingList;
