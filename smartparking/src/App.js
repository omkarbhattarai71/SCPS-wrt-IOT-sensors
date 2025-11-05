import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import LoginPage from "./pages/LoginPage";
import SignupPage from "./pages/SignupPage";
import DashboardPage from "./pages/DashboardPage";
import AboutUs from "./components/Aboutus";
import "bootstrap/dist/css/bootstrap.min.css";


function App() {
  // const [token, setToken] = useState(null);
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


// import React, { useState, useEffect } from "react";
// import { BrowserRouter as Router, Route, Routes, useNavigate } from "react-router-dom";
// import LoginPage from "./pages/LoginPage";
// import SignupPage from "./pages/SignupPage";
// import DashboardPage from "./pages/DashboardPage";
// import AboutUs from "./components/Aboutus";
// import "bootstrap/dist/css/bootstrap.min.css";


// // function App() {
// //   // const [token, setToken] = useState(null);
// //   const [token, setToken] = useState(localStorage.getItem("token") || null);

// //     useEffect(() => {
// //     if (token) {
// //       localStorage.setItem("token", token);
// //     } else {
// //       localStorage.removeItem("token");
// //     }
// //   }, [token]);
// // Create a wrapper component to handle navigation
// function AppContent() {
//   const [token, setToken] = useState(() => {
//     return localStorage.getItem("token") || null;
//   });
//   const navigate = useNavigate();

//   useEffect(() => {
//     if (token) {
//       localStorage.setItem("token", token);
//       // Navigate to dashboard when token is set
//       navigate("/dashboard");
//     } else {
//       localStorage.removeItem("token");
//     }
//   }, [token, navigate]);

//   return (
//     // <Router>
//       <Routes>
//         <Route path="/" element={<DashboardPage token={token} setToken={setToken} />} />
//         <Route path="/dashboard" element={<DashboardPage token={token} setToken={setToken} />} />        
//         <Route path="/login" element={<LoginPage setToken={setToken} />} />
//         <Route path="/signup" element={<SignupPage />} />  
//         <Route path="/about" element={<AboutUs/>}/>
//       </Routes>
//     // </Router>
//   );
// }
// function App() {
//   return (
//     <Router>
//       <AppContent />
//     </Router>
//   );
// }

// export default App;
