
import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import StickyCallButton from './components/StickyCallButton';
import PrivacyPolicy from './components/PrivacyPolicy';
import TermsConditions from './components/TermsConditions';
import Home from './components/Home';
import NotFound from './components/NotFound';
import ErrorBoundary from './components/ErrorBoundary';
import Admin from './Admin';
import TourPackages from './TourPackages';
import TourPackageDetails from './TourPackageDetails';

const ScrollHandler: React.FC<{ targetId: string | null, onComplete: () => void }> = ({ targetId, onComplete }) => {
  useEffect(() => {
    if (targetId) {
      const timer = setTimeout(() => {
        if (targetId === 'top') {
          window.scrollTo({ top: 0, behavior: 'smooth' });
        } else {
          const element = document.getElementById(targetId);
          if (element) {
            const headerOffset = 100;
            const elementPosition = element.getBoundingClientRect().top + window.scrollY;
            const offsetPosition = elementPosition - headerOffset;
            window.scrollTo({ top: offsetPosition, behavior: 'smooth' });
          }
        }
        onComplete();
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [targetId, onComplete]);
  return null;
};

const App: React.FC = () => {
  return (
    <ErrorBoundary>
      <Router>
        <AppContent />
      </Router>
    </ErrorBoundary>
  );
};

const AppContent: React.FC = () => {
  const [targetSection, setTargetSection] = useState<string | null>(null);
  const location = useLocation();
  const isAdminPage = location.pathname.startsWith('/admin');

  const navigateToHome = (sectionId?: string) => {
    setTargetSection(sectionId || 'top');
  };

  if (isAdminPage) {
    return <Admin />;
  }

  return (
    <div className="min-h-screen bg-white flex flex-col overflow-x-hidden">
      <ScrollHandler targetId={targetSection} onComplete={() => setTargetSection(null)} />
      
      <Navbar onNavigateHome={navigateToHome} />
      
      <main className="flex-grow">
        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Routes location={location}>
              <Route path="/" element={<Home />} />
              <Route path="/tours" element={<TourPackages />} />
              <Route path="/tours/:id" element={<TourPackageDetails />} />
              <Route path="/privacy" element={<PrivacyPolicy />} />
              <Route path="/terms" element={<TermsConditions />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </motion.div>
        </AnimatePresence>
      </main>
      
      <Footer 
        onNavigateHome={navigateToHome} 
      />

      {/* Global Floating Elements */}
      <StickyCallButton />
    </div>
  );
};

export default App;
