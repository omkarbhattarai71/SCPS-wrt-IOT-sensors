import React from 'react';
import { motion } from 'framer-motion';

const ManageParkingLot = ({ selectedLot, onUpdate, onDelete }) => {
  const handleDelete = () => {
    if (selectedLot && window.confirm(`Are you sure you want to delete "${selectedLot.name}"?`)) {
      onDelete(selectedLot);
    }
  };

  if (!selectedLot) {
    return (
      <div className="card" style={{ height: "100%" }}>
        <div className="card-body d-flex align-items-center justify-content-center">
          <p className="text-muted mb-0">Select a parking lot to manage</p>
        </div>
      </div>
    );
  }

  return (
    <motion.div 
      className="card"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      style={{ height: "100%" }}
    >
      <div className="card-header bg-primary text-white">
        <h5 className="mb-0">Manage Parking Lot</h5>
      </div>
      <div className="card-body">
        <div className="mb-2">
          <label className="form-label fw-bold mb-0 small">Name</label>
          <p className="mb-0">{selectedLot.name}</p>
        </div>

        <div className="mb-2">
          <label className="form-label fw-bold mb-0 small">Address</label>
          <p className="mb-0">{selectedLot.address}</p>
        </div>

        <div className="mb-3">
          <label className="form-label fw-bold mb-0 small">Location</label>
          <p className="mb-0 small text-muted">
            {selectedLot.location?.latitude}, {selectedLot.location?.longitude}
          </p>
        </div>

        <div className="d-flex gap-2">
          <button 
            type="button" 
            className="btn btn-sm btn-primary flex-grow-1"
            onClick={() => onUpdate && onUpdate(selectedLot.id, {})}
            disabled
          >
            Update
          </button>
          <button 
            type="button" 
            className="btn btn-sm btn-danger"
            onClick={handleDelete}
          >
            Delete
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export default ManageParkingLot;
