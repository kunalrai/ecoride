
import React, { useState } from 'react';
import { Button } from '../components/Button';
import { LocationSearch } from '../components/LocationSearch';
import { Search, PlusCircle, ArrowRight, Home as HomeIcon, Repeat, Briefcase, MapPin } from 'lucide-react';

interface HomeProps {
  onNavigate: (page: string) => void;
}

export const Home: React.FC<HomeProps> = ({ onNavigate }) => {
  const [activeTab, setActiveTab] = useState<'find' | 'offer'>('find');
  const [origin, setOrigin] = useState('');
  const [destination, setDestination] = useState('');

  const setLocation = async (type: 'home' | 'office') => {
      // Mock locations
      if (type === 'home') setOrigin("Koramangala 4th Block, Bangalore");
      if (type === 'office') setDestination("Manyata Tech Park, Nagavara");
  };

  const handleAction = () => {
      onNavigate(activeTab === 'find' ? 'find' : 'offer');
  };

  return (
    <div className="space-y-6 relative pb-10">
      {/* Interactive Map Background Look */}
      <div className="absolute inset-0 z-0 opacity-10 pointer-events-none h-[500px] overflow-hidden rounded-b-3xl">
           <iframe
                width="100%"
                height="100%"
                frameBorder="0"
                src="https://maps.google.com/maps?q=Bangalore&t=&z=11&ie=UTF8&iwloc=&output=embed"
                className="grayscale"
            ></iframe>
      </div>

      {/* Main Card */}
      <div className="relative z-10 bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-100 max-w-2xl mx-auto mt-4">
        {/* Tabs */}
        <div className="flex border-b border-gray-100">
            <button 
                onClick={() => setActiveTab('find')}
                className={`flex-1 py-4 text-center font-bold text-lg flex items-center justify-center gap-2 transition-colors ${activeTab === 'find' ? 'bg-green-50 text-green-700 border-b-2 border-green-600' : 'text-gray-500 hover:bg-gray-50'}`}
            >
                <Search className="w-5 h-5" /> Find Pool
            </button>
            <button 
                onClick={() => setActiveTab('offer')}
                className={`flex-1 py-4 text-center font-bold text-lg flex items-center justify-center gap-2 transition-colors ${activeTab === 'offer' ? 'bg-blue-50 text-blue-700 border-b-2 border-blue-600' : 'text-gray-500 hover:bg-gray-50'}`}
            >
                <PlusCircle className="w-5 h-5" /> Offer Pool
            </button>
        </div>

        <div className="p-6 space-y-5">
            {/* Inputs */}
            <div className="space-y-4">
                <LocationSearch 
                    placeholder="Leaving from..." 
                    value={origin} 
                    onChange={setOrigin} 
                    color="green"
                />
                <LocationSearch 
                    placeholder="Going to..." 
                    value={destination} 
                    onChange={setDestination} 
                    color="red"
                />
            </div>

            {/* Shortcuts */}
            <div className="flex gap-3">
                <button onClick={() => setLocation('home')} className="flex-1 flex items-center justify-center gap-2 py-2 px-4 rounded-lg border border-gray-200 hover:border-green-500 hover:bg-green-50 transition-all text-sm font-medium text-gray-600 hover:text-green-700">
                    <HomeIcon className="w-4 h-4" /> Home
                </button>
                <button onClick={() => setLocation('office')} className="flex-1 flex items-center justify-center gap-2 py-2 px-4 rounded-lg border border-gray-200 hover:border-green-500 hover:bg-green-50 transition-all text-sm font-medium text-gray-600 hover:text-green-700">
                    <Briefcase className="w-4 h-4" /> Office
                </button>
            </div>

            <Button 
                onClick={handleAction}
                className={`w-full h-12 text-lg rounded-xl shadow-lg ${activeTab === 'find' ? 'bg-green-600 hover:bg-green-700 shadow-green-200' : 'bg-blue-600 hover:bg-blue-700 shadow-blue-200'}`}
            >
                {activeTab === 'find' ? 'Search Rides' : 'Offer Ride'} <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
        </div>
      </div>

      {/* Quick Stats / Recent */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 relative z-10">
          <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-col items-center justify-center text-center">
             <div className="text-2xl font-bold text-green-600">24kg</div>
             <div className="text-xs text-gray-500">CO2 Saved</div>
          </div>
          <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-col items-center justify-center text-center">
             <div className="text-2xl font-bold text-blue-600">12</div>
             <div className="text-xs text-gray-500">Shared Rides</div>
          </div>
          <div className="col-span-2 bg-gradient-to-r from-gray-900 to-gray-800 p-4 rounded-xl shadow-sm text-white flex justify-between items-center cursor-pointer hover:shadow-lg transition-shadow" onClick={() => onNavigate('dashboard')}>
              <div>
                  <div className="text-xs text-gray-400">Recurring Ride</div>
                  <div className="font-semibold flex items-center gap-2 mt-1"><Repeat className="w-4 h-4"/> Mon - Fri</div>
              </div>
              <div className="bg-white/10 px-3 py-1 rounded text-sm hover:bg-white/20 transition-colors">View</div>
          </div>
      </div>
    </div>
  );
};
