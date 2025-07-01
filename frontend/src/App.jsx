import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import SignupPage from "./Components/SignupPage";
import LoginPage from "./Components/LoginPage";
import HomePage from "./Components/HomePage";
import ReportForm from "./Components/ReportForm";
import AdminSignup from "./Components/AdminSignup";
import Admin from "./Components/Admin";
import AdminLogin from "./Components/AdminLogin";
import Select_role from "./Components/Select_role";
import SpecificUserDetails from "./Components/SpecificUserDetails";
import SpecificIncident from "./Components/SpecificIncident";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Select_role />} />
        {/* user */}
        <Route path="/home" element={<HomePage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/report" element={<ReportForm />} />

        {/* admin */}
        <Route path="/adminsignup" element={<AdminSignup />} />
        <Route path="/admin" element={<Admin />} />
        <Route path="/adminlogin" element={<AdminLogin />} />
        <Route path="/details/:id" element={<SpecificUserDetails />} />
        <Route path="/incident/:id" element={<SpecificIncident />} />

      </Routes>
    </Router>
  );
}

export default App;
