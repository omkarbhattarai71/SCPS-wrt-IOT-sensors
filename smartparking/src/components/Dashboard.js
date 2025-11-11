import { useState, useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import { motion } from "framer-motion";
import axios from "axios";
import L from "leaflet";
import { OpenStreetMapProvider } from "leaflet-geosearch";
import "leaflet-geosearch/dist/geosearch.css";
import { database } from "../Firebase";
import { ref, onValue } from "firebase/database"; 
import { useNavigate } from "react-router-dom";
import "leaflet/dist/leaflet.css";

const Dashboard = ({ token, setToken, onLogout }) => {
  const [spots, setSpots] = useState([]);
  const [searchId, setSearchId] = useState("");
  const [forecast, setForecast] = useState(null);
  const [filter, setFilter] = useState("All");
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userType");

    // Check if setToken exists before calling it
    if (onLogout && typeof onLogout === "function") {
      onLogout();
      console.log("onLogout called");
    } else if(setToken && typeof setToken ==="function"){
      setToken(null);
      console.log("setToken called");
    } else{
      console.warn("No Logout function available, using fallback");
      window.location.href = "/";
      return;     
    }
    navigate("/");
  };

  useEffect(() => {
    if (token) {
      // Only fetch data if user is logged in
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

      // Firebase Realtime Database listener (only when logged in)
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
      // Reset spots when logged out
      setSpots([]);
      setForecast(null);
    }
  }, [token]);

  // Filtered Spots
  const filteredSpots = spots.filter((spot) => {
    const matchId = !searchId || spot.spot_id === parseInt(searchId);
    const matchStatus =
      filter === "All" || spot.status.toLowerCase() === filter.toLowerCase();
    return matchId && matchStatus;
  });

  // Search Container[advanced]
  const SearchField = () => {
    const map = useMap();

    useEffect(() => {
      if (!token) return;
      // Clear any existing markers from previous searches
      const searchMarkers = [];

      const handleSearch = async (query, showAllResults = false) => {
        try {
          const provider = new OpenStreetMapProvider();
          const results = await provider.search({ query });

          if (results && results.length > 0) {
            // Clear previous search markers
            searchMarkers.forEach((marker) => map.removeLayer(marker));
            searchMarkers.length = 0;

            const firstResult = results[0];
            const { x, y } = firstResult;

            if (!isNaN(y) && !isNaN(x)) {
              // Center map on the result (only if not just showing suggestions)
              if (!showAllResults) {
                map.setView([y, x], 13);
              }

              // Create a custom icon for better visibility
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

              // Add a marker for the search result
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

              // Make sure marker is clickable
              marker.on("click", function (e) {
                this.openPopup();
                map.setView(e.latlng, 15); // Zoom in when clicked
              });

              // Only open popup if this is the main search result
              if (!showAllResults) {
                marker.openPopup();
              }

              searchMarkers.push(marker);

              // Add markers for other results too when doing main search
              if (!showAllResults && results.length > 1) {
                results.slice(1, 5).forEach((result) => {
                  const resultMarker = L.marker([result.y, result.x], {
                    icon: customIcon,
                    title: result.label,
                  }).addTo(map).bindPopup(`
                    <div style="text-align: center; min-width: 200px;">
                      <b style="font-size: 14px;">${result.label}</b><br/>
                      <small style="color: #666;">${
                        result.raw?.class || "Location"
                      }</small>
                      <div style="margin-top: 8px;">
                        <button onclick="window.dispatchEvent(new CustomEvent('zoomToLocation', { detail: { lat: ${
                          result.y
                        }, lng: ${result.x} } }))" 
                          style="background: #4FC3F7; color: white; border: none; padding: 5px 10px; border-radius: 3px; cursor: pointer; font-size: 12px;">
                          Zoom Here
                        </button>
                      </div>
                    </div>
                  `);

                  resultMarker.on("click", function (e) {
                    this.openPopup();
                    map.setView(e.latlng, 15);
                  });

                  searchMarkers.push(resultMarker);
                });
              }
            }
          } else if (!showAllResults) {
            // No results found (only show for main search, not suggestions)
            const noResultsMarker = L.marker(map.getCenter(), {
              title: "No results found",
            })
              .addTo(map)
              .bindPopup(
                `
              <div style="text-align: center;">
                <b>No results found</b><br/>
                <small>Try a different search term</small>
              </div>
            `
              )
              .openPopup();

            noResultsMarker.on("click", function (e) {
              this.openPopup();
            });

            searchMarkers.push(noResultsMarker);
          }

          return results;
        } catch (error) {
          console.error("Search error:", error);

          if (!showAllResults) {
            // Show error marker
            const errorMarker = L.marker(map.getCenter(), {
              title: "Search Error",
            })
              .addTo(map)
              .bindPopup(
                `
              <div style="text-align: center; color: red;">
                <b>Search Error</b><br/>
                <small>Please try again</small>
              </div>
            `
              )
              .openPopup();

            errorMarker.on("click", function (e) {
              this.openPopup();
            });

            searchMarkers.push(errorMarker);
          }

          return [];
        }
      };

      // Create a custom search control with better styling
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
          placeholder="Search for parking place..." 
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
      <div class="search-suggestions" style="
        position: absolute;
        top: 100%;
        left: 0;
        right: 0;
        background: white;
        border: 1px solid #ccc;
        border-top: none;
        borderRadius: 0 0 4px 4px;
        max-height: 200px;
        overflow-y: auto;
        z-index: 1000;
        display: none;
        box-shadow: 0 2px 6px rgba(0,0,0,0.2);
      "></div>
    `;

      const searchInput = searchContainer.querySelector("input");
      const searchButton = searchContainer.querySelector("button");
      const suggestionsDropdown = searchContainer.querySelector(
        ".search-suggestions"
      );

      // Function to show suggestions
      const showSuggestions = (results) => {
        if (!results || results.length === 0) {
          suggestionsDropdown.style.display = "none";
          return;
        }

        const suggestionsHTML = results
          .slice(0, 8)
          .map(
            (result) => `
        <div class="suggestion-item" style="
          padding: 10px 12px;
          cursor: pointer;
          border-bottom: 1px solid #f0f0f0;
          transition: background-color 0.2s;
        " data-label="${result.label.replace(/"/g, "&quot;")}" 
           data-x="${result.x}" 
           data-y="${result.y}">
          <div style="font-weight: 500; font-size: 13px;">${result.label}</div>
          <div style="font-size: 11px; color: #666; margin-top: 2px;">
            ${result.raw?.type || result.raw?.class || "Location"}
          </div>
        </div>
      `
          )
          .join("");

        suggestionsDropdown.innerHTML = suggestionsHTML;
        suggestionsDropdown.style.display = "block";

        // Add click event listeners to suggestion items
        suggestionsDropdown
          .querySelectorAll(".suggestion-item")
          .forEach((item) => {
            item.addEventListener("click", () => {
              const label = item.getAttribute("data-label");
              // const x = parseFloat(item.getAttribute("data-x"));
              // const y = parseFloat(item.getAttribute("data-y"));

              searchInput.value = label;
              suggestionsDropdown.style.display = "none";

              // Perform the search with the selected suggestion
              handleSearch(label);
            });

            // Hover effects
            item.addEventListener("mouseenter", () => {
              item.style.backgroundColor = "#f5f5f5";
            });

            item.addEventListener("mouseleave", () => {
              item.style.backgroundColor = "white";
            });
          });
      };

      // Function to hide suggestions
      const hideSuggestions = () => {
        suggestionsDropdown.style.display = "none";
      };

      // Search on button click
      searchButton.addEventListener("click", () => {
        if (searchInput.value.trim().length > 0) {
          hideSuggestions();
          handleSearch(searchInput.value.trim());
        }
      });

      // Search on Enter key
      searchInput.addEventListener("keypress", (e) => {
        if (e.key === "Enter" && searchInput.value.trim().length > 0) {
          hideSuggestions();
          handleSearch(searchInput.value.trim());
        }
      });

      // Show suggestions as you type
      let timeoutId;
      searchInput.addEventListener("input", (e) => {
        clearTimeout(timeoutId);
        const query = e.target.value.trim();

        if (query.length > 2) {
          timeoutId = setTimeout(async () => {
            const results = await handleSearch(query, true);
            showSuggestions(results);
          }, 300);
        } else {
          hideSuggestions();
        }
      });

      // Hide suggestions when clicking outside
      document.addEventListener("click", (e) => {
        if (!searchContainer.contains(e.target)) {
          hideSuggestions();
        }
      });

      // Hide suggestions when input loses focus (with delay to allow clicking suggestions)
      searchInput.addEventListener("blur", () => {
        setTimeout(hideSuggestions, 200);
      });

      // Custom control class
      L.Control.CustomSearch = L.Control.extend({
        onAdd: function (map) {
          return searchContainer;
        },

        onRemove: function (map) {
          searchMarkers.forEach((marker) => map.removeLayer(marker));
          searchMarkers.length = 0;
          document.removeEventListener("click", hideSuggestions);
        },
      });

      // Add search control to map
      new L.Control.CustomSearch({ position: "topright" }).addTo(map);

      return () => {
        searchMarkers.forEach((marker) => map.removeLayer(marker));
        if (searchContainer.parentNode) {
          searchContainer.parentNode.removeChild(searchContainer);
        }
        document.removeEventListener("click", hideSuggestions);
      };
    }, [map]);

    return null;
  };

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
        <a href="/" style={{ textDecoration: "none" }}>
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
            onClick={() => navigate("/about")}
          >
            About Us
          </button>

          {token ? (
            // logged in state - show logout button
            <button
              style={{
                backgroundColor: "#ff4444",
                border: "none",
                color: "white",
                borderRadius: "8px",
                padding: "8px 16px",
                cursor: "pointer",
                transition: "all 0.3s ease",
              }}
              onClick={handleLogout}
            >
              Logout
            </button>
          ) : (
            // Logged out state - show Login button
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
              onClick={() => navigate("/login")}
            >
              Login
            </button>
          )}

          {/* <button
            style={{
              backgroundColor: "#4FC3F7",
              border: "none",
              color: "black",
              borderRadius: "8px",
              padding: "8px 16px",
              cursor: "pointer",
              transition: "all 0.3s ease",
            }}
            onClick={() => navigate("/login")}
          >
            Login
          </button> */}
        </nav>
      </header>

      {/* Background image */}
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
          {/* <h1 style={{ color: '#4FC3F7' }}>Smart Parking Dashboard</h1> */}
          {token && (
            <>
              <input
                className="form-control mb-2 mt-4"
                placeholder="Search Spot ID"
                value={searchId}
                onChange={(e) => setSearchId(e.target.value)}
                // style={{ marginTop: "10px" }}
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
            </>
          )}

          {token && forecast && (
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
            center={[55.65326433931066, 12.569958569333638]}  
            zoom={14}
            style={{ height: "500px", marginTop: "20px" }}
          >
            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
            {token && <SearchField />}

            {token &&
              filteredSpots.map((spot) => (
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
          {/* Call to action when logged in */}
          {token && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              style={{
                backgroundColor: "rgba(0,0,0,0.6)",
                padding: "30px",
                borderRadius: "10px",
                color: "white",
                textAlign: "center",
                marginTop: "20px",
              }}
            >
              <h3>Welcome to Smart Parking System</h3>
              <p>
                You can now see the available parking slots and predictions with an ease. Enjoy the site developed by the team <h4>MOSK</h4>
              </p>
              <div
                style={{
                  display: "flex",
                  gap: "10px",
                  justifyContent: "center",
                  flexWrap: "wrap",
                }}
              >
                <button
                  onClick={() => navigate("/about")}
                  style={{
                    backgroundColor: "#4FC3F7",
                    border: "none",
                    color: "white",
                    padding: "10px 20px",
                    borderRadius: "5px",
                    cursor: "pointer",
                  }}
                >
                  Wanna view the team?
                </button>                
              </div>
            </motion.div>
          )}

          {/* Call to action when not logged in */}
          {!token && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              style={{
                backgroundColor: "rgba(0,0,0,0.6)",
                padding: "30px",
                borderRadius: "10px",
                color: "white",
                textAlign: "center",
                marginTop: "20px",
              }}
            >
              <h3>Smart Parking System</h3>
              <p>
                Login to access real-time parking spot information and
                predictions
              </p>
              <div
                style={{
                  display: "flex",
                  gap: "10px",
                  justifyContent: "center",
                  flexWrap: "wrap",
                }}
              >
                <button
                  onClick={() => navigate("/login")}
                  style={{
                    backgroundColor: "#4FC3F7",
                    border: "none",
                    color: "white",
                    padding: "10px 20px",
                    borderRadius: "5px",
                    cursor: "pointer",
                  }}
                >
                  Login
                </button>
                <button
                  onClick={() => navigate("/signup")}
                  style={{
                    backgroundColor: "transparent",
                    border: "1px solid #4FC3F7",
                    color: "#4FC3F7",
                    padding: "10px 20px",
                    borderRadius: "5px",
                    cursor: "pointer",
                  }}
                >
                  Sign Up
                </button>
              </div>
            </motion.div>
          )}
        </div>
      </motion.div>

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
        <p>© 2025 Smart Parking System | All Rights Reserved</p>
      </footer>
    </div>
  );
};

export default Dashboard;
