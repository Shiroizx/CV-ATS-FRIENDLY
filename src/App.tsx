import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Analytics } from "@vercel/analytics/react";
import "animate.css";
import "sweetalert2/dist/sweetalert2.min.css";
import Navbar from "./components/Navbar";
import MainPage from "./pages/MainPage";
import CVBuilderPage from "./pages/CVBuilderPage";
import CreativeManagementBuilderPage from "./pages/CreativeManagementBuilderPage";
import PortfolioBuilderPage from "./pages/PortfolioBuilderPage";
import DonatePage from "./pages/DonatePage";
import ChangelogPage from "./pages/ChangelogPage";
import PortfolioMobilePreview from "./pages/PortfolioMobilePreview";
import SpkDssPage from "./pages/SpkDssPage";

import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import EmailConfirmedPage from "./pages/EmailConfirmedPage";
import SettingsPage from "./pages/SettingsPage";
import { AuthProvider } from "./contexts/AuthContext";
import AdminDashboardPage from "./pages/AdminDashboardPage";
import MyResumesPage from "./pages/MyResumesPage";
import DownloadHistoryPage from "./pages/DownloadHistoryPage";
import TermsPage from "./pages/TermsPage";
import PrivacyPage from "./pages/PrivacyPage";
import AdminRoute from "./components/AdminRoute";
import ProtectedRoute from "./components/ProtectedRoute";

function App() {
  return (
    <AuthProvider>
      <Router>
        <Navbar />
        <Routes>
          <Route path="/" element={<MainPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/email-confirmed" element={<EmailConfirmedPage />} />
          <Route path="/builder" element={<CVBuilderPage />} />
          <Route path="/cv-builder/:id?" element={<CVBuilderPage />} />
          <Route path="/builder/creative-management/:id?" element={<CreativeManagementBuilderPage />} />
          <Route path="/builder/portfolio/preview" element={<PortfolioMobilePreview />} />
          <Route path="/builder/portfolio/:id?" element={<PortfolioBuilderPage />} />
          <Route path="/my-resumes" element={<ProtectedRoute><MyResumesPage /></ProtectedRoute>} />
          <Route path="/download-history" element={<ProtectedRoute><DownloadHistoryPage /></ProtectedRoute>} />
          <Route path="/settings" element={<ProtectedRoute><SettingsPage /></ProtectedRoute>} />
          <Route path="/admin" element={<AdminRoute><AdminDashboardPage /></AdminRoute>} />
          <Route path="/spk" element={<AdminRoute><SpkDssPage /></AdminRoute>} />
          <Route path="/donate" element={<DonatePage />} />
          <Route path="/changelog" element={<ChangelogPage />} />
          <Route path="/terms" element={<TermsPage />} />
          <Route path="/privacy" element={<PrivacyPage />} />
        </Routes>
      </Router>
      <Analytics />
    </AuthProvider>
  );
}

export default App;
