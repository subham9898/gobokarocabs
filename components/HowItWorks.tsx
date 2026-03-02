
import React from 'react';

const STEPS = [
  {
    step: '01',
    title: 'Choose Your Route',
    desc: 'Seamlessly choose your origin and destination from our extensive Jharkhand network.',
    icon: 'fa-map-location-dot'
  },
  {
    step: '02',
    title: 'Get Instant Quotes',
    desc: 'View fixed rates for Sedans and SUVs instantly. What you see is exactly what you pay- no hidden fees ever.',
    icon: 'fa-hand-holding-dollar'
  },
  {
    step: '03',
    title: 'Confirm & Ride',
    desc: 'Finalize your trip through WhatsApp and relax. Our premium service ensures a driver is dispatched to your exact location immediately.',
    icon: 'fa-car-on'
  }
];

const HowItWorks: React.FC = () => {
  return (
    <section className="py-24 bg-white px-4">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <span className="text-[#A3E635] font-black text-sm tracking-widest uppercase">The Process</span>
          <h2 className="text-3xl md:text-5xl font-black text-gray-900 mt-2 tracking-tight">How It Works</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 relative">
          {/* Connector Line (Desktop) */}
          <div className="hidden md:block absolute top-1/2 left-0 w-full h-px bg-gray-100 -z-10 transform -translate-y-8"></div>
          
          {STEPS.map((s, i) => (
            <div key={i} className="flex flex-col items-center text-center group">
              <div className="w-20 h-20 rounded-3xl bg-black text-[#A3E635] flex items-center justify-center text-3xl mb-8 relative shadow-xl transform group-hover:-translate-y-2 transition-transform duration-300">
                <i className={`fas ${s.icon}`}></i>
                <div className="absolute -top-3 -right-3 w-8 h-8 rounded-full bg-[#A3E635] text-black text-xs font-black flex items-center justify-center border-4 border-white">
                  {s.step}
                </div>
              </div>
              <h3 className="text-xl font-black text-gray-900 mb-3">{s.title}</h3>
              <p className="text-gray-500 text-sm leading-relaxed max-w-[250px]">
                {s.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
