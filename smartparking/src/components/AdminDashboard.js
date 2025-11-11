import { useState, useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import { motion } from "framer-motion";
import axios from "axios";
import L from "leaflet";
import { OpenStreetMapProvider } from "leaflet-geosearch";
import "leaflet-geosearch/dist/geosearch.css";
import { database } from "../Firebase";
import { ref, onValue } from "firebase/database"; // [, set, remove] set and remove sensor from firebase
import { useNavigate } from "react-router-dom";
import "leaflet/dist/leaflet.css";

const AdminDashboard = ({ token, setToken, onLogout }) => {
  const [spots, setSpots] = useState([]);
  const [sensors, setSensors] = useState([]);
  const [searchId, setSearchId] = useState("");
  const [filter, setFilter] = useState("All");
  const [showAddSensorModal, setShowAddSensorModal] = useState(false);
  //   const [editingSensor, setEditingSensor] = useState(null); // Will be used later-on
  const [newSensor, setNewSensor] = useState({
    spot_id: "",
    location: "",
    latitude: "",
    longitude: "",
    status: "active",
    type: "ultrasonic",
  });
  const navigate = useNavigate();

  // Handle logout
  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userType");

    if (onLogout && typeof onLogout === "function") {
      onLogout();
    } else if (setToken && typeof setToken === "function") {
      setToken(null);
    } else {
      window.location.href = "/login";
      return;
    }
    navigate("/login");
  };

  // Fetch spots and sensors
  useEffect(() => {
    if (token) {
      const fetchSpots = async () => {
        try {
          const res = await axios.get("http://localhost:8000/api/spots/", {
            headers: { Authorization: `Token ${token}` },
          });
          setSpots(res.data);
        } catch (err) {
          console.error("Error fetching spots:", err);
        }
      };

      const fetchSensors = async () => {
        try {
          const res = await axios.get("http://localhost:8000/api/sensors/", {
            headers: { Authorization: `Token ${token}` },
          });
          setSensors(res.data);
        } catch (err) {
          console.error("Error fetching sensors:", err);
        }
      };

      fetchSpots();
      fetchSensors();

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

      return () => unsubscribe();
    } else {
      setSpots([]);
      setSensors([]);
    }
  }, [token]);

  // Add new sensor
  const handleAddSensor = async () => {
    try {
      const sensorData = {
        ...newSensor,
        spot_id: parseInt(newSensor.spot_id),
        latitude: parseFloat(newSensor.latitude),
        longitude: parseFloat(newSensor.longitude),
      };

      const res = await axios.post(
        "http://localhost:8000/api/sensors/",
        sensorData,
        {
          headers: { Authorization: `Token ${token}` },
        }
      );

      setSensors([...sensors, res.data]);
      setShowAddSensorModal(false);
      setNewSensor({
        spot_id: "",
        location: "",
        latitude: "",
        longitude: "",
        status: "active",
        type: "ultrasonic",
      });
      alert("Sensor added successfully!");
    } catch (error) {
      console.error("Error adding sensor:", error);
      alert("Failed to add sensor: " + error.message);
    }
  };

  // Update sensor
  const handleUpdateSensor = async (sensorId, updates) => {
    try {
      const res = await axios.put(
        `http://localhost:8000/api/sensors/${sensorId}/`,
        updates,
        {
          headers: { Authorization: `Token ${token}` },
        }
      );

      setSensors(
        sensors.map((sensor) => (sensor.id === sensorId ? res.data : sensor))
      );
      alert("Sensor updated successfully!");
    } catch (error) {
      console.error("Error updating sensor:", error);
      alert("Failed to update sensor: " + error.message);
    }
  };

  // Remove sensor
  const handleRemoveSensor = async (sensorId) => {
    if (window.confirm("Are you sure you want to remove this sensor?")) {
      try {
        await axios.delete(`http://localhost:8000/api/sensors/${sensorId}/`, {
          headers: { Authorization: `Token ${token}` },
        });

        setSensors(sensors.filter((sensor) => sensor.id !== sensorId));
        alert("Sensor removed successfully!");
      } catch (error) {
        console.error("Error removing sensor:", error);
        alert("Failed to remove sensor: " + error.message);
      }
    }
  };

  // Toggle sensor status
  const handleToggleSensorStatus = (sensor) => {
    const newStatus = sensor.status === "active" ? "maintenance" : "active";
    handleUpdateSensor(sensor.id, { status: newStatus });
  };

  const filteredSpots = spots.filter((spot) => {
    const matchId = !searchId || spot.spot_id === parseInt(searchId);
    const matchStatus =
      filter === "All" || spot.status.toLowerCase() === filter.toLowerCase();
    return matchId && matchStatus;
  });

  // Search Field Component
  const SearchField = () => {
    const map = useMap();

    useEffect(() => {
      if (!token) return;
      if (map._customSearchAdded) return;
      map._customSearchAdded = true;
      const searchMarkers = [];

      const handleSearch = async (query, showAllResults = false) => {
        try {
          const provider = new OpenStreetMapProvider();
          const results = await provider.search({ query });

          if (results && results.length > 0) {
            searchMarkers.forEach((marker) => map.removeLayer(marker));
            searchMarkers.length = 0;

            const firstResult = results[0];
            const { x, y } = firstResult;

            if (!isNaN(y) && !isNaN(x)) {
              if (!showAllResults) {
                map.setView([y, x], 13);
              }

              const customIcon = new L.Icon({
                iconUrl:
                  "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
                iconRetinaUrl:
                  "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
                shadowUrl:
                  "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
                iconSize: [25, 41],
                iconAnchor: [12, 41],
                popupAnchor: [1, -34],
                shadowSize: [41, 41],
              });

              const marker = L.marker([y, x], {
                icon: customIcon,
                title: firstResult.label,
              }).addTo(map).bindPopup(`
                  <div style="text-align: center; min-width: 200px;">
                    <b style="font-size: 14px;">${firstResult.label}</b><br/>
                    <small style="color: #666;">${
                      firstResult.raw?.class || "Location"
                    }</small>
                    <div style="margin-top: 8px;">
                      <button onclick="window.dispatchEvent(new CustomEvent('zoomToLocation', { detail: { lat: ${y}, lng: ${x} } }))" 
                        style="background: #4FC3F7; color: white; border: none; padding: 5px 10px; border-radius: 3px; cursor: pointer; font-size: 12px;">
                        Zoom Here
                      </button>
                    </div>
                  </div>
                `);

              marker.on("click", function (e) {
                this.openPopup();
                map.setView(e.latlng, 15);
              });

              if (!showAllResults) {
                marker.openPopup();
              }
              searchMarkers.push(marker);
            }
          }
        } catch (error) {
          console.error("Search error:", error);
        }
      };

      // Search control implementation (similar to user dashboard)
      const searchContainer = L.DomUtil.create(
        "div",
        "leaflet-bar leaflet-control custom-search-container"
      );
      searchContainer.style.backgroundColor = "white";
      searchContainer.style.borderRadius = "4px";
      searchContainer.style.padding = "5px";
      searchContainer.style.boxShadow = "0 2px 6px rgba(0,0,0,0.3)";
      searchContainer.style.position = "relative";

      searchContainer.innerHTML = `
        <div style="display: flex; align-items: center; position: relative;">
          <input 
            type="text" 
            placeholder="Search for location..." 
            style="
              width: 100%;
              max-width:300px; 
              padding: 8px 12px; 
              border: 1px solid #ccc; 
              border-radius: 4px 0 0 4px;
              border-right: none;
              outline: none;
              font-size: 14px;
            "
          />
          <button 
            style="
              padding: 8px 16px;
              background: #4FC3F7;
              color: white;
              border: 1px solid #4FC3F7;
              borderRadius: 0 4px 4px 0;
              cursor: pointer;
              font-size: 14px;
              font-weight: bold;
            "
          >
            Search
          </button>
        </div>
      `;

      const searchInput = searchContainer.querySelector("input");
      const searchButton = searchContainer.querySelector("button");

      searchButton.addEventListener("click", () => {
        if (searchInput.value.trim().length > 0) {
          handleSearch(searchInput.value.trim());
        }
      });

      searchInput.addEventListener("keypress", (e) => {
        if (e.key === "Enter" && searchInput.value.trim().length > 0) {
          handleSearch(searchInput.value.trim());
        }
      });

      L.Control.CustomSearch = L.Control.extend({
        onAdd: function (map) {
          return searchContainer;
        },
        onRemove: function (map) {
          searchMarkers.forEach((marker) => map.removeLayer(marker));
        },
      });

      new L.Control.CustomSearch({ position: "topright" }).addTo(map);

      return () => {
        searchMarkers.forEach((marker) => map.removeLayer(marker));
      };
    }, [map]);

    return null;
  };

  return (
    <div
      style={{ position: "relative", minHeight: "100vh", overflow: "hidden" }}
    >      
      <header
        style={{
          position: "sticky",
          top: 0,
          background: "linear-gradient(90deg, #0d1b2a, #1b263b, #415a77)",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "12px 28px",
          boxShadow: "0 3px 15px rgba(0,0,0,0.4)",
          borderBottom: "1px solid rgba(79, 195, 247, 0.3)",
          zIndex: 50,
        }}
      >
        <a
          href="/admin"
          style={{
            textDecoration: "none",
            display: "flex",
            alignItems: "center",
            gap: "10px",
          }}
        >
          <img
            src="/images/brand.png"
            alt="Smart Parking Logo"
            style={{
              width: "40px",
              height: "40px",
              borderRadius: "8px",
              boxShadow: "0 0 10px rgba(79,195,247,0.6)",
            }}
          />
          <h2
            style={{
              color: "#4FC3F7",
              fontWeight: "600",
              letterSpacing: "0.5px",
              fontSize: "1.5rem",
              margin: 0,
              transition: "color 0.3s ease",
            }}
            onMouseEnter={(e) => (e.target.style.color = "#BBE1FA")}
            onMouseLeave={(e) => (e.target.style.color = "#4FC3F7")}
          >
           Smart Parking - Admin
          </h2>
        </a>

        <nav style={{ display: "flex", gap: "15px" }}>        

          {token ? (
            <button
              style={{
                background: "linear-gradient(90deg, #ff4b2b, #ff416c)",
                border: "none",
                color: "white",
                borderRadius: "25px",
                padding: "8px 18px",
                cursor: "pointer",
                fontSize: "14px",
                fontWeight: "600",
                boxShadow: "0 0 10px rgba(255, 65, 108, 0.5)",
                transition: "transform 0.2s ease",
              }}
              onMouseEnter={(e) => (e.target.style.transform = "scale(1.05)")}
              onMouseLeave={(e) => (e.target.style.transform = "scale(1)")}
              onClick={handleLogout}
            >
              Logout
            </button>
          ) : (
            <button
              style={{
                background: "linear-gradient(90deg, #4FC3F7, #00bcd4)",
                border: "none",
                color: "#0d1b2a",
                borderRadius: "25px",
                padding: "8px 18px",
                cursor: "pointer",
                fontSize: "14px",
                fontWeight: "600",
                boxShadow: "0 0 10px rgba(79,195,247,0.5)",
                transition: "transform 0.2s ease",
              }}
              onMouseEnter={(e) => (e.target.style.transform = "scale(1.05)")}
              onMouseLeave={(e) => (e.target.style.transform = "scale(1)")}
              onClick={() => navigate("/login")}
            >
              Login
            </button>
          )}
        </nav>
      </header>

      {/* Background */}
      <div
        style={{
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
        }}
      ></div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <div className="container">
          {/* Admin Controls */}
          {token && (
            <div className="row mb-4">
              <div className="col-md-12">
                <motion.div
                  style={{
                    backgroundColor: "rgba(0,0,0,0.7)",
                    padding: "20px",
                    borderRadius: "10px",
                    color: "white",
                    marginTop: "20px",
                  }}
                >
                  <div className="d-flex justify-content-between align-items-center mb-3">
                    <h4>Sensor Management</h4>
                    <button
                      className="btn btn-success"
                      onClick={() => setShowAddSensorModal(true)}
                    >
                      + Add New Sensor
                    </button>
                  </div>

                  {/* Sensor List */}
                  <div className="row">
                    {sensors.map((sensor) => (
                      <div key={sensor.id} className="col-md-6 col-lg-4 mb-3">
                        <div
                          className="card"
                          style={{ backgroundColor: "rgba(255,255,255,0.9)" }}
                        >
                          <div className="card-body">
                            <h6 className="card-title">Sensor #{sensor.id}</h6>
                            <p className="card-text mb-1">
                              <strong>Spot ID:</strong> {sensor.spot_id}
                              <br />
                              <strong>Location:</strong> {sensor.location}
                              <br />
                              <strong>Type:</strong> {sensor.type}
                              <br />
                              <strong>Status:</strong>
                              <span
                                className={`badge ${
                                  sensor.status === "active"
                                    ? "bg-success"
                                    : "bg-warning"
                                } ms-2`}
                              >
                                {sensor.status}
                              </span>
                            </p>
                            <div className="btn-group w-100">
                              <button
                                className={`btn btn-sm ${
                                  sensor.status === "active"
                                    ? "btn-warning"
                                    : "btn-success"
                                }`}
                                onClick={() => handleToggleSensorStatus(sensor)}
                              >
                                {sensor.status === "active"
                                  ? "Maintenance"
                                  : "Activate"}
                              </button>
                              <button
                                className="btn btn-sm btn-danger"
                                onClick={() => handleRemoveSensor(sensor.id)}
                              >
                                Remove
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </motion.div>
              </div>
            </div>
          )}

          {/* Map and Spot Management */}
          {token && (
            <div className="row">
              <div className="col-md-12">
                <motion.div
                  style={{
                    backgroundColor: "rgba(0,0,0,0.7)",
                    padding: "20px",
                    borderRadius: "10px",
                    color: "white",
                    marginBottom: "20px",
                  }}
                >
                  <h4>Parking Spots Overview</h4>

                  <div className="row mb-3">
                    <div className="col-md-6">
                      <input
                        className="form-control"
                        placeholder="Search Spot ID"
                        value={searchId}
                        onChange={(e) => setSearchId(e.target.value)}
                      />
                    </div>
                    <div className="col-md-6">
                      <select
                        className="form-control"
                        value={filter}
                        onChange={(e) => setFilter(e.target.value)}
                      >
                        <option>Filter: All</option>
                        <option>Free</option>
                        <option>Occupied</option>
                      </select>
                    </div>
                  </div>

                  {/* Statistics */}
                  <div className="row text-center mb-3">
                    <div className="col-md-3">
                      <div className="bg-primary p-3 rounded">
                        <h5>Total Spots</h5>
                        <h3>{spots.length}</h3>
                      </div>
                    </div>
                    <div className="col-md-3">
                      <div className="bg-success p-3 rounded">
                        <h5>Free Spots</h5>
                        <h3>
                          {spots.filter((s) => s.status === "free").length}
                        </h3>
                      </div>
                    </div>
                    <div className="col-md-3">
                      <div className="bg-danger p-3 rounded">
                        <h5>Occupied</h5>
                        <h3>
                          {spots.filter((s) => s.status === "occupied").length}
                        </h3>
                      </div>
                    </div>
                    <div className="col-md-3">
                      <div className="bg-info p-3 rounded">
                        <h5>Active Sensors</h5>
                        <h3>
                          {sensors.filter((s) => s.status === "active").length}
                        </h3>
                      </div>
                    </div>
                  </div>

                  {/* Map */}
                  <MapContainer
                    center={[55.65326433931066, 12.569958569333638]}
                    zoom={14}
                    style={{ height: "400px", borderRadius: "8px" }}
                  >
                    <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                    <SearchField />

                    {filteredSpots.map((spot) => (
                      <Marker
                        key={spot.spot_id}
                        position={[
                          55.65326433931066 + spot.spot_id * 0.001,
                          12.569958569333638 + spot.spot_id * 0.001,
                        ]}
                      >
                        <Popup>
                          <div>
                            <strong>Spot {spot.spot_id}</strong>
                            <br />
                            Status: {spot.status}
                            <br />
                            <small>
                              Last updated:{" "}
                              {new Date(spot.timestamp).toLocaleString()}
                            </small>
                          </div>
                        </Popup>
                      </Marker>
                    ))}
                  </MapContainer>
                </motion.div>
              </div>
            </div>
          )}
        </div>
      </motion.div>

      {/* Add Sensor Modal */}
      {showAddSensorModal && (
        <div
          className="modal show d-block"
          style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
        >
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Add New Sensor</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setShowAddSensorModal(false)}
                ></button>
              </div>
              <div className="modal-body">
                <div className="mb-3">
                  <label className="form-label">Spot ID</label>
                  <input
                    type="number"
                    className="form-control"
                    value={newSensor.spot_id}
                    onChange={(e) =>
                      setNewSensor({ ...newSensor, spot_id: e.target.value })
                    }
                    required
                    onInvalid={(e) => e.target.setCustomValidity("Please enter a Spot ID")}
                    onInput={(e) => e.target.setCustomValidity("")}
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label">Location Name</label>
                  <input
                    type="text"
                    className="form-control"
                    value={newSensor.location}
                    onChange={(e) =>
                      setNewSensor({ ...newSensor, location: e.target.value })
                    }
                    required
                  />
                </div>
                <div className="row">
                  <div className="col-md-6">
                    <div className="mb-3">
                      <label className="form-label">Latitude</label>
                      <input
                        type="number"
                        step="any"
                        className="form-control"
                        value={newSensor.latitude}
                        onChange={(e) =>
                          setNewSensor({
                            ...newSensor,
                            latitude: e.target.value,
                          })
                        }
                        required
                      />
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="mb-3">
                      <label className="form-label">Longitude</label>
                      <input
                        type="number"
                        step="any"
                        className="form-control"
                        value={newSensor.longitude}
                        onChange={(e) =>
                          setNewSensor({
                            ...newSensor,
                            longitude: e.target.value,
                          })
                        }
                        required
                      />
                    </div>
                  </div>
                </div>
                <div className="mb-3">
                  <label className="form-label">Sensor Type</label>
                  <select
                    className="form-control"
                    value={newSensor.type}
                    onChange={(e) =>
                      setNewSensor({ ...newSensor, type: e.target.value })
                    }
                  >
                    <option value="ultrasonic">Ultrasonic Parking Sensor</option>                    
                    <option value="magnetic">Electromagnetic Parking Sensor</option>
                    <option value="camera">Camera Parking Sensor</option>    
                    <option value="infrared">Infrared Parking Sensor</option>                 
                  </select>
                </div>
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setShowAddSensorModal(false)}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={handleAddSensor}
                >
                  Add Sensor
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <footer
        style={{
          background: "linear-gradient(90deg, #1e1e1e, #433d3dff)",
          color: "#bdbdbd",
          fontSize: "14px",
          textAlign: "center",
          padding: "15px",
          marginTop: "20px",
        }}
      >
        <p>© 2025 Smart Parking System | Admin Panel</p>
      </footer>
    </div>
  );
};

export default AdminDashboard;
