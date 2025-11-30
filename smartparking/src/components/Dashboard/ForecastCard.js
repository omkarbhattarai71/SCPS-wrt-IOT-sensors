import React from "react";
import { motion } from "framer-motion";
import { COLORS } from "../../constants/parkingConstants";

const ForecastCard = ({ forecast }) => {
  if (!forecast) return null;

  const cardStyle = {
    backgroundColor: COLORS.darkOverlay,
    padding: "15px",
    borderRadius: "10px",
    color: "white",
    textAlign: "center",
    marginBottom: "15px",
  };

  const predictedValueStyle = {
    fontSize: "20px",
    color: COLORS.primary,
  };

  return (
    <motion.div
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.4 }}
      style={cardStyle}
    >
      <h4>🚗 Predicted Occupancy in 1 Hour:</h4>
      <p style={predictedValueStyle}>{forecast.yhat.toFixed(1)} spots</p>
    </motion.div>
  );
};

export default ForecastCard;
