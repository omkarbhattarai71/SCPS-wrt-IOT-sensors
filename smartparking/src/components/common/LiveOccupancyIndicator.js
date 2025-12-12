import React, { useState, useEffect } from 'react';
import { doc, onSnapshot } from 'firebase/firestore';
import { firestore } from '../../Firebase';

/**
 * LiveOccupancyIndicator - A reusable component for displaying real-time parking lot occupancy
 * 
 * @param {string} parkingLotId - The ID of the parking lot
 * @param {number} totalSpots - Total number of parking spots (optional, will fetch if not provided)
 * @param {string} variant - Display variant: 'compact', 'inline', 'full' (default: 'full')
 * @param {boolean} showLiveBadge - Whether to show the "Live" badge (default: true)
 * @param {boolean} showPercentage - Whether to show percentage (default: true)
 * @param {boolean} isActive - Whether this is in an active/selected state (for color adaptation)
 * @param {React.ReactNode} forecastButton - Optional forecast button/badge to display next to occupancy
 */
const LiveOccupancyIndicator = ({
  parkingLotId,
  totalSpots: providedTotalSpots,
  variant = 'full',
  showLiveBadge = true,
  showPercentage = true,
  isActive = false,
  forecastButton = null
}) => {
  const [occupancyData, setOccupancyData] = useState(null);
  const [totalSpots, setTotalSpots] = useState(providedTotalSpots || 0);

  useEffect(() => {
    if (!parkingLotId) return;

    // Subscribe to Firestore eventlist for live occupancy updates
    const eventlistRef = doc(firestore, 'eventlists', String(parkingLotId));

    const unsubscribe = onSnapshot(
      eventlistRef,
      (docSnapshot) => {
        if (docSnapshot.exists()) {
          const data = docSnapshot.data();
          const events = data.events || [];
          const latestEvent = events[events.length - 1];

          if (latestEvent) {
            const occupiedSpots = latestEvent.occupied_spots || [];
            setOccupancyData({
              occupied: occupiedSpots.length,
              timestamp: latestEvent.timestamp
            });
          }
        }
      },
      (error) => {
        console.error(`Error listening to eventlist for lot ${parkingLotId}:`, error);
        setOccupancyData(null);
      }
    );

    // Fetch total spots count if not provided
    if (!providedTotalSpots) {
      const fetchTotalSpots = async () => {
        try {
          const token = localStorage.getItem('token');
          if (!token) return;

          const response = await fetch(
            `${process.env.REACT_APP_API_URL}/cadmin/parking-spots/?parking_lot_id=${parkingLotId}`,
            {
              headers: {
                'Authorization': `Bearer ${token}`
              }
            }
          );
          if (response.ok) {
            const data = await response.json();
            setTotalSpots(data.length);
          }
        } catch (error) {
          console.error(`Error fetching spots count for lot ${parkingLotId}:`, error);
        }
      };

      fetchTotalSpots();
    }

    return () => unsubscribe();
  }, [parkingLotId, providedTotalSpots]);

  const occupied = occupancyData?.occupied || 0;
  const percentage = totalSpots > 0 ? (occupied / totalSpots) * 100 : 0;
  const progressBarColor = percentage > 80 ? 'bg-danger' : percentage > 50 ? 'bg-warning' : 'bg-success';

  // If no spots configured, don't render anything
  if (totalSpots === 0) return null;

  // Compact variant - just a small badge with count
  if (variant === 'compact') {
    return (
      <span
        className={`badge ${progressBarColor}`}
        style={{ fontSize: '0.75rem' }}
      >
        {occupied}/{totalSpots}
      </span>
    );
  }

  // Inline variant - count and percentage on one line
  if (variant === 'inline') {
    return (
      <div className="d-flex align-items-center gap-2">
        {showLiveBadge && (
          <span className="badge bg-info" style={{ fontSize: '0.7rem' }}>
            <i className="bi bi-broadcast"></i>
          </span>
        )}
        <small className={isActive ? 'text-white' : 'text-dark'}>
          <strong>{occupied} / {totalSpots}</strong>
          {showPercentage && <span className="ms-1">({percentage.toFixed(0)}%)</span>}
        </small>
      </div>
    );
  }

  // Full variant - complete display with progress bar
  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-1">
        <div className="d-flex align-items-center gap-2">
          <small className={isActive ? 'text-white' : 'text-dark'}>
            <strong>{occupied} / {totalSpots}</strong> occupied
          </small>
          {forecastButton && (
            <div onClick={(e) => e.stopPropagation()}>
              {forecastButton}
            </div>
          )}
        </div>
        {showPercentage && (
          <small className={isActive ? 'text-white-50' : 'text-muted'}>
            {percentage.toFixed(0)}%
          </small>
        )}
      </div>
      <div className="progress" style={{ height: '6px' }}>
        <div
          className={`progress-bar ${progressBarColor}`}
          role="progressbar"
          style={{ width: `${percentage}%` }}
          aria-valuenow={occupied}
          aria-valuemin="0"
          aria-valuemax={totalSpots}
        ></div>
      </div>
    </div>
  );
};

export default LiveOccupancyIndicator;
