
import React, { useEffect, useState } from 'react';
import { backend } from '../services/backendService';
import { Ride, Booking, User } from '../types';
import { Button } from '../components/Button';
import { Calendar, Clock, MapPin, ChevronRight, Wallet, Plus, ArrowUpRight, ArrowDownLeft } from 'lucide-react';

interface DashboardProps {
    user: User;
    onNavigate: (page: string) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ user, onNavigate }) => {
    const [bookings, setBookings] = useState<(Booking & { ride: Ride })[]>([]);
    const [offered, setOffered] = useState<Ride[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'bookings' | 'offered' | 'wallet'>('bookings');

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const [b, o] = await Promise.all([
                    backend.getUserBookings(),
                    backend.getUserOfferedRides()
                ]);
                setBookings(b);
                setOffered(o);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [user.id]);

    if (loading) return <div className="text-center py-20 text-gray-500">Syncing...</div>;

    return (
        <div className="max-w-4xl mx-auto space-y-6 pb-20">
            <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
            
            <div className="flex space-x-2 border-b border-gray-200 overflow-x-auto">
                {['bookings', 'offered', 'wallet'].map((tab) => (
                    <button 
                        key={tab}
                        onClick={() => setActiveTab(tab as any)}
                        className={`pb-3 px-4 font-medium text-sm capitalize whitespace-nowrap transition-colors ${activeTab === tab ? 'border-b-2 border-green-600 text-green-700' : 'text-gray-500 hover:text-gray-700'}`}
                    >
                        {tab === 'bookings' ? 'My Rides' : tab === 'offered' ? 'Offered' : 'Wallet & Points'}
                    </button>
                ))}
            </div>

            {activeTab === 'wallet' && (
                <div className="space-y-6">
                    <div className="bg-gradient-to-r from-green-600 to-emerald-600 rounded-2xl p-6 text-white shadow-lg">
                        <div className="flex justify-between items-start mb-8">
                            <div>
                                <div className="text-green-100 text-sm font-medium mb-1">Available Balance</div>
                                <div className="text-4xl font-bold">{user.walletBalance} <span className="text-lg opacity-80">Pts</span></div>
                            </div>
                            <div className="bg-white/20 p-2 rounded-lg backdrop-blur-sm">
                                <Wallet className="w-6 h-6 text-white" />
                            </div>
                        </div>
                        <div className="flex gap-3">
                            <button className="flex-1 bg-white text-green-700 font-bold py-2.5 rounded-xl shadow-sm text-sm flex items-center justify-center gap-2 hover:bg-green-50">
                                <Plus className="w-4 h-4" /> Add Points
                            </button>
                            <button className="flex-1 bg-green-700 text-white font-bold py-2.5 rounded-xl shadow-sm text-sm flex items-center justify-center gap-2 hover:bg-green-800 border border-green-600">
                                Redeem
                            </button>
                        </div>
                    </div>

                    <h3 className="font-bold text-gray-900">Recent Transactions</h3>
                    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="p-4 border-b border-gray-100 flex justify-between items-center last:border-0">
                                <div className="flex items-center gap-3">
                                    <div className={`p-2 rounded-full ${i % 2 === 0 ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-600'}`}>
                                        {i % 2 === 0 ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownLeft className="w-4 h-4" />}
                                    </div>
                                    <div>
                                        <div className="font-semibold text-gray-900 text-sm">{i % 2 === 0 ? 'Ride Taken' : 'Points Added'}</div>
                                        <div className="text-xs text-gray-500">Today, 10:00 AM</div>
                                    </div>
                                </div>
                                <div className={`font-bold ${i % 2 === 0 ? 'text-red-600' : 'text-green-600'}`}>
                                    {i % 2 === 0 ? '-' : '+'}50
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {activeTab === 'bookings' && (
                <div className="space-y-4">
                    {bookings.length === 0 ? (
                        <div className="text-center py-10 bg-gray-50 rounded-xl border border-dashed border-gray-300">
                            <p className="text-gray-500">No active bookings.</p>
                            <Button className="mt-4" onClick={() => onNavigate('find')}>Find Ride</Button>
                        </div>
                    ) : bookings.map((booking) => (
                        <div key={booking.id} className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
                            <div className="flex justify-between items-start mb-3">
                                <span className="bg-green-100 text-green-800 px-2 py-0.5 rounded text-xs font-bold tracking-wide uppercase">{booking.status}</span>
                                <span className="font-bold text-gray-900">{booking.totalPrice} Pts</span>
                            </div>
                            <div className="flex gap-4">
                                <div className="text-center w-16">
                                    <div className="font-bold text-gray-900 text-lg">{booking.ride.time}</div>
                                    <div className="text-xs text-gray-500">{new Date(booking.ride.date).getDate()} May</div>
                                </div>
                                <div className="w-px bg-gray-200 self-stretch"></div>
                                <div className="flex-1">
                                    <div className="flex items-center text-sm font-semibold text-gray-900">
                                        <span className="truncate max-w-[100px]">{booking.ride.origin}</span>
                                        <ChevronRight className="w-4 h-4 mx-1 text-gray-400" />
                                        <span className="truncate max-w-[100px]">{booking.ride.destination}</span>
                                    </div>
                                    <div className="text-xs text-gray-500 mt-1">
                                        Driver: {booking.ride.driverName} • {booking.ride.vehicleModel}
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};
