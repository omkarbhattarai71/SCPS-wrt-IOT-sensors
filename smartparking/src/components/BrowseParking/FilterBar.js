import React, { useState } from 'react';
import { motion } from 'framer-motion';

const FilterBar = ({ filters, onFilterChange }) => {
  const [showFilters, setShowFilters] = useState(false);
  const [tempFilters, setTempFilters] = useState({
    maxDistance: '',
    maxPrice: '',
    sortBy: filters.sortBy || 'distance'
  });

  const handleApplyFilters = () => {
    onFilterChange({
      maxDistance: tempFilters.maxDistance ? parseFloat(tempFilters.maxDistance) : null,
      maxPrice: tempFilters.maxPrice ? parseFloat(tempFilters.maxPrice) : null,
      sortBy: tempFilters.sortBy
    });
    setShowFilters(false);
  };

  const handleClearFilters = () => {
    setTempFilters({
      maxDistance: '',
      maxPrice: '',
      sortBy: 'distance'
    });
    onFilterChange({
      maxDistance: null,
      maxPrice: null,
      sortBy: 'distance'
    });
  };

  const activeFilterCount = [
    filters.maxDistance !== null,
    filters.maxPrice !== null
  ].filter(Boolean).length;

  return (
    <div className="mb-3">
      <div className="card">
        <div className="card-body">
          <div className="d-flex justify-content-between align-items-center">
            <div className="d-flex align-items-center gap-3">
              <button
                className="btn btn-primary"
                onClick={() => setShowFilters(!showFilters)}
              >
                <i className="bi bi-funnel me-2"></i>
                Filters
                {activeFilterCount > 0 && (
                  <span className="badge bg-light text-dark ms-2">
                    {activeFilterCount}
                  </span>
                )}
              </button>
              
              {activeFilterCount > 0 && (
                <button
                  className="btn btn-outline-secondary btn-sm"
                  onClick={handleClearFilters}
                >
                  <i className="bi bi-x-circle me-1"></i>
                  Clear Filters
                </button>
              )}
            </div>

            <div className="d-flex align-items-center">
              <label className="me-2 mb-0">Sort by:</label>
              <select
                className="form-select form-select-sm"
                style={{ width: 'auto' }}
                value={tempFilters.sortBy}
                onChange={(e) => {
                  setTempFilters({ ...tempFilters, sortBy: e.target.value });
                  onFilterChange({ sortBy: e.target.value });
                }}
              >
                <option value="distance">Distance</option>
                <option value="price">Price</option>
                <option value="availability">Availability</option>
              </select>
            </div>
          </div>

          {showFilters && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="mt-3 pt-3 border-top"
            >
              <div className="row g-3">
                <div className="col-md-6">
                  <label htmlFor="maxDistance" className="form-label">
                    <i className="bi bi-geo-alt me-2"></i>
                    Maximum Distance (km)
                  </label>
                  <input
                    type="number"
                    className="form-control"
                    id="maxDistance"
                    placeholder="e.g., 5"
                    min="0"
                    step="0.5"
                    value={tempFilters.maxDistance}
                    onChange={(e) => setTempFilters({ ...tempFilters, maxDistance: e.target.value })}
                  />
                  <small className="text-muted">
                    <i className="bi bi-info-circle me-1"></i>
                    Backend support coming soon
                  </small>
                </div>

                <div className="col-md-6">
                  <label htmlFor="maxPrice" className="form-label">
                    <i className="bi bi-currency-dollar me-2"></i>
                    Maximum Price ($/hour)
                  </label>
                  <input
                    type="number"
                    className="form-control"
                    id="maxPrice"
                    placeholder="e.g., 10"
                    min="0"
                    step="0.5"
                    value={tempFilters.maxPrice}
                    onChange={(e) => setTempFilters({ ...tempFilters, maxPrice: e.target.value })}
                  />
                  <small className="text-muted">
                    <i className="bi bi-info-circle me-1"></i>
                    Backend support coming soon
                  </small>
                </div>
              </div>

              <div className="mt-3 d-flex gap-2">
                <button
                  className="btn btn-success"
                  onClick={handleApplyFilters}
                >
                  <i className="bi bi-check2 me-2"></i>
                  Apply Filters
                </button>
                <button
                  className="btn btn-secondary"
                  onClick={() => setShowFilters(false)}
                >
                  Cancel
                </button>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FilterBar;
