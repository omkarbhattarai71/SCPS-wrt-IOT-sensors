import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { NotificationProvider } from "./context/NotificationContext";
import NotificationDisplay from "./components/common/NotificationDisplay";
import LoginPage from "./pages/LoginPage";
import SignupPage from "./pages/SignupPage";
import DashboardPage from "./pages/DashboardPage";
import BrowseParkingPage from "./pages/BrowseParkingPage";
import AboutUs from "./components/Aboutus";
import "bootstrap/dist/css/bootstrap.min.css";


function App() {
  return (
    <NotificationProvider>
      <AuthProvider>
        <Router>
          <NotificationDisplay />
          <Routes>
            <Route path="/" element={<BrowseParkingPage />} />
            <Route path="/dashboard" element={<DashboardPage />} />        
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<SignupPage />} />  
            <Route path="/about" element={<AboutUs/>}/>
          </Routes>
        </Router>
      </AuthProvider>
    </NotificationProvider>
  );
}


export default App;


