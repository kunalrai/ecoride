
import React, { useEffect, useState } from 'react';
import { Ride, ChatMessage } from '../types';
import { backend } from '../services/backendService';
import { Button } from '../components/Button';
import { Navigation, MessageSquare, Send, Phone, Shield, Star, Share2, Building2, Car } from 'lucide-react';

interface RideDetailsProps {
  ride: Ride;
  onBack: () => void;
}

export const RideDetails: React.FC<RideDetailsProps> = ({ ride, onBack }) => {
  const [loading, setLoading] = useState(false);
  const [aiInsights, setAiInsights] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([{role: 'model', text: `Hi! I'm EcoBot. Any questions about this ride?`}]);
  const [input, setInput] = useState('');
  const [chatLoading, setChatLoading] = useState(false);

  useEffect(() => {
    backend.getRouteInsights(ride.origin, ride.destination).then(setAiInsights);
  }, [ride]);

  const handleBook = async () => {
    if(!confirm(`Confirm booking for ${ride.price} Points?`)) return;
    setLoading(true);
    try {
      await backend.bookRide(ride.id, 1);
      alert('Booking Confirmed!');
      onBack();
    } catch (e: any) {
      alert(e.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
      e.preventDefault();
      if (!input.trim()) return;
      const userMsg = input;
      setInput('');
      setMessages(prev => [...prev, {role: 'user', text: userMsg}]);
      setChatLoading(true);
      const history = messages.map(m => ({ role: m.role, parts: [{ text: m.text }] }));
      const responseText = await backend.askAiAssistant(history, userMsg);
      setMessages(prev => [...prev, {role: 'model', text: responseText}]);
      setChatLoading(false);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 pb-20">
      <div className="lg:col-span-2 space-y-6">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
           <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-gray-50">
             <Button variant="secondary" size="sm" onClick={onBack}>← Back</Button>
             <button className="text-gray-500 hover:text-green-600"><Share2 className="w-5 h-5" /></button>
           </div>
           
           <div className="w-full h-64 bg-gray-100 relative">
               <iframe
                 width="100%"
                 height="100%"
                 frameBorder="0"
                 src={`https://maps.google.com/maps?q=${encodeURIComponent(ride.origin)} to ${encodeURIComponent(ride.destination)}&t=&z=12&ie=UTF8&iwloc=&output=embed`}
                 className="absolute inset-0 grayscale-[0.2]"
               ></iframe>
           </div>

           <div className="p-6">
              <div className="flex justify-between items-start mb-6">
                 <div>
                    <h1 className="text-3xl font-bold text-gray-900">{ride.time}</h1>
                    <p className="text-gray-500 font-medium">{new Date(ride.date).toLocaleDateString(undefined, {weekday: 'long', day: 'numeric', month: 'short'})}</p>
                 </div>
                 <div className="text-right">
                    <span className="block text-3xl font-bold text-green-600">{ride.price}</span>
                    <span className="text-xs text-gray-500 font-semibold uppercase tracking-wider">Points</span>
                 </div>
              </div>

              <div className="relative pl-6 space-y-8 mb-8 border-l-2 border-gray-100 ml-3">
                 <div className="relative">
                    <div className="absolute -left-[31px] top-1 w-4 h-4 rounded-full bg-green-500 ring-4 ring-white shadow-sm"></div>
                    <h3 className="text-lg font-bold text-gray-900">{ride.origin}</h3>
                 </div>
                 <div className="relative">
                    <div className="absolute -left-[31px] top-1 w-4 h-4 rounded-full bg-red-500 ring-4 ring-white shadow-sm"></div>
                    <h3 className="text-lg font-bold text-gray-900">{ride.destination}</h3>
                 </div>
              </div>

              <div className="bg-gray-50 rounded-xl p-4 flex items-center justify-between border border-gray-100">
                 <div className="flex items-center gap-4">
                    <img src={ride.driverAvatar} className="w-14 h-14 rounded-full border-2 border-white shadow-sm" alt=""/>
                    <div>
                        <div className="font-bold text-gray-900 text-lg">{ride.driverName}</div>
                        <div className="flex flex-wrap gap-2 text-xs text-gray-600 mt-1">
                            {ride.driverCompany && (
                                <span className="bg-white px-2 py-0.5 rounded border border-gray-200 flex items-center">
                                    <Building2 className="w-3 h-3 mr-1" /> {ride.driverCompany}
                                </span>
                            )}
                            <span className="bg-white px-2 py-0.5 rounded border border-gray-200 flex items-center">
                                <Star className="w-3 h-3 text-yellow-400 fill-yellow-400 mr-1"/> {ride.driverRating}
                            </span>
                        </div>
                    </div>
                 </div>
                 <button className="h-10 w-10 bg-white rounded-full flex items-center justify-center shadow-sm border border-gray-200 text-green-600">
                     <Phone className="w-4 h-4" />
                 </button>
              </div>
              
              {ride.vehicleModel && (
                  <div className="mt-4 flex items-center gap-2 text-sm text-gray-600 bg-gray-50 p-3 rounded-lg border border-gray-100">
                      <Car className="w-4 h-4 text-gray-400" />
                      <span className="font-medium">{ride.vehicleModel}</span>
                      <span className="text-gray-400">|</span>
                      <span className="font-mono bg-white px-2 py-0.5 rounded border border-gray-200 text-xs">{ride.vehicleNumber}</span>
                  </div>
              )}
           </div>
        </div>

        {/* AI Insights */}
        <div className="bg-gradient-to-r from-indigo-50 to-blue-50 rounded-xl p-5 border border-indigo-100">
           <h3 className="text-sm font-bold text-indigo-900 mb-2 flex items-center">
             <Navigation className="w-4 h-4 mr-2" /> Route Insights
           </h3>
           <div className="text-indigo-800 text-sm leading-relaxed">
               {aiInsights || "Analysing route..."}
           </div>
        </div>
      </div>

      <div className="space-y-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
           <div className="flex justify-between items-center mb-6">
               <span className="text-gray-600">Total Points</span>
               <span className="font-bold text-2xl text-gray-900">{ride.price}</span>
           </div>
           <Button className="w-full h-12 text-lg font-bold" onClick={handleBook} isLoading={loading} disabled={ride.seatsAvailable === 0}>
              {ride.seatsAvailable > 0 ? 'Join Ride' : 'Full'}
           </Button>
        </div>

        {/* Chat */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 flex flex-col h-[400px]">
            <div className="bg-gray-900 p-3 text-white text-sm font-bold flex items-center gap-2 rounded-t-2xl">
                <MessageSquare className="w-4 h-4 text-green-400"/> EcoBot Assistant
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50">
                {messages.map((m, i) => (
                    <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[85%] rounded-2xl px-3 py-2 text-sm shadow-sm ${m.role === 'user' ? 'bg-gray-900 text-white' : 'bg-white border border-gray-100'}`}>{m.text}</div>
                    </div>
                ))}
                {chatLoading && <div className="text-xs text-gray-400 italic px-4">Typing...</div>}
            </div>
            <form onSubmit={handleSendMessage} className="p-2 border-t border-gray-200 flex gap-2">
                <input className="flex-1 bg-gray-100 rounded-lg px-3 py-2 text-sm focus:outline-none" placeholder="Ask details..." value={input} onChange={e => setInput(e.target.value)} />
                <button type="submit" className="bg-green-600 text-white p-2 rounded-lg"><Send className="w-4 h-4" /></button>
            </form>
        </div>
      </div>
    </div>
  );
};
