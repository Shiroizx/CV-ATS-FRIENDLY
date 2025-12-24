import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Analytics } from "@vercel/analytics/react";
import MainPage from "./pages/MainPage";
import CVBuilderPage from "./pages/CVBuilderPage";
import CreativeManagementBuilderPage from "./pages/CreativeManagementBuilderPage";

function App() {
  return (
    <>
      <Router>
        <Routes>
          <Route path="/" element={<MainPage />} />
          <Route path="/builder" element={<CVBuilderPage />} />
          <Route path="/builder/creative-management" element={<CreativeManagementBuilderPage />} />
        </Routes>
      </Router>
      <Analytics />
    </>
  );
}

export default App;
