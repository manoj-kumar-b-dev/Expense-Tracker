/**
 * @file VerifyEmail.jsx
 * @description Auto-verification handler page with email resend fallback capabilities.
 */

import React, { useEffect, useState, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { CheckCircle, XCircle, AlertCircle, Loader, Mail, ArrowRight } from 'lucide-react';
import { useForm } from 'react-hook-form';
import api from '../../api/axiosInstance';
import Input from '../ui/Input';
import Button from '../ui/Button';
import toast from 'react-hot-toast';

export const VerifyEmail = () => {
  const { verificationToken } = useParams();
  const [status, setStatus] = useState('verifying'); // verifying | success | failed
  const [errorMsg, setErrorMsg] = useState('');
  
  // Resend Verification State
  const [resendLoading, setResendLoading] = useState(false);
  const [resendSuccess, setResendSuccess] = useState(false);

  const verifyTriggered = useRef(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: {
      email: '',
    },
  });

  useEffect(() => {
    // Prevent double invocation in React 18 strict mode
    if (verifyTriggered.current) return;
    verifyTriggered.current = true;

    const performVerification = async () => {
      try {
        const res = await api.get(`/auth/verify-email/${verificationToken}`);
        setStatus('success');
        toast.success(res.data.message || 'Email verified successfully!');
      } catch (err) {
        setStatus('failed');
        setErrorMsg(
          err.response?.data?.message || 'Verification failed. The link may be invalid or expired.'
        );
      }
    };

    performVerification();
  }, [verificationToken]);

  const onResendSubmit = async (data) => {
    setResendLoading(true);
    try {
      const res = await api.post('/auth/resend-verification', data);
      setResendSuccess(true);
      toast.success(res.data.message || 'Verification link sent!');
    } catch (err) {
      toast.error(
        err.response?.data?.message || 'Failed to resend verification email.'
      );
    } finally {
      setResendLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#0B0F19] flex items-center justify-center p-4 relative overflow-hidden">
      {/* Visual background glows */}
      <div className="absolute top-1/4 left-1/4 w-80 h-80 rounded-full bg-primary/20 blur-[120px] pointer-events-none animate-pulseSlow" />
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 rounded-full bg-success/10 blur-[120px] pointer-events-none animate-pulseSlow" style={{ animationDelay: '1.5s' }} />

      {/* Main glassmorphic wrapper */}
      <div className="w-full max-w-md glass-panel p-8 text-center border border-white/10 shadow-2xl relative z-10 animate-slideUp">
        
        {/* Status: VERIFYING */}
        {status === 'verifying' && (
          <div className="py-8 space-y-6">
            <div className="flex justify-center">
              <Loader className="w-12 h-12 text-primary animate-spin" />
            </div>
            <div className="space-y-2">
              <h2 className="text-2xl font-black text-white tracking-tight">Verifying Email Address</h2>
              <p className="text-sm font-semibold text-gray-400">
                Please wait a moment while we verify your account credentials.
              </p>
            </div>
          </div>
        )}

        {/* Status: SUCCESS */}
        {status === 'success' && (
          <div className="py-4 animate-scaleUp">
            <div className="inline-flex bg-success/20 p-4 rounded-full text-success mb-6 border border-success/30 shadow-inner">
              <CheckCircle className="w-12 h-12" />
            </div>
            <h2 className="text-2xl font-black text-white tracking-tight mb-2">Verification Complete!</h2>
            <p className="text-sm font-semibold text-gray-400 max-w-sm mx-auto mb-8">
              Your email address has been successfully verified. You can now access your dashboard and track your assets.
            </p>
            <Link
              to="/login"
              className="inline-flex items-center justify-center px-6 py-3 border border-white/10 hover:border-white/20 bg-white/5 hover:bg-white/10 rounded-xl text-sm font-bold text-white transition-all w-full"
            >
              Sign In to Your Account
            </Link>
          </div>
        )}

        {/* Status: FAILED */}
        {status === 'failed' && (
          <div className="py-4 animate-scaleUp">
            <div className="inline-flex bg-red-500/20 p-4 rounded-full text-red-500 mb-6 border border-red-500/30 shadow-inner">
              <XCircle className="w-12 h-12" />
            </div>
            <h2 className="text-2xl font-black text-white tracking-tight mb-2">Verification Failed</h2>
            <p className="text-sm font-semibold text-red-400/90 max-w-sm mx-auto mb-6">
              {errorMsg}
            </p>

            {!resendSuccess ? (
              <div className="text-left border-t border-white/5 pt-6 mt-6">
                <h3 className="text-sm font-bold text-white mb-2">Need a new verification link?</h3>
                <p className="text-xs text-gray-400 mb-4">
                  Enter your email address below to receive another verification email.
                </p>

                <form onSubmit={handleSubmit(onResendSubmit)} className="space-y-4">
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

                  <Button type="submit" className="w-full" isLoading={resendLoading}>
                    <span>Resend Verification Email</span>
                    <ArrowRight className="w-4 h-4 ml-1" />
                  </Button>
                </form>
              </div>
            ) : (
              <div className="p-4 bg-success/10 border border-success/20 rounded-xl text-left mt-6 animate-scaleUp">
                <h3 className="text-sm font-bold text-success mb-1 flex items-center gap-1.5">
                  <CheckCircle className="w-4 h-4" /> Link Dispatched
                </h3>
                <p className="text-xs text-gray-400">
                  We have sent a new verification email to that address. Please check your inbox (and spam folder).
                </p>
              </div>
            )}

            <div className="mt-8 text-xs font-semibold text-gray-400">
              <Link to="/login" className="text-primary hover:underline underline-offset-4">
                Back to Login
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default VerifyEmail;
