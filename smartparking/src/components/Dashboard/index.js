import { useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useNotification } from "../../context/NotificationContext";
import Header from "../common/Header";
import ParkingLotList from "./ParkingLotList";
import ParkingMap from "./ParkingMap";
import Footer from "../common/Footer";
import AddParkingLotModal from "./AddParkingLotModal";

const Dashboard = () => {
  const navigate = useNavigate();
  const { token, setToken } = useAuth();
  const { showSuccess, showError } = useNotification();
  const [showAddModal, setShowAddModal] = useState(false);

  const handleLogout = () => {
    setToken(null);
    navigate("/");
  };

  const handleAddLot = () => {
    setShowAddModal(true);
  };

  const handleSubmitNewLot = async (formData) => {
    try {
      const response = await fetch(process.env.REACT_APP_API_URL + "/cadmin/parking-lots/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to create parking lot");
      }

      const data = await response.json();
      showSuccess("Parking lot created successfully!");
      
      // Trigger refetch of parking lots list
      window.location.reload();
    } catch (error) {
      showError(error.message || "Failed to create parking lot");
      console.error("Error creating parking lot:", error);
    }
  };

  const handleDeleteLot = (lot) => {
    console.log("Delete parking lot:", lot);
    // TODO: Implement delete functionality
  };

  const handleManageLot = (lot) => {
    console.log("Manage parking lot:", lot);
    // TODO: Implement manage functionality
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
      <Header token={token} onLogout={handleLogout} />

      <div style={backgroundStyle}></div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <div className="container my-4">
          <h1 className="text-center text-white mb-4">Parking Lots Dashboard</h1>
          <ParkingLotList 
            onSelectLot={(lot) => console.log("Selected lot:", lot)}
            onAdd={handleAddLot}
            onDelete={handleDeleteLot}
            onManage={handleManageLot}
          />
        </div>

        <div className="container">

          <ParkingMap token={token} spots={[]}/>
        </div>
      </motion.div>

      <AddParkingLotModal 
        show={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSubmit={handleSubmitNewLot}
      />

      <Footer />
    </div>
  );
};

export default Dashboard;
