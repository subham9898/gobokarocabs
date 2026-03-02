
import React, { useState, useRef, useEffect } from 'react';
import { GoogleGenAI } from "@google/genai";
import { ROUTES_PRICING, CONTACT_PHONE, WHATSAPP_LINK } from '../constants';

const GeminiChat: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<{ role: 'user' | 'ai'; text: string }[]>([
    { role: 'ai', text: 'Namaste! I am your Go Bokaro AI Assistant. Planning a trip from the Steel City today?' }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({
        top: scrollRef.current.scrollHeight,
        behavior: 'smooth'
      });
    }
  }, [messages, isTyping]);

  const handleSend = async () => {
    if (!input.trim() || isTyping) return;

    const userMsg = input;
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setIsTyping(true);

    try {
      // Create fresh instance per guidelines to ensure latest key usage
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: userMsg,
        config: {
          systemInstruction: `
            You are "Steel Buddy", the official AI travel concierge for "Go Bokaro Cabs", the leading intercity service in Bokaro Steel City, Jharkhand.
            Your persona: Helpful, local, reliable, and slightly traditional yet tech-savvy. 
            Greeting: Use "Namaste" or "Ram Ram" appropriately. Use "Ji" to show respect.
            
            Key Information:
            - Fleet: Modern Sedans (Dzire/Amaze) and spacious SUVs (Maruti Ertiga - 7 seater).
            - Base Station: Bokaro Steel City.
            - Major Destinations: Ranchi (₹1699+), Jamshedpur (₹2499+), Kolkata (₹6500+), Dhanbad (₹999+).
            - Pricing Strategy: Transparent fixed rates for drops. Tolls/State Taxes extra.
            - Contact: All bookings are finalized via WhatsApp or calling ${CONTACT_PHONE}.
            - Local Knowledge: You know about Bokaro's Sectors, City Park, Garga Dam, and the Steel Plant.
            
            Rules:
            1. Keep answers concise.
            2. If someone asks for a price not in the list, give an estimate based on ₹14-16 per km for Sedan.
            3. Always end with a subtle nudge to call or WhatsApp for the best deal.
            4. If asked about safety, emphasize 24/7 support and verified drivers.
          `
        }
      });

      const aiText = response.text || "Namaste! I'm having a small technical glitch. Please call us directly at 8271212333 for immediate assistance.";
      setMessages(prev => [...prev, { role: 'ai', text: aiText }]);
    } catch (error) {
      console.error("Gemini API Error:", error);
      setMessages(prev => [...prev, { role: 'ai', text: "Namaste! My connection is a bit weak right now. You can reach our 24/7 hotline at 8271212333 for bookings." }]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-[200] font-sans">
      {/* Trigger Button with Badge */}
      <div className="relative">
        {!isOpen && (
          <span className="absolute -top-1 -right-1 flex h-4 w-4 z-10">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-lime-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-4 w-4 bg-lime-500"></span>
          </span>
        )}
        <button 
          onClick={() => setIsOpen(!isOpen)}
          className={`w-14 h-14 md:w-16 md:h-16 rounded-full shadow-2xl flex items-center justify-center transition-all duration-300 border-2 transform ${
            isOpen ? 'bg-white text-black border-gray-100 rotate-0' : 'bg-black text-[#A3E635] border-[#A3E635] hover:scale-110'
          }`}
          aria-label="Chat with Steel Buddy"
        >
          <i className={`fas ${isOpen ? 'fa-times' : 'fa-robot'} text-xl md:text-2xl`}></i>
        </button>
      </div>

      {/* Chat Window */}
      <div 
        className={`absolute bottom-20 right-0 w-[calc(100vw-2.5rem)] sm:w-[400px] h-[600px] max-h-[80vh] bg-white rounded-[2rem] shadow-2xl flex flex-col overflow-hidden border border-gray-100 transition-all duration-500 ease-[cubic-bezier(0.23,1,0.32,1)] origin-bottom-right ${
          isOpen ? 'scale-100 opacity-100 translate-y-0' : 'scale-90 opacity-0 translate-y-10 pointer-events-none'
        }`}
      >
        {/* Header - Premium Dark */}
        <div className="bg-black p-5 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-[#A3E635] flex items-center justify-center relative shadow-lg">
              <i className="fas fa-id-badge text-black text-xl"></i>
              <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-green-500 border-2 border-black rounded-full"></div>
            </div>
            <div>
              <h4 className="font-extrabold text-sm tracking-tight leading-none mb-1">Steel Buddy</h4>
              <div className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 bg-lime-500 rounded-full animate-pulse"></span>
                <p className="text-[9px] text-lime-400 font-black uppercase tracking-widest">Online & Ready</p>
              </div>
            </div>
          </div>
          <div className="flex gap-2">
             <a href={`tel:${CONTACT_PHONE}`} className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center hover:bg-[#A3E635] hover:text-black transition-all">
              <i className="fas fa-phone text-xs"></i>
            </a>
            <button onClick={() => setIsOpen(false)} className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-gray-400 hover:text-white transition-colors">
              <i className="fas fa-times text-xs"></i>
            </button>
          </div>
        </div>

        {/* Messages Area */}
        <div 
          ref={scrollRef} 
          className="flex-grow overflow-y-auto p-5 space-y-4 bg-gray-50/50 scrollbar-hide"
          data-lenis-prevent
        >
          {messages.map((m, i) => (
            <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'} animate-fade-in`}>
              <div className={`max-w-[85%] px-5 py-3.5 rounded-2xl text-[13px] leading-relaxed shadow-sm ${
                m.role === 'user' 
                ? 'bg-black text-white rounded-tr-none font-medium' 
                : 'bg-white border border-gray-100 text-gray-800 rounded-tl-none font-medium'
              }`}>
                {m.text}
              </div>
            </div>
          ))}
          {isTyping && (
            <div className="flex justify-start animate-fade-in">
              <div className="bg-white border border-gray-100 p-4 rounded-2xl rounded-tl-none shadow-sm flex gap-1.5">
                <div className="w-1.5 h-1.5 bg-lime-500 rounded-full animate-bounce [animation-duration:0.8s]"></div>
                <div className="w-1.5 h-1.5 bg-lime-500 rounded-full animate-bounce [animation-duration:0.8s] [animation-delay:0.2s]"></div>
                <div className="w-1.5 h-1.5 bg-lime-500 rounded-full animate-bounce [animation-duration:0.8s] [animation-delay:0.4s]"></div>
              </div>
            </div>
          )}
        </div>

        {/* Input Interface */}
        <div className="p-5 bg-white border-t border-gray-100">
          <div className="flex gap-2 items-center">
            <div className="flex-grow flex items-center bg-gray-100 rounded-2xl px-4 focus-within:ring-2 focus-within:ring-[#A3E635] focus-within:bg-white transition-all shadow-inner">
              <input 
                type="text" 
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                placeholder="Ask about fares or routes..."
                className="w-full bg-transparent py-3.5 text-sm font-semibold text-gray-800 outline-none"
              />
            </div>
            <button 
              onClick={handleSend}
              disabled={isTyping || !input.trim()}
              className="bg-black text-[#A3E635] w-12 h-12 rounded-2xl flex items-center justify-center hover:scale-105 active:scale-95 disabled:opacity-30 transition-all shadow-lg flex-shrink-0"
            >
              <i className="fas fa-paper-plane text-sm"></i>
            </button>
          </div>
          
          <div className="flex justify-center items-center gap-4 mt-4 text-[9px] text-gray-400 font-bold uppercase tracking-[0.15em]">
             <span className="flex items-center gap-1"><i className="fas fa-shield-halved text-lime-600"></i> Encrypted</span>
             <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
             <span className="flex items-center gap-1"><i className="fas fa-bolt text-lime-600"></i> AI Powered</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GeminiChat;
