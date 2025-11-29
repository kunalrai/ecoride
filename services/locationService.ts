
export const getCurrentLocation = (): Promise<{lat: number, lng: number}> => {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error("Geolocation is not supported by your browser"));
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (position) => resolve({
        lat: position.coords.latitude,
        lng: position.coords.longitude
      }),
      (error) => reject(error)
    );
  });
};

export const getAddressFromCoords = async (lat: number, lng: number): Promise<string> => {
  // In a real production app, you would call Google Maps Geocoding API here.
  // const response = await fetch(`https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=YOUR_API_KEY`);
  
  // For this demo, we mock the response to a common tech hub location in Bangalore
  await new Promise(resolve => setTimeout(resolve, 800)); // Simulate API delay
  
  // Simple mock logic to vary the location slightly based on randomness to feel real
  const locations = [
    "Sony World Signal, Koramangala",
    "Indiranagar Metro Station",
    "Silk Board Junction",
    "Manyata Tech Park, Gate 5",
    "HSR Layout, Sector 4",
    "Bagmane Tech Park, CV Raman Nagar",
    "Wipro Gate, Sarjapur Road"
  ];
  
  return locations[Math.floor(Math.random() * locations.length)];
};

export const searchPlaces = async (query: string): Promise<string[]> => {
  if (!query || query.length < 2) return [];
  
  await new Promise(resolve => setTimeout(resolve, 200)); // Simulate network delay

  const allPlaces = [
    "Koramangala 4th Block, Bangalore",
    "Indiranagar Metro Station, Bangalore",
    "Manyata Tech Park, Nagavara",
    "HSR Layout Sector 1, Bangalore",
    "Whitefield ITPL Main Gate",
    "Electronic City Phase 1",
    "Silk Board Junction, Hosur Road",
    "Marathahalli Bridge",
    "Bagmane Tech Park, CV Raman Nagar",
    "Phoenix Marketcity, Mahadevapura",
    "EcoSpace Business Park, Bellandur",
    "Forum Mall, Koramangala",
    "Wipro Gate, Sarjapur Road",
    "Majestic Bus Stand, Bangalore",
    "Bangalore International Airport (KIAL)",
    "MG Road, Bangalore",
    "RMZ Infinity, Old Madras Road",
    "Embassy Golf Links, Domlur"
  ];
  
  return allPlaces.filter(p => p.toLowerCase().includes(query.toLowerCase()));
};
