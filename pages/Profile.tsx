
import React, { useState } from 'react';
import { User } from '../types';
import { Button } from '../components/Button';
import { User as UserIcon, Mail, Phone, Building, Edit2, Save, X, Camera } from 'lucide-react';

interface ProfileProps {
  user: User;
  onNavigate: (page: string) => void;
  onUpdateUser: (updatedUser: User) => void;
}

export const Profile: React.FC<ProfileProps> = ({ user, onNavigate, onUpdateUser }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState({
    name: user.name,
    email: user.email,
    company: user.company || '',
  });

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
      // Call the backend to update profile
      const updatedUser = {
        ...user,
        name: formData.name,
        email: formData.email,
        company: formData.company,
      };

      // Pass the updated user back to the parent
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
      name: user.name,
      email: user.email,
      company: user.company || '',
    });
    setIsEditing(false);
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
                <div className="px-4 py-3 bg-gray-50 rounded-lg text-gray-900 font-medium">
                  {user.email || 'Not provided'}
                </div>
              )}
            </div>

            {/* Phone Field (Read-only) */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Phone className="w-4 h-4 inline mr-2 text-gray-400" />
                Phone Number
              </label>
              <div className="px-4 py-3 bg-gray-50 rounded-lg text-gray-900 font-medium flex items-center justify-between">
                <span>{user.phone || 'Not provided'}</span>
                {user.isVerified && (
                  <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full font-semibold">
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
    </div>
  );
};
