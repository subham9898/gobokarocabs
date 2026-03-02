
import React from 'react';
import { motion } from 'motion/react';
import { Link } from 'react-router-dom';
import { 
  ArrowRight, 
  ArrowRightLeft, 
  Clock, 
  Heart, 
  Users, 
  ChevronRight,
  Map
} from 'lucide-react';

const SERVICES = [
  {
    title: 'One- Way Trips',
    description: 'Why pay for a return trip you are not taking? Secure reliable intercity travel at a fraction of the price.',
    icon: ArrowRight,
    color: 'bg-blue-50 text-blue-600',
    link: '/'
  },
  {
    title: 'Round Trips',
    description: 'Save more when you book a return. Enjoy special rates and the convenience of a driver who waits, whether you are back in hours or days.',
    icon: ArrowRightLeft,
    color: 'bg-purple-50 text-purple-600',
    link: '/'
  },
  {
    title: 'Local Rentals',
    description: 'Hire by the hour or day. Your easiest way to move around your city.',
    icon: Clock,
    color: 'bg-amber-50 text-amber-600',
    link: '/'
  },
  {
    title: 'Explore Jharkhand',
    description: 'Discover hidden gems with curated tour packages. Safe, reliable travel led by local experts.',
    icon: Map,
    color: 'bg-emerald-50 text-emerald-600',
    link: '/tours'
  },
  {
    title: 'Wedding Fleet',
    description: 'Elevate your big day with luxury vehicles for grand groom entries and seamless guest transportation.',
    icon: Heart,
    color: 'bg-pink-50 text-pink-600',
    link: '/'
  },
  {
    title: 'Corporate & Events',
    description: '"Seamless Corporate Solutions & Event Services: No Hidden Charges, Just Pure Integrity."',
    icon: Users,
    color: 'bg-rose-50 text-rose-600',
    link: '/'
  }
];

const Services: React.FC = () => {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <section id="services" className="py-24 bg-white px-4">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-20">
          <motion.span 
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-[#A3E635] font-black text-[10px] tracking-[0.4em] uppercase"
          >
            Premium Mobility
          </motion.span>
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-4xl md:text-6xl font-black text-gray-900 mt-4 tracking-tighter"
          >
            Services Tailored For You
          </motion.h2>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {SERVICES.map((svc, idx) => (
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1 }}
              whileHover={{ y: -10 }}
              key={idx} 
            >
              {svc.link === '/' ? (
                <button onClick={scrollToTop} className="h-full block w-full text-left">
                  <div className="p-10 rounded-[3rem] border border-gray-100 bg-white hover:border-[#A3E635] hover:shadow-[0_32px_64px_-16px_rgba(0,0,0,0.1)] transition-all duration-500 group flex flex-col h-full">
                    <div className={`w-16 h-16 ${svc.color} group-hover:bg-[#A3E635] group-hover:text-black rounded-2xl flex items-center justify-center mb-8 transition-all duration-500 transform group-hover:rotate-12 shadow-sm`}>
                      <svc.icon size={28} />
                    </div>
                    <h3 className="text-2xl font-black text-gray-900 mb-4 tracking-tight">{svc.title}</h3>
                    <p className="text-gray-500 text-sm leading-relaxed font-medium">
                      {svc.description}
                    </p>
                    <div className="mt-auto pt-8 opacity-0 group-hover:opacity-100 transition-all transform translate-y-2 group-hover:translate-y-0">
                      <span className="text-[10px] font-black text-gray-900 flex items-center gap-2 uppercase tracking-widest">
                        Book Now <ChevronRight size={14} className="text-[#A3E635]" />
                      </span>
                    </div>
                  </div>
                </button>
              ) : (
                <Link to={svc.link} className="h-full block">
                  <div className="p-10 rounded-[3rem] border border-gray-100 bg-white hover:border-[#A3E635] hover:shadow-[0_32px_64px_-16px_rgba(0,0,0,0.1)] transition-all duration-500 group flex flex-col h-full">
                    <div className={`w-16 h-16 ${svc.color} group-hover:bg-[#A3E635] group-hover:text-black rounded-2xl flex items-center justify-center mb-8 transition-all duration-500 transform group-hover:rotate-12 shadow-sm`}>
                      <svc.icon size={28} />
                    </div>
                    <h3 className="text-2xl font-black text-gray-900 mb-4 tracking-tight">{svc.title}</h3>
                    <p className="text-gray-500 text-sm leading-relaxed font-medium">
                      {svc.description}
                    </p>
                    <div className="mt-auto pt-8 opacity-0 group-hover:opacity-100 transition-all transform translate-y-2 group-hover:translate-y-0">
                      <span className="text-[10px] font-black text-gray-900 flex items-center gap-2 uppercase tracking-widest">
                        {svc.title === 'Jharkhand Tourism' ? 'Explore Now' : 'Book Now'} <ChevronRight size={14} className="text-[#A3E635]" />
                      </span>
                    </div>
                  </div>
                </Link>
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Services;
