
import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { Menu, X, Phone, MessageSquare, ChevronRight, Globe } from 'lucide-react';
import { CONTACT_PHONE, WHATSAPP_LINK, INSTAGRAM_LINK, FACEBOOK_LINK } from '../constants';

interface NavbarProps {
  onNavigateHome?: (sectionId?: string) => void;
}

const Navbar: React.FC<NavbarProps> = ({ onNavigateHome }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (isMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
  }, [isMenuOpen]);

  const handleNavClick = (e: React.MouseEvent, id?: string) => {
    if (location.pathname !== '/') {
      navigate('/');
      setTimeout(() => {
        if (onNavigateHome) onNavigateHome(id);
      }, 100);
    } else {
      e.preventDefault();
      if (onNavigateHome) {
        onNavigateHome(id);
      }
    }
    setIsMenuOpen(false);
  };

  const navLinks = [
    { name: 'Services', id: 'services' },
    { name: 'Pricing', id: 'pricing' },
    { name: 'About', id: 'about' },
  ];

  return (
    <motion.nav 
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className="fixed top-0 w-full z-[100] py-4 px-4 md:px-8"
    >
      <div className="max-w-7xl mx-auto">
        <div className="relative flex items-center justify-between px-6 py-3 rounded-[2rem] bg-white/90 backdrop-blur-xl border border-white/20 shadow-[0_8px_32px_rgba(0,0,0,0.08)]">
          {/* Logo Section */}
          <Link 
            to="/" 
            className="flex items-center gap-3 group" 
            onClick={(e) => handleNavClick(e)}
          >
            <motion.div 
              whileHover={{ rotate: 12 }}
              className="w-10 h-10 md:w-12 md:h-12 bg-white rounded-xl flex items-center justify-center overflow-hidden shadow-lg border-2 border-[#A3E635]"
            >
              <img 
                src="https://res.cloudinary.com/dn6sk8mqh/image/upload/v1771266719/Screenshot_2026-02-16_235537_ru81eo.png" 
                alt="Go Bokaro Cabs Logo" 
                className="w-full h-full object-cover scale-110"
              />
            </motion.div>
            <div>
              <h1 className="text-base md:text-xl font-black tracking-tighter leading-none text-black">GO BOKARO</h1>
              <p className="text-[8px] md:text-[10px] tracking-[0.2em] text-[#A3E635] font-bold uppercase">Premium Cabs</p>
            </div>
          </Link>

          {/* Desktop Links */}
          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <button
                key={link.id}
                onClick={(e) => handleNavClick(e as any, link.id)}
                className="text-[10px] font-black uppercase tracking-[0.2em] transition-all hover:text-[#A3E635] text-gray-500"
              >
                {link.name}
              </button>
            ))}
            <Link 
              to="/tours" 
              className="text-[10px] font-black uppercase tracking-[0.2em] transition-all hover:text-[#A3E635] text-gray-500"
            >
              Tour Packages
            </Link>
          </div>

          {/* CTAs */}
          <div className="flex items-center gap-3">
            <a 
              href={`tel:${CONTACT_PHONE}`}
              className="hidden lg:flex items-center gap-2 px-5 py-2.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all bg-gray-100 text-black hover:bg-black hover:text-white"
            >
              <Phone size={14} />
              <span>{CONTACT_PHONE}</span>
            </a>
            <motion.a 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              href={WHATSAPP_LINK}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-[#A3E635] text-black px-6 py-2.5 rounded-full font-black text-[10px] md:text-xs tracking-widest uppercase shadow-[0_8px_20px_-4px_rgba(163,230,53,0.5)] transition-all"
            >
              BOOK NOW
            </motion.a>
            
            {/* Mobile Menu Toggle */}
            <button 
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden p-2 rounded-xl transition-colors text-black hover:bg-gray-100"
              aria-label="Toggle Menu"
            >
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation Overlay */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div 
            initial={{ opacity: 0, x: '100%' }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed inset-0 bg-white z-[99] md:hidden flex flex-col p-8 pt-32"
          >
            <div className="flex flex-col gap-8">
              <button 
                onClick={() => setIsMenuOpen(false)}
                className="self-start flex items-center gap-2 text-gray-400 font-black text-[10px] uppercase tracking-[0.3em] mb-4 hover:text-black transition-colors"
              >
                <ChevronRight size={16} className="rotate-180" />
                Back
              </button>
              {['Home', 'Tour Packages', ...navLinks.map(l => l.name)].map((name, i) => (
                <motion.button
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.1 }}
                  key={name}
                  onClick={(e) => {
                    if (name === 'Tour Packages') {
                      navigate('/tours');
                      setIsMenuOpen(false);
                    } else {
                      handleNavClick(e as any, name.toLowerCase() === 'home' ? undefined : name.toLowerCase())
                    }
                  }}
                  className="text-4xl font-black text-gray-900 flex justify-between items-center group"
                >
                  {name}
                  <ChevronRight size={32} className="text-gray-200 group-hover:text-[#A3E635] transition-colors" />
                </motion.button>
              ))}
            </div>
            
            <div className="mt-auto space-y-8">
              <div className="h-px bg-gray-100"></div>
              <div className="grid grid-cols-2 gap-4">
                <a href={`tel:${CONTACT_PHONE}`} className="flex flex-col items-center gap-3 p-6 bg-gray-50 rounded-[2rem]">
                  <Phone className="text-gray-400" size={24} />
                  <span className="text-[10px] font-black uppercase tracking-widest">Call Us</span>
                </a>
                <a href={WHATSAPP_LINK} className="flex flex-col items-center gap-3 p-6 bg-lime-50 rounded-[2rem]">
                  <MessageSquare className="text-lime-600" size={24} />
                  <span className="text-[10px] font-black uppercase tracking-widest text-lime-600">WhatsApp</span>
                </a>
              </div>
              <div className="flex justify-center gap-6">
                <a href={FACEBOOK_LINK} className="w-12 h-12 rounded-full bg-gray-50 flex items-center justify-center text-gray-400 hover:bg-black hover:text-white transition-all">
                  <Globe size={20} />
                </a>
                <a href={INSTAGRAM_LINK} className="w-12 h-12 rounded-full bg-gray-50 flex items-center justify-center text-gray-400 hover:bg-black hover:text-white transition-all">
                  <Globe size={20} />
                </a>
              </div>
              <p className="text-center text-gray-400 text-[10px] font-black uppercase tracking-[0.3em]">Premium • Reliable • Local</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
};

export default Navbar;
