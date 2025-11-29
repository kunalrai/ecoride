
import React, { useState } from 'react';
import { User, UserRole } from '../types';
import { Button } from './Button';
import { Menu, User as UserIcon, Car, Search, PlusCircle, LayoutDashboard, Wallet, Bell, Map, LogOut } from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
  user: User;
  onNavigate: (page: string) => void;
  currentPage: string;
  onLogout: () => void;
}

export const Layout: React.FC<LayoutProps> = ({ children, user, onNavigate, currentPage, onLogout }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const NavItem = ({ page, icon: Icon, label }: { page: string, icon: any, label: string }) => (
    <button
      onClick={() => {
        onNavigate(page);
        setIsMobileMenuOpen(false);
      }}
      className={`flex items-center px-4 py-3 text-sm font-medium rounded-lg w-full transition-colors ${
        currentPage === page 
          ? 'bg-green-50 text-green-700' 
          : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
      }`}
    >
      <Icon className={`mr-3 h-5 w-5 ${currentPage === page ? 'text-green-600' : 'text-gray-400'}`} />
      {label}
    </button>
  );

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
      {/* Navbar */}
      <nav className="bg-white shadow-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <div className="flex-shrink-0 flex items-center cursor-pointer" onClick={() => onNavigate('home')}>
                <div className="bg-green-600 text-white p-1.5 rounded-lg mr-2">
                   <Car className="h-5 w-5" />
                </div>
                <span className="text-xl font-bold text-gray-800 tracking-tight">EcoRide</span>
              </div>
              <div className="hidden md:ml-10 md:flex md:space-x-8">
                 <button onClick={() => onNavigate('home')} className={`${currentPage === 'home' ? 'text-green-600 border-green-600' : 'text-gray-500 border-transparent hover:text-gray-700'} border-b-2 px-1 pt-1 text-sm font-medium h-16 inline-flex items-center`}>
                    Home
                 </button>
                 <button onClick={() => onNavigate('dashboard')} className={`${currentPage === 'dashboard' ? 'text-green-600 border-green-600' : 'text-gray-500 border-transparent hover:text-gray-700'} border-b-2 px-1 pt-1 text-sm font-medium h-16 inline-flex items-center`}>
                    My Rides
                 </button>
              </div>
            </div>
            
            <div className="hidden md:flex md:items-center space-x-4">
              <div className="bg-gray-100 p-2 rounded-full text-gray-500 hover:text-green-600 cursor-pointer">
                 <Bell className="h-5 w-5" />
              </div>
              
              <div className="flex items-center bg-gray-50 rounded-full px-3 py-1.5 border border-gray-200 cursor-pointer" onClick={() => onNavigate('dashboard')}>
                 <Wallet className="h-4 w-4 mr-2 text-green-600" />
                 <span className="text-sm font-bold text-gray-700">{user.walletBalance} pts</span>
              </div>

              <div className="ml-3 relative flex items-center gap-3 pl-3 border-l border-gray-200">
                 <div className="text-right hidden lg:block">
                     <div className="text-sm font-medium text-gray-900">{user.name}</div>
                     <div className="text-xs text-gray-500">{user.company || 'Verified User'}</div>
                 </div>
                 <img className="h-9 w-9 rounded-full border border-gray-200 bg-gray-100 cursor-pointer" src={user.avatarUrl} alt="" onClick={() => onNavigate('dashboard')} />
                 <Button variant="outline" size="sm" onClick={onLogout} className="ml-2 text-xs py-1 h-8 px-2 border-0 text-red-500 hover:bg-red-50 hover:text-red-600">
                    <LogOut className="h-4 w-4" />
                 </Button>
              </div>
            </div>

            <div className="-mr-2 flex items-center md:hidden">
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none"
              >
                <Menu className="h-6 w-6" />
              </button>
            </div>
          </div>
        </div>

        {/* Mobile menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden bg-white border-t border-gray-200 absolute w-full shadow-lg z-50">
            <div className="pt-2 pb-3 space-y-1 px-2">
              <NavItem page="home" icon={Car} label="Home" />
              <NavItem page="find" icon={Search} label="Find a Ride" />
              <NavItem page="offer" icon={PlusCircle} label="Offer a Ride" />
              <NavItem page="dashboard" icon={LayoutDashboard} label="My Rides & Wallet" />
            </div>
            <div className="pt-4 pb-4 border-t border-gray-200">
              <div className="flex items-center px-4">
                <div className="flex-shrink-0">
                  <img className="h-10 w-10 rounded-full bg-gray-100" src={user.avatarUrl} alt="" />
                </div>
                <div className="ml-3">
                  <div className="text-base font-medium text-gray-800">{user.name}</div>
                  <div className="text-xs text-green-600 font-semibold">{user.company}</div>
                </div>
                <div className="ml-auto bg-green-50 px-3 py-1 rounded-full text-sm font-bold text-green-700">
                   {user.walletBalance} pts
                </div>
              </div>
              <div className="mt-3 px-4">
                 <Button variant="danger" className="w-full justify-center" onClick={onLogout}>
                    Log Out
                 </Button>
              </div>
            </div>
          </div>
        )}
      </nav>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {children}
      </main>
    </div>
  );
};
