import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';

const ManageSpotsModal = ({ show, onClose, parkingLot }) => {
  const [spots, setSpots] = useState([]);
  const [loading, setLoading] = useState(false);
  const [newAuthCode, setNewAuthCode] = useState(null);
  const [showAuthCodeModal, setShowAuthCodeModal] = useState(false);
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

      const data = await response.json();
      
      // Show the auth code modal with the full token
      if (data.parking_spot?.auth_code) {
        setNewAuthCode(data.parking_spot.auth_code);
        setShowAuthCodeModal(true);
      }
      
      showSuccess('Parking spot added successfully!');
      fetchSpots();
    } catch (error) {
      showError(error.message || 'Failed to add parking spot');
      console.error('Error adding spot:', error);
    }
  };

  const handleCopyAuthCode = () => {
    if (newAuthCode) {
      navigator.clipboard.writeText(newAuthCode);
      showSuccess('Auth code copied to clipboard!');
    }
  };

  const handleCloseAuthCodeModal = () => {
    setShowAuthCodeModal(false);
    setNewAuthCode(null);
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
      {/* Auth Code Display Modal */}
      {showAuthCodeModal && newAuthCode && (
        <div
          key="auth-code-modal"
          className="modal show d-block"
          style={{ backgroundColor: 'rgba(0,0,0,0.7)', zIndex: 1060 }}
          onClick={handleCloseAuthCodeModal}
        >
          <motion.div
            className="modal-dialog modal-dialog-centered"
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-content border-warning" style={{ borderWidth: '3px' }}>
              <div className="modal-header bg-warning">
                <h5 className="modal-title">
                  <i className="bi bi-exclamation-triangle-fill me-2"></i>
                  Save Authentication Code
                </h5>
              </div>
              <div className="modal-body">
                <div className="alert alert-warning mb-3">
                  <strong>⚠️ Important:</strong> This authentication code will only be shown once. 
                  Make sure to copy and save it securely before closing this window.
                </div>
                <div className="mb-3">
                  <label className="form-label fw-bold">Authentication Code:</label>
                  <div className="input-group">
                    <input
                      type="text"
                      className="form-control font-monospace"
                      value={newAuthCode}
                      readOnly
                      style={{ fontSize: '0.9rem' }}
                    />
                    <button
                      className="btn btn-outline-primary"
                      type="button"
                      onClick={handleCopyAuthCode}
                    >
                      <i className="bi bi-clipboard"></i> Copy
                    </button>
                  </div>
                </div>
                <p className="text-muted small mb-0">
                  <i className="bi bi-info-circle me-1"></i>
                  This code is used by IoT sensors to authenticate and send parking spot status updates.
                </p>
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={handleCloseAuthCodeModal}
                >
                  I've Saved the Code
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}

      {/* Main Manage Spots Modal */}
      <div
        key="manage-spots-modal"
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
                            <strong>{spot.auth_code_prefix}...</strong>
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
