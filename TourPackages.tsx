
import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Clock, MapPin, Phone, ArrowRight, ChevronRight, Search, X } from 'lucide-react';
import { TourPackage } from './types';
import { WHATSAPP_LINK, CONTACT_PHONE } from './constants';
import { Link } from 'react-router-dom';

const TourPackages: React.FC = () => {
  const [packages, setPackages] = useState<TourPackage[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  const filteredPackages = packages.filter(pkg => {
    const searchLower = searchTerm.toLowerCase();
    return (
      pkg.title.toLowerCase().includes(searchLower) ||
      pkg.description.toLowerCase().includes(searchLower) ||
      pkg.primary_from?.toLowerCase().includes(searchLower) ||
      pkg.primary_to?.toLowerCase().includes(searchLower)
    );
  });

  useEffect(() => {
    const fetchPackages = async () => {
      try {
        const response = await fetch('/api/tour-packages');
        if (response.ok) {
          setPackages(await response.json());
        }
      } catch (err) {
        console.error('Failed to fetch tour packages');
      } finally {
        setLoading(false);
      }
    };
    fetchPackages();
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen bg-white">
      <main className="pt-24 pb-24">
        {/* Hero Section */}
        <section className="px-4 md:px-8 mb-12">
          <div className="max-w-7xl mx-auto">
            <div className="bg-black rounded-[2.5rem] p-8 md:p-16 relative overflow-hidden">
              <div className="absolute inset-0 opacity-20">
                <img 
                  src="https://picsum.photos/seed/travel/1920/1080" 
                  alt="Background" 
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              </div>
              <div className="relative z-10">
                <motion.span 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="inline-block bg-[#A3E635] text-black px-4 py-1.5 rounded-full text-[9px] font-black tracking-[0.3em] uppercase mb-4"
                >
                  Explore Jharkhand
                </motion.span>
                <motion.h1 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="text-4xl md:text-6xl font-black text-white tracking-tighter leading-none mb-4"
                >
                  Curated <span className="text-[#A3E635] italic">Tour Packages.</span>
                </motion.h1>
                <motion.p 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="text-gray-400 text-sm md:text-base font-medium max-w-xl mb-10"
                >
                  Discover the hidden gems of Jharkhand with our specially crafted tour packages.
                </motion.p>

                {/* Filter / Search Bar */}
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="relative max-w-lg"
                >
                  <div className="absolute inset-y-0 left-6 flex items-center pointer-events-none">
                    <Search size={18} className="text-[#A3E635]" />
                  </div>
                  <input 
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search destination, theme, or city..."
                    className="w-full bg-white/10 backdrop-blur-md border-2 border-white/10 rounded-[1.5rem] py-5 pl-16 pr-6 text-white font-bold placeholder:text-gray-500 focus:border-[#A3E635] focus:bg-white/20 transition-all outline-none"
                  />
                  {searchTerm && (
                    <button 
                      onClick={() => setSearchTerm('')}
                      className="absolute inset-y-0 right-6 flex items-center text-gray-400 hover:text-white transition-colors"
                    >
                      <X size={18} />
                    </button>
                  )}
                </motion.div>
              </div>
            </div>
          </div>
        </section>

        {/* Packages Grid */}
        <section className="px-4 md:px-8">
          <div className="max-w-7xl mx-auto">
            {loading ? (
              <div className="text-center py-20">
                <div className="w-12 h-12 border-4 border-[#A3E635] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-gray-400 font-bold uppercase tracking-widest text-xs">Loading adventures...</p>
              </div>
            ) : packages.length > 0 ? (
              <>
                {filteredPackages.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {filteredPackages.map((pkg, i) => (
                      <Link to={`/tours/${pkg.id}`} key={pkg.id}>
                        <motion.div 
                          initial={{ opacity: 0, y: 30 }}
                          whileInView={{ opacity: 1, y: 0 }}
                          viewport={{ once: true }}
                          transition={{ delay: i * 0.1 }}
                          className="group bg-white rounded-[2.5rem] overflow-hidden border border-gray-100 shadow-sm hover:shadow-2xl transition-all duration-500"
                        >
                          <div className="relative h-72 overflow-hidden">
                            {pkg.image_url ? (
                              <img 
                                src={pkg.image_url} 
                                alt={pkg.title} 
                                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                              />
                            ) : (
                              <div className="w-full h-full bg-gray-100 flex items-center justify-center text-gray-300">
                                <MapPin size={48} />
                              </div>
                            )}
                            <div className="absolute top-6 left-6">
                              <span className="bg-white/90 backdrop-blur-md text-black px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg">
                                {pkg.duration}
                              </span>
                            </div>
                          </div>
                          
                          <div className="p-10">
                            {(pkg.primary_from || pkg.primary_to) && (
                              <div className="flex items-center gap-2 text-gray-400 font-black text-[9px] uppercase tracking-widest mb-3">
                                <span>{pkg.primary_from}</span>
                                <ChevronRight size={10} className="text-[#A3E635]" />
                                <span>{pkg.primary_to}</span>
                              </div>
                            )}
                            <div className="flex justify-between items-start mb-4">
                              <h3 className="text-2xl font-black text-gray-900 tracking-tight group-hover:text-[#A3E635] transition-colors">{pkg.title}</h3>
                            </div>
                            <p className="text-gray-500 font-medium text-sm leading-relaxed mb-8 line-clamp-3">
                              {pkg.description}
                            </p>
                            
                            <div className="flex items-center justify-between pt-8 border-t border-gray-50">
                              <div>
                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Starting from</p>
                                <p className="text-3xl font-black text-gray-900 tracking-tighter">₹{pkg.price.toLocaleString()}</p>
                              </div>
                              <div
                                className="w-14 h-14 bg-black text-[#A3E635] rounded-2xl flex items-center justify-center hover:bg-[#A3E635] hover:text-black transition-all shadow-xl group-hover:rotate-12"
                              >
                                <ArrowRight size={24} />
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      </Link>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-32 bg-gray-50 rounded-[3rem]">
                    <Search className="mx-auto text-gray-200 mb-6" size={64} />
                    <h3 className="text-2xl font-black text-gray-900 mb-2">No Matches Found</h3>
                    <p className="text-gray-400 font-medium">Try searching with a different keyword or location.</p>
                    <button 
                      onClick={() => setSearchTerm('')}
                      className="mt-8 text-[#A3E635] font-black uppercase tracking-widest text-[10px] border-b-2 border-[#A3E635]/20 hover:border-[#A3E635] transition-all"
                    >
                      Clear Search
                    </button>
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-32 bg-gray-50 rounded-[3rem]">
                <MapPin className="mx-auto text-gray-200 mb-6" size={64} />
                <h3 className="text-2xl font-black text-gray-900 mb-2">No Packages Yet</h3>
                <p className="text-gray-400 font-medium">We are currently crafting new adventures for you.</p>
              </div>
            )}
          </div>
        </section>

        {/* CTA Section */}
        <section className="px-4 md:px-8 mt-32">
          <div className="max-w-7xl mx-auto">
            <div className="bg-[#A3E635] rounded-[3rem] p-12 md:p-20 flex flex-col md:flex-row items-center justify-between gap-12 relative overflow-hidden">
              <div className="relative z-10">
                <h2 className="text-4xl md:text-6xl font-black text-black tracking-tighter leading-none mb-6">
                  Want a Custom <br/>
                  <span className="opacity-50 italic">Itinerary?</span>
                </h2>
                <p className="text-black/60 font-bold text-lg max-w-md">
                  Tell us where you want to go and we'll plan the perfect trip for you and your family.
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-4 relative z-10">
                <a 
                  href={`tel:${CONTACT_PHONE}`}
                  className="bg-black text-white px-10 py-6 rounded-2xl font-black uppercase tracking-widest text-sm flex items-center gap-3 shadow-2xl hover:scale-105 transition-all"
                >
                  <Phone size={20} />
                  Call Expert
                </a>
                <a 
                  href={WHATSAPP_LINK}
                  className="bg-white text-black px-10 py-6 rounded-2xl font-black uppercase tracking-widest text-sm flex items-center gap-3 shadow-2xl hover:scale-105 transition-all"
                >
                  WhatsApp Us
                </a>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};

export default TourPackages;
