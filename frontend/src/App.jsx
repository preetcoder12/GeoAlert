import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import SignupPage from "./Components/SignupPage";
import LoginPage from "./Components/LoginPage";
import HomePage from "./Components/HomePage";
import ReportForm from "./Components/ReportForm";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/report" element={<ReportForm />} />

      </Routes>
    </Router>
  );
}

export default App;
