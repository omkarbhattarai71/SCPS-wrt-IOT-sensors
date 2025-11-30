import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useParkingSpots } from "../../hooks/useParkingSpots";
import { PARKING_STATUS } from "../../constants/parkingConstants";
import DashboardHeader from "./DashboardHeader";
import FilterControls from "./FilterControls";
import ForecastCard from "./ForecastCard";
import ParkingMap from "./ParkingMap";
import CallToAction from "./CallToAction";
import DashboardFooter from "./DashboardFooter";

const Dashboard = ({ token, setToken }) => {
  const [searchId, setSearchId] = useState("");
  const [filter, setFilter] = useState(PARKING_STATUS.ALL);
  const navigate = useNavigate();

  const { spots, forecast, loading, error } = useParkingSpots(token);

  const handleLogout = () => {
    localStorage.removeItem("token");

    if (typeof setToken === "function") {
      setToken(null);
    }

    navigate("/");
  };

  // Memoized filtered spots
  const filteredSpots = useMemo(() => {
    return spots.filter((spot) => {
      const matchId = !searchId || spot.spot_id === parseInt(searchId);
      const matchStatus =
        filter === PARKING_STATUS.ALL ||
        spot.status.toLowerCase() === filter.toLowerCase();
      return matchId && matchStatus;
    });
  }, [spots, searchId, filter]);

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
      <DashboardHeader token={token} onLogout={handleLogout} />

      <div style={backgroundStyle}></div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <div className="container">
          {token && (
            <FilterControls
              searchId={searchId}
              setSearchId={setSearchId}
              filter={filter}
              setFilter={setFilter}
            />
          )}

          {error && (
            <div
              style={{
                backgroundColor: "rgba(255,68,68,0.8)",
                color: "white",
                padding: "10px",
                borderRadius: "5px",
                marginTop: "10px",
              }}
            >
              Error: {error}
            </div>
          )}

          {loading && (
            <div
              style={{
                backgroundColor: "rgba(0,0,0,0.6)",
                color: "white",
                padding: "10px",
                borderRadius: "5px",
                marginTop: "10px",
                textAlign: "center",
              }}
            >
              Loading parking data...
            </div>
          )}

          {token && <ForecastCard forecast={forecast} />}

          <ParkingMap token={token} filteredSpots={filteredSpots} />

          <CallToAction token={token} />
        </div>
      </motion.div>

      <DashboardFooter />
    </div>
  );
};

export default Dashboard;
