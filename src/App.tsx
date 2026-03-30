import { FileText, Home, Receipt, ScrollText, Wallet } from "lucide-react";
import { Link, NavLink, Route, Routes, useLocation } from "react-router-dom";
import { AllOfferLetters } from "./pages/AllOfferLetters";
import { OfferLetterMaker } from "./pages/OfferLetterMaker";

function PlaceholderPage({ title, description }: { title: string; description: string }) {
  return (
    <div className="page-shell">
      <section className="hero-card">
        <p className="eyebrow">Document Hub</p>
        <h1>{title}</h1>
        <p>{description}</p>
        <Link className="primary-button" to="/offer-letter">
          Create Offer Letter
        </Link>
      </section>
    </div>
  );
}

function BottomNavigation() {
  const location = useLocation();

  const items = [
    { to: "/", label: "Home", icon: Home },
    { to: "/quotations", label: "Quotations", icon: ScrollText },
    { to: "/invoices", label: "Invoices", icon: Receipt },
    { to: "/wallet", label: "Wallet", icon: Wallet },
    { to: "/offer-letters", label: "Offer Letters", icon: FileText },
  ];

  return (
    <nav className="bottom-nav">
      {items.map((item) => {
        const Icon = item.icon;
        const isActive =
          location.pathname === item.to ||
          (item.to === "/offer-letters" && location.pathname.startsWith("/offer-letter"));

        return (
          <NavLink key={item.to} className={`bottom-nav-link ${isActive ? "active" : ""}`} to={item.to}>
            <Icon size={18} />
            <span>{item.label}</span>
          </NavLink>
        );
      })}
    </nav>
  );
}

export default function App() {
  return (
    <div className="app-root">
      <Routes>
        <Route
          path="/"
          element={
            <PlaceholderPage
              title="Offer Letter Creator"
              description="Build polished employment offer letters with structured editing, live preview, and export-ready document rendering."
            />
          }
        />
        <Route
          path="/quotations"
          element={
            <PlaceholderPage
              title="Quotations"
              description="Quotation tools can be plugged in here later without changing the offer letter feature structure."
            />
          }
        />
        <Route
          path="/invoices"
          element={
            <PlaceholderPage
              title="Invoices"
              description="Invoice flows can sit alongside offer letters inside the same document workspace."
            />
          }
        />
        <Route
          path="/wallet"
          element={
            <PlaceholderPage
              title="Wallet"
              description="This placeholder keeps the bottom navigation aligned with the larger document app plan."
            />
          }
        />
        <Route path="/offer-letter" element={<OfferLetterMaker />} />
        <Route path="/offer-letter/:id" element={<OfferLetterMaker />} />
        <Route path="/offer-letters" element={<AllOfferLetters />} />
      </Routes>
      <BottomNavigation />
    </div>
  );
}
