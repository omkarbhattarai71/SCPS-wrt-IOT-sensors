import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { OpenStreetMapProvider } from 'leaflet-geosearch';

const AddParkingLotModal = ({ show, onClose, onSubmit }) => {
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    price: ''
  });

  const [errors, setErrors] = useState({});
  const [isGeocoding, setIsGeocoding] = useState(false);

  const provider = new OpenStreetMapProvider();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validate = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }

    if (!formData.address.trim()) {
      newErrors.address = 'Address is required';
    }

    if (!formData.price.trim()) {
      newErrors.price = 'Price is required';
    } else if (isNaN(formData.price) || parseFloat(formData.price) < 0) {
      newErrors.price = 'Price must be a valid non-negative number';
    }

    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newErrors = validate();

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsGeocoding(true);

    try {
      // Geocode the address to get coordinates
      const results = await provider.search({ query: formData.address });

      if (results.length === 0) {
        setErrors({ address: 'Could not find coordinates for this address. Please check and try again.' });
        setIsGeocoding(false);
        return;
      }

      // Use the first result
      const { y: latitude, x: longitude } = results[0];

      const submitData = {
        name: formData.name,
        address: results[0].label,
        latitude: latitude,
        longitude: longitude,
        price_per_hour: parseFloat(formData.price)
      };

      onSubmit(submitData);
      handleClose();
    } catch (error) {
      setErrors({ address: 'Failed to geocode address. Please try again.' });
      console.error('Geocoding error:', error);
    } finally {
      setIsGeocoding(false);
    }
  };

  const handleClose = () => {
    setFormData({
      name: '',
      address: '',
      price: ''
    });
    setErrors({});
    setIsGeocoding(false);
    onClose();
  };

  if (!show) return null;

  return (
    <div
      className="modal show d-block"
      style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}
      onClick={handleClose}
    >
      <motion.div
        className="modal-dialog modal-dialog-centered"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">Add New Parking Lot</h5>
            <button
              type="button"
              className="btn-close"
              onClick={handleClose}
            ></button>
          </div>
          <form onSubmit={handleSubmit}>
            <div className="modal-body">
              <div className="mb-3">
                <label htmlFor="name" className="form-label">
                  Name <span className="text-danger">*</span>
                </label>
                <input
                  type="text"
                  className={`form-control ${errors.name ? 'is-invalid' : ''}`}
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="e.g., Central Park Lot"
                />
                {errors.name && <div className="invalid-feedback">{errors.name}</div>}
              </div>

              <div className="mb-3">
                <label htmlFor="address" className="form-label">
                  Address <span className="text-danger">*</span>
                </label>
                <input
                  type="text"
                  className={`form-control ${errors.address ? 'is-invalid' : ''}`}
                  id="address"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  placeholder="e.g., 123 Main St, New York, NY, USA"
                />
                {errors.address && <div className="invalid-feedback">{errors.address}</div>}
                <small className="text-muted">
                  Coordinates will be automatically determined from the address
                </small>
              </div>

              <div className="mb-3">
                <label htmlFor="price" className="form-label">
                  Price per Hour ($) <span className="text-danger">*</span>
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  className={`form-control ${errors.price ? 'is-invalid' : ''}`}
                  id="price"
                  name="price"
                  value={formData.price}
                  onChange={handleChange}
                  placeholder="e.g., 5.00"
                />
                {errors.price && <div className="invalid-feedback">{errors.price}</div>}
              </div>
            </div>
            <div className="modal-footer">
              <button
                type="button"
                className="btn btn-secondary"
                onClick={handleClose}
                disabled={isGeocoding}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn btn-success"
                disabled={isGeocoding}
              >
                {isGeocoding ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                    Finding Location...
                  </>
                ) : (
                  'Add Parking Lot'
                )}
              </button>
            </div>
          </form>
        </div>
      </motion.div>
    </div>
  );
};

export default AddParkingLotModal;
