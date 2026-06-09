/**
 * @file Login.jsx
 * @description Glassmorphism styled user login page utilizing react-hook-form and global AuthContext.
 */

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Mail, Lock, ArrowRight } from 'lucide-react';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';

export const Login = () => {
  const { loginUser } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

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
    const success = await loginUser(data);
    setLoading(false);
    if (success) {
      navigate('/dashboard');
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
