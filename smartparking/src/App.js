import { useState, useEffect } from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import LoginPage from "./pages/LoginPage";
import SignupPage from "./pages/SignupPage";
import DashboardPage from "./pages/DashboardPage";
import AdminDashboardPage from "./pages/AdminDashboardPage";
import AboutUs from "./components/Aboutus";
import "bootstrap/dist/css/bootstrap.min.css";

function App() {
  const [token, setToken] = useState(localStorage.getItem("token") || null);
  const [userType, setUserType] = useState(
    localStorage.getItem("userType") || null
  );

  useEffect(() => {
    if (token) {
      localStorage.setItem("token", token);
    } else {
      localStorage.removeItem("token");
      localStorage.removeItem("userType");
    }
    if (userType) {
      localStorage.setItem("userType", userType);
    }
  }, [token, userType]);
  const handleLogout = () => {
    setToken(null);
    setUserType("user");
  };

  return (
    <Router>
      <Routes>
        <Route
          path="/"
          element={
            <DashboardPage
              token={token}
              setToken={setToken}
              onLogout={handleLogout}
            />
          }
        />
        <Route
          path="/dashboard"
          element={
            <DashboardPage
              token={token}
              setToken={setToken}
              onLogout={handleLogout}
            />
          }
        />
        <Route
          path="/admin"
          element={
            <AdminDashboardPage
              token={token}
              setToken={setToken}
              onLogout={handleLogout}
            />
          }
        />
        <Route path="/login" element={<LoginPage setToken={setToken} setUserType={setUserType}/>} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/about" element={<AboutUs />} />
      </Routes>
    </Router>
  );
}

export default App;


