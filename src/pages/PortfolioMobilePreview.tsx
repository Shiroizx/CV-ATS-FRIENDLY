import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import PortfolioPreview from "../components/portfolio/PortfolioPreview";
import type { PortfolioData } from "../types/portfolio";
import { initialPortfolioData } from "../types/portfolio";

export default function PortfolioMobilePreview() {
    const navigate = useNavigate();
    const [data, setData] = useState<PortfolioData>(initialPortfolioData);

    useEffect(() => {
        document.title = "Portfolio Preview - FreeBuild CV";
        // Retrieve data from sessionStorage
        const storedData = sessionStorage.getItem("portfolioPreviewData");
        if (storedData) {
            try {
                setData(JSON.parse(storedData));
            } catch (err) {
                console.error("Failed to parse portfolio data:", err);
            }
        } else {
            // No data found, redirect back
            navigate("/builder/portfolio");
        }
    }, [navigate]);

    return (
        <div className="min-h-screen bg-gray-100 flex flex-col">
            <header className="sticky top-0 z-50 bg-white border-b border-gray-200 px-4 py-3 flex items-center gap-3">
                <button
                    onClick={() => navigate("/builder/portfolio")}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                    <ArrowLeft className="w-5 h-5 text-gray-600" />
                </button>
                <h2 className="text-lg font-semibold text-gray-900">Preview Portfolio</h2>
            </header>

            <main className="flex-1 w-full max-w-2xl mx-auto overflow-x-hidden p-0 sm:p-4">
                <PortfolioPreview data={data} />
            </main>
        </div>
    );
}
