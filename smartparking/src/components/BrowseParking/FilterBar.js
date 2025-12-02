import React, { useState, useRef } from 'react';

const FilterBar = ({ filters, onFilterChange, hasLocation }) => {
  const [tempDistance, setTempDistance] = useState(filters.maxDistance);
  const [tempPrice, setTempPrice] = useState(filters.maxPrice);

  // Update temp values when filters change externally
  React.useEffect(() => {
    setTempDistance(filters.maxDistance);
  }, [filters.maxDistance]);

  React.useEffect(() => {
    setTempPrice(filters.maxPrice);
  }, [filters.maxPrice]);
  const distanceTimeoutRef = useRef(null);
  const priceTimeoutRef = useRef(null);

  const handleDistanceChange = (value) => {
    setTempDistance(value);
  };

  const handleDistanceRelease = (value) => {
    onFilterChange({
      ...filters,
      maxDistance: value > 0 ? value : 0
    });
  };

  const handlePriceChange = (value) => {
    setTempPrice(value);
  };

  const handlePriceRelease = (value) => {
    onFilterChange({
      ...filters,
      maxPrice: value > 0 ? value : 0
    });
  };

  const handleClearFilters = () => {
    setTempDistance(20);
    setTempPrice(0);
    onFilterChange({
      maxDistance: 20,
      maxPrice: 0,
      sortBy: 'distance'
    });
  };

  const activeFilterCount = [
    tempDistance !== null && tempDistance > 0 && tempDistance < 20,
    tempPrice !== null && tempPrice > 0
  ].filter(Boolean).length;

  return (
    <div className="mb-3">
      <div className="card">
        <div className="card-body">
          <div className="d-flex justify-content-between align-items-center mb-3">
            <div className="d-flex align-items-center gap-2">
              <h6 className="mb-0">
                <i className="bi bi-funnel me-2"></i>
                Filters
              </h6>
              {activeFilterCount > 0 && (
                <button
                  className="btn btn-outline-secondary btn-sm"
                  onClick={handleClearFilters}
                >
                  <i className="bi bi-x-circle me-1"></i>
                  Clear
                </button>
              )}
            </div>

            <div className="d-flex align-items-center">
              <label className="me-2 mb-0 text-muted small">Sort by:</label>
              <select
                className="form-select form-select-sm"
                style={{ width: 'auto' }}
                value={filters.sortBy || 'distance'}
                onChange={(e) => {
                  onFilterChange({ ...filters, sortBy: e.target.value });
                }}
              >
                <option value="distance">Distance</option>
                <option value="price">Price</option>
                <option value="availability">Availability</option>
              </select>
            </div>
          </div>

          <div className="row g-3">
            <div className="col-md-6">
              <label htmlFor="maxDistance" className="form-label d-flex justify-content-between align-items-center mb-2">
                <span>
                  <i className="bi bi-geo-alt me-2"></i>
                  Maximum Distance
                </span>
                <span className={`badge ${tempDistance > 0 && tempDistance < 20 ? 'bg-primary' : 'bg-secondary'}`}>
                  {hasLocation ? `${tempDistance} km` : 'Getting location...'}
                </span>
              </label>
              <input
                type="range"
                className="form-range"
                id="maxDistance"
                min="0"
                max="20"
                step="1"
                value={tempDistance || 0}
                onChange={(e) => handleDistanceChange(parseFloat(e.target.value))}
                onMouseUp={(e) => handleDistanceRelease(parseFloat(e.target.value))}
                onTouchEnd={(e) => handleDistanceRelease(parseFloat(e.target.value))}
                disabled={!hasLocation}
                style={{ opacity: hasLocation ? 1 : 0.5 }}
              />
              <div className="d-flex justify-content-between small text-muted">
                <span>No limit</span>
                <span>20 km</span>
              </div>
              {!hasLocation && (
                <small className="text-warning">
                  <i className="bi bi-info-circle me-1"></i>
                  Acquiring your location...
                </small>
              )}
            </div>

            <div className="col-md-6">
              <label htmlFor="maxPrice" className="form-label d-flex justify-content-between align-items-center mb-2">
                <span>
                  <i className="bi bi-currency-dollar me-2"></i>
                  Maximum Price
                </span>
                <span className={`badge ${tempPrice > 0 ? 'bg-success' : 'bg-secondary'}`}>
                  {tempPrice > 0 ? `${tempPrice} DKK/hr` : 'No limit'}
                </span>
              </label>
              <input
                type="range"
                className="form-range"
                id="maxPrice"
                min="0"
                max="50"
                step="5"
                value={tempPrice || 0}
                onChange={(e) => handlePriceChange(parseFloat(e.target.value))}
                onMouseUp={(e) => handlePriceRelease(parseFloat(e.target.value))}
                onTouchEnd={(e) => handlePriceRelease(parseFloat(e.target.value))}
              />
              <div className="d-flex justify-content-between small text-muted">
                <span>No limit</span>
                <span>50 DKK</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FilterBar;
