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
              <div>
                {lot.name}
                <br />
                <small className={selectedLot?.id === lot.id ? 'text-white-50' : 'text-muted'}>
                  {lot.address}
                </small>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default ParkingLotList;