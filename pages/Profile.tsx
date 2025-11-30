
import React, { useState } from 'react';
import { User } from '../types';
import { Button } from '../components/Button';
import { User as UserIcon, Mail, Phone, Building, Edit2, Save, X, Camera, Trash2, AlertTriangle, Check, Send } from 'lucide-react';
import { backend } from '../services/backendService';

interface ProfileProps {
  user: User;
  onNavigate: (page: string) => void;
  onUpdateUser: (updatedUser: User, skipApiCall?: boolean) => void;
  onLogout?: () => void;
}

export const Profile: React.FC<ProfileProps> = ({ user, onNavigate, onUpdateUser, onLogout }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');
  const [formData, setFormData] = useState({
    name: user.name || '',
    email: user.email || '',
    company: user.company || '',
  });

  // Email verification states
  const [showEmailVerification, setShowEmailVerification] = useState(false);
  const [verificationEmail, setVerificationEmail] = useState('');
  const [verificationOtp, setVerificationOtp] = useState('');
  const [isSendingOtp, setIsSendingOtp] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [verificationMessage, setVerificationMessage] = useState('');
  const [verificationError, setVerificationError] = useState('');

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const updatedUser = {
        ...user,
        name: formData.name,
        email: formData.email,
        company: formData.company,
      };

      onUpdateUser(updatedUser);
      setIsEditing(false);
    } catch (error) {
      console.error('Failed to update profile:', error);
      alert('Failed to update profile. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      name: user.name || '',
      email: user.email || '',
      company: user.company || '',
    });
    setIsEditing(false);
  };

  const handleDeleteAccount = async () => {
    if (deleteConfirmText !== 'DELETE') {
      alert('Please type DELETE to confirm account deletion');
      return;
    }

    setIsDeleting(true);
    try {
      await backend.deleteAccount();
      alert('Your account has been deleted successfully');

      if (onLogout) {
        onLogout();
      }
    } catch (error: any) {
      console.error('Failed to delete account:', error);
      alert(error.message || 'Failed to delete account. Please try again.');
    } finally {
      setIsDeleting(false);
      setShowDeleteModal(false);
    }
  };

  // Email verification handlers
  const handleOpenEmailVerification = () => {
    setShowEmailVerification(true);
    setVerificationEmail(user.email || '');
    setVerificationOtp('');
    setOtpSent(false);
    setVerificationMessage('');
    setVerificationError('');
  };

  const handleSendVerificationCode = async () => {
    if (!verificationEmail || !verificationEmail.includes('@')) {
      setVerificationError('Please enter a valid email address');
      return;
    }

    setIsSendingOtp(true);
    setVerificationError('');
    setVerificationMessage('');

    try {
      await backend.sendEmailVerification(verificationEmail);
      setOtpSent(true);
      setVerificationMessage('Verification code sent! Check your inbox.');
    } catch (error: any) {
      setVerificationError(error.message || 'Failed to send verification code');
    } finally {
      setIsSendingOtp(false);
    }
  };

  const handleVerifyEmail = async () => {
    if (!verificationOtp || verificationOtp.length !== 6) {
      setVerificationError('Please enter the 6-digit verification code');
      return;
    }

    setIsVerifying(true);
    setVerificationError('');
    setVerificationMessage('');

    try {
      const result = await backend.verifyEmail(verificationEmail, verificationOtp);
      setVerificationMessage('Email verified successfully!');

      // Pass true for skipApiCall since verifyEmail already updated the backend
      onUpdateUser(result.user, true);

      setTimeout(() => {
        setShowEmailVerification(false);
      }, 2000);
    } catch (error: any) {
      setVerificationError(error.message || 'Invalid verification code');
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Profile</h1>
          <p className="text-gray-500 mt-1">Manage your account information</p>
        </div>
        {!isEditing && (
          <Button
            onClick={() => setIsEditing(true)}
            variant="outline"
            className="flex items-center gap-2"
          >
            <Edit2 className="w-4 h-4" />
            Edit Profile
          </Button>
        )}
      </div>

      {/* Profile Card */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {/* Cover & Avatar Section */}
        <div className="relative h-32 bg-gradient-to-r from-green-500 to-green-600">
          <div className="absolute -bottom-16 left-8">
            <div className="relative">
              <img
                src={user.avatarUrl}
                alt={user.name}
                className="w-32 h-32 rounded-full border-4 border-white bg-white shadow-lg"
              />
              {isEditing && (
                <button className="absolute bottom-2 right-2 bg-green-600 text-white p-2 rounded-full hover:bg-green-700 transition-colors shadow-lg">
                  <Camera className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Profile Info Section */}
        <div className="pt-20 px-8 pb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Name Field */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <UserIcon className="w-4 h-4 inline mr-2 text-gray-400" />
                Full Name
              </label>
              {isEditing ? (
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-all"
                  placeholder="Enter your full name"
                />
              ) : (
                <div className="px-4 py-3 bg-gray-50 rounded-lg text-gray-900 font-medium">
                  {user.name}
                </div>
              )}
            </div>

            {/* Email Field */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Mail className="w-4 h-4 inline mr-2 text-gray-400" />
                Email Address
              </label>
              <div className="relative">
                {isEditing ? (
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-all"
                    placeholder="Enter your email"
                  />
                ) : (
                  <div className="flex items-center gap-2">
                    <div className="flex-1 px-4 py-3 bg-gray-50 rounded-lg text-gray-900 font-medium flex items-center justify-between">
                      <span>{user.email || 'Not provided'}</span>
                      {user.isEmailVerified && (
                        <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full font-semibold flex items-center gap-1">
                          <Check className="w-3 h-3" />
                          Verified
                        </span>
                      )}
                    </div>
                    {user.email && !user.isEmailVerified && (
                      <Button
                        onClick={handleOpenEmailVerification}
                        variant="outline"
                        className="text-xs px-3 py-2 border-green-500 text-green-600 hover:bg-green-50 flex items-center gap-1"
                      >
                        <Send className="w-3 h-3" />
                        Verify
                      </Button>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Phone Field (Read-only) */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Phone className="w-4 h-4 inline mr-2 text-gray-400" />
                Phone Number
              </label>
              <div className="px-4 py-3 bg-gray-50 rounded-lg text-gray-900 font-medium flex items-center justify-between">
                <span>{user.phone || 'Not provided'}</span>
                {user.isPhoneVerified && (
                  <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full font-semibold flex items-center gap-1">
                    <Check className="w-3 h-3" />
                    Verified
                  </span>
                )}
              </div>
            </div>

            {/* Company Field */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Building className="w-4 h-4 inline mr-2 text-gray-400" />
                Company
              </label>
              {isEditing ? (
                <input
                  type="text"
                  name="company"
                  value={formData.company}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-all"
                  placeholder="Enter your company name"
                />
              ) : (
                <div className="px-4 py-3 bg-gray-50 rounded-lg text-gray-900 font-medium">
                  {user.company || 'Not provided'}
                </div>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          {isEditing && (
            <div className="flex gap-3 mt-6 pt-6 border-t border-gray-100">
              <Button
                onClick={handleSave}
                disabled={isSaving}
                className="flex items-center gap-2 bg-green-600 hover:bg-green-700"
              >
                <Save className="w-4 h-4" />
                {isSaving ? 'Saving...' : 'Save Changes'}
              </Button>
              <Button
                onClick={handleCancel}
                variant="outline"
                disabled={isSaving}
                className="flex items-center gap-2"
              >
                <X className="w-4 h-4" />
                Cancel
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Stats Card */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
        <h2 className="text-xl font-bold text-gray-900 mb-6">Account Stats</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <div className="text-center">
            <div className="text-3xl font-bold text-green-600">{user.rating.toFixed(1)}</div>
            <div className="text-sm text-gray-500 mt-1">Rating</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-blue-600">{user.walletBalance}</div>
            <div className="text-sm text-gray-500 mt-1">Wallet Points</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-purple-600">12</div>
            <div className="text-sm text-gray-500 mt-1">Total Rides</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-orange-600">24kg</div>
            <div className="text-sm text-gray-500 mt-1">CO₂ Saved</div>
          </div>
        </div>
      </div>

      {/* Danger Zone */}
      <div className="bg-white rounded-2xl shadow-sm border-2 border-red-200 p-8">
        <h2 className="text-xl font-bold text-red-600 mb-2 flex items-center gap-2">
          <AlertTriangle className="w-5 h-5" />
          Danger Zone
        </h2>
        <p className="text-gray-600 mb-6">
          Once you delete your account, there is no going back. This action cannot be undone.
        </p>
        <Button
          onClick={() => setShowDeleteModal(true)}
          variant="outline"
          className="border-red-500 text-red-600 hover:bg-red-50 flex items-center gap-2"
        >
          <Trash2 className="w-4 h-4" />
          Delete Account
        </Button>
      </div>

      {/* Email Verification Modal */}
      {showEmailVerification && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 animate-fade-in">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Verify Email</h2>
              <button
                onClick={() => setShowEmailVerification(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="space-y-4">
              {/* Email Input */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  value={verificationEmail}
                  onChange={(e) => setVerificationEmail(e.target.value)}
                  disabled={otpSent}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-all disabled:bg-gray-100"
                  placeholder="your-email@example.com"
                />
              </div>

              {/* Send OTP Button */}
              {!otpSent && (
                <Button
                  onClick={handleSendVerificationCode}
                  disabled={isSendingOtp}
                  className="w-full bg-green-600 hover:bg-green-700 flex items-center justify-center gap-2"
                >
                  <Send className="w-4 h-4" />
                  {isSendingOtp ? 'Sending...' : 'Send Verification Code'}
                </Button>
              )}

              {/* OTP Input */}
              {otpSent && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Verification Code
                    </label>
                    <input
                      type="text"
                      value={verificationOtp}
                      onChange={(e) => {
                        const value = e.target.value.replace(/\D/g, '').slice(0, 6);
                        setVerificationOtp(value);
                      }}
                      maxLength={6}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-all text-center text-2xl font-mono tracking-widest"
                      placeholder="000000"
                    />
                    <p className="text-xs text-gray-500 mt-2">
                      Enter the 6-digit code sent to your email
                    </p>
                  </div>

                  <div className="flex gap-3">
                    <Button
                      onClick={handleVerifyEmail}
                      disabled={isVerifying || verificationOtp.length !== 6}
                      className="flex-1 bg-green-600 hover:bg-green-700 disabled:bg-gray-300"
                    >
                      {isVerifying ? 'Verifying...' : 'Verify Email'}
                    </Button>
                    <Button
                      onClick={handleSendVerificationCode}
                      disabled={isSendingOtp}
                      variant="outline"
                      className="flex-1"
                    >
                      {isSendingOtp ? 'Sending...' : 'Resend Code'}
                    </Button>
                  </div>
                </>
              )}

              {/* Success Message */}
              {verificationMessage && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-start gap-3">
                  <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <p className="text-green-800 text-sm">{verificationMessage}</p>
                </div>
              )}

              {/* Error Message */}
              {verificationError && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                  <p className="text-red-800 text-sm">{verificationError}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 animate-fade-in">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                <AlertTriangle className="w-6 h-6 text-red-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900">Delete Account</h2>
            </div>

            <div className="mb-6">
              <p className="text-gray-600 mb-4">
                This action will permanently delete your account and all associated data including:
              </p>
              <ul className="list-disc list-inside text-gray-600 space-y-1 mb-4">
                <li>Your profile information</li>
                <li>All your rides and bookings</li>
                <li>Your wallet and transaction history</li>
                <li>All vehicles and reviews</li>
              </ul>
              <p className="text-red-600 font-semibold">
                This action cannot be undone.
              </p>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Type <span className="font-bold text-red-600">DELETE</span> to confirm:
              </label>
              <input
                type="text"
                value={deleteConfirmText}
                onChange={(e) => setDeleteConfirmText(e.target.value)}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none transition-all"
                placeholder="Type DELETE"
              />
            </div>

            <div className="flex gap-3">
              <Button
                onClick={handleDeleteAccount}
                disabled={isDeleting || deleteConfirmText !== 'DELETE'}
                className="flex-1 bg-red-600 hover:bg-red-700 disabled:bg-gray-300"
              >
                {isDeleting ? 'Deleting...' : 'Delete My Account'}
              </Button>
              <Button
                onClick={() => {
                  setShowDeleteModal(false);
                  setDeleteConfirmText('');
                }}
                variant="outline"
                disabled={isDeleting}
                className="flex-1"
              >
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
