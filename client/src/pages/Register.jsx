/**
 * @file Register.jsx
 * @description Glassmorphism styled registration page utilizing react-hook-form and global AuthContext.
 */

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { User, Mail, Lock, DollarSign, ArrowRight } from 'lucide-react';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';

export const Register = () => {
  const { registerUser } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [registeredEmail, setRegisteredEmail] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm({
    defaultValues: {
      name: '',
      email: '',
      password: '',
      currency: 'USD'
    }
  });

  const onSubmit = async (data) => {
    setLoading(true);
    const success = await registerUser(data);
    setLoading(false);
    if (success) {
      setRegisteredEmail(data.email);
    }
  };

  const currencies = [
    { code: 'USD', name: 'US Dollar ($)' },
    { code: 'EUR', name: 'Euro (€)' },
    { code: 'GBP', name: 'British Pound (£)' },
    { code: 'INR', name: 'Indian Rupee (₹)' },
    { code: 'CAD', name: 'Canadian Dollar (C$)' },
    { code: 'AUD', name: 'Australian Dollar (A$)' }
  ];

  return (
    <div className="min-h-screen w-full bg-[#0B0F19] flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background visual accent glows */}
      <div className="absolute top-1/4 left-1/4 w-80 h-80 rounded-full bg-primary/20 blur-[120px] pointer-events-none animate-pulseSlow" />
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 rounded-full bg-success/15 blur-[120px] pointer-events-none animate-pulseSlow" style={{ animationDelay: '1.5s' }} />

      {/* Main glassmorphic wrapper */}
      <div className="w-full max-w-md glass-panel p-8 text-center border border-white/10 dark:border-white/10 shadow-2xl relative z-10 animate-slideUp">
        
        {!registeredEmail ? (
          <>
            {/* Brand details */}
            <div className="space-y-2 mb-8">
              <div className="inline-flex bg-primary p-3 rounded-2xl shadow-lg shadow-primary/30 items-center justify-center mx-auto mb-2">
                <span className="text-white text-2xl font-black tracking-wider leading-none">A</span>
              </div>
              <h2 className="text-2xl font-black text-white tracking-tight">Create Account</h2>
              <p className="text-sm font-semibold text-gray-400">
                Start tracking your net asset health beautifully today.
              </p>
            </div>

            {/* Form fields */}
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <Input
                label="Full Name"
                type="text"
                icon={User}
                placeholder="John Doe"
                error={errors.name?.message}
                {...register('name', { required: 'Full name is required' })}
              />

              <Input
                label="Email Address"
                type="email"
                icon={Mail}
                placeholder="name@example.com"
                error={errors.email?.message}
                {...register('email', {
                  required: 'Email address is required',
                  pattern: {
                    value: /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
                    message: 'Please provide a valid email address'
                  }
                })}
              />

              <Input
                label="Password"
                type="password"
                icon={Lock}
                placeholder="••••••••"
                error={errors.password?.message}
                {...register('password', {
                  required: 'Password is required',
                  minLength: {
                    value: 6,
                    message: 'Password must be at least 6 characters long'
                  }
                })}
              />

              {/* Currency selection element */}
              <div className="text-left space-y-1.5 w-full">
                <label className="block text-xs font-semibold tracking-wide text-gray-400 uppercase">
                  Preferred Currency
                </label>
                <div className="relative rounded-xl shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-500">
                    <DollarSign className="h-5 w-5" />
                  </div>
                  <select
                    className="glass-input pl-11 text-sm text-gray-300 bg-[#161C2A]/30 border-white/10 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary rounded-xl w-full"
                    {...register('currency')}
                  >
                    {currencies.map((curr) => (
                      <option key={curr.code} value={curr.code} className="bg-[#161C2A] text-white">
                        {curr.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Submit button */}
              <Button
                type="submit"
                className="w-full mt-2"
                isLoading={loading}
              >
                <span>Create Account</span>
                <ArrowRight className="w-4 h-4 ml-1 shrink-0" />
              </Button>
            </form>

            {/* Footer links */}
            <div className="mt-8 text-xs font-semibold text-gray-400">
              <span>Already have an account? </span>
              <Link
                to="/login"
                className="text-primary hover:text-primary-light transition-colors underline underline-offset-4"
              >
                Sign in
              </Link>
            </div>
          </>
        ) : (
          /* Verification Info Card */
          <div className="py-4 animate-scaleUp">
            <div className="inline-flex bg-success/20 p-4 rounded-full text-success mb-6 border border-success/30 shadow-inner">
              <Mail className="w-12 h-12" />
            </div>
            <h2 className="text-2xl font-black text-white tracking-tight mb-2">Check Your Inbox</h2>
            <p className="text-sm font-semibold text-gray-400 max-w-sm mx-auto mb-4">
              We have dispatched a verification email link to:
            </p>
            <p className="text-sm font-bold text-primary mb-6 bg-[#161C2A] py-2.5 px-4 rounded-xl border border-white/5 inline-block">
              {registeredEmail}
            </p>
            <p className="text-xs text-gray-500 max-w-xs mx-auto mb-8 leading-relaxed">
              Please click the link in the email to activate your account. If you do not see it within a few minutes, check your spam folder.
            </p>
            <Link
              to="/login"
              className="inline-flex items-center justify-center px-6 py-3 border border-white/10 hover:border-white/20 bg-white/5 hover:bg-white/10 rounded-xl text-sm font-bold text-white transition-all w-full"
            >
              Back to Sign In
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default Register;
