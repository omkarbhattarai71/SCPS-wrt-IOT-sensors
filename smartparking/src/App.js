import { useState, useEffect } from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import LoginPage from "./pages/LoginPage";
import SignupPage from "./pages/SignupPage";
import DashboardPage from "./pages/DashboardPage";
import AboutUs from "./components/Aboutus";
import "bootstrap/dist/css/bootstrap.min.css";


function App() {
  const [token, setToken] = useState(localStorage.getItem("token") || null);

    useEffect(() => {
    if (token) {
      localStorage.setItem("token", token);
    } else {
      localStorage.removeItem("token");
    }
  }, [token]);


  return (
    <Router>
      <Routes>
        <Route path="/" element={<DashboardPage token={token} setToken={setToken} />} />
        <Route path="/dashboard" element={<DashboardPage token={token} setToken={setToken} />} />        
        <Route path="/login" element={<LoginPage setToken={setToken} />} />
        <Route path="/signup" element={<SignupPage />} />  
        <Route path="/about" element={<AboutUs/>}/>
      </Routes>
    </Router>
  );
}


export default App;


