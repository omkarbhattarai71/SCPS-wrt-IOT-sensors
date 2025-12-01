import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

const ManageParkingLot = ({ selectedLot, onUpdate, onDelete }) => {
  const [formData, setFormData] = useState({
    name: '',
    address: ''
  });

  useEffect(() => {
    if (selectedLot) {
      setFormData({
        name: selectedLot.name || '',
        address: selectedLot.address || ''
      });
    }
  }, [selectedLot]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleUpdate = (e) => {
    e.preventDefault();
    if (selectedLot) {
      onUpdate(selectedLot.id, formData);
    }
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
      style={{ height: "100%" }}
    >
      <div className="card-header bg-primary text-white">
        <h5 className="mb-0">Manage Parking Lot</h5>
      </div>
      <div className="card-body">
        <form onSubmit={handleUpdate}>
          <div className="mb-3">
            <label htmlFor="name" className="form-label">
              Name
            </label>
            <input
              type="text"
              className="form-control"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
            />
          </div>

          <div className="mb-3">
            <label htmlFor="address" className="form-label">
              Address
            </label>
            <input
              type="text"
              className="form-control"
              id="address"
              name="address"
              value={formData.address}
              onChange={handleChange}
              required
            />
          </div>

          <div className="d-flex gap-2">
            <button type="submit" className="btn btn-primary flex-grow-1">
              Update
            </button>
            <button 
              type="button" 
              className="btn btn-danger"
              onClick={handleDelete}
            >
              Delete
            </button>
          </div>
        </form>
      </div>
    </motion.div>
  );
};

export default ManageParkingLot;
