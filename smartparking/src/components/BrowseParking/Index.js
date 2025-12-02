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
  const [filters, setFilters] = useState({
    maxDistance: null,
    maxPrice: null,
    sortBy: 'distance' // distance, price, availability
  });
  const { showError, showSuccess } = useNotification();

  const handleLogout = () => {
    setToken(null);
    navigate('/');
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
    fetchParkingLots();
  }, []);

  useEffect(() => {
    // Apply filters when they change
    applyFilters();
  }, [filters, parkingLots]);

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

  const fetchParkingLots = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/parking-lots/`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch parking lots');
      }

      const data = await response.json();
      setParkingLots(data.parking_lots || []);
      setFilteredLots(data.parking_lots || []);
    } catch (error) {
      showError(error.message || 'Failed to load parking lots');
      console.error('Error fetching parking lots:', error);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...parkingLots];

    // Note: Distance and price filtering will be implemented on backend
    // For now, we just pass through all lots
    // When backend supports it, we'll make API calls with filter parameters

    if (filters.maxDistance !== null) {
      // TODO: Backend implementation needed
      // filtered = filtered.filter(lot => lot.distance <= filters.maxDistance);
    }

    if (filters.maxPrice !== null) {
      // TODO: Backend implementation needed
      // filtered = filtered.filter(lot => lot.price <= filters.maxPrice);
    }

    // TODO: Sorting will also need backend support for accurate distance calculation
    // if (filters.sortBy === 'distance') {
    //   filtered.sort((a, b) => a.distance - b.distance);
    // }

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
          />

          <div className="row" style={{ minHeight: "calc(100vh - 300px)" }}>
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