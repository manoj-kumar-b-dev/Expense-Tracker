/**
 * @file ForgotPassword.jsx
 * @description Glassmorphism-styled password recovery request form.
 */

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link } from 'react-router-dom';
import { Mail, ArrowLeft, CheckCircle, AlertCircle, Loader } from 'lucide-react';
import api from '../../api/axiosInstance';
import Input from '../ui/Input';
import Button from '../ui/Button';

export const ForgotPassword = () => {
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: {
      email: '',
    },
  });

  const onSubmit = async (data) => {
    setLoading(true);
    setErrorMsg('');
    try {
      await api.post('/auth/forgot-password', data);
      setSubmitted(true);
    } catch (err) {
      setErrorMsg(
        err.response?.data?.message || 'Failed to request password reset. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#0B0F19] flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background visual accent glows */}
      <div className="absolute top-1/4 left-1/4 w-80 h-80 rounded-full bg-primary/20 blur-[120px] pointer-events-none animate-pulseSlow" />
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 rounded-full bg-success/10 blur-[120px] pointer-events-none animate-pulseSlow" style={{ animationDelay: '1.5s' }} />

      {/* Main glassmorphic card */}
      <div className="w-full max-w-md glass-panel p-8 text-center border border-white/10 shadow-2xl relative z-10 animate-slideUp">
        {/* Back to Login arrow */}
        <div className="text-left mb-6">
          <Link
            to="/login"
            className="inline-flex items-center text-xs font-semibold text-gray-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-1.5" />
            Back to login
          </Link>
        </div>

        {!submitted ? (
          <>
            {/* Header info */}
            <div className="space-y-2 mb-8">
              <div className="inline-flex bg-primary p-3 rounded-2xl shadow-lg shadow-primary/30 items-center justify-center mx-auto mb-2">
                <Mail className="text-white w-6 h-6" />
              </div>
              <h2 className="text-2xl font-black text-white tracking-tight">Forgot Password?</h2>
              <p className="text-sm font-semibold text-gray-400">
                Enter your email address and we'll send you instructions to reset your password.
              </p>
            </div>

            {/* Error banner */}
            {errorMsg && (
              <div className="flex items-start gap-2.5 p-3.5 mb-6 text-sm text-red-200 bg-red-950/40 border border-red-500/20 rounded-xl text-left">
                <AlertCircle className="w-4 h-4 mt-0.5 shrink-0 text-red-400" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
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
                    message: 'Please provide a valid email address',
                  },
                })}
              />

              <Button type="submit" className="w-full mt-2" isLoading={loading}>
                <span>Send Reset Link</span>
              </Button>
            </form>
          </>
        ) : (
          /* Success Screen */
          <div className="py-4 animate-scaleUp">
            <div className="inline-flex bg-success/20 p-4 rounded-full text-success mb-6 border border-success/30 shadow-inner">
              <CheckCircle className="w-12 h-12" />
            </div>
            <h2 className="text-2xl font-black text-white tracking-tight mb-2">Check Your Email</h2>
            <p className="text-sm font-semibold text-gray-400 max-w-sm mx-auto mb-8">
              We have sent password reset instructions to your email address. Please follow the instructions to secure your account.
            </p>
            <Link
              to="/login"
              className="inline-flex items-center justify-center px-6 py-3 border border-white/10 hover:border-white/20 bg-white/5 hover:bg-white/10 rounded-xl text-sm font-bold text-white transition-all w-full"
            >
              Return to Sign In
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default ForgotPassword;
