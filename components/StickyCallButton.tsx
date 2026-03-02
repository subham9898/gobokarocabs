
import React from 'react';
import { motion } from 'motion/react';
import { Phone } from 'lucide-react';
import { CONTACT_PHONE } from '../constants';

const StickyCallButton: React.FC = () => {
  return (
    <div className="fixed bottom-8 right-8 z-[200]">
      <motion.a 
        initial={{ scale: 0, rotate: -180 }}
        animate={{ scale: 1, rotate: 0 }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        href={`tel:${CONTACT_PHONE}`}
        className="relative w-16 h-16 rounded-2xl bg-[#A3E635] text-black shadow-[0_20px_40px_-10px_rgba(163,230,53,0.5)] flex items-center justify-center border-4 border-white transition-all"
        aria-label="Call Support"
      >
        <Phone size={24} className="animate-[pulse_2s_infinite]" />
        <span className="absolute -top-2 -right-2 flex h-5 w-5">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-black opacity-40"></span>
          <span className="relative inline-flex rounded-full h-5 w-5 bg-black border-2 border-white"></span>
        </span>
      </motion.a>
    </div>
  );
};

export default StickyCallButton;
