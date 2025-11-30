import { useState, useEffect } from "react";
import axios from "axios";
import { database } from "../Firebase";
import { ref, onValue } from "firebase/database";

export const useParkingSpots = (token) => {
  const [spots, setSpots] = useState([]);
  const [forecast, setForecast] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!token) {
      setSpots([]);
      setForecast(null);
      return;
    }

    const fetchSpots = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const [spotsRes, forecastRes] = await Promise.all([
          axios.get(`${process.env.REACT_APP_API_URL}/api/spots/`, {
            headers: { Authorization: `Token ${token}` },
          }),
          axios.get(`${process.env.REACT_APP_API_URL}/api/forecast/`, {
            headers: { Authorization: `Token ${token}` },
          }),
        ]);

        setSpots(spotsRes.data);
        setForecast(forecastRes.data[0]);
      } catch (err) {
        console.error("Error fetching from API:", err);
        setError(err.message || "Failed to fetch parking data");
      } finally {
        setLoading(false);
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

    return () => unsubscribe();
  }, [token]);

  return { spots, forecast, loading, error };
};
