import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Analytics } from "@vercel/analytics/react"
import MainPage from './pages/MainPage';
import CVBuilderPage from './pages/CVBuilderPage';

function App() {
  return (
    <>
      <Router>
        <Routes>
          <Route path="/" element={<MainPage />} />
          <Route path="/builder" element={<CVBuilderPage />} />
        </Routes>
      </Router>
      <Analytics />
    </>
  );
}

export default App;
