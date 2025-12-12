import React, { useState } from 'react';
import { motion } from 'framer-motion';
import ManageSpotsModal from './ManageSpotsModal';

const ManageParkingLot = ({ selectedLot, onUpdate, onDelete }) => {
  const [showSpotsModal, setShowSpotsModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editedPrice, setEditedPrice] = useState('');
  const [errors, setErrors] = useState({});

  // Update editedPrice when selectedLot changes
  React.useEffect(() => {
    if (selectedLot) {
      setEditedPrice(selectedLot.price_per_hour || '');
      setIsEditing(false);
      setErrors({});
    }
  }, [selectedLot]);

  const handleChange = (e) => {
    setEditedPrice(e.target.value);
    // Clear error when user starts typing
    if (errors.price) {
      setErrors({});
    }
  };

  const validate = () => {
    const newErrors = {};

    if (!editedPrice.toString().trim()) {
      newErrors.price = 'Price is required';
    } else if (isNaN(editedPrice) || parseFloat(editedPrice) < 0) {
      newErrors.price = 'Price must be a valid non-negative number';
    }

    return newErrors;
  };

  const handleUpdate = () => {
    const newErrors = validate();

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    const updates = {
      price_per_hour: parseFloat(editedPrice)
    };

    onUpdate(selectedLot.id, updates);
    setIsEditing(false);
  };

  const handleCancelEdit = () => {
    setEditedPrice(selectedLot.price_per_hour || '');
    setErrors({});
    setIsEditing(false);
  };

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
      style={{ height: "100%", display: "flex", flexDirection: "column" }}
    >
      <div className="card-header bg-primary text-white">
        <h5 className="mb-0">Manage Parking Lot</h5>
      </div>
      <div className="card-body" style={{
        overflowY: "auto",
        maxHeight: "calc(100vh - 400px)",
        flex: "1"
      }}>
        <div className="mb-2">
          <label className="form-label fw-bold mb-0 small">Name</label>
          <p className="mb-0" style={{ wordBreak: 'break-word', overflowWrap: 'break-word' }}>
            {selectedLot.name}
          </p>
        </div>

        <div className="mb-2">
          <label className="form-label fw-bold mb-0 small">Address</label>
          <p className="mb-0 small" style={{ wordBreak: 'break-word', overflowWrap: 'break-word' }}>
            {selectedLot.address}
          </p>
        </div>

        <div className="mb-2">
          <label className="form-label fw-bold mb-0 small">Price per Hour</label>
          {isEditing ? (
            <input
              type="number"
              step="0.01"
              min="0"
              className={`form-control form-control-sm ${errors.price ? 'is-invalid' : ''}`}
              name="price"
              value={editedPrice}
              onChange={handleChange}
            />
          ) : (
            <p className="mb-0">
              {selectedLot.price_per_hour && selectedLot.price_per_hour > 0
                ? `${parseFloat(selectedLot.price_per_hour).toFixed(2)} DKK`
                : 'Free'}
            </p>
          )}
          {errors.price && <div className="invalid-feedback d-block">{errors.price}</div>}
        </div>

        <div className="mb-3">
          <label className="form-label fw-bold mb-0 small">Location</label>
          <p className="mb-0 small text-muted" style={{ wordBreak: 'break-all', fontSize: '0.75rem' }}>
            {selectedLot.location?.latitude}, {selectedLot.location?.longitude}
          </p>
        </div>

        <div className="mb-3">
          <button
            type="button"
            className="btn btn-sm btn-info w-100"
            onClick={() => setShowSpotsModal(true)}
            disabled={isEditing}
          >
            Manage Spots
          </button>
        </div>

        <div className="d-flex gap-2">
          {isEditing ? (
            <>
              <button
                type="button"
                className="btn btn-sm btn-success flex-grow-1"
                onClick={handleUpdate}
              >
                Save
              </button>
              <button
                type="button"
                className="btn btn-sm btn-secondary"
                onClick={handleCancelEdit}
              >
                Cancel
              </button>
            </>
          ) : (
            <>
              <button
                type="button"
                className="btn btn-sm btn-primary flex-grow-1"
                onClick={() => setIsEditing(true)}
              >
                Edit
              </button>
              <button
                type="button"
                className="btn btn-sm btn-danger"
                onClick={handleDelete}
              >
                Delete
              </button>
            </>
          )}
        </div>
      </div>

      <ManageSpotsModal
        show={showSpotsModal}
        onClose={() => setShowSpotsModal(false)}
        parkingLot={selectedLot}
      />
    </motion.div>
  );
};

export default ManageParkingLot;
