
import React from 'react';

const REVIEWS = [
  {
    name: 'Sandeep Mishra',
    location: 'Sector 4, Bokaro',
    text: 'Best service for Ranchi airport drops. The driver reached my home 15 mins early and the car was spotless. Truly premium feel.',
    initials: 'SM'
  },
  {
    name: 'Priya Sharma',
    location: 'Cooperative Colony',
    text: 'Booked an Ertiga for a family trip to Deoghar. Very professional behavior and the rates were exactly what was shown on the website.',
    initials: 'PS'
  },
  {
    name: 'Ankit Raj',
    location: 'Chira Chas',
    text: 'Go Bokaro Cabs is my go-to for corporate trips to Jamshedpur. Reliable, safe, and they provide proper bills for reimbursement.',
    initials: 'AR'
  }
];

const Testimonials: React.FC = () => {
  return (
    <section className="py-24 bg-gray-50 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-black text-gray-900 mt-2 tracking-tight">Voices of Jharkhand</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {REVIEWS.map((r, i) => (
            <div key={i} className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-gray-100 hover:shadow-xl transition-shadow">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 rounded-2xl bg-black text-[#A3E635] flex items-center justify-center font-black text-sm">
                  {r.initials}
                </div>
                <div>
                  <h4 className="font-black text-gray-900 text-sm">{r.name}</h4>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{r.location}</p>
                </div>
              </div>
              <div className="flex gap-1 text-amber-400 mb-4">
                {[...Array(5)].map((_, j) => <i key={j} className="fas fa-star text-xs"></i>)}
              </div>
              <p className="text-gray-600 text-sm leading-relaxed italic">
                "{r.text}"
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
