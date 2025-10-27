import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { motion } from 'framer-motion';
import axios from 'axios';
import { database } from '../firebase';
import { ref, onValue, off } from 'firebase/database';
import 'leaflet/dist/leaflet.css';

const Dashboard = ({ token }) => {
  const [spots, setSpots] = useState([]);
  const [searchId, setSearchId] = useState('');
  const [forecast, setForecast] = useState(null);

  useEffect(() => {
    // Fetch from REST API
    const fetchSpots = async () => {
      try {
        const res = await axios.get('http://localhost:8000/api/spots/', {
          headers: { Authorization: `Token ${token}` },
        });
        setSpots(res.data);

        const f = await axios.get('http://localhost:8000/api/forecast/', {
          headers: { Authorization: `Token ${token}` },
        });
        setForecast(f.data[0]);
      } catch (err) {
        console.error('Error fetching from API:', err);
      }
    };
    fetchSpots();

    // Firebase Realtime Database listener
    const spotsRef = ref(database, 'spots');
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

  const filteredSpots = spots.filter(
    (spot) => !searchId || spot.spot_id === parseInt(searchId)
  );

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <div className="container">
        <h1>Smart Parking Dashboard</h1>

        <input
          className="form-control mb-2"
          placeholder="Search Spot ID"
          value={searchId}
          onChange={(e) => setSearchId(e.target.value)}
        />

        <select className="form-control mb-2">
          <option>Filter: All</option>
          <option>Free</option>
          <option>Occupied</option>
        </select>

        {forecast && (
          <p>Predicted occupied in 1h: {forecast.yhat.toFixed(1)}</p>
        )}

        <MapContainer
          center={[51.505, -0.09]}
          zoom={13}
          style={{ height: '500px' }}
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
  );
};

export default Dashboard;
