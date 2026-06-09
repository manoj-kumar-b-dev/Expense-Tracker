/**
 * @file AuthContext.jsx
 * @description Authentication context state manager with useReducer.
 */

import React, { createContext, useContext, useReducer, useEffect } from 'react';
import api from '../api/axiosInstance';
import toast from 'react-hot-toast';

// 1. Initial State
const initialState = {
  user: JSON.parse(localStorage.getItem('user')) || null,
  token: localStorage.getItem('token') || null,
  isAuthenticated: !!localStorage.getItem('token'),
  loading: true,
  error: null,
};

// 2. Reducer
const authReducer = (state, action) => {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    case 'AUTH_START':
      return { ...state, loading: true, error: null };
    case 'AUTH_SUCCESS':
      return {
        ...state,
        user: action.payload.user,
        token: action.payload.token,
        isAuthenticated: true,
        loading: false,
        error: null,
      };
    case 'AUTH_FAIL':
      return {
        ...state,
        user: null,
        token: null,
        isAuthenticated: false,
        loading: false,
        error: action.payload,
      };
    case 'UPDATE_PROFILE':
      return {
        ...state,
        user: { ...state.user, ...action.payload },
      };
    case 'LOGOUT':
      return {
        ...state,
        user: null,
        token: null,
        isAuthenticated: false,
        loading: false,
        error: null,
      };
    default:
      return state;
  }
};

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // 3. Load user on application mounting
  useEffect(() => {
    const loadUser = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        dispatch({ type: 'SET_LOADING', payload: false });
        return;
      }

      try {
        const res = await api.get('/auth/me');
        dispatch({
          type: 'AUTH_SUCCESS',
          payload: { user: res.data.data, token },
        });
      } catch (err) {
        dispatch({ type: 'AUTH_FAIL', payload: err.response?.data?.message || 'Session invalid' });
      }
    };
    loadUser();
  }, []);

  // 4. Action Handlers
  const registerUser = async (formData) => {
    dispatch({ type: 'AUTH_START' });
    try {
      const res = await api.post('/auth/register', formData);
      const { token, data } = res.data;
      
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(data));
      
      dispatch({
        type: 'AUTH_SUCCESS',
        payload: { user: data, token },
      });
      toast.success(res.data.message || 'Account registered!');
      return true;
    } catch (err) {
      const message = err.response?.data?.message || 'Registration failed';
      dispatch({ type: 'AUTH_FAIL', payload: message });
      toast.error(message);
      return false;
    }
  };

  const loginUser = async (formData) => {
    dispatch({ type: 'AUTH_START' });
    try {
      const res = await api.post('/auth/login', formData);
      const { token, data } = res.data;
      
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(data));
      
      dispatch({
        type: 'AUTH_SUCCESS',
        payload: { user: data, token },
      });
      toast.success('Logged in successfully!');
      return true;
    } catch (err) {
      const message = err.response?.data?.message || 'Invalid credentials';
      dispatch({ type: 'AUTH_FAIL', payload: message });
      toast.error(message);
      return false;
    }
  };

  const logoutUser = async () => {
    try {
      await api.post('/auth/logout');
    } catch (err) {
      console.error('Logout API failed:', err);
    } finally {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      dispatch({ type: 'LOGOUT' });
      toast.success('Logged out successfully');
    }
  };

  const updateProfile = (profileData) => {
    const updatedUser = { ...state.user, ...profileData };
    localStorage.setItem('user', JSON.stringify(updatedUser));
    dispatch({ type: 'UPDATE_PROFILE', payload: profileData });
  };

  return (
    <AuthContext.Provider
      value={{
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
        loading: state.loading,
        error: state.error,
        registerUser,
        loginUser,
        logoutUser,
        updateProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
