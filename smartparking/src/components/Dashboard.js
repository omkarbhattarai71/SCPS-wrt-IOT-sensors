import React, { useState, useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import { motion } from "framer-motion";
import axios from "axios";
import { database } from "../firebase";
import { ref, onValue, off } from "firebase/database";
import "leaflet/dist/leaflet.css";

const Dashboard = ({ token }) => {
  const [spots, setSpots] = useState([]);
  const [searchId, setSearchId] = useState("");
  const [forecast, setForecast] = useState(null);
  const [filter, setFilter] = useState("All");

  useEffect(() => {
    if (!token) {
      window.location.href = "/login"; // redirect unauthenticated users
    }
    // Fetch from REST API
    const fetchSpots = async () => {
      try {
        const res = await axios.get("http://localhost:8000/api/spots/", {
          headers: { Authorization: `Token ${token}` },
        });
        setSpots(res.data);

        const f = await axios.get("http://localhost:8000/api/forecast/", {
          headers: { Authorization: `Token ${token}` },
        });
        setForecast(f.data[0]);
      } catch (err) {
        console.error("Error fetching from API:", err);
      }
    };
    fetchSpots();

    // Firebase Realtime Database listener
    const spotsRef = ref(database, "spots");
    const unsubscribe = onValue(spotsRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const updatedSpots = Object.keys(data).map((id) => ({
          spot_id: parseInt(id),
          status: data[id].status,
          timestamp: data[id].timestamp,
        }));
        setSpots(updatedSpots);
      }
    });

    // Cleanup listener
    return () => off(spotsRef);
  }, [token]);

  // const filteredSpots = spots.filter(
  //   (spot) => !searchId || spot.spot_id === parseInt(searchId)
  // );

  const filteredSpots = spots.filter((spot) => {
    const matchId = !searchId || spot.spot_id === parseInt(searchId);
    const matchStatus =
      filter === "All" || spot.status.toLowerCase() === filter.toLowerCase();
    return matchId && matchStatus;
  });

  return (
    <div
      style={{
        position: "relative",
        minHeight: "100vh",
        overflow: "hidden",
      }}
    >
      <header
        style={{
          position: "sticky",
          top: 0,
          backgroundColor: "rgba(57, 46, 46, 0.7)",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "10px 20px",
          zIndex: 10,
        }}
      >
        <a href="/" style={{textDecoration:"none"}}>
          <h2 style={{ color: "#4FC3F7" }}>Smart Parking Dashboard</h2>
        </a>
        <nav style={{ display: "flex", gap: "15px" }}>
          <button
            style={{
              backgroundColor: "transparent",
              border: "1px solid #4FC3F7",
              color: "#4FC3F7",
              borderRadius: "8px",
              padding: "8px 16px",
              cursor: "pointer",
              transition: "all 0.3s ease",
            }}
          >
            About Us
          </button>
          <button
            style={{
              backgroundColor: "#4FC3F7",
              border: "none",
              color: "black",
              borderRadius: "8px",
              padding: "8px 16px",
              cursor: "pointer",
              transition: "all 0.3s ease",
            }}
          >
            Login
          </button>
        </nav>
      </header>

      {/* Background image */}
      <div
        style={{
          backgroundImage: 'url("/images/bg-dashboard.jpg")',
          backgroundSize: "cover",
          backgroundPosition: "center",
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          zIndex: -1,
          opacity: 0.7,
        }}
      ></div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <div className="container">
          {/* <h1 style={{ color: '#4FC3F7' }}>Smart Parking Dashboard</h1> */}

          <input
            className="form-control mb-2"
            placeholder="Search Spot ID"
            value={searchId}
            onChange={(e) => setSearchId(e.target.value)}
          />

          <select
            className="form-control mb-2"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          >
            <option>Filter: All</option>
            <option>Free</option>
            <option>Occupied</option>
          </select>

          {/* {forecast && (
            <p> 🚗Predicted occupied in 1h: {forecast.yhat.toFixed(1)}</p>
          )} */}
          {forecast && (
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.4 }}
              style={{
                backgroundColor: "rgba(0,0,0,0.6)",
                padding: "15px",
                borderRadius: "10px",
                color: "white",
                textAlign: "center",
                marginBottom: "15px",
              }}
            >
              <h4>🚗 Predicted Occupancy in 1 Hour:</h4>
              <p style={{ fontSize: "20px", color: "#4FC3F7" }}>
                {forecast.yhat.toFixed(1)} spots
              </p>
            </motion.div>
          )}

          <MapContainer
            center={[51.505, -0.09]}
            zoom={13}
            style={{ height: "500px" }}
          >
            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

            {filteredSpots.map((spot) => (
              <Marker
                key={spot.spot_id}
                position={[
                  51.505 + spot.spot_id * 0.001,
                  -0.09 + spot.spot_id * 0.001,
                ]}
              >
                <Popup>
                  Spot {spot.spot_id}: {spot.status}
                </Popup>
              </Marker>
            ))}
          </MapContainer>
        </div>
      </motion.div>

      <footer
        style={{
          background: "linear-gradient(90deg, #1e1e1e, #2c2c2c)",
          color: "#bdbdbd",
          fontSize: "14px",
          textAlign: "center",
          padding: "15px",
        }}
      >
        <p>© 2025 Smart Parking System | All Rights Reserved</p>
      </footer>
    </div>
  );
};

export default Dashboard;
