import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { CVData } from '../types';
import { initialCVData } from '../types';
import CVForm from '../components/cv-form';
import CVPreview from '../components/cv-preview';

export default function CVBuilderPage() {
    const navigate = useNavigate();
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

    const handleBackToHome = () => {
        navigate('/');
    };

    const handlePrint = () => {
        window.print();
    };

    return (
        <div className="min-h-screen bg-gray-50 print:bg-white">
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
                    onBackToHome={handleBackToHome}
                />
            )}
        </div>
    );
}
