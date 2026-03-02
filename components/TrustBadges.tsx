
import React from 'react';
import { motion } from 'motion/react';
import { 
  UserCheck, 
  Sparkles, 
  MapPin, 
  Headphones 
} from 'lucide-react';

const BADGES = [
  { icon: UserCheck, title: 'Verified Drivers', desc: 'Police verified & trained' },
  { icon: Sparkles, title: 'Sanitized Cabs', desc: 'Clean & fresh every trip' },
  { icon: MapPin, title: 'GPS Tracked', desc: 'Real-time safety monitoring' },
  { icon: Headphones, title: '24/7 Support', desc: 'Bokaro based helpdesk' }
];

const TrustBadges: React.FC = () => {
  return (
    <div className="bg-white border-b border-gray-100 py-10 sm:py-12 px-4">
      <div className="max-w-7xl mx-auto flex flex-wrap justify-center gap-6 sm:gap-10 md:gap-20">
        {BADGES.map((badge, i) => (
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.1 }}
            key={i} 
            className="flex items-center gap-5 group"
          >
            <div className="w-14 h-14 rounded-2xl bg-gray-50 flex items-center justify-center text-gray-400 group-hover:bg-[#A3E635] group-hover:text-black group-hover:rotate-12 transition-all duration-500 shadow-sm">
              <badge.icon size={24} />
            </div>
            <div>
              <h4 className="font-black text-gray-900 text-[11px] uppercase tracking-[0.2em] mb-1">{badge.title}</h4>
              <p className="text-[9px] font-bold text-gray-400 uppercase tracking-[0.3em]">{badge.desc}</p>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default TrustBadges;
