/**
 * @file Profile.jsx
 * @description User profile details editor supporting base64 avatar uploads and preferred currencies selector.
 */

import React, { useState, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../api/axiosInstance';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { User, Mail, DollarSign, Camera, Check } from 'lucide-react';

export const Profile = () => {
  const { user, updateProfile } = useAuth();
  const fileInputRef = useRef(null);

  const [avatarLoading, setAvatarLoading] = useState(false);
  const [profileLoading, setProfileLoading] = useState(false);

  // 1. React hook form
  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm({
    defaultValues: {
      name: user?.name || '',
      email: user?.email || '',
      currency: user?.currency || 'USD'
    }
  });

  const currencies = [
    { code: 'USD', name: 'US Dollar ($)' },
    { code: 'EUR', name: 'Euro (€)' },
    { code: 'GBP', name: 'British Pound (£)' },
    { code: 'INR', name: 'Indian Rupee (₹)' },
    { code: 'CAD', name: 'Canadian Dollar (C$)' },
    { code: 'AUD', name: 'Australian Dollar (A$)' }
  ];

  // 2. Handle file reading for avatar upload
  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate type and scale
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file type');
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      toast.error('Image size must be less than 2MB');
      return;
    }

    const reader = new FileReader();
    reader.onloadstart = () => setAvatarLoading(true);
    reader.onload = async () => {
      const base64Data = reader.result;
      try {
        const res = await api.post('/users/avatar', { avatar: base64Data });
        updateProfile({ avatar: base64Data });
        toast.success('Avatar uploaded successfully!');
      } catch (err) {
        toast.error(err.response?.data?.message || 'Failed to upload avatar');
      } finally {
        setAvatarLoading(false);
      }
    };
    reader.readAsDataURL(file);
  };

  // 3. Submit profile modifications
  const onSubmit = async (data) => {
    setProfileLoading(true);
    try {
      const res = await api.put('/users/profile', data);
      updateProfile(res.data.data);
      toast.success(res.data.message || 'Profile updated successfully!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update profile details');
    } finally {
      setProfileLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6 md:space-y-8 animate-fadeIn text-left">
      {/* Title */}
      <div>
        <h2 className="text-xl md:text-2xl font-black text-gray-900 dark:text-white tracking-tight">
          My Account Profile
        </h2>
        <p className="text-xs font-semibold text-gray-500 dark:text-gray-400">
          Edit your name, email, preferred currency, and configure your visual avatar.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Left column: Avatar Uploader */}
        <div className="glass-panel p-6 flex flex-col items-center justify-center space-y-4 border border-gray-200/50 dark:border-gray-800/40 text-center h-fit">
          <div className="relative group">
            {/* Avatar display frame */}
            {user?.avatar ? (
              <img
                src={user.avatar}
                alt={user.name}
                className="w-32 h-32 rounded-3xl object-cover border-2 border-primary/20 dark:border-primary-light/20 shadow-2xl transition-transform duration-200 group-hover:scale-102"
              />
            ) : (
              <div className="w-32 h-32 rounded-3xl bg-primary/10 border-2 border-primary/20 dark:border-primary-light/25 flex items-center justify-center text-primary dark:text-primary-light text-4xl font-extrabold shadow-inner">
                {user?.name?.charAt(0).toUpperCase()}
              </div>
            )}

            {/* Shimmer loading layer */}
            {avatarLoading && (
              <div className="absolute inset-0 bg-black/60 backdrop-blur-xs rounded-3xl flex items-center justify-center text-white">
                <svg className="animate-spin h-8 w-8" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
              </div>
            )}

            {/* Click upload hover key */}
            <button
              onClick={() => fileInputRef.current.click()}
              className="absolute -bottom-2 -right-2 bg-primary hover:bg-primary-light text-white p-2.5 rounded-2xl shadow-xl hover:scale-110 active:scale-95 transition-all duration-200"
              title="Upload Photo"
              disabled={avatarLoading}
            >
              <Camera className="w-4 h-4 shrink-0" />
            </button>
          </div>

          <input
            type="file"
            ref={fileInputRef}
            onChange={handleAvatarChange}
            accept="image/*"
            className="hidden"
          />

          <div className="leading-none space-y-1">
            <h4 className="text-base font-extrabold text-gray-800 dark:text-white">{user?.name}</h4>
            <span className="block text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest">{user?.email}</span>
          </div>
        </div>

        {/* Right column: Form Details update */}
        <div className="md:col-span-2 glass-panel p-6 md:p-8 space-y-6 border border-gray-200/50 dark:border-gray-800/40">
          <h3 className="text-sm font-black text-gray-500 dark:text-gray-400 uppercase tracking-wider pb-3 border-b border-gray-200/50 dark:border-gray-800/40">
            Account Metadata Information
          </h3>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <Input
              label="Full Name"
              type="text"
              icon={User}
              error={errors.name?.message}
              {...register('name', { required: 'Name is required' })}
            />

            <Input
              label="Email Address"
              type="email"
              icon={Mail}
              error={errors.email?.message}
              {...register('email', {
                required: 'Email is required',
                pattern: {
                  value: /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
                  message: 'Please provide a valid email'
                }
              })}
            />

            <div className="text-left space-y-1.5 w-full">
              <label className="block text-xs font-semibold tracking-wide text-gray-600 dark:text-gray-400 uppercase">
                Base Currency Code
              </label>
              <div className="relative rounded-xl shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                  <DollarSign className="h-5 w-5" />
                </div>
                <select
                  className="glass-input pl-11 text-sm bg-white dark:bg-darkBg-card dark:text-white"
                  {...register('currency')}
                >
                  {currencies.map((curr) => (
                    <option key={curr.code} value={curr.code}>{curr.name}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="pt-4 border-t border-gray-200/50 dark:border-gray-800/40 flex justify-end">
              <Button type="submit" className="px-6" isLoading={profileLoading}>
                <Check className="w-4 h-4 shrink-0" />
                <span>Save Profile Changes</span>
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Profile;
