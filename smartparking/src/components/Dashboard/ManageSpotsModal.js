import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';

const ManageSpotsModal = ({ show, onClose, parkingLot }) => {
  const [spots, setSpots] = useState([]);
  const [loading, setLoading] = useState(false);
  const { token } = useAuth();
  const { showError, showSuccess } = useNotification();

  useEffect(() => {
    if (show && parkingLot) {
      fetchSpots();
    }
  }, [show, parkingLot]);

  const fetchSpots = async () => {
    setLoading(true);
    try {
      const response = await fetch(
        `${process.env.REACT_APP_API_URL}/cadmin/parking-spots/?parking_lot_id=${parkingLot.id}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          },
        }
      );

      if (!response.ok) {
        throw new Error('Failed to fetch parking spots');
      }

      const data = await response.json();
      setSpots(data);
    } catch (error) {
      showError(error.message || 'Failed to load parking spots');
      console.error('Error fetching spots:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddSpot = async () => {
    try {
      const response = await fetch(
        `${process.env.REACT_APP_API_URL}/cadmin/parking-spots/`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            parking_lot_id: parkingLot.id
          })
        }
      );

      if (!response.ok) {
        throw new Error('Failed to add parking spot');
      }

      showSuccess('Parking spot added successfully!');
      fetchSpots();
    } catch (error) {
      showError(error.message || 'Failed to add parking spot');
      console.error('Error adding spot:', error);
    }
  };

  const handleDeleteSpot = async (spotId) => {
    if (!window.confirm('Are you sure you want to delete this parking spot?')) {
      return;
    }

    try {
      const response = await fetch(
        `${process.env.REACT_APP_API_URL}/cadmin/parking-spots/`,
        {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ id: spotId })
        }
      );

      if (!response.ok) {
        throw new Error('Failed to delete parking spot');
      }

      showSuccess('Parking spot deleted successfully!');
      fetchSpots();
    } catch (error) {
      showError(error.message || 'Failed to delete parking spot');
      console.error('Error deleting spot:', error);
    }
  };

  if (!show) return null;

  return (
    <AnimatePresence>
      <div
        className="modal show d-block"
        style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}
        onClick={onClose}
      >
        <motion.div
          className="modal-dialog modal-lg modal-dialog-centered"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">
                Manage Spots - {parkingLot?.name}
              </h5>
              <button
                type="button"
                className="btn-close"
                onClick={onClose}
                aria-label="Close"
              ></button>
            </div>
            <div className="modal-body">
              {loading ? (
                <div className="text-center py-4">
                  <div className="spinner-border" role="status">
                    <span className="visually-hidden">Loading...</span>
                  </div>
                </div>
              ) : (
                <>
                  <div className="d-flex justify-content-between align-items-center mb-3">
                    <h6 className="mb-0">
                      Total Spots: {spots.length}
                    </h6>
                    <button
                      className="btn btn-primary btn-sm"
                      onClick={handleAddSpot}
                    >
                      + Add Spot
                    </button>
                  </div>

                  {spots.length === 0 ? (
                    <div className="alert alert-info">
                      No parking spots found. Click "Add Spot" to create one.
                    </div>
                  ) : (
                    <div className="list-group">
                      {spots.map((spot) => (
                        <div
                          key={spot.id}
                          className="list-group-item d-flex justify-content-between align-items-center"
                        >
                          <div>
                            <strong>Spot #{spot.spot_number || spot.id}</strong>
                            <span className="ms-3">
                              <span
                                className={`badge ${
                                  spot.is_occupied
                                    ? 'bg-danger'
                                    : 'bg-success'
                                }`}
                              >
                                {spot.is_occupied ? 'Occupied' : 'Available'}
                              </span>
                            </span>
                          </div>
                          <button
                            className="btn btn-sm btn-outline-danger"
                            onClick={() => handleDeleteSpot(spot.id)}
                          >
                            Delete
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </>
              )}
            </div>
            <div className="modal-footer">
              <button
                type="button"
                className="btn btn-secondary"
                onClick={onClose}
              >
                Close
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default ManageSpotsModal;
