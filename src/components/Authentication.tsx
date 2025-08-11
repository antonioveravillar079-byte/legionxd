import React, { useState } from 'react';
import { Eye, EyeOff, Shield, User, Mail, Lock, LogIn, UserPlus, XCircle, MessageSquare } from 'lucide-react'; // Added XCircle for error messages
import { useApp } from '../contexts/AppContext';
import { User as UserType } from '../types';
import { apiService } from '../services/api';

import { useNavigate } from 'react-router-dom';

export function Authentication() {
  const { state, dispatch } = useApp();
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    username: '',
    discordUsername: '',
    robloxUsername: ''
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [localError, setLocalError] = useState<string | null>(null); // New local error state for unhandled errors

  // Email validation regex
  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  // Form validation logic
  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.email) {
      newErrors.email = 'El email es requerido';
    } else if (!validateEmail(formData.email)) {
      newErrors.email = 'El email no tiene un formato válido';
    }

    if (!formData.password) {
      newErrors.password = 'La contraseña es requerida';
    } else if (formData.password.length < 6) {
      newErrors.password = 'La contraseña debe tener al menos 6 caracteres';
    }

    if (!isLogin) { // Validation specific to registration
      if (!formData.username) {
        newErrors.username = 'El nombre de usuario es requerido';
      } else if (formData.username.length < 3) {
        newErrors.username = 'El nombre de usuario debe tener al menos 3 caracteres';
      }

      if (!formData.discordUsername) {
        newErrors.discordUsername = 'El nombre de Discord es requerido';
      }

      if (!formData.robloxUsername) {
        newErrors.robloxUsername = 'El nombre de usuario de Roblox es requerido';
      }

      if (!formData.confirmPassword) {
        newErrors.confirmPassword = 'Confirmar contraseña es requerido';
      } else if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = 'Las contraseñas no coinciden';
      }
    }

    setErrors(newErrors);
    // Also clear general errors if validation passes
    if (Object.keys(newErrors).length === 0) {
      setLocalError(null);
      setErrors(prev => ({ ...prev, general: '' })); // Clear specific general message if form data becomes valid
    }
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission (Login or Register)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError(null); // Clear any previous local error

    if (!validateForm()) {
      // If client-side validation fails, display errors and stop
      setLocalError("Por favor, corrige los errores en el formulario.");
      return;
    }

    try {
      if (isLogin) {
        // Login logic
        const response = await apiService.login({
          email: formData.email,
          password: formData.password
        });
        
        if (response.token && response.user) {
          apiService.setToken(response.token);
          dispatch({ type: 'LOGIN', payload: response.user });
          navigate('/');
        } else {
          setLocalError('Error en el login.');
        }
      } else {
        // Register logic
        const response = await apiService.register({
          email: formData.email,
          password: formData.password,
          username: formData.username,
          discordUsername: formData.discordUsername,
          robloxUsername: formData.robloxUsername
        });

        if (response.token && response.user) {
          apiService.setToken(response.token);
          dispatch({ type: 'REGISTER', payload: response.user });
          navigate('/');
        } else {
          setLocalError('Error en el registro.');
        }
      }
    } catch (error) {
      console.error('Authentication error:', error);
      if (error instanceof Error) {
        setLocalError(error.message);
      } else {
        setLocalError('Ocurrió un error inesperado. Por favor, inténtalo de nuevo más tarde.');
      }
    }
  };

  // Handle input changes and clear errors dynamically
  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear specific field error when typing
    if (errors[field]) { 
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
    // Clear general/local error messages when any input changes
    if (errors.general || localError) { 
        setErrors(prev => ({ ...prev, general: '' })); // Clear old 'general' error if it was set
        setLocalError(null);
    }
  };

  const SubmitIcon = isLogin ? LogIn : UserPlus;

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-800 via-red-900 to-gray-950 text-gray-200 flex items-center justify-center py-16 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-md w-full animate-fade-in-up">
        <div className="text-center mb-10">
          <div className="mx-auto h-20 w-20 flex items-center justify-center rounded-full bg-red-600 mb-6 shadow-xl animate-bounce-slow">
            <Shield className="h-10 w-10 text-white drop-shadow-lg" />
          </div>
          <h2 className="text-5xl font-extrabold text-white mb-2">
            Nova Dark Legion
          </h2>
          <p className="mt-2 text-xl text-gray-400">
            {isLogin ? 'Inicia sesión en tu cuenta de miembro' : 'Únete a nuestra legión imparable'}
          </p>
        </div>

        <div className="bg-gray-900 py-10 px-8 shadow-2xl rounded-2xl border border-red-700 animate-scale-in">
          {/* General Error Message */}
          {(errors.general || localError) && (
            <div className="mb-6 p-4 bg-red-900/30 border border-red-700 rounded-lg text-red-300 text-base font-medium flex items-center justify-center animate-fade-in">
              <XCircle className="h-5 w-5 mr-3" />
              {localError || errors.general} {/* Prefer localError if present */}
            </div>
          )}

          <form className="space-y-6" onSubmit={handleSubmit}>
            {/* Email Input */}
            <div>
              <label htmlFor="email" className="block text-base font-medium text-gray-300 mb-2">
                Email
              </label>
              <div className="mt-1 relative rounded-xl shadow-sm group">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-500 group-focus-within:text-red-500 transition-colors" />
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  className={`pl-12 pr-4 block w-full py-3 border ${
                    errors.email ? 'border-red-500' : 'border-gray-700'
                  } rounded-xl shadow-sm bg-gray-800 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all duration-200`}
                  placeholder="tu@email.com"
                />
              </div>
              {/* Dedicated space for error message with fixed height */}
              <div className="h-6 flex items-center">
                {errors.email && (
                  <p className="mt-1 text-sm text-red-400 flex items-center animate-fade-in">
                    <XCircle className="h-4 w-4 mr-1" /> {errors.email}
                  </p>
                )}
              </div>
            </div>

            {/* Username Input (Register Only) */}
            {!isLogin && (
              <div>
                <label htmlFor="username" className="block text-base font-medium text-gray-300 mb-2">
                  Nombre de Usuario
                </label>
                <div className="mt-1 relative rounded-xl shadow-sm group">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-500 group-focus-within:text-red-500 transition-colors" />
                  <input
                    id="username"
                    name="username"
                    type="text"
                    value={formData.username}
                    onChange={(e) => handleInputChange('username', e.target.value)}
                    className={`pl-12 pr-4 block w-full py-3 border ${
                      errors.username ? 'border-red-500' : 'border-gray-700'
                    } rounded-xl shadow-sm bg-gray-800 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all duration-200`}
                    placeholder="TuNombreDeUsuario"
                  />
                </div>
                {/* Dedicated space for error message with fixed height */}
                <div className="h-6 flex items-center">
                  {errors.username && (
                    <p className="mt-1 text-sm text-red-400 flex items-center animate-fade-in">
                      <XCircle className="h-4 w-4 mr-1" /> {errors.username}
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Discord Username Input (Register Only) */}
            {!isLogin && (
              <div>
                <label htmlFor="discordUsername" className="block text-base font-medium text-gray-300 mb-2">
                  Nombre de Discord
                </label>
                <div className="mt-1 relative rounded-xl shadow-sm group">
                  <MessageSquare className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-500 group-focus-within:text-red-500 transition-colors" />
                  <input
                    id="discordUsername"
                    name="discordUsername"
                    type="text"
                    value={formData.discordUsername}
                    onChange={(e) => handleInputChange('discordUsername', e.target.value)}
                    className={`pl-12 pr-4 block w-full py-3 border ${
                      errors.discordUsername ? 'border-red-500' : 'border-gray-700'
                    } rounded-xl shadow-sm bg-gray-800 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all duration-200`}
                    placeholder="usuario#1234"
                  />
                </div>
                {/* Dedicated space for error message with fixed height */}
                <div className="h-6 flex items-center">
                  {errors.discordUsername && (
                    <p className="mt-1 text-sm text-red-400 flex items-center animate-fade-in">
                      <XCircle className="h-4 w-4 mr-1" /> {errors.discordUsername}
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Roblox Username Input (Register Only) */}
            {!isLogin && (
              <div>
                <label htmlFor="robloxUsername" className="block text-base font-medium text-gray-300 mb-2">
                  Usuario de Roblox
                </label>
                <div className="mt-1 relative rounded-xl shadow-sm group">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-500 group-focus-within:text-red-500 transition-colors" />
                  <input
                    id="robloxUsername"
                    name="robloxUsername"
                    type="text"
                    value={formData.robloxUsername}
                    onChange={(e) => handleInputChange('robloxUsername', e.target.value)}
                    className={`pl-12 pr-4 block w-full py-3 border ${
                      errors.robloxUsername ? 'border-red-500' : 'border-gray-700'
                    } rounded-xl shadow-sm bg-gray-800 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all duration-200`}
                    placeholder="TuUsuarioRoblox"
                  />
                </div>
                {/* Dedicated space for error message with fixed height */}
                <div className="h-6 flex items-center">
                  {errors.robloxUsername && (
                    <p className="mt-1 text-sm text-red-400 flex items-center animate-fade-in">
                      <XCircle className="h-4 w-4 mr-1" /> {errors.robloxUsername}
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Password Input */}
            <div>
              <label htmlFor="password" className="block text-base font-medium text-gray-300 mb-2">
                Contraseña
              </label>
              <div className="mt-1 relative rounded-xl shadow-sm group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-500 group-focus-within:text-red-500 transition-colors" />
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete={isLogin ? 'current-password' : 'new-password'}
                  value={formData.password}
                  onChange={(e) => handleInputChange('password', e.target.value)}
                  className={`pl-12 pr-12 block w-full py-3 border ${
                    errors.password ? 'border-red-500' : 'border-gray-700'
                  } rounded-xl shadow-sm bg-gray-800 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all duration-200`}
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 focus:outline-none transition-colors"
                  onClick={() => setShowPassword(!showPassword)}
                  title={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
              {/* Dedicated space for error message with fixed height */}
              <div className="h-6 flex items-center">
                {errors.password && (
                  <p className="mt-1 text-sm text-red-400 flex items-center animate-fade-in">
                    <XCircle className="h-4 w-4 mr-1" /> {errors.password}
                  </p>
                )}
              </div>
            </div>

            {/* Confirm Password Input (Register Only) */}
            {!isLogin && (
              <div>
                <label htmlFor="confirmPassword" className="block text-base font-medium text-gray-300 mb-2">
                  Confirmar Contraseña
                </label>
                <div className="mt-1 relative rounded-xl shadow-sm group">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-500 group-focus-within:text-red-500 transition-colors" />
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    autoComplete="new-password"
                    value={formData.confirmPassword}
                    onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                    className={`pl-12 pr-12 block w-full py-3 border ${
                      errors.confirmPassword ? 'border-red-500' : 'border-gray-700'
                    } rounded-xl shadow-sm bg-gray-800 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all duration-200`}
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 focus:outline-none transition-colors"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    title={showConfirmPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                  >
                    {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
                {/* Dedicated space for error message with fixed height */}
                <div className="h-6 flex items-center">
                  {errors.confirmPassword && (
                    <p className="mt-1 text-sm text-red-400 flex items-center animate-fade-in">
                      <XCircle className="h-4 w-4 mr-1" /> {errors.confirmPassword}
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Submit Button */}
            <div>
              <button
                type="submit"
                className={`
                  w-full flex items-center justify-center py-4 px-6 border border-transparent text-xl font-bold rounded-xl shadow-xl group
                  text-white bg-gradient-to-r from-red-600 to-red-800 hover:from-red-700 hover:to-red-900 
                  focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 
                  transition-all duration-300 transform hover:scale-105
                `}
              >
                <SubmitIcon className="h-6 w-6 mr-3 transition-transform group-hover:translate-x-1" />
                {isLogin ? 'Iniciar Sesión' : 'Registrarse'}
              </button>
            </div>

            {/* Toggle Login/Register */}
            <div className="text-center pt-4">
              <button
                type="button"
                onClick={() => {
                  setIsLogin(!isLogin);
                  setFormData({ email: '', password: '', confirmPassword: '', username: '', discordUsername: '', robloxUsername: '' });
                  setErrors({}); // Clear validation errors
                  setLocalError(null); // Clear general/local errors when toggling
                }}
                className="text-lg text-red-400 hover:text-red-300 transition-colors font-medium"
              >
                {isLogin 
                  ? '¿No tienes cuenta? Regístrate aquí' 
                  : '¿Ya tienes cuenta? Inicia sesión aquí'
                }
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
