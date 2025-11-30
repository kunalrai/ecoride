
import React, { useState, useEffect } from 'react';
import { Layout } from './components/Layout';
import { Home } from './pages/Home';
import { FindRide } from './pages/FindRide';
import { OfferRide } from './pages/OfferRide';
import { RideDetails } from './pages/RideDetails';
import { Dashboard } from './pages/Dashboard';
import { Auth } from './pages/Auth';
import { backend } from './services/backendService';
import { User, Ride, UserRole } from './types';

export default function App() {
  const [currentPage, setCurrentPage] = useState('home');
  const [user, setUser] = useState<User | null>(null);
  const [selectedRide, setSelectedRide] = useState<Ride | null>(null);

  useEffect(() => {
    // Check for session
    backend.getCurrentUser().then(setUser);
  }, []);

  const handleLogin = (loggedInUser: User) => {
    setUser(loggedInUser);
    setCurrentPage('home');
  };

  const handleLogout = async () => {
    await backend.logout();
    setUser(null);
  };

  const handleNavigate = (page: string) => {
    setCurrentPage(page);
    window.scrollTo(0, 0);
  };

  const handleRideSelect = (ride: Ride) => {
    setSelectedRide(ride);
    handleNavigate('details');
  };

  if (!user) {
    return <Auth onLogin={handleLogin} />;
  }

  return (
    <Layout 
      user={user} 
      onNavigate={handleNavigate} 
      currentPage={currentPage}
      onLogout={handleLogout}
    >
      {currentPage === 'home' && <Home onNavigate={handleNavigate} />}
      {currentPage === 'find' && <FindRide onNavigate={handleNavigate} onSelectRide={handleRideSelect} />}
      {currentPage === 'offer' && <OfferRide onNavigate={handleNavigate} />}
      {currentPage === 'details' && selectedRide && <RideDetails ride={selectedRide} onBack={() => handleNavigate('find')} />}
      {currentPage === 'dashboard' && <Dashboard user={user} onNavigate={handleNavigate} />}
    </Layout>
  );
}
