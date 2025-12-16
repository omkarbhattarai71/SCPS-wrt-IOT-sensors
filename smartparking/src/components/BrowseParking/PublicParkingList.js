import React, { useState, useEffect } from 'react';
import LiveOccupancyIndicator from '../common/LiveOccupancyIndicator';
import { useNotification } from '../../context/NotificationContext';

const PublicParkingList = ({ parkingLots, loading, selectedLot, onSelectLot }) => {
  const [forecastLoading, setForecastLoading] = useState({});
  const [forecastData, setForecastData] = useState({});
  const [forecastError, setForecastError] = useState({});
  const [forecastTimestamps, setForecastTimestamps] = useState({});
  const { showSuccess, showError, showInfo } = useNotification();

  const FORECAST_CACHE_DURATION = 5 * 60 * 1000; // 5 minutes in milliseconds
  const FORECAST_CACHE_KEY = 'parking_forecasts';

  // Load cached forecasts from localStorage on mount
  useEffect(() => {
    try {
      const cached = localStorage.getItem(FORECAST_CACHE_KEY);
      if (cached) {
        const parsedCache = JSON.parse(cached);
        const now = Date.now();

        // Filter out expired forecasts
        const validForecasts = {};
        const validTimestamps = {};

        Object.keys(parsedCache).forEach((lotId) => {
          const item = parsedCache[lotId];
          if (item && item.timestamp && (now - item.timestamp) < FORECAST_CACHE_DURATION) {
            validForecasts[lotId] = item.data;
            validTimestamps[lotId] = item.timestamp;
          }
        });

        if (Object.keys(validForecasts).length > 0) {
          setForecastData(validForecasts);
          setForecastTimestamps(validTimestamps);
        }
      }
    } catch (error) {
      console.error('Error loading forecast cache:', error);
      // Clear invalid cache
      localStorage.removeItem(FORECAST_CACHE_KEY);
    }
  }, []);

  // Save forecasts to localStorage whenever they change
  useEffect(() => {
    try {
      const cacheData = {};
      Object.keys(forecastData).forEach((lotId) => {
        if (forecastData[lotId] && forecastTimestamps[lotId]) {
          cacheData[lotId] = {
            data: forecastData[lotId],
            timestamp: forecastTimestamps[lotId]
          };
        }
      });

      if (Object.keys(cacheData).length > 0) {
        localStorage.setItem(FORECAST_CACHE_KEY, JSON.stringify(cacheData));
      }
    } catch (error) {
      console.error('Error saving forecast cache:', error);
    }
  }, [forecastData, forecastTimestamps]);

  const handleRequestForecast = async (lotId, e) => {
    e.stopPropagation();

    // Check if we have a cached forecast that's still valid
    const cachedTimestamp = forecastTimestamps[lotId];
    const now = Date.now();

    if (cachedTimestamp && forecastData[lotId]) {
      const timeElapsed = now - cachedTimestamp;
      if (timeElapsed < FORECAST_CACHE_DURATION) {
        const timeRemaining = Math.ceil((FORECAST_CACHE_DURATION - timeElapsed) / 1000 / 60);
        showInfo(
          `Using cached forecast. New forecast available in ${timeRemaining} minute${timeRemaining !== 1 ? 's' : ''}.`,
          3000
        );
        return;
      }
    }

    setForecastLoading((prev) => ({ ...prev, [lotId]: true }));
    setForecastError((prev) => ({ ...prev, [lotId]: null }));

    try {
      // Real API call to backend
      const response = await fetch(
        `${process.env.REACT_APP_API_URL}/request-forecast/?parking_lot_id=${lotId}&hours_ahead=1`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );
      const responseText = await response.text();
      
      if (!response.ok) {
        let errorMessage = 'Failed to fetch forecast';
        const contentType = response.headers.get('content-type');
        
        if (contentType && contentType.includes('application/json')) {
          try {
            const errorData = JSON.parse(responseText);
            errorMessage = errorData.error || errorMessage;
          } catch (jsonError) {
            console.error('Failed to parse error JSON:', jsonError);
            errorMessage = `Server error: ${response.status}`;
          }
        } else {
          // Response is not JSON (might be HTML error page)
          errorMessage = responseText.substring(0, 200) || `Server error: ${response.status}`;
        }
        throw new Error(errorMessage);
      }

      // Parse the response text as JSON
      let data;
      try {
        data = JSON.parse(responseText);
      } catch (parseError) {
        console.error('Failed to parse response JSON:', parseError);
        console.error('Response text that failed to parse:', responseText);
        throw new Error('Invalid JSON response from server');
      }

      // Validate response structure
      if (!data.forecast) {
        throw new Error('Invalid response format: missing forecast data');
      }

      setForecastData((prev) => ({ ...prev, [lotId]: data.forecast }));
      setForecastTimestamps((prev) => ({ ...prev, [lotId]: Date.now() }));

      // Find parking lot name for better notification
      const lot = parkingLots.find(l => l.id === lotId);
      const lotName = lot?.name || 'Parking lot';

      showSuccess(
        `Forecast received for ${lotName}: ${data.forecast.predicted_occupied}/${lot?.capacity || 'N/A'} spots predicted occupied in 1 hour (${Math.round(data.forecast.confidence_score * 100)}% confidence)`,
        6000
      );
    } catch (error) {
      console.error('Error fetching forecast:', error);
      setForecastError((prev) => ({ ...prev, [lotId]: error.message }));

      showError(
        `Failed to fetch forecast: ${error.message}`,
        5000
      );
    } finally {
      setForecastLoading((prev) => ({ ...prev, [lotId]: false }));
    }
  };
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
                  {lot.capacity > 0 && (
                    <span className="badge bg-info" style={{ fontSize: '0.7rem' }}>
                      <i className="bi bi-broadcast"></i> Live
                    </span>
                  )}
                  <span className={`badge ${selectedLot?.id === lot.id ? 'bg-light text-dark' : 'bg-success'}`} style={{ fontSize: '0.7rem' }}>
                    {lot.price_per_hour && lot.price_per_hour > 0 ? (
                      <>
                        <i className="bi bi-currency-dollar"></i> {lot.price_per_hour} DKK/h
                      </>
                    ) : (
                      <>
                        <i className="bi bi-gift"></i> Free
                      </>
                    )}
                  </span>
                  {lot.distance !== undefined && lot.distance !== null && (
                    <span className={selectedLot?.id === lot.id ? 'text-white-50' : 'text-muted'} style={{ fontSize: '0.875rem' }}>
                      <i className="bi bi-compass me-1"></i>
                      {lot.distance.toFixed(2)} km
                    </span>
                  )}
                  {lot.location?.latitude && lot.location?.longitude && (
                    <a
                      href={`https://www.google.com/maps/dir/?api=1&destination=${lot.location.latitude},${lot.location.longitude}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`btn btn-sm ${selectedLot?.id === lot.id ? 'btn-light' : 'btn-outline-primary'}`}
                      style={{ fontSize: '0.75rem', padding: '0.125rem 0.5rem' }}
                      onClick={(e) => e.stopPropagation()}
                    >
                      <i className="bi bi-map me-1"></i>
                      Navigate
                    </a>
                  )}
                </div>
                <small className={selectedLot?.id === lot.id ? 'text-white-50' : 'text-muted'}>
                  <i className="bi bi-geo-alt me-1"></i>
                  {lot.address}
                </small>

                <div className="mt-2">
                  <LiveOccupancyIndicator
                    parkingLotId={lot.id}
                    totalSpots={lot.capacity}
                    variant="full"
                    showLiveBadge={false}
                    showPercentage={true}
                    isActive={selectedLot?.id === lot.id}
                    forecastButton={
                      forecastData[lot.id] ? (
                        <div
                          className={`badge ${selectedLot?.id === lot.id ? 'bg-light text-dark' : 'bg-info'}`}
                          style={{ fontSize: '0.7rem', padding: '0.2rem 0.4rem' }}
                        >
                          <i className="bi bi-graph-up me-1"></i>
                          1h: {forecastData[lot.id].predicted_occupied}/{lot.capacity}
                          <span className="ms-1">
                            ({Math.round(forecastData[lot.id].confidence_score * 100)}%)
                          </span>
                        </div>
                      ) : (
                        <button
                          className={`btn btn-sm ${selectedLot?.id === lot.id ? 'btn-light' : 'btn-outline-info'}`}
                          style={{ fontSize: '0.7rem', padding: '0.1rem 0.4rem' }}
                          onClick={(e) => handleRequestForecast(lot.id, e)}
                          disabled={forecastLoading[lot.id]}
                          title="Request forecast for next hour"
                        >
                          {forecastLoading[lot.id] ? (
                            <>
                              <span className="spinner-border spinner-border-sm me-1" role="status" aria-hidden="true"></span>
                              ...
                            </>
                          ) : (
                            <>
                              <i className="bi bi-graph-up me-1"></i>
                              Request forecast
                            </>
                          )}
                        </button>
                      )
                    }
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
