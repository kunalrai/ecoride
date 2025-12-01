
import React, { useEffect, useState } from 'react';
import { backend } from '../services/backendService';
import { Ride, Booking, User } from '../types';
import { Button } from '../components/Button';
import { Calendar, Clock, MapPin, ChevronRight, Wallet, Plus, ArrowUpRight, ArrowDownLeft } from 'lucide-react';

interface DashboardProps {
    user: User;
    onNavigate: (page: string) => void;
}

interface Transaction {
    id: string;
    type: string;
    category: string;
    amount: number;
    pointsChanged: number;
    description: string;
    createdAt: string;
}

interface WalletData {
    balance: number;
    points: number;
}

export const Dashboard: React.FC<DashboardProps> = ({ user, onNavigate }) => {
    const [bookings, setBookings] = useState<(Booking & { ride: Ride })[]>([]);
    const [offered, setOffered] = useState<Ride[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'bookings' | 'offered' | 'wallet'>('bookings');
    const [wallet, setWallet] = useState<WalletData>({ balance: 0, points: 0 });
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [showAddPointsModal, setShowAddPointsModal] = useState(false);
    const [addPointsAmount, setAddPointsAmount] = useState('');
    const [loadingWallet, setLoadingWallet] = useState(false);

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

    useEffect(() => {
        if (activeTab === 'wallet') {
            fetchWalletData();
        }
    }, [activeTab]);

    const fetchWalletData = async () => {
        try {
            const [walletData, transactionHistory] = await Promise.all([
                backend.getWallet(),
                backend.getTransactionHistory(10, 0)
            ]);
            setWallet(walletData);
            setTransactions(transactionHistory);
        } catch (error) {
            console.error('Failed to fetch wallet data:', error);
        }
    };

    const handleAddPoints = async () => {
        const amount = parseFloat(addPointsAmount);
        if (!amount || amount < 1) {
            alert('Please enter a valid amount (minimum ₹1)');
            return;
        }

        setLoadingWallet(true);
        try {
            // Create Razorpay order
            const order = await backend.createWalletOrder(amount);

            // Initialize Razorpay
            const options = {
                key: import.meta.env.VITE_RAZORPAY_KEY_ID || '',
                amount: order.amount,
                currency: order.currency,
                name: 'EcoRide',
                description: 'Add Points to Wallet',
                order_id: order.id,
                handler: async (response: any) => {
                    try {
                        // Verify payment
                        await backend.verifyAndLoadWallet(
                            amount,
                            response.razorpay_order_id,
                            response.razorpay_payment_id,
                            response.razorpay_signature
                        );

                        // Refresh wallet data
                        await fetchWalletData();

                        setShowAddPointsModal(false);
                        setAddPointsAmount('');
                        alert('Points added successfully!');
                    } catch (error: any) {
                        alert(error.message || 'Payment verification failed');
                    }
                },
                prefill: {
                    name: user.name,
                    email: user.email,
                    contact: user.phone,
                },
                theme: {
                    color: '#16a34a',
                },
            };

            const razorpay = new (window as any).Razorpay(options);
            razorpay.open();
        } catch (error: any) {
            alert(error.message || 'Failed to create order');
        } finally {
            setLoadingWallet(false);
        }
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        const today = new Date();
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);

        if (date.toDateString() === today.toDateString()) {
            return `Today, ${date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}`;
        } else if (date.toDateString() === yesterday.toDateString()) {
            return `Yesterday, ${date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}`;
        } else {
            return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
        }
    };

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
                                <div className="text-4xl font-bold">₹{wallet.balance.toFixed(2)}</div>
                                <div className="text-green-100 text-sm mt-1">{wallet.points} Points</div>
                            </div>
                            <div className="bg-white/20 p-2 rounded-lg backdrop-blur-sm">
                                <Wallet className="w-6 h-6 text-white" />
                            </div>
                        </div>
                        <div className="flex gap-3">
                            <button
                                onClick={() => setShowAddPointsModal(true)}
                                className="flex-1 bg-white text-green-700 font-bold py-2.5 rounded-xl shadow-sm text-sm flex items-center justify-center gap-2 hover:bg-green-50 transition-colors"
                            >
                                <Plus className="w-4 h-4" /> Add Points
                            </button>
                            <button className="flex-1 bg-green-700 text-white font-bold py-2.5 rounded-xl shadow-sm text-sm flex items-center justify-center gap-2 hover:bg-green-800 border border-green-600 transition-colors">
                                Redeem
                            </button>
                        </div>
                    </div>

                    <h3 className="font-bold text-gray-900">Recent Transactions</h3>
                    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                        {transactions.length === 0 ? (
                            <div className="p-8 text-center text-gray-500">
                                No transactions yet
                            </div>
                        ) : (
                            transactions.map((transaction) => (
                                <div key={transaction.id} className="p-4 border-b border-gray-100 flex justify-between items-center last:border-0">
                                    <div className="flex items-center gap-3">
                                        <div className={`p-2 rounded-full ${transaction.type === 'DEBIT' ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-600'}`}>
                                            {transaction.type === 'DEBIT' ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownLeft className="w-4 h-4" />}
                                        </div>
                                        <div>
                                            <div className="font-semibold text-gray-900 text-sm">{transaction.description}</div>
                                            <div className="text-xs text-gray-500">{formatDate(transaction.createdAt)}</div>
                                        </div>
                                    </div>
                                    <div>
                                        <div className={`font-bold text-right ${transaction.type === 'DEBIT' ? 'text-red-600' : 'text-green-600'}`}>
                                            {transaction.type === 'DEBIT' ? '-' : '+'}₹{Math.abs(transaction.amount).toFixed(2)}
                                        </div>
                                        {transaction.pointsChanged !== 0 && (
                                            <div className="text-xs text-gray-500 text-right">
                                                {transaction.pointsChanged > 0 ? '+' : ''}{transaction.pointsChanged} pts
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            )}

            {showAddPointsModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl">
                        <h2 className="text-xl font-bold text-gray-900 mb-4">Add Points to Wallet</h2>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Enter Amount (₹)
                                </label>
                                <input
                                    type="number"
                                    value={addPointsAmount}
                                    onChange={(e) => setAddPointsAmount(e.target.value)}
                                    placeholder="100"
                                    min="1"
                                    step="1"
                                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                />
                                {addPointsAmount && parseFloat(addPointsAmount) > 0 && (
                                    <p className="mt-2 text-sm text-gray-600">
                                        You will receive approximately {Math.floor(parseFloat(addPointsAmount) * 10)} points
                                    </p>
                                )}
                            </div>
                            <div className="flex gap-3">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setShowAddPointsModal(false);
                                        setAddPointsAmount('');
                                    }}
                                    className="flex-1 px-4 py-3 border border-gray-300 rounded-xl font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                                    disabled={loadingWallet}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="button"
                                    onClick={handleAddPoints}
                                    disabled={loadingWallet || !addPointsAmount || parseFloat(addPointsAmount) < 1}
                                    className="flex-1 px-4 py-3 bg-green-600 text-white rounded-xl font-medium hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                                >
                                    {loadingWallet ? 'Processing...' : 'Continue to Payment'}
                                </button>
                            </div>
                        </div>
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
