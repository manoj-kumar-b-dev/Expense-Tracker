/**
 * @file ResetPassword.jsx
 * @description Password reset page form.
 */

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Lock, AlertCircle, CheckCircle, ArrowLeft } from 'lucide-react';
import api from '../../api/axiosInstance';
import Input from '../ui/Input';
import Button from '../ui/Button';
import toast from 'react-hot-toast';

export const ResetPassword = () => {
  const { resetToken } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [success, setSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm({
    defaultValues: {
      password: '',
      confirmPassword: '',
    },
  });

  const password = watch('password');

  const onSubmit = async (data) => {
    setLoading(true);
    setErrorMsg('');
    try {
      const res = await api.put(`/auth/reset-password/${resetToken}`, {
        password: data.password,
      });
      setSuccess(true);
      toast.success(res.data.message || 'Password reset successful!');
      setTimeout(() => {
        navigate('/login');
      }, 3000);
    } catch (err) {
      setErrorMsg(
        err.response?.data?.message || 'Failed to reset password. The token may be expired.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#0B0F19] flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background visual glows */}
      <div className="absolute top-1/4 left-1/4 w-80 h-80 rounded-full bg-primary/20 blur-[120px] pointer-events-none animate-pulseSlow" />
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 rounded-full bg-success/10 blur-[120px] pointer-events-none animate-pulseSlow" style={{ animationDelay: '1.5s' }} />

      {/* Main glassmorphic card */}
      <div className="w-full max-w-md glass-panel p-8 text-center border border-white/10 shadow-2xl relative z-10 animate-slideUp">
        {!success ? (
          <>
            {/* Header info */}
            <div className="space-y-2 mb-8">
              <div className="inline-flex bg-primary p-3 rounded-2xl shadow-lg shadow-primary/30 items-center justify-center mx-auto mb-2">
                <Lock className="text-white w-6 h-6" />
              </div>
              <h2 className="text-2xl font-black text-white tracking-tight">Reset Password</h2>
              <p className="text-sm font-semibold text-gray-400">
                Please enter your new password below.
              </p>
            </div>

            {/* Error banner */}
            {errorMsg && (
              <div className="flex items-start gap-2.5 p-3.5 mb-6 text-sm text-red-200 bg-red-950/40 border border-red-500/20 rounded-xl text-left">
                <AlertCircle className="w-4 h-4 mt-0.5 shrink-0 text-red-400" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* Form fields */}
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <Input
                label="New Password"
                type="password"
                icon={Lock}
                placeholder="••••••••"
                error={errors.password?.message}
                {...register('password', {
                  required: 'Password is required',
                  minLength: {
                    value: 6,
                    message: 'Password must be at least 6 characters long',
                  },
                })}
              />

              <Input
                label="Confirm Password"
                type="password"
                icon={Lock}
                placeholder="••••••••"
                error={errors.confirmPassword?.message}
                {...register('confirmPassword', {
                  required: 'Password confirmation is required',
                  validate: (val) => val === password || 'Passwords do not match',
                })}
              />

              <Button type="submit" className="w-full mt-2" isLoading={loading}>
                <span>Reset Password</span>
              </Button>
            </form>
          </>
        ) : (
          /* Success Screen */
          <div className="py-4 animate-scaleUp">
            <div className="inline-flex bg-success/20 p-4 rounded-full text-success mb-6 border border-success/30 shadow-inner">
              <CheckCircle className="w-12 h-12" />
            </div>
            <h2 className="text-2xl font-black text-white tracking-tight mb-2">Password Reset!</h2>
            <p className="text-sm font-semibold text-gray-400 max-w-sm mx-auto mb-8">
              Your password has been changed successfully. You will be redirected to the sign in page shortly.
            </p>
            <div className="animate-pulse text-xs font-semibold text-gray-500">
              Redirecting in a few seconds...
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ResetPassword;
