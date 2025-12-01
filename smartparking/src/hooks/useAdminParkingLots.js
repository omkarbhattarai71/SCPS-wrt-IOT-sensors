import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { useNotification } from "../context/NotificationContext";

export const useAdminParkingLots = () => {
  const [parkingLots, setParkingLots] = useState([]);
  const [loading, setLoading] = useState(false);
  const { token } = useAuth();
  const { showError } = useNotification();

  const fetchParkingLots = async () => {
    if (!token) return;

    setLoading(true);
    try {
      const response = await fetch(process.env.REACT_APP_API_URL + "/cadmin/parking-lots", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch parking lots");
      }

      const data = await response.json();
      setParkingLots(data.parking_lots || []);
    } catch (err) {
      const errorMessage = err.message || "Failed to load parking lots";
      showError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchParkingLots();
  }, [token]);

  return {
    parkingLots,
    loading,
    refetch: fetchParkingLots,
  };
};