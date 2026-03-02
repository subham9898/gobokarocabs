
import React, { useState } from 'react';

const FAQS = [
  {
    q: 'Are tolls and state taxes included in the one-way fare?',
    a: 'Yes, the tolls and state taxes are included in the one- way fare'
  },
  {
    q: 'Do you provide doorstep pickup?',
    a: "Yes, we are Jharkhand's dedicated cab service providing doorstep pickup and drop-off."
  },
  {
    q: 'What is the cancellation policy?',
    a: 'We offer free cancellation if informed at least 2 hours before the scheduled pickup time. For last-minute cancellations, a nominal fee may apply.'
  },
  {
    q: 'Are the cabs air-conditioned?',
    a: 'Absolutely. All our cabs are fully air-conditioned and well-maintained for a comfortable long-distance journey.'
  },
  {
    q: 'Do you provide GST bills for corporate travel?',
    a: 'Yes, we provide valid bills for all trips, which can be used for corporate reimbursements or business accounting.'
  }
];

const FAQ: React.FC = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section className="py-24 bg-white px-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-16">
          <span className="text-[#A3E635] font-black text-sm tracking-widest uppercase">Got Questions?</span>
          <h2 className="text-3xl md:text-5xl font-black text-gray-900 mt-2 tracking-tight">Frequently Asked</h2>
        </div>

        <div className="space-y-4">
          {FAQS.map((faq, i) => (
            <div key={i} className="border border-gray-100 rounded-2xl overflow-hidden shadow-sm">
              <button 
                onClick={() => setOpenIndex(openIndex === i ? null : i)}
                className={`w-full flex items-center justify-between p-6 text-left transition-colors ${openIndex === i ? 'bg-black text-white' : 'bg-white text-gray-900 hover:bg-gray-50'}`}
              >
                <span className="font-bold text-sm md:text-base">{faq.q}</span>
                <i className={`fas fa-chevron-down transition-transform duration-300 ${openIndex === i ? 'rotate-180 text-[#A3E635]' : 'text-gray-300'}`}></i>
              </button>
              <div className={`overflow-hidden transition-all duration-300 ${openIndex === i ? 'max-h-40' : 'max-h-0'}`}>
                <div className="p-6 text-sm text-gray-500 bg-gray-50 leading-relaxed font-medium">
                  {faq.a}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FAQ;
