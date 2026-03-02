import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';

const TermsConditions: React.FC = () => {
  // Scroll to top when component mounts
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <section className="pt-28 pb-20 px-4 md:px-8 bg-white min-h-screen">
      <div className="max-w-4xl mx-auto">
        <Link 
          to="/"
          className="group flex items-center gap-2 text-sm font-bold text-gray-500 hover:text-[#A3E635] transition-colors mb-8 uppercase tracking-widest"
        >
          <i className="fas fa-arrow-left group-hover:-translate-x-1 transition-transform"></i>
          Back to Home
        </Link>

        <div className="bg-gray-50 rounded-[2rem] p-8 md:p-12 border border-gray-100 shadow-xl animate-fade-in">
          <h1 className="text-3xl md:text-5xl font-black text-gray-900 mb-8">Terms & Conditions</h1>
          
          <div className="space-y-8 text-gray-600 leading-relaxed font-medium">
            <p>
              Welcome to Go Bokaro Cabs. By accessing our website, booking a cab, or using our services via phone, WhatsApp, or any other communication channel, you agree to comply with and be bound by the following Terms and Conditions. Please read them carefully before using our services.
            </p>

            <div>
              <h2 className="text-xl md:text-2xl font-black text-gray-900 mb-4">Service Overview</h2>
              <p>
                Go Bokaro Cabs provides car rental and cab services including local travel, outstation trips, airport transfers, wedding bookings, and corporate travel. All services are subject to availability and confirmation.
              </p>
            </div>

            <div>
              <h2 className="text-xl md:text-2xl font-black text-gray-900 mb-4">Booking & Confirmation</h2>
              <ul className="list-disc pl-5 space-y-2">
                <li>Bookings can be made via phone call, WhatsApp, or our website.</li>
                <li>A booking is considered confirmed only after it has been accepted by Go Bokaro Cabs.</li>
                <li>Trip details such as pickup location, time, vehicle type, and fare must be confirmed at the time of booking.</li>
              </ul>
            </div>

            <div>
              <h2 className="text-xl md:text-2xl font-black text-gray-900 mb-4">Pricing & Payments</h2>
              <ul className="list-disc pl-5 space-y-2">
                <li>All fares are calculated based on distance, duration, vehicle type, and service category.</li>
                <li>Prices communicated at the time of booking are final unless trip details change.</li>
                <li>Additional charges may apply for tolls, parking fees, state taxes, night charges, waiting time, or route changes.</li>
                <li>Payments must be made as per the agreed mode of payments (cash, UPI, or other accepted methods).</li>
              </ul>
            </div>

            <div>
              <h2 className="text-xl md:text-2xl font-black text-gray-900 mb-4">Cancellations & Refunds</h2>
              <ul className="list-disc pl-5 space-y-2">
                <li>Cancellations should be communicated as early as possible.</li>
                <li>Cancellation charges may apply depending on the time of cancellation and service type.</li>
                <li>Refunds, if applicable, will be processed in accordance with Go Bokaro Cabs’ refund policy.</li>
              </ul>
            </div>

            <div>
              <h2 className="text-xl md:text-2xl font-black text-gray-900 mb-4">Customer Responsibilities</h2>
              <ul className="list-disc pl-5 space-y-2">
                <li>Customers must provide accurate pickup and drop-off details.</li>
                <li>Any changes to trip details should be communicated in advance.</li>
                <li>Customers are responsible for their personal belongings during the journey.</li>
                <li>Smoking, consumption of alcohol, and any illegal activities are strictly prohibited inside the vehicle.</li>
              </ul>
            </div>

            <div>
              <h2 className="text-xl md:text-2xl font-black text-gray-900 mb-4">Driver & Vehicle Policy</h2>
              <ul className="list-disc pl-5 space-y-2">
                <li>Go Bokaro Cabs assigns trained and verified drivers for all services.</li>
                <li>Vehicle allocation is subject to availability and may vary based on operational requirements.</li>
                <li>Drivers reserve the right to refuse service in cases of unsafe conditions, abusive behavior, or violation of these Terms and Conditions.</li>
              </ul>
            </div>

            <div>
              <h2 className="text-xl md:text-2xl font-black text-gray-900 mb-4">Delays & Unforeseen Circumstances</h2>
              <p>
                Go Bokaro Cabs shall not be held responsible for delays or service disruptions caused by traffic, weather conditions, road closures, mechanical issues, or events beyond our reasonable control.
              </p>
            </div>

            <div>
              <h2 className="text-xl md:text-2xl font-black text-gray-900 mb-4">Wedding & Corporate Bookings</h2>
              <ul className="list-disc pl-5 space-y-2">
                <li>Special event and corporate bookings may require advance payment and prior confirmation.</li>
                <li>Any damage caused to the vehicle during such bookings shall be chargeable to the customer.</li>
              </ul>
            </div>

            <div>
              <h2 className="text-xl md:text-2xl font-black text-gray-900 mb-4">Limitations of Liability & Website Use</h2>
              <p className="mb-4">
                Go Bokaro Cabs shall not be held liable for any indirect, incidental, or consequential damages arising from the use of our services. Our liability is limited to the extent permitted by law.
              </p>
              <p className="mb-4">
                The content on this website is provided for informational purposes only. Unauthorized use, copying, or reproduction of the website content is strictly prohibited.
              </p>
              <p>
                Use of our services is also governed by our Privacy Policy, which explains how we collect and protect your personal information.
              </p>
            </div>

            <div className="border-t border-gray-200 pt-8 mt-8">
              <h2 className="text-xl md:text-2xl font-black text-gray-900 mb-4">Updates & Governing Law</h2>
              <p className="mb-4">
                Go Bokaro Cabs reserves the right to modify or update these Terms and Conditions at any time without prior notice. The Updated Terms and Condition will be effective once published on the website.
              </p>
              <p className="mb-4">
                These Terms & Conditions shall be governed by the laws of India, and any disputes shall be subject to the exclusive jurisdiction of local courts in Bokaro, Jharkhand.
              </p>
              <p className="font-bold text-gray-900">
                For any questions or clarifications regarding these Terms & Conditions, please contact Go Bokaro Cabs through our official website or via our contact numbers.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default TermsConditions;
