/**
 * @file Login.jsx
 * @description Glassmorphism styled user login page utilizing react-hook-form and global AuthContext.
 */

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Mail, Lock, ArrowRight, AlertCircle } from 'lucide-react';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import api from '../api/axiosInstance';

export const Login = () => {
  const { loginUser } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [unverifiedEmail, setUnverifiedEmail] = useState('');
  const [resendLoading, setResendLoading] = useState(false);
  const [resendSuccess, setResendSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm({
    defaultValues: {
      email: '',
      password: ''
    }
  });

  const onSubmit = async (data) => {
    setLoading(true);
    setUnverifiedEmail('');
    setResendSuccess(false);

    const result = await loginUser(data);
    setLoading(false);
    
    if (result === true || result?.success) {
      navigate('/dashboard');
    } else if (result?.unverified) {
      setUnverifiedEmail(result.email);
    }
  };

  const handleResendVerification = async () => {
    setResendLoading(true);
    try {
      await api.post('/auth/resend-verification', { email: unverifiedEmail });
      setResendSuccess(true);
    } catch (err) {
      console.error('Failed to resend verification:', err);
    } finally {
      setResendLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#0B0F19] flex items-center justify-center p-4 relative overflow-hidden">
      {/* Visual background glows */}
      <div className="absolute top-1/4 left-1/4 w-80 h-80 rounded-full bg-primary/25 blur-[120px] pointer-events-none animate-pulseSlow" />
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 rounded-full bg-success/15 blur-[120px] pointer-events-none animate-pulseSlow" style={{ animationDelay: '1.5s' }} />

      {/* Main glassmorphic wrapper */}
      <div className="w-full max-w-md glass-panel p-8 text-center border border-white/10 dark:border-white/10 shadow-2xl relative z-10 animate-slideUp">
        {/* Brand details */}
        <div className="space-y-2 mb-8">
          <div className="inline-flex bg-primary p-3 rounded-2xl shadow-lg shadow-primary/30 items-center justify-center mx-auto mb-2">
            <span className="text-white text-2xl font-black tracking-wider leading-none">A</span>
          </div>
          <h2 className="text-2xl font-black text-white tracking-tight">Welcome Back</h2>
          <p className="text-sm font-semibold text-gray-400">
            Sign in to track your expenses and budgets securely.
          </p>
        </div>

        {/* Form fields */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input
          className=""
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

          <div className="text-right">
            <Link
              to="/forgot-password"
              className="text-xs font-semibold text-primary hover:text-primary-light transition-colors hover:underline"
            >
              Forgot Password?
            </Link>
          </div>

          {unverifiedEmail && (
            <div className="flex flex-col items-start gap-2.5 p-3.5 text-sm text-amber-200 bg-amber-950/40 border border-amber-500/20 rounded-xl text-left animate-scaleUp">
              <div className="flex items-start gap-2">
                <AlertCircle className="w-4.5 h-4.5 mt-0.5 shrink-0 text-amber-400" />
                <span>Your email is not verified. Please verify it before logging in.</span>
              </div>
              {!resendSuccess ? (
                <button
                  type="button"
                  onClick={handleResendVerification}
                  disabled={resendLoading}
                  className="mt-1 text-xs text-primary hover:text-primary-light underline font-bold transition-all"
                >
                  {resendLoading ? 'Resending email...' : 'Resend verification email'}
                </button>
              ) : (
                <span className="text-xs text-success font-bold mt-1">Verification link resent!</span>
              )}
            </div>
          )}

          {/* Submit button */}
          <Button
            type="submit"
            className="w-full mt-2"
            isLoading={loading}
          >
            <span>Sign In</span>
            <ArrowRight className="w-4 h-4 ml-1 shrink-0" />
          </Button>
        </form>

        {/* Footer links */}
        <div className="mt-8 text-xs font-semibold text-gray-400">
          <span>Don't have an account? </span>
          <Link
            to="/register"
            className="text-primary hover:text-primary-light transition-colors underline underline-offset-4"
          >
            Create account
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Login;
