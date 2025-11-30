
import React, { useState, useEffect } from 'react';
import { backend } from '../services/backendService';
import { Button } from '../components/Button';
import { LocationSearch } from '../components/LocationSearch';
import { Users, Sparkles, Repeat, Car } from 'lucide-react';

interface OfferRideProps {
  onNavigate: (page: string) => void;
}

export const OfferRide: React.FC<OfferRideProps> = ({ onNavigate }) => {
  const [loading, setLoading] = useState(false);
  const [generatingAi, setGeneratingAi] = useState(false);
  const [loadingLocation, setLoadingLocation] = useState(false);

  const [formData, setFormData] = useState({
    origin: '',
    destination: '',
    date: new Date().toISOString().split('T')[0],
    time: '09:00',
    points: 50,
    seats: 3,
    description: '',
    recurring: false,
    vehicle: 'Honda City (KA-01-AB-1234)'
  });

  const loadCurrentLocation = async () => {
    setLoadingLocation(true);
    try {
      const coords = await backend.getCurrentLocation();
      const address = await backend.getAddressFromCoords(coords.lat, coords.lng);
      setFormData(prev => ({ ...prev, origin: address }));
    } catch (error) {
      console.error('Failed to get current location:', error);
    } finally {
      setLoadingLocation(false);
    }
  };

  useEffect(() => {
    loadCurrentLocation();
  }, []);

  const handleGenerateDescription = async () => {
    setGeneratingAi(true);
    try {
      const desc = await backend.generateRideDescription(formData.origin, formData.destination, formData.date);
      setFormData(prev => ({ ...prev, description: desc }));
    } finally {
      setGeneratingAi(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await backend.createRide({
        origin: formData.origin,
        destination: formData.destination,
        date: formData.date,
        time: formData.time,
        price: Number(formData.points),
        totalSeats: Number(formData.seats),
        seatsAvailable: Number(formData.seats),
        description: formData.description,
        recurring: formData.recurring,
        vehicleModel: formData.vehicle.split('(')[0].trim(),
        vehicleNumber: formData.vehicle.split('(')[1]?.replace(')', '') || ''
      });
      alert('Ride published!');
      onNavigate('dashboard');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto pb-20">
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
        <div className="bg-blue-600 px-8 py-6 text-white">
             <h2 className="text-2xl font-bold">Offer a Ride</h2>
             <p className="text-blue-100 mt-1">Earn points and reduce traffic.</p>
        </div>
        
        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          {/* Route */}
          <div className="space-y-4">
             <div className="flex items-center gap-3">
                 <div className="w-8 flex flex-col items-center gap-1 pt-2">
                     <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                     <div className="w-0.5 h-20 bg-gray-200 border-l border-dashed border-gray-300 my-1"></div>
                     <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                 </div>
                 <div className="flex-1 space-y-4">
                     <LocationSearch
                        placeholder={loadingLocation ? "Detecting location..." : "Start Location"}
                        value={formData.origin}
                        onChange={(val) => setFormData({...formData, origin: val})}
                        color="green"
                     />
                     <LocationSearch 
                        placeholder="End Location"
                        value={formData.destination}
                        onChange={(val) => setFormData({...formData, destination: val})}
                        color="red"
                     />
                 </div>
             </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
             <div>
                 <label className="text-sm font-medium text-gray-700 mb-1 block">Date</label>
                 <input
                   required
                   type="date"
                   className="w-full p-3 border border-gray-200 rounded-xl focus:ring-blue-500"
                   value={formData.date}
                   onChange={e => setFormData({...formData, date: e.target.value})}
                 />
             </div>
             <div>
                 <label className="text-sm font-medium text-gray-700 mb-1 block">Time</label>
                 <input
                   required
                   type="time"
                   className="w-full p-3 border border-gray-200 rounded-xl focus:ring-blue-500"
                   value={formData.time}
                   onChange={e => setFormData({...formData, time: e.target.value})}
                 />
             </div>
          </div>

          <div className="flex items-center gap-3 bg-blue-50 p-4 rounded-xl border border-blue-100">
              <input 
                type="checkbox" 
                id="recurring" 
                checked={formData.recurring}
                onChange={e => setFormData({...formData, recurring: e.target.checked})}
                className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500" 
              />
              <label htmlFor="recurring" className="flex-1 cursor-pointer">
                  <span className="block font-semibold text-blue-900">Recurring Ride</span>
                  <span className="text-xs text-blue-700">Repeat this Mon-Fri automatically</span>
              </label>
              <Repeat className="text-blue-300 w-6 h-6" />
          </div>

          {/* Details */}
          <div className="bg-gray-50 p-6 rounded-xl border border-gray-100 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                  <div>
                      <label className="text-sm font-medium text-gray-700 mb-1 block">Points per Seat</label>
                      <input
                        type="number"
                        className="w-full p-3 border border-gray-200 rounded-xl font-bold text-gray-900"
                        value={formData.points}
                        onChange={e => setFormData({...formData, points: Number(e.target.value)})}
                      />
                  </div>
                  <div>
                      <label className="text-sm font-medium text-gray-700 mb-1 block">Seats</label>
                      <div className="relative">
                          <Users className="absolute left-3 top-3.5 w-5 h-5 text-gray-400" />
                          <input
                            type="number"
                            min="1"
                            max="6"
                            className="w-full pl-10 p-3 border border-gray-200 rounded-xl font-bold text-gray-900"
                            value={formData.seats}
                            onChange={e => setFormData({...formData, seats: Number(e.target.value)})}
                          />
                      </div>
                  </div>
              </div>
              
              <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">Vehicle</label>
                  <div className="relative">
                      <Car className="absolute left-3 top-3.5 w-5 h-5 text-gray-400" />
                      <select 
                        className="w-full pl-10 p-3 border border-gray-200 rounded-xl bg-white appearance-none"
                        value={formData.vehicle}
                        onChange={e => setFormData({...formData, vehicle: e.target.value})}
                      >
                          <option>Honda City (KA-01-AB-1234)</option>
                          <option>Swift Dzire (KA-05-XY-9876)</option>
                      </select>
                  </div>
              </div>

              <div>
                <div className="flex justify-between mb-1">
                   <label className="text-sm font-medium text-gray-700">Description</label>
                   <button type="button" onClick={handleGenerateDescription} className="text-xs text-blue-600 flex items-center font-semibold">
                       <Sparkles className="w-3 h-3 mr-1" /> AI Write
                   </button>
                </div>
                <textarea
                  className="w-full p-3 border border-gray-200 rounded-xl text-sm"
                  rows={2}
                  value={formData.description}
                  onChange={e => setFormData({...formData, description: e.target.value})}
                  placeholder="AC, Music, Route info..."
                />
              </div>
          </div>

          <Button type="submit" isLoading={loading} className="w-full h-14 bg-gray-900 text-lg rounded-xl shadow-lg">
             Publish Ride
          </Button>
        </form>
      </div>
    </div>
  );
};
