import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';

const PrivacyPolicy: React.FC = () => {
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
          <h1 className="text-3xl md:text-5xl font-black text-gray-900 mb-8">Privacy Policy</h1>
          
          <div className="space-y-8 text-gray-600 leading-relaxed font-medium">
            <p>
              At Go Bokaro Cabs, we respect your privacy and are committed to protecting the personal information you share with us. This Privacy Policy explains how we collect, use, store, and safeguard your information when you use our website, contact us, or book our services via calls, WhatsApp, or other communication channels.
            </p>

            <div>
              <h2 className="text-xl md:text-2xl font-black text-gray-900 mb-4">Information We Collect</h2>
              <p className="mb-4">We may collect the following types of information when you interact with Go Bokaro Cabs:</p>
              <ul className="list-disc pl-5 space-y-2">
                <li>Name, phone number, and contact details</li>
                <li>Pickup and drop-off locations</li>
                <li>Booking, travel, and service details</li>
                <li>Communication details shared via phone calls, WhatsApp, or website contact forms</li>
                <li>Any information you voluntarily provide to us for booking or support purposes</li>
              </ul>
              <p className="mt-4 text-sm text-gray-500">We do not intentionally collect sensitive personal data unless it is required to provide our services.</p>
            </div>

            <div>
              <h2 className="text-xl md:text-2xl font-black text-gray-900 mb-4">How We Use Your Information</h2>
              <p className="mb-4">The information we collect is used to:</p>
              <ul className="list-disc pl-5 space-y-2">
                <li>Process and manage cab bookings</li>
                <li>Communicate with you regarding your trips, inquiries, and service updates</li>
                <li>Provide customer support and assistance</li>
                <li>Improve our services and customer experience</li>
                <li>Ensure safety, reliability, and service quality</li>
              </ul>
              <p className="mt-4 text-sm text-gray-500">We do not use your personal information for unsolicited marketing purposes.</p>
            </div>

            <div>
              <h2 className="text-xl md:text-2xl font-black text-gray-900 mb-4">WhatsApp Communication Privacy</h2>
              <p className="mb-4">
                Go Bokaro Cabs provides booking assistance and customer support through WhatsApp for user convenience. When you contact us via WhatsApp, we may collect your name, phone number, messages, booking details, travel preferences, and any media you choose to share.
              </p>
              <p className="mb-4">This information is used only to:</p>
              <ul className="list-disc pl-5 space-y-2">
                <li>Respond to your inquiries</li>
                <li>Process and confirm bookings</li>
                <li>Share service-related updates</li>
                <li>Provide customer support</li>
              </ul>
              <p className="mt-4">
                We do not sell, rent, or share WhatsApp communications for promotional or marketing purposes. Your information may be shared with drivers only when necessary to complete your booking or when required by law.
              </p>
              <p className="mt-4 text-sm bg-lime-50 p-4 rounded-xl border border-lime-100">
                Please note that WhatsApp is a third-party platform operated by Meta Platforms, Inc., and your communication is also subject to WhatsApp’s own Privacy Policy and Terms of Service. Go Bokaro Cabs shall not be responsible for WhatsApp’s data handling practices.
              </p>
            </div>

            <div>
              <h2 className="text-xl md:text-2xl font-black text-gray-900 mb-4">Information Sharing</h2>
              <p>
                Go Bokaro Cabs does not sell, trade, or rent your personal information to third parties. We may share your information only:
              </p>
              <ul className="list-disc pl-5 space-y-2 mt-2">
                <li>With drivers to fulfil your booking</li>
                <li>When required by law or government authorities</li>
                <li>To protect the rights, safety, or property of our customers and business</li>
              </ul>
            </div>

            <div>
              <h2 className="text-xl md:text-2xl font-black text-gray-900 mb-4">Data Security & Retention</h2>
              <p className="mb-4">
                We implement reasonable security measures to protect your personal information from unauthorized access, misuse, or disclosure. However, no method of electronic transmission or storage is completely secure, and we cannot guarantee absolute security.
              </p>
              <p>
                We retain your personal and communication data only for as long as necessary to provide our services, comply with legal requirements, or resolve disputes.
              </p>
            </div>

            <div>
              <h2 className="text-xl md:text-2xl font-black text-gray-900 mb-4">Cookies & Third-Party Links</h2>
              <p className="mb-4">
                Our website may use cookies to enhance user experience and to analyze website performance. You may choose to disable cookies through your browser settings.
              </p>
              <p>
                Our website may contain links to third-party websites or services. Go Bokaro Cabs shall not be responsible for the privacy practices or content of such external websites.
              </p>
            </div>

            <div>
              <h2 className="text-xl md:text-2xl font-black text-gray-900 mb-4">Your Consent</h2>
              <p>
                By using our website, booking our services, or contacting us via phone or WhatsApp, you agree to the collection and use of your information as outlined in this Privacy Policy.
              </p>
            </div>

            <div className="border-t border-gray-200 pt-8 mt-8">
              <h2 className="text-xl md:text-2xl font-black text-gray-900 mb-4">Changes & Contact</h2>
              <p className="mb-4">
                Go Bokaro Cabs reserves the right to update or modify this Privacy Policy at any time. Any changes will be posted on this page with an updated effective date.
              </p>
              <p className="font-bold text-gray-900">
                If you have any questions or concerns regarding this Privacy Policy or how your information is handled, please contact Go Bokaro Cabs through our official website or via our contact numbers.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default PrivacyPolicy;
