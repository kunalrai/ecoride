
import React, { useState, useEffect } from 'react';
import { Button } from '../components/Button';
import { backend } from '../services/backendService';
import { User } from '../types';
import { Car, Smartphone, ArrowRight, ShieldCheck } from 'lucide-react';

interface AuthProps {
  onLogin: (user: User) => void;
}

export const Auth: React.FC<AuthProps> = ({ onLogin }) => {
  const [step, setStep] = useState<'phone' | 'otp' | 'name'>('phone');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [name, setName] = useState('');
  const [isNewUser, setIsNewUser] = useState(false);
  const [loading, setLoading] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);

  // Cooldown timer for resend
  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCooldown]);

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (phone.length < 10) {
        alert("Please enter a valid 10-digit mobile number");
        return;
    }
    setLoading(true);
    try {
        // Add +91 country code for Indian numbers
        const formattedPhone = phone.startsWith('+') ? phone : `+91${phone}`;
        // Try login first - if user doesn't exist, ask for name
        await backend.login(formattedPhone);
        setIsNewUser(false);
        setStep('otp');
    } catch (error: any) {
        if (error.message === 'OTP_REQUIRED') {
            // User exists - OTP sent successfully
            setIsNewUser(false);
            setStep('otp');
            setResendCooldown(30); // 30 second cooldown
        } else if (error.message === 'User not found') {
            // New user - need to collect name first
            setIsNewUser(true);
            setStep('name');
        } else {
            alert(error.message || "Failed to send OTP");
        }
    } finally {
        setLoading(false);
    }
  };

  const handleSendSignupOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
        alert("Please enter your name");
        return;
    }
    setLoading(true);
    try {
        // Add +91 country code for Indian numbers
        const formattedPhone = phone.startsWith('+') ? phone : `+91${phone}`;
        // Send signup OTP with name
        await backend.signup(formattedPhone, name);
        setStep('otp');
    } catch (error: any) {
        if (error.message === 'OTP_REQUIRED') {
            // Expected - OTP was sent successfully
            setStep('otp');
            setResendCooldown(30); // 30 second cooldown
        } else {
            alert(error.message || "Failed to send OTP");
        }
    } finally {
        setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (resendCooldown > 0) return;

    setLoading(true);
    try {
        const formattedPhone = phone.startsWith('+') ? phone : `+91${phone}`;

        if (isNewUser) {
            // Resend signup OTP
            await backend.signup(formattedPhone, name);
        } else {
            // Resend login OTP
            await backend.login(formattedPhone);
        }

        setResendCooldown(30); // Reset cooldown
        alert('OTP sent successfully!');
    } catch (error: any) {
        if (error.message !== 'OTP_REQUIRED') {
            alert(error.message || "Failed to resend OTP");
        } else {
            setResendCooldown(30);
            alert('OTP sent successfully!');
        }
    } finally {
        setLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (otp.length !== 6) {
        alert("Please enter a valid 6-digit OTP");
        return;
    }
    setLoading(true);
    try {
        // Add +91 country code for Indian numbers
        const formattedPhone = phone.startsWith('+') ? phone : `+91${phone}`;
        // Verify OTP and login/signup
        const user = isNewUser
            ? await backend.signup(formattedPhone, name, otp)
            : await backend.login(formattedPhone, otp);
        onLogin(user);
    } catch (error: any) {
        alert(error.message || "Verification failed");
    } finally {
        setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center items-center p-4">
       <div className="w-full max-w-md bg-white rounded-3xl shadow-xl overflow-hidden">
           <div className="bg-green-600 p-8 text-center">
               <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                   <Car className="w-8 h-8 text-green-600" />
               </div>
               <h1 className="text-2xl font-bold text-white">EcoRide</h1>
               <p className="text-green-100 text-sm mt-1">India's Trusted Corporate Carpool</p>
           </div>

           <div className="p-8">
               {step === 'phone' && (
                   <form onSubmit={handleSendOtp} className="space-y-6">
                       <div className="text-center">
                           <h2 className="text-xl font-semibold text-gray-900">Get Started</h2>
                           <p className="text-gray-500 text-sm mt-1">Enter your mobile number to continue</p>
                       </div>

                       <div className="relative">
                           <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                               <Smartphone className="h-5 w-5 text-gray-400" />
                           </div>
                           <div className="absolute inset-y-0 left-10 flex items-center pointer-events-none">
                               <span className="text-gray-500 font-medium border-r border-gray-300 pr-2">+91</span>
                           </div>
                           <input
                               type="tel"
                               className="block w-full pl-24 pr-3 py-3 border border-gray-300 rounded-xl focus:ring-green-500 focus:border-green-500"
                               placeholder="99999 99999"
                               value={phone}
                               onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                               autoFocus
                           />
                       </div>

                       <Button type="submit" className="w-full h-12 rounded-xl" isLoading={loading}>
                           Next <ArrowRight className="ml-2 h-4 w-4" />
                       </Button>

                       <div className="flex items-center justify-center space-x-2 text-xs text-gray-400">
                           <ShieldCheck className="h-4 w-4" />
                           <span>100% Secure & Verified Community</span>
                       </div>
                   </form>
               )}

               {step === 'name' && (
                   <form onSubmit={handleSendSignupOtp} className="space-y-6">
                       <div className="text-center">
                           <h2 className="text-xl font-semibold text-gray-900">Welcome to EcoRide!</h2>
                           <p className="text-gray-500 text-sm mt-1">Please enter your name to continue</p>
                       </div>

                       <div>
                           <input
                               type="text"
                               className="block w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-green-500 focus:border-green-500"
                               placeholder="Full Name"
                               value={name}
                               onChange={(e) => setName(e.target.value)}
                               autoFocus
                           />
                       </div>

                       <Button type="submit" className="w-full h-12 rounded-xl" isLoading={loading}>
                           Send OTP <ArrowRight className="ml-2 h-4 w-4" />
                       </Button>

                       <div className="text-center text-sm">
                           <button type="button" onClick={() => setStep('phone')} className="text-gray-500 hover:text-gray-700">
                               ← Back to phone number
                           </button>
                       </div>
                   </form>
               )}

               {step === 'otp' && (
                   <form onSubmit={handleVerifyOtp} className="space-y-6">
                       <div className="text-center">
                           <h2 className="text-xl font-semibold text-gray-900">Verify OTP</h2>
                           <p className="text-gray-500 text-sm mt-1">Sent to +91 {phone} <button type='button' onClick={() => setStep('phone')} className="text-green-600 font-medium">Edit</button></p>
                       </div>

                       <div className="flex justify-center gap-2">
                           <input
                               type="text"
                               className="block w-full text-center py-3 border border-gray-300 rounded-xl focus:ring-green-500 focus:border-green-500 tracking-widest text-2xl font-bold"
                               placeholder="123456"
                               maxLength={6}
                               value={otp}
                               onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                               autoFocus
                           />
                       </div>

                       <Button type="submit" className="w-full h-12 rounded-xl" isLoading={loading}>
                           Verify & {isNewUser ? 'Sign Up' : 'Login'}
                       </Button>

                       <div className="text-center text-sm">
                           <span className="text-gray-500">Didn't receive code? </span>
                           <button
                               type="button"
                               onClick={handleResendOtp}
                               disabled={resendCooldown > 0 || loading}
                               className={`font-medium ${resendCooldown > 0 ? 'text-gray-400 cursor-not-allowed' : 'text-green-600 hover:underline'}`}
                           >
                               {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : 'Resend'}
                           </button>
                       </div>
                   </form>
               )}
           </div>
       </div>
    </div>
  );
};
