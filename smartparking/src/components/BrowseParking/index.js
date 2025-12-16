import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import Header from '../common/Header';
import Footer from '../common/Footer';
import PublicParkingMap from './PublicParkingMap';
import PublicParkingList from './PublicParkingList';
import FilterBar from './FilterBar';
import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';
import { auth } from '../../Firebase';
import { signOut } from 'firebase/auth';

const BrowseParking = () => {
  const navigate = useNavigate();
  const { token, setToken } = useAuth();
  const [parkingLots, setParkingLots] = useState([]);
  const [filteredLots, setFilteredLots] = useState([]);
  const [selectedLot, setSelectedLot] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isCityOperator, setIsCityOperator] = useState(false);
  const [operatorRequestStatus, setOperatorRequestStatus] = useState(null);
  const [checkingRole, setCheckingRole] = useState(true);
  const [userLocation, setUserLocation] = useState(null);
  const [filters, setFilters] = useState({
    maxDistance: 20,
    maxPrice: 0,
    sortBy: 'distance' // distance, price, availability
  });
  const [fetchedFilters, setFetchedFilters] = useState({
    maxDistance: 0,
    maxPrice: 0,
    hadLocation: false
  });
  const { showError, showSuccess } = useNotification();

  const handleLogout = async () => {
    try {
      await signOut(auth);
      setToken(null);
      navigate('/');
    } catch (error) {
      console.error("Logout error:", error);
      showError("Failed to logout");
    }
  };

  const handleGoToDashboard = () => {
    navigate('/dashboard');
  };

  const handleRequestOperatorAccess = async () => {
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/request-operator-access/`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        showSuccess(data.message);
        setOperatorRequestStatus(data.status);
      } else {
        const errorData = await response.json();
        showError(errorData.error || 'Failed to submit operator request');
      }
    } catch (error) {
      showError('Failed to submit operator request. Please try again.');
      console.error('Error requesting operator access:', error);
    }
  };

  useEffect(() => {
    checkUserRole();
  }, [token]);

  useEffect(() => {
    // Fetch parking lots immediately without filters
    fetchParkingLots();
    // Then get user location for distance filtering
    getUserLocation();
  }, []);

  useEffect(() => {
    // Skip if filters haven't changed (initial render)
    if (parkingLots.length === 0) return;

    // Check if we need to refetch from backend
    const needsRefetch =
      (userLocation && filters.maxDistance > 0 && (fetchedFilters.maxDistance === 0 || filters.maxDistance > fetchedFilters.maxDistance)) ||
      (filters.maxPrice > 0 && (fetchedFilters.maxPrice === 0 || filters.maxPrice > fetchedFilters.maxPrice)) ||
      (userLocation && filters.maxDistance === 0 && fetchedFilters.maxDistance > 0) ||
      (filters.maxPrice === 0 && fetchedFilters.maxPrice > 0) ||
      (userLocation && !fetchedFilters.hadLocation); // Refetch when location becomes available

    if (needsRefetch) {
      fetchParkingLots();
    } else {
      // Apply filters client-side on existing data
      applyClientSideFilters();
    }
  }, [filters, userLocation]);

  const getUserLocation = () => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
          });
          // Don't fetch here - the useEffect will handle refetch when userLocation changes
        },
        (error) => {
          console.error('Error getting location:', error);
          // Location failed, but we already have results from initial fetch
        }
      );
    }
  };

  const checkUserRole = async () => {
    if (!token) {
      setCheckingRole(false);
      setIsCityOperator(false);
      setOperatorRequestStatus(null);
      return;
    }

    setCheckingRole(true);
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/check-user-role/`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setIsCityOperator(data.is_city_operator);
        setOperatorRequestStatus(data.operator_request_status);
      }
    } catch (error) {
      console.error('Error checking user role:', error);
      setIsCityOperator(false);
      setOperatorRequestStatus(null);
    } finally {
      setCheckingRole(false);
    }
  };

  const handleCancelOperator = async () => {
    console.log('BrowseParking: handleCancelOperator called, token present=', !!token);
    if (!token) {
      showError('You must be logged in to cancel the request.');
      return;
    }

    // Optimistically update UI
    const prevStatus = operatorRequestStatus;
    setOperatorRequestStatus(null);

    try {
      const res = await fetch(`${process.env.REACT_APP_API_URL}/request-operator-access/`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        // revert
        setOperatorRequestStatus(prevStatus);
        const msg = data.error || 'Failed to cancel operator request';
        throw new Error(msg);
      }

      showSuccess(data.message || 'Operator request cancelled');

      // Refresh role
      await checkUserRole();
    } catch (err) {
      console.error('Error cancelling operator request:', err);
      showError(err.message || 'Failed to cancel operator request');
    }
  };

  const fetchParkingLots = async () => {
    setLoading(true);
    try {
      // Build query parameters
      const params = new URLSearchParams();

      // Add user location if available
      if (userLocation) {
        params.append('latitude', userLocation.latitude);
        params.append('longitude', userLocation.longitude);
      }

      // Add filters
      if (filters.maxDistance > 0 && userLocation) {
        params.append('max_distance', filters.maxDistance);
      }

      if (filters.maxPrice !== null && filters.maxPrice > 0) {
        params.append('max_price', filters.maxPrice);
      }

      const url = `${process.env.REACT_APP_API_URL}/parking-lots/?${params.toString()}`;
      const response = await fetch(url);

      if (!response.ok) {
        throw new Error('Failed to fetch parking lots');
      }

      const data = await response.json();
      setParkingLots(data.parking_lots || []);
      setFilteredLots(data.parking_lots || []);

      // Store the filters we fetched with
      setFetchedFilters({
        maxDistance: filters.maxDistance,
        maxPrice: filters.maxPrice,
        hadLocation: !!userLocation
      });
    } catch (error) {
      showError(error.message || 'Failed to load parking lots');
      console.error('Error fetching parking lots:', error);
    } finally {
      setLoading(false);
    }
  };

  const applyClientSideFilters = () => {
    let filtered = [...parkingLots];

    // Apply distance filter (client-side) - only if distance > 0
    if (filters.maxDistance > 0) {
      filtered = filtered.filter(lot =>
        lot.distance === undefined || lot.distance === null || lot.distance <= filters.maxDistance
      );
    }

    // Apply price filter (client-side) - only if price > 0
    // Include lots with no price set (they should always be shown)
    if (filters.maxPrice !== null && filters.maxPrice > 0) {
      filtered = filtered.filter(lot =>
        lot.price_per_hour === undefined ||
        lot.price_per_hour === null ||
        lot.price_per_hour === 0 ||
        lot.price_per_hour <= filters.maxPrice
      );
    }

    // Apply sorting
    if (filters.sortBy === 'distance') {
      filtered.sort((a, b) => (a.distance || 0) - (b.distance || 0));
    } else if (filters.sortBy === 'price') {
      filtered.sort((a, b) => (a.price_per_hour || 0) - (b.price_per_hour || 0));
    }

    setFilteredLots(filtered);
  };

  const handleFilterChange = (newFilters) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  };

  const containerStyle = {
    position: "relative",
    minHeight: "100vh",
    overflow: "hidden",
  };

  const backgroundStyle = {
    backgroundImage: 'url("/images/bg-dashboard.jpg")',
    backgroundSize: "cover",
    backgroundPosition: "center",
    backgroundRepeat: "no-repeat",
    position: "fixed",
    top: 0,
    left: 0,
    width: "100%",
    height: "100vh",
    zIndex: -1,
    opacity: 0.7,
  };

  return (
    <div style={containerStyle}>
      <Header
        token={token}
        onLogout={handleLogout}
        isCityOperator={isCityOperator}
        onGoToDashboard={handleGoToDashboard}
        onRequestOperator={handleRequestOperatorAccess}
        onCancelOperator={handleCancelOperator}
        checkingRole={checkingRole}
        operatorRequestStatus={operatorRequestStatus}
      />
      <div style={backgroundStyle}></div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <div className="container-fluid my-4">
          <h1 className="text-center text-white mb-4">Find Parking</h1>

          <FilterBar 
            filters={filters}
            onFilterChange={handleFilterChange}
            hasLocation={!!userLocation}
          />          <div className="row" style={{ minHeight: "calc(100vh - 300px)" }}>
            <div className="col-md-4">
              <div style={{
                height: "calc(100vh - 300px)",
                overflowY: "auto",
                backgroundColor: "rgba(255, 255, 255, 0.95)",
                borderRadius: "8px",
                padding: "15px"
              }}>
                <PublicParkingList
                  parkingLots={filteredLots}
                  loading={loading}
                  selectedLot={selectedLot}
                  onSelectLot={setSelectedLot}
                />
              </div>
            </div>
            <div className="col-md-8" style={{ height: "calc(100vh - 300px)" }}>
              <PublicParkingMap
                parkingLots={filteredLots}
                selectedLot={selectedLot}
                onSelectLot={setSelectedLot}
              />
            </div>
          </div>
        </div>
      </motion.div>

      <Footer />
    </div>
  );
};

export default BrowseParking;