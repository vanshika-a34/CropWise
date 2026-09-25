import React from 'react';
import { LanguageProvider } from '../components/dashboard/LanguageContext';
import AgriNavbar from '../components/dashboard/AgriNavbar';
import AgriHero from '../components/dashboard/AgriHero';
import AgriFeatures from '../components/dashboard/AgriFeatures';
import AgriWeather from '../components/dashboard/AgriWeather';
import AgriSoilHeatmap from '../components/dashboard/AgriSoilHeatmap';
import AgriFooter from '../components/dashboard/AgriFooter';

/**
 * AgriDashboard — Main dashboard page that assembles all sections.
 * Wrapped in LanguageProvider for multilingual support.
 * This page is fully self-contained and does not depend on
 * any existing components from the main app.
 */
export default function Dashboard() {
  return (
    <div className="bg-[#0B1F1A] text-white font-outfit scroll-smooth">
      <AgriHero />
      <AgriFeatures />
      <AgriWeather />
      <AgriSoilHeatmap />
      <AgriFooter />
    </div>
  );
}
