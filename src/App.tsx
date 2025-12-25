import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Analytics } from "@vercel/analytics/react";
import "animate.css";
import "sweetalert2/dist/sweetalert2.min.css";
import Navbar from "./components/Navbar";
import MainPage from "./pages/MainPage";
import CVBuilderPage from "./pages/CVBuilderPage";
import CreativeManagementBuilderPage from "./pages/CreativeManagementBuilderPage";
import DonatePage from "./pages/DonatePage";
import ChangelogPage from "./pages/ChangelogPage";

function App() {
  return (
    <>
      <Router>
        <Navbar />
        <Routes>
          <Route path="/" element={<MainPage />} />
          <Route path="/builder" element={<CVBuilderPage />} />
          <Route path="/builder/creative-management" element={<CreativeManagementBuilderPage />} />
          <Route path="/donate" element={<DonatePage />} />
          <Route path="/changelog" element={<ChangelogPage />} />
        </Routes>
      </Router>
      <Analytics />
    </>
  );
}

export default App;
