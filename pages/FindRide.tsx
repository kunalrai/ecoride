
import React, { useState, useEffect } from 'react';
import { Ride } from '../types';
import { backend } from '../services/mockBackend';
import { Button } from '../components/Button';
import { LocationSearch } from '../components/LocationSearch';
import { Star, Building2, Car } from 'lucide-react';

interface FindRideProps {
  onNavigate: (page: string) => void;
  onSelectRide: (ride: Ride) => void;
}

export const FindRide: React.FC<FindRideProps> = ({ onNavigate, onSelectRide }) => {
  const [rides, setRides] = useState<Ride[]>([]);
  const [loading, setLoading] = useState(false);
  const [origin, setOrigin] = useState('');
  const [destination, setDestination] = useState('');

  const handleSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setLoading(true);
    try {
      const results = await backend.searchRides(origin, destination);
      setRides(results);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    handleSearch();
  }, []);

  return (
    <div className="flex flex-col h-[calc(100vh-100px)]">
      {/* Search Header */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 mb-4 shrink-0 z-20 relative">
        <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-3">
            <div className="flex-1">
                 <LocationSearch 
                    placeholder="From" 
                    value={origin} 
                    onChange={setOrigin} 
                    color="green"
                 />
            </div>
            <div className="flex-1">
                 <LocationSearch 
                    placeholder="To" 
                    value={destination} 
                    onChange={setDestination} 
                    color="red"
                 />
            </div>
            <Button type="submit" isLoading={loading} className="md:w-32 w-full h-[50px] mt-0.5">Search</Button>
        </form>
      </div>

      <div className="flex-1 flex flex-col md:flex-row gap-4 overflow-hidden">
          {/* Results List */}
          <div className="flex-1 overflow-y-auto pr-2 space-y-4 pb-20">
            {rides.length === 0 && !loading ? (
               <div className="text-center py-20 bg-white rounded-xl border border-dashed border-gray-300">
                 <h3 className="text-gray-900 font-medium">No rides found</h3>
                 <p className="text-gray-500 text-sm mt-1">Try changing your location search.</p>
               </div>
            ) : (
              rides.map((ride) => (
                <div 
                    key={ride.id} 
                    onClick={() => onSelectRide(ride)}
                    className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 cursor-pointer hover:border-green-300 transition-all hover:shadow-md group relative overflow-hidden"
                >
                  <div className="absolute top-0 right-0 bg-green-50 px-3 py-1 rounded-bl-xl text-green-700 font-bold text-sm">
                      {ride.price} Pts
                  </div>

                  <div className="flex items-start gap-4">
                      <img src={ride.driverAvatar} alt="" className="w-12 h-12 rounded-full border border-gray-100" />
                      <div className="flex-1 min-w-0">
                          <div className="flex items-baseline justify-between pr-16">
                             <h3 className="text-base font-bold text-gray-900 truncate">{ride.driverName}</h3>
                          </div>
                          <div className="flex items-center gap-2 text-xs text-gray-500 mt-1">
                              {ride.driverCompany && (
                                <span className="flex items-center bg-blue-50 text-blue-700 px-1.5 py-0.5 rounded border border-blue-100">
                                    <Building2 className="w-3 h-3 mr-1" /> {ride.driverCompany}
                                </span>
                              )}
                              <span className="flex items-center">
                                  <Star className="w-3 h-3 text-yellow-400 fill-yellow-400 mr-1" /> {ride.driverRating}
                              </span>
                              {ride.driverVerified && <span className="text-green-600 font-medium">Verified</span>}
                          </div>
                          
                          <div className="mt-4 flex items-center relative">
                             <div className="absolute left-0 top-1 bottom-1 w-0.5 bg-gray-200"></div>
                             <div className="space-y-3 w-full pl-4">
                                 <div className="relative">
                                     <div className="absolute -left-[21px] top-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
                                     <div className="flex justify-between">
                                         <div className="text-sm font-semibold text-gray-900 truncate">{ride.origin}</div>
                                         <div className="text-sm font-bold text-gray-900">{ride.time}</div>
                                     </div>
                                 </div>
                                 <div className="relative">
                                     <div className="absolute -left-[21px] top-1 w-3 h-3 bg-red-500 rounded-full border-2 border-white"></div>
                                     <div className="text-sm font-semibold text-gray-900 truncate">{ride.destination}</div>
                                 </div>
                             </div>
                          </div>
                          
                          <div className="mt-4 pt-3 border-t border-gray-100 flex justify-between items-center">
                              <div className="flex items-center gap-2 text-xs text-gray-500">
                                  {ride.vehicleModel && (
                                      <span className="flex items-center"><Car className="w-3 h-3 mr-1"/> {ride.vehicleModel}</span>
                                  )}
                                  <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
                                  <span>{ride.seatsAvailable} seats</span>
                              </div>
                          </div>
                      </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Map Preview (Desktop) */}
          <div className="hidden md:block w-1/3 bg-gray-100 rounded-xl overflow-hidden shadow-inner border border-gray-200 relative z-0">
               <iframe
                 width="100%"
                 height="100%"
                 frameBorder="0"
                 src={`https://maps.google.com/maps?q=Bangalore&t=&z=12&ie=UTF8&iwloc=&output=embed`}
                 className="grayscale-[0.2]"
               ></iframe>
               <div className="absolute bottom-4 left-4 right-4 bg-white p-3 rounded-lg shadow-lg text-xs text-center text-gray-600">
                  Search along route enabled
               </div>
          </div>
      </div>
    </div>
  );
};
