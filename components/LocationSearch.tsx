
import React, { useState, useEffect, useRef } from 'react';
import { MapPin, Navigation, Search, X, Map as MapIcon, ChevronRight } from 'lucide-react';
import { searchPlaces, getCurrentLocation, getAddressFromCoords } from '../services/locationService';

interface LocationSearchProps {
  placeholder: string;
  value: string;
  onChange: (value: string) => void;
  label?: string;
  color?: 'green' | 'red' | 'blue' | 'gray';
}

export const LocationSearch: React.FC<LocationSearchProps> = ({ placeholder, value, onChange, label, color = 'green' }) => {
  const [query, setQuery] = useState(value);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showMapModal, setShowMapModal] = useState(false);
  
  const wrapperRef = useRef<HTMLDivElement>(null);

  // Sync internal state with prop
  useEffect(() => {
    setQuery(value);
  }, [value]);

  // Handle outside click to close suggestions
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [wrapperRef]);

  const handleSearchChange = async (text: string) => {
    setQuery(text);
    onChange(text); // Update parent immediately
    
    if (text.length > 1) {
        const results = await searchPlaces(text);
        setSuggestions(results);
        setShowSuggestions(true);
    } else {
        setSuggestions([]);
        setShowSuggestions(false);
    }
  };

  const handleSelect = (place: string) => {
    setQuery(place);
    onChange(place);
    setShowSuggestions(false);
  };

  const handleUseCurrentLocation = async () => {
    setLoading(true);
    try {
      const coords = await getCurrentLocation();
      const address = await getAddressFromCoords(coords.lat, coords.lng);
      setQuery(address);
      onChange(address);
    } catch {
      alert("Location access denied");
    } finally {
      setLoading(false);
    }
  };

  const handleMapConfirm = () => {
      // In a real app with Google Maps JS API, we would get the center coordinates.
      // Here we simulate picking a location.
      const mockPinnedLocation = query || "Selected Location on Map"; 
      setQuery(mockPinnedLocation);
      onChange(mockPinnedLocation);
      setShowMapModal(false);
  };

  const colorClasses = {
      green: "bg-green-500 ring-green-100",
      red: "bg-red-500 ring-red-100",
      blue: "bg-blue-500 ring-blue-100",
      gray: "bg-gray-500 ring-gray-100"
  };

  return (
    <div className="relative" ref={wrapperRef}>
        {label && <label className="block text-xs font-semibold text-gray-500 mb-1 uppercase tracking-wide">{label}</label>}
        <div className="relative group">
            <div className="absolute left-4 top-3.5 z-10">
                <div className={`w-3 h-3 rounded-full ring-4 ${colorClasses[color]}`}></div>
            </div>
            <input 
                type="text" 
                placeholder={placeholder}
                value={query}
                onChange={(e) => handleSearchChange(e.target.value)}
                onFocus={() => query.length > 1 && setShowSuggestions(true)}
                className="w-full pl-12 pr-20 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:bg-white transition-all font-medium text-gray-900 truncate"
            />
            
            <div className="absolute right-2 top-2 flex items-center gap-1">
                 {query && (
                     <button onClick={() => handleSearchChange('')} className="p-1.5 hover:bg-gray-200 rounded-full text-gray-400">
                         <X className="w-4 h-4" />
                     </button>
                 )}
                 <button 
                    onClick={() => setShowMapModal(true)}
                    className="p-1.5 hover:bg-blue-50 text-gray-400 hover:text-blue-600 rounded-lg transition-colors"
                    title="Pick on Map"
                >
                    <MapIcon className="w-5 h-5" />
                 </button>
                 <button 
                    onClick={handleUseCurrentLocation}
                    className="p-1.5 hover:bg-green-50 text-gray-400 hover:text-green-600 rounded-lg transition-colors"
                    title="Use Current Location"
                >
                   {loading ? <div className="w-4 h-4 border-2 border-green-500 border-t-transparent rounded-full animate-spin"></div> : <Navigation className="w-5 h-5" />}
                </button>
            </div>
        </div>

        {/* Autocomplete Dropdown */}
        {showSuggestions && suggestions.length > 0 && (
            <div className="absolute z-50 left-0 right-0 mt-1 bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden max-h-60 overflow-y-auto">
                {suggestions.map((place, idx) => (
                    <button 
                        key={idx}
                        onClick={() => handleSelect(place)}
                        className="w-full text-left px-4 py-3 hover:bg-gray-50 flex items-center gap-3 border-b border-gray-50 last:border-0 transition-colors"
                    >
                        <div className="bg-gray-100 p-2 rounded-full text-gray-500">
                            <MapPin className="w-4 h-4" />
                        </div>
                        <span className="text-sm font-medium text-gray-700 truncate">{place}</span>
                    </button>
                ))}
            </div>
        )}

        {/* Map Picker Modal */}
        {showMapModal && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
                <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col h-[80vh]">
                    <div className="p-4 border-b border-gray-200 flex justify-between items-center bg-gray-50">
                        <h3 className="font-bold text-gray-800 flex items-center gap-2">
                            <MapIcon className="w-5 h-5 text-blue-600"/> Pick Location
                        </h3>
                        <button onClick={() => setShowMapModal(false)} className="p-2 hover:bg-gray-200 rounded-full">
                            <X className="w-5 h-5" />
                        </button>
                    </div>
                    
                    <div className="flex-1 relative bg-gray-100">
                        <iframe
                            width="100%"
                            height="100%"
                            frameBorder="0"
                            src={`https://maps.google.com/maps?q=Bangalore&t=&z=13&ie=UTF8&iwloc=&output=embed`}
                            className="absolute inset-0 grayscale-[0.2]"
                        ></iframe>
                        
                        {/* Center Pin Overlay */}
                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none mb-8">
                            <div className="relative">
                                <MapPin className="w-10 h-10 text-red-600 drop-shadow-lg -translate-y-1/2" fill="currentColor" />
                                <div className="w-3 h-1.5 bg-black/20 rounded-full blur-[2px] absolute bottom-1 left-1/2 -translate-x-1/2"></div>
                            </div>
                        </div>

                        <div className="absolute top-4 left-4 right-4 bg-white p-3 rounded-xl shadow-lg border border-gray-200 text-center text-sm font-medium text-gray-600">
                             Drag map to pin location
                        </div>
                    </div>

                    <div className="p-4 border-t border-gray-200 bg-white">
                        <button 
                            onClick={handleMapConfirm}
                            className="w-full bg-gray-900 text-white font-bold py-3 rounded-xl hover:bg-gray-800 transition-colors shadow-lg"
                        >
                            Confirm Location
                        </button>
                    </div>
                </div>
            </div>
        )}
    </div>
  );
};
