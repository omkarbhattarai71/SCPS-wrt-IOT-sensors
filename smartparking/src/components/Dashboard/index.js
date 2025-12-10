import { useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useNotification } from "../../context/NotificationContext";
import { useAdminParkingLots } from "../../hooks/useAdminParkingLots";
import Header from "../common/Header";
import ParkingLotList from "./ParkingLotList";
import ParkingMap from "./ParkingMap";
import ManageParkingLot from "./ManageParkingLot";
import Footer from "../common/Footer";
import AddParkingLotModal from "./AddParkingLotModal";

const Dashboard = () => {
  const navigate = useNavigate();
  const { token, setToken } = useAuth();
  const { showSuccess, showError } = useNotification();
  const { parkingLots, loading } = useAdminParkingLots();
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedLot, setSelectedLot] = useState(null);

  const handleLogout = () => {
    setToken(null);
    navigate("/");
  };

  const handleBrowseParking = () => {
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

  const handleUpdateLot = async (lotId, formData) => {
    try {
      const response = await fetch(process.env.REACT_APP_API_URL + "/cadmin/parking-lots/", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ id: lotId, ...formData })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to update parking lot");
      }

      const data = await response.json();
      showSuccess("Parking lot updated successfully!");

      // Trigger refetch of parking lots list
      window.location.reload();
    } catch (error) {
      showError(error.message || "Failed to update parking lot");
      console.error("Error updating parking lot:", error);
    }
  };

  const handleDeleteLot = async (lot) => {
    try {
      const response = await fetch(process.env.REACT_APP_API_URL + `/cadmin/parking-lots/`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ id: lot.id })
      });

      if (!response.ok) {
        throw new Error("Failed to delete parking lot");
      }

      showSuccess("Parking lot deleted successfully!");
      setSelectedLot(null);
      window.location.reload();
    } catch (error) {
      showError(error.message || "Failed to delete parking lot");
      console.error("Error deleting parking lot:", error);
    }
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
        onBrowseParking={handleBrowseParking}
      />

      <div style={backgroundStyle}></div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <div className="container-fluid my-4">
          <h1 className="text-center text-white mb-4">Parking Lots Dashboard</h1>
          <div className="row" style={{ minHeight: "calc(100vh - 250px)" }}>
            <div className="col-md-4">
              <div style={{ height: "60%", marginBottom: "20px", maxHeight: "calc(60vh - 150px)", overflowY: "auto" }}>
                <ParkingLotList
                  parkingLots={parkingLots}
                  loading={loading}
                  selectedLot={selectedLot}
                  onSelectLot={setSelectedLot}
                  onAdd={handleAddLot}
                />
              </div>
              <div style={{ height: "38%" }}>
                <ManageParkingLot
                  selectedLot={selectedLot}
                  onUpdate={handleUpdateLot}
                  onDelete={handleDeleteLot}
                />
              </div>
            </div>
            <div className="col-md-8" style={{ height: "calc(100vh - 180px)" }}>
              <ParkingMap
                token={token}
                parkingLots={parkingLots}
                selectedLot={selectedLot}
                onSelectLot={setSelectedLot}
              />
            </div>
          </div>
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
