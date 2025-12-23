import { useState } from 'react';
import type { CVData } from './types';
import { initialCVData } from './types';
import CVForm from './components/cv-form';
import CVPreview from './components/cv-preview';

function App() {
  const [cvData, setCVData] = useState<CVData>(initialCVData);
  const [isPreviewMode, setIsPreviewMode] = useState(false);

  const handleFormChange = (data: CVData) => {
    setCVData(data);
  };

  const handlePreview = () => {
    setIsPreviewMode(true);
  };

  const handleBackToForm = () => {
    setIsPreviewMode(false);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {isPreviewMode ? (
        <CVPreview
          data={cvData}
          onBack={handleBackToForm}
          onPrint={handlePrint}
        />
      ) : (
        <CVForm
          data={cvData}
          onChange={handleFormChange}
          onPreview={handlePreview}
        />
      )}
    </div>
  );
}

export default App;
