import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronDown, MapPin, ArrowRight, Clock } from 'lucide-react';
import { RoutePrice } from '../types';
import { ROUTES_PRICING } from '../constants';

const PriceTable: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'intercity' | 'rentals'>('intercity');
  const [routes, setRoutes] = useState<RoutePrice[]>([]);
  const [rentals, setRentals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [visibleCount, setVisibleCount] = useState(10);

  useEffect(() => {
    const fetchPricing = async () => {
      try {
        const [routesRes, rentalsRes] = await Promise.all([
          fetch('/api/routes'),
          fetch('/api/rentals')
        ]);
        if (routesRes.ok) setRoutes(await routesRes.json());
        if (rentalsRes.ok) setRentals(await rentalsRes.json());
      } catch (err) {
        console.error('Failed to fetch pricing');
      } finally {
        setLoading(false);
      }
    };
    fetchPricing();
  }, []);

  const visibleRoutes = (routes.length > 0 ? routes : ROUTES_PRICING).slice(0, visibleCount);
  const totalRoutesCount = routes.length > 0 ? routes.length : ROUTES_PRICING.length;
  const hasMore = activeTab === 'intercity' && visibleCount < totalRoutesCount;

  const handleShowMore = () => {
    setVisibleCount(prev => prev + 10);
  };

  return (
    <section id="pricing" className="py-24 bg-gray-50 px-4 md:px-8">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <span className="inline-block bg-lime-100 text-lime-700 px-4 py-1 rounded-full text-[10px] font-black tracking-[0.2em] uppercase mb-4">Pricing Guide</span>
          <h2 className="text-3xl md:text-5xl font-black text-gray-900 mb-4 tracking-tight">Standard Intercity One Way Rates</h2>
          <p className="text-gray-500 text-sm md:text-lg max-w-2xl mx-auto font-medium">Transparent, competitive, and honest pricing across Jharkhand. No hidden charges-- just exceptional service.</p>
          
          <div className="flex justify-center mt-12">
            <div className="bg-white p-1 rounded-2xl flex gap-1 shadow-sm border border-gray-100">
              <button 
                onClick={() => setActiveTab('intercity')}
                className={`px-8 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'intercity' ? 'bg-black text-[#A3E635] shadow-lg' : 'text-gray-400 hover:text-gray-600'}`}
              >
                Intercity Drops
              </button>
              <button 
                onClick={() => setActiveTab('rentals')}
                className={`px-8 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'rentals' ? 'bg-black text-[#A3E635] shadow-lg' : 'text-gray-400 hover:text-gray-600'}`}
              >
                Local Rentals
              </button>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-20">
            <div className="w-12 h-12 border-4 border-[#A3E635] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-400 font-bold uppercase tracking-widest text-xs">Fetching latest prices...</p>
          </div>
        ) : (
          <>
            {activeTab === 'intercity' ? (
              <>
                {/* Desktop View (Table) */}
                <div className="hidden lg:block overflow-hidden rounded-[2.5rem] shadow-2xl border-4 border-white bg-white">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-black text-white">
                        <th className="p-8 text-xs font-black uppercase tracking-widest opacity-60">Route (From - To)</th>
                        <th className="p-8 text-xs font-black uppercase tracking-widest opacity-60">Time & Distance</th>
                        <th className="p-8 text-xs font-black uppercase tracking-widest text-center bg-[#A3E635] text-black">Sedan</th>
                        <th className="p-8 text-xs font-black uppercase tracking-widest text-center">Ertiga</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {visibleRoutes.map((route, idx) => (
                        <motion.tr 
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: (idx % 10) * 0.05 }}
                          key={idx} 
                          className="hover:bg-gray-50/80 transition-colors group"
                        >
                          <td className="p-8">
                            <div className="flex items-center gap-4">
                              <div className="w-12 h-12 rounded-2xl bg-lime-100 flex items-center justify-center text-[#A3E635] group-hover:bg-[#A3E635] group-hover:text-black transition-all">
                                <MapPin size={20} />
                              </div>
                              <div className="flex flex-wrap items-center gap-2">
                                <span className="font-black text-xl text-gray-900 tracking-tight">{route.from || 'Bokaro'}</span>
                                <ArrowRight size={16} className="text-gray-300 mx-1" />
                                <span className="font-black text-xl text-gray-900 tracking-tight">{route.destination}</span>
                              </div>
                            </div>
                          </td>
                          <td className="p-8">
                            <div className="flex flex-col">
                              <span className="font-black text-gray-800 text-lg">{route.time}</span>
                              <span className="text-xs uppercase tracking-widest font-black text-gray-400">{route.distance}</span>
                            </div>
                          </td>
                          <td className="p-8 text-center bg-lime-50/30">
                            <span className="text-3xl font-black text-gray-900">₹{(route.sedan || 0).toLocaleString()}</span>
                            <span className="block text-[10px] font-bold text-lime-600 uppercase mt-1 tracking-widest">Base Fare</span>
                          </td>
                          <td className="p-8 text-center">
                            <span className="text-3xl font-black text-gray-900">₹{(route.ertiga || 0).toLocaleString()}</span>
                            <span className="block text-[10px] font-bold text-gray-400 uppercase mt-1 tracking-widest">Premium Choice</span>
                          </td>
                        </motion.tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Mobile View (Cards) */}
                <div className="lg:hidden grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {visibleRoutes.map((route, idx) => (
                    <motion.div 
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: (idx % 10) * 0.05 }}
                      key={idx} 
                      className="bg-white rounded-[2rem] p-8 shadow-xl border border-gray-100 hover:border-[#A3E635] transition-all transform active:scale-[0.98]"
                    >
                      <div className="flex justify-between items-start mb-6">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-2xl bg-lime-500 text-white flex items-center justify-center shadow-lg shadow-lime-500/20">
                            <MapPin size={20} />
                          </div>
                          <div>
                            <div className="flex flex-wrap items-center gap-2">
                               <h3 className="font-black text-2xl text-gray-900 tracking-tight">{route.from || 'Bokaro'}</h3>
                               <ArrowRight size={14} className="text-[#A3E635]" />
                               <h3 className="font-black text-2xl text-gray-900 tracking-tight">{route.destination}</h3>
                            </div>
                            <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest mt-1">{route.distance} • {route.time}</p>
                          </div>
                        </div>
                      </div>
                      
                      <div className="space-y-4">
                        <div className="bg-lime-50 p-5 rounded-2xl flex justify-between items-center">
                          <div>
                            <p className="text-[9px] uppercase font-black text-lime-700 tracking-[0.2em] mb-1">Sedan</p>
                            <p className="text-2xl font-black text-gray-900">₹{(route.sedan || 0).toLocaleString()}</p>
                          </div>
                          <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-sm text-lime-600">
                            <i className="fas fa-car"></i>
                          </div>
                        </div>
                        <div className="bg-gray-50 p-5 rounded-2xl flex justify-between items-center">
                          <div>
                            <p className="text-[9px] uppercase font-black text-gray-500 tracking-[0.2em] mb-1">Ertiga (SUV)</p>
                            <p className="text-2xl font-black text-gray-900">₹{(route.ertiga || 0).toLocaleString()}</p>
                          </div>
                          <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-sm text-gray-400">
                            <i className="fas fa-shuttle-van"></i>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {rentals.map((rate, idx) => (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: idx * 0.05 }}
                    key={idx} 
                    className="p-8 rounded-[2.5rem] border border-gray-100 bg-white hover:border-[#A3E635] hover:shadow-[0_24px_48px_-12px_rgba(0,0,0,0.08)] transition-all duration-500 group text-center"
                  >
                    <div className="w-16 h-16 bg-gray-50 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:bg-black group-hover:text-[#A3E635] transition-all">
                      <Clock size={28} />
                    </div>
                    <h3 className="text-xl font-black text-gray-900 mb-1">{rate.hr} Package</h3>
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-6">{rate.km} limit • {rate.city}</p>
                    <div className="text-4xl font-black text-gray-900 tracking-tighter mb-2">
                      <span className="text-lg">₹</span>{rate.rate}
                    </div>
                    <p className="text-[9px] font-bold text-lime-600 uppercase tracking-widest">Inclusive of all taxes</p>
                  </motion.div>
                ))}
                {rentals.length === 0 && (
                  <div className="col-span-full py-20 text-center bg-white rounded-[2.5rem] border border-dashed border-gray-200">
                    <p className="text-gray-400 font-bold uppercase tracking-widest text-xs">No rental packages added yet.</p>
                  </div>
                )}
              </div>
            )}

            {/* Show More Button */}
            {hasMore && (
              <div className="mt-12 text-center">
                <button 
                  onClick={handleShowMore}
                  className="group inline-flex items-center gap-3 bg-black text-white px-10 py-5 rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-[#A3E635] hover:text-black transition-all shadow-xl hover:scale-105 active:scale-95"
                >
                  Show More Cities
                  <ChevronDown className="group-hover:animate-bounce" size={18} />
                </button>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-4">
                  Showing {visibleCount} of {routes.length} available destinations
                </p>
              </div>
            )}
          </>
        )}
        
        <div className="mt-12 text-center text-gray-400 font-medium px-6">
          <div className="max-w-xl mx-auto border-t border-gray-100 pt-8 space-y-2">
            <p className="text-xs">* Prices are indicative for one-way drops. Toll, parking, and state taxes are included.</p>
            <p className="text-[10px] uppercase font-black tracking-widest text-lime-600">Verified Service • 24/7 Bokaro Helpdesk</p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default PriceTable;
