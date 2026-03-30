import { FileText, Plus } from "lucide-react";
import { Navigate, Route, Routes, useLocation, useNavigate } from "react-router-dom";
import { AllOfferLetters } from "./pages/AllOfferLetters";
import { OfferLetterMaker } from "./pages/OfferLetterMaker";

function FeatureNavigation() {
  const location = useLocation();
  const navigate = useNavigate();
  const isList = location.pathname === "/offer-letters";
  const isMaker = location.pathname.startsWith("/offer-letter");

  return (
    <nav className="feature-nav">
      <button className={`feature-nav-link ${isList ? "active" : ""}`} type="button" onClick={() => navigate("/offer-letters")}>
        <FileText size={16} />
        View All Letters
      </button>
      <button className={`feature-nav-link ${isMaker ? "active" : ""}`} type="button" onClick={() => navigate("/offer-letter")}>
        <Plus size={16} />
        Create Offer Letter
      </button>
    </nav>
  );
}

export default function App() {
  return (
    <div className="app-root">
      <FeatureNavigation />
      <Routes>
        <Route path="/" element={<Navigate replace to="/offer-letters" />} />
        <Route path="/offer-letter" element={<OfferLetterMaker />} />
        <Route path="/offer-letter/:id" element={<OfferLetterMaker />} />
        <Route path="/offer-letters" element={<AllOfferLetters />} />
      </Routes>
    </div>
  );
}
