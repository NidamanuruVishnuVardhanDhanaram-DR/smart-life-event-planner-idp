import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  Eye, EyeOff, Mail, Lock, AlertCircle, CheckCircle, 
  ArrowRight, Loader2, Sparkles, Shield, Zap, User
} from 'lucide-react';

// ============================================
// LOGIN COMPONENT - FIXED & ENHANCED VERSION
// ============================================
const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false,
  });
  
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [focusedField, setFocusedField] = useState(null);
  const [touchedFields, setTouchedFields] = useState({});
  const [successAnimation, setSuccessAnimation] = useState(false);
  const [attempts, setAttempts] = useState(0);
  const [isLocked, setIsLocked] = useState(false);
  const [lockTimer, setLockTimer] = useState(0);
  
  // Refs for auto-focus
  const emailInputRef = useRef(null);
  const passwordInputRef = useRef(null);

  // 🔧 FIX #1: Safe auth context access with fallback
  let login;
  try {
    const auth = useAuth();
    login = auth?.login;
  } catch (err) {
    console.warn('AuthContext not available, using demo mode');
    login = async (email, password) => {
      // Demo login function for testing without backend
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      if (email === 'demo@eventplanner.com' && password === 'demo123') {
        return { success: true, user: { email, name: 'Demo User' } };
      }
      return { success: false, message: 'Invalid email or password' };
    };
  }

  const navigate = useNavigate();

  // Auto-focus email on mount
  useEffect(() => {
    if (emailInputRef.current) {
      setTimeout(() => emailInputRef.current.focus(), 100);
    }
  }, []);

  // 🔧 FIX #2: Account lockout mechanism after 5 failed attempts
  useEffect(() => {
    if (isLocked && lockTimer > 0) {
      const timer = setInterval(() => {
        setLockTimer(prev => {
          if (prev <= 1) {
            setIsLocked(false);
            setAttempts(0);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [isLocked, lockTimer]);

  // Load remembered email on mount
  useEffect(() => {
    try {
      const rememberedEmail = localStorage.getItem('rememberedEmail');
      if (rememberedEmail) {
        setFormData(prev => ({
          ...prev,
          email: rememberedEmail,
          rememberMe: true
        }));
      }
    } catch (err) {
      console.warn('Could not load remembered email:', err);
    }
  }, []);

  // Validation function
  const validateField = (name, value) => {
    switch (name) {
      case 'email':
        if (!value || !value.trim()) return 'Email is required';
        if (!/\S+@\S+\.\S+/.test(value)) return 'Invalid email format';
        if (value.length > 254) return 'Email is too long';
        return '';
      case 'password':
        if (!value) return 'Password is required';
        if (value.length < 6) return 'Password must be at least 6 characters';
        if (value.length > 128) return 'Password is too long';
        return '';
      default:
        return '';
    }
  };

  // Get field error
  const getFieldError = (fieldName) => {
    if (!touchedFields[fieldName]) return '';
    return validateField(fieldName, formData[fieldName]);
  };

  // Check if form is valid
  const isFormValid = () => {
    const emailError = validateField('email', formData.email);
    const passwordError = validateField('password', formData.password);
    return !emailError && !passwordError && !isLocked;
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));

    // Clear error when user starts typing
    if (error) setError('');
  };

  const handleBlur = (e) => {
    const { name } = e.target;
    setTouchedFields(prev => ({
      ...prev,
      [name]: true
    }));
    setFocusedField(null);
  };

  const handleFocus = (e) => {
    setFocusedField(e.target.name);
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  // 🔧 FIX #3: Enhanced submit handler with better error handling
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Check if account is locked
    if (isLocked) {
      setError(`Account temporarily locked. Try again in ${lockTimer} seconds.`);
      return;
    }
    
    // Mark all fields as touched
    setTouchedFields({
      email: true,
      password: true
    });

    // Validate all fields
    const emailError = validateField('email', formData.email);
    const passwordError = validateField('password', formData.password);

    if (emailError || passwordError) {
      setError('Please fix the errors above');
      return;
    }

    setError('');
    setLoading(true);

    try {
      const result = await login(formData.email.trim(), formData.password);

      if (result.success) {
        // Show success animation
        setSuccessAnimation(true);
        
        // Store user data and token
        try {
          if (result.token) {
            localStorage.setItem('authToken', result.token);
          }
          if (result.user) {
            localStorage.setItem('currentUser', JSON.stringify(result.user));
          }
          
          // Store remember me preference
          if (formData.rememberMe) {
            localStorage.setItem('rememberedEmail', formData.email);
          } else {
            localStorage.removeItem('rememberedEmail');
          }

          // Store login timestamp
          localStorage.setItem('loginTime', new Date().toISOString());
          
          // 🔧 FIX #4: Dispatch custom event for other components
          window.dispatchEvent(new CustomEvent('userLoggedIn', { 
            detail: { user: result.user, timestamp: new Date() } 
          }));
        } catch (storageErr) {
          console.warn('localStorage not available:', storageErr);
        }

        // Delay navigation for animation
        setTimeout(() => {
          navigate('/dashboard', { replace: true });
        }, 800);
      } else {
        // Increment failed attempts
        const newAttempts = attempts + 1;
        setAttempts(newAttempts);
        
        // Lock account after 5 failed attempts
        if (newAttempts >= 5) {
          setIsLocked(true);
          setLockTimer(60); // Lock for 60 seconds
          setError('Too many failed attempts. Account locked for 60 seconds.');
        } else {
          setError(result.message || 'Login failed. Please check your credentials.');
          // Show remaining attempts
          if (newAttempts >= 3) {
            setError(prev => `${prev} (${5 - newAttempts} attempts remaining)`);
          }
        }
        
        // Shake animation on error
        if (passwordInputRef.current) {
          passwordInputRef.current.classList.add('animate-shake');
          setTimeout(() => {
            passwordInputRef.current?.classList.remove('animate-shake');
          }, 500);
        }
      }
    } catch (err) {
      console.error('Login error:', err);
      setError('An unexpected error occurred. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  // 🔧 FIX #5: Demo credentials helper
  const fillDemoCredentials = () => {
    setFormData({
      email: 'demo@eventplanner.com',
      password: 'demo123',
      rememberMe: false
    });
    setTouchedFields({});
    setError('');
    
    // Focus on password field after filling
    setTimeout(() => {
      if (passwordInputRef.current) {
        passwordInputRef.current.focus();
      }
    }, 100);
  };

  // Format lock timer
  const formatLockTimer = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return mins > 0 ? `${mins}:${secs.toString().padStart(2, '0')}` : `${secs}s`;
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center px-4 py-12 sm:px-6 lg:px-8 overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 bg-cover bg-center bg-no-repeat transition-all duration-1000">
        {/* Background image with fallback gradient */}
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: "url('https://images.unsplash.com/photo-1557682250-33bd709cbe85?w=1920&q=80')",
          }}
        />
        {/* Multiple overlay layers for depth */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-900/85 via-purple-900/75 to-indigo-900/85"></div>
        <div className="absolute inset-0 backdrop-blur-sm"></div>
        
        {/* Animated gradient orbs - Matching AIPlanner style */}
        <div className="absolute top-0 left-0 w-96 h-96 bg-blue-500/30 rounded-full blur-3xl animate-blob"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-purple-500/30 rounded-full blur-3xl animate-blob animation-delay-2000"></div>
        <div className="absolute top-1/2 left-1/2 w-96 h-96 bg-pink-500/20 rounded-full blur-3xl animate-blob animation-delay-4000"></div>
      </div>

      {/* Success Overlay */}
      {successAnimation && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-white/10 backdrop-blur-md">
          <div className="text-center animate-success-bounce">
            <div className="w-24 h-24 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-2xl">
              <CheckCircle size={48} className="text-white" />
            </div>
            <p className="text-white text-xl font-bold">Login Successful!</p>
            <p className="text-white/70 text-sm mt-2">Redirecting to dashboard...</p>
            
            {/* Loading dots */}
            <div className="flex justify-center gap-1 mt-4">
              {[0, 1, 2].map(i => (
                <div 
                  key={i}
                  className="w-2 h-2 bg-white rounded-full animate-bounce"
                  style={{ animationDelay: `${i * 0.15}s` }}
                />
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="relative z-10 max-w-md w-full space-y-8">
        
        {/* Header Section */}
        <div className="text-center space-y-4">
          {/* Logo */}
          <div className="relative inline-block">
            <div className="w-20 h-20 bg-gradient-to-br from-blue-400 via-purple-500 to-pink-500 rounded-2xl flex items-center justify-center shadow-2xl mx-auto transform hover:rotate-6 transition-transform duration-300 hover:shadow-purple-500/30">
              <span className="text-4xl filter drop-shadow-lg">🎯</span>
            </div>
            <div className="absolute -top-1 -right-1 w-6 h-6 bg-green-400 rounded-full border-4 border-gray-900 flex items-center justify-center animate-pulse">
              <Sparkles size={12} className="text-white" />
            </div>
          </div>

          {/* Title */}
          <div className="space-y-2">
            <h2 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-200 via-purple-200 to-pink-200">
              Welcome Back
            </h2>
            <p className="text-white/70 text-lg">
              Sign in to continue to{' '}
              <span className="font-semibold text-white">Smart Event Planner</span>
            </p>
          </div>

          {/* Feature badges */}
          <div className="flex justify-center gap-3 pt-2 flex-wrap">
            <span className="px-3 py-1 bg-blue-500/20 border border-blue-400/30 rounded-full text-xs font-medium text-blue-200 flex items-center gap-1 backdrop-blur-sm">
              <Shield size={12} /> Secure
            </span>
            <span className="px-3 py-1 bg-purple-500/20 border border-purple-400/30 rounded-full text-xs font-medium text-purple-200 flex items-center gap-1 backdrop-blur-sm">
              <Zap size={12} /> Fast
            </span>
            <span className="px-3 py-1 bg-emerald-500/20 border border-emerald-400/30 rounded-full text-xs font-medium text-emerald-200 flex items-center gap-1 backdrop-blur-sm">
              <User size={12} /> Smart
            </span>
          </div>
        </div>

        {/* Login Card */}
        <div className="bg-white/10 backdrop-blur-xl rounded-3xl shadow-2xl p-8 border border-white/20 relative overflow-hidden">
          {/* Decorative corner gradient */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-blue-400/20 to-transparent rounded-bl-3xl"></div>
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-purple-400/10 to-transparent rounded-tr-2xl"></div>
          
          <form className="space-y-6 relative" onSubmit={handleSubmit}>
            
            {/* 🔧 FIX #6: Enhanced Error Alert with lockout warning */}
            {error && (
              <div className={`${
                isLocked 
                  ? 'bg-red-500/30 border-red-400/60' 
                  : 'bg-red-500/20 border-red-400/50'
              } text-red-200 px-4 py-3 rounded-xl backdrop-blur-sm animate-slideDown flex items-start gap-3`}>
                <AlertCircle size={20} className="mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                  <p className="font-semibold text-sm">
                    {isLocked ? '🔒 Account Locked' : 'Authentication Error'}
                  </p>
                  <p className="text-sm opacity-90 mt-1">{error}</p>
                  {isLocked && (
                    <div className="mt-2">
                      <div className="w-full bg-red-900/40 rounded-full h-2 overflow-hidden">
                        <div 
                          className="bg-red-400 h-full transition-all duration-1000 ease-linear"
                          style={{ width: `${(lockTimer / 60) * 100}%` }}
                        />
                      </div>
                      <p className="text-xs mt-1 text-red-300">
                        Reseting in {formatLockTimer(lockTimer)}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Email Field */}
            <div className="space-y-2">
              <label htmlFor="email" className={`block text-sm font-semibold transition-colors ${
                focusedField === 'email' ? 'text-blue-300' : 'text-white/90'
              }`}>
                Email Address
              </label>
              <div className={`relative group ${getFieldError('email') ? 'shake-animation' : ''}`}>
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Mail size={18} className={`transition-colors ${
                    focusedField === 'email' ? 'text-blue-400 scale-110' : 'text-white/50'
                  }`} />
                </div>
                <input
                  ref={emailInputRef}
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  disabled={isLocked}
                  className={`w-full pl-11 pr-4 py-3.5 border-2 rounded-xl focus:outline-none transition-all duration-300 placeholder-white/60 bg-white/5 backdrop-blur-md text-white font-medium disabled:opacity-50 disabled:cursor-not-allowed ${
                    getFieldError('email') 
                      ? 'border-red-400/60 bg-red-500/10 focus:border-red-400 focus:ring-4 focus:ring-red-400/20' 
                      : focusedField === 'email'
                        ? 'border-blue-400/60 bg-white/10 focus:border-blue-400 focus:ring-4 focus:ring-blue-400/20 shadow-lg shadow-blue-500/20'
                        : 'border-white/20 hover:border-white/40 focus:border-blue-400 focus:ring-4 focus:ring-blue-400/20'
                  }`}
                  placeholder="you@example.com"
                  value={formData.email}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  onFocus={handleFocus}
                  aria-describedby={getFieldError('email') ? 'email-error' : undefined}
                  aria-invalid={!!getFieldError('email')}
                />
                {/* Email validation icon */}
                {formData.email && !getFieldError('email') && touchedFields.email && (
                  <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
                    <CheckCircle size={18} className="text-green-400" />
                  </div>
                )}
              </div>
              {getFieldError('email') && (
                <p id="email-error" className="text-red-300 text-xs mt-1.5 ml-1 flex items-center gap-1 animate-fadeIn">
                  <AlertCircle size={12} />
                  {getFieldError('email')}
                </p>
              )}
            </div>

            {/* Password Field */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label htmlFor="password" className={`block text-sm font-semibold transition-colors ${
                  focusedField === 'password' ? 'text-blue-300' : 'text-white/90'
                }`}>
                  Password
                </label>
                <Link
                  to="/forgot-password"
                  className="text-xs font-medium text-blue-300 hover:text-white transition-colors hover:underline flex items-center gap-1"
                >
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Lock size={18} className={`transition-colors ${
                    focusedField === 'password' ? 'text-blue-400 scale-110' : 'text-white/50'
                  }`} />
                </div>
                <input
                  ref={passwordInputRef}
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  required
                  disabled={isLocked}
                  className={`w-full pl-11 pr-12 py-3.5 border-2 rounded-xl focus:outline-none transition-all duration-300 placeholder-white/60 bg-white/5 backdrop-blur-md text-white font-medium disabled:opacity-50 disabled:cursor-not-allowed ${
                    getFieldError('password') 
                      ? 'border-red-400/60 bg-red-500/10 focus:border-red-400 focus:ring-4 focus:ring-red-400/20' 
                      : focusedField === 'password'
                        ? 'border-blue-400/60 bg-white/10 focus:border-blue-400 focus:ring-4 focus:ring-blue-400/20 shadow-lg shadow-blue-500/20'
                        : 'border-white/20 hover:border-white/40 focus:border-blue-400 focus:ring-4 focus:ring-blue-400/20'
                  }`}
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  onFocus={handleFocus}
                  aria-describedby={getFieldError('password') ? 'password-error' : undefined}
                  aria-invalid={!!getFieldError('password')}
                />
                <button
                  type="button"
                  onClick={togglePasswordVisibility}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center text-white/50 hover:text-white transition-all hover:scale-110"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  tabIndex={-1}
                  disabled={isLocked}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {getFieldError('password') && (
                <p id="password-error" className="text-red-300 text-xs mt-1.5 ml-1 flex items-center gap-1 animate-fadeIn">
                  <AlertCircle size={12} />
                  {getFieldError('password')}
                </p>
              )}
              
              {/* Password strength indicator */}
              {formData.password && !getFieldError('password') && (
                <div className="flex gap-1 mt-2">
                  {[...Array(4)].map((_, i) => (
                    <div 
                      key={i}
                      className={`h-1 flex-1 rounded-full transition-all ${
                        formData.password.length >= (i + 1) * 3 
                          ? i < 1 ? 'bg-red-400' 
                            : i < 2 ? 'bg-yellow-400' 
                            : i < 3 ? 'bg-blue-400' 
                            : 'bg-green-400'
                          : 'bg-gray-600'
                      }`}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Remember Me Checkbox */}
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="rememberMe"
                  name="rememberMe"
                  type="checkbox"
                  checked={formData.rememberMe}
                  onChange={handleChange}
                  disabled={isLocked}
                  className="w-4 h-4 rounded border-white/30 bg-white/10 text-blue-500 focus:ring-blue-400/50 focus:ring-offset-0 cursor-pointer transition-all"
                />
                <label 
                  htmlFor="rememberMe" 
                  className="ml-2 block text-sm text-white/80 cursor-pointer select-none"
                >
                  Remember my email
                </label>
              </div>
              
              {/* Attempt counter */}
              {attempts > 0 && !isLocked && (
                <span className="text-xs text-yellow-300/80">
                  {attempts}/5 attempts
                </span>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading || !isFormValid()}
              className={`w-full flex justify-center items-center gap-2 py-3.5 px-6 text-white text-base font-bold rounded-xl shadow-lg transform transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-offset-2 focus:ring-offset-transparent ${
                loading || !isFormValid()
                  ? 'bg-gray-600 cursor-not-allowed opacity-60'
                  : 'bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 hover:scale-[1.02] hover:shadow-2xl hover:shadow-purple-500/25 active:scale-[0.98] focus:ring-purple-400/50'
              }`}
            >
              {loading ? (
                <>
                  <Loader2 size={20} className="animate-spin" />
                  <span>Signing In...</span>
                </>
              ) : (
                <>
                  <span>Sign In</span>
                  <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>

            {/* Divider */}
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-white/20"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-transparent text-white/60">or continue with</span>
              </div>
            </div>

            {/* Social Login Buttons */}
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                className="flex items-center justify-center gap-2 px-4 py-2.5 bg-white/10 border border-white/20 rounded-xl text-white font-medium hover:bg-white/20 transition-all duration-300 hover:scale-[1.02] group disabled:opacity-50"
                onClick={() => alert('Google login coming soon!')}
                disabled={isLocked}
              >
                <svg className="w-5 h-5 group-hover:scale-110 transition-transform" viewBox="0 0 24 24">
                  <path fill="#EA4335" d="M5.26620003,9.76452941 C6.19878754,6.93863203 8.85444915,4.90909091 12,4.90909091 C13.6909091,4.90909091 15.2181818,5.50909091 16.4181818,6.49090909 L19.9090909,3 C17.7818182,1.14545455 15.0545455,0 12,0 C7.27006974,0 3.1977497,2.69829785 1.23999023,6.65002441 L5.26620003,9.76452941 Z"/>
                  <path fill="#34A853" d="M16.0407269,18.0125889 C14.9509167,18.7163016 13.5660892,19.0909091 12,19.0909091 C8.86648613,19.0909091 6.21911939,17.076871 5.27698177,14.2678769 L1.23746264,17.3349879 C3.19279051,21.2936293 7.26500293,24 12,24 C14.9328362,24 17.7353462,22.9573905 19.834192,20.9995801 L16.0407269,18.0125889 Z"/>
                  <path fill="#4A90E2" d="M19.834192,20.9995801 C22.0291676,18.9520994 23.4545455,15.903663 23.4545455,12 C23.4545455,11.2909091 23.3454545,10.5272727 23.1818182,9.81818182 L12,9.81818182 L12,14.4545455 L18.4363636,14.4545455 C18.1187732,16.013626 17.2662994,17.2212117 16.0407269,18.0125889 L19.834192,20.9995801 Z"/>
                  <path fill="#FBBC05" d="M5.27698177,14.2678769 C5.03832634,13.556323 4.90909091,12.7937589 4.90909091,12 C4.90909091,11.2182781 5.03443647,10.4668121 5.26620003,9.76452941 L1.23999023,6.65002441 C0.43658717,8.26043162 0,10.0753848 0,12 C0,13.9195484 0.444780743,15.7301341 1.23746264,17.3349879 L5.27698177,14.2678769 Z"/>
                </svg>
                <span className="text-sm">Google</span>
              </button>
              
              <button
                type="button"
                className="flex items-center justify-center gap-2 px-4 py-2.5 bg-white/10 border border-white/20 rounded-xl text-white font-medium hover:bg-white/20 transition-all duration-300 hover:scale-[1.02] group disabled:opacity-50"
                onClick={() => alert('GitHub login coming soon!')}
                disabled={isLocked}
              >
                <svg className="w-5 h-5 group-hover:scale-110 transition-transform" fill="currentColor" viewBox="0 0 24 24">
                  <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd"/>
                </svg>
                <span className="text-sm">GitHub</span>
              </button>
            </div>

            {/* 🔧 FIX #7: Demo Credentials Button (for testing) */}
            <div className="pt-2 border-t border-white/10">
              <button
                type="button"
                onClick={fillDemoCredentials}
                className="w-full text-sm text-blue-300 hover:text-white py-2 px-4 rounded-lg bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/20 hover:border-blue-500/40 transition-all flex items-center justify-center gap-2"
              >
                <Sparkles size={14} />
                Fill Demo Credentials (for testing)
              </button>
              <p className="text-xs text-white/40 text-center mt-2">
                Demo: demo@eventplanner.com / demo123
              </p>
            </div>
          </form>
        </div>

        {/* Register Link */}
        <div className="text-center space-y-2">
          <p className="text-white/70">
            Don't have an account?{' '}
            <Link
              to="/register"
              className="font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-300 to-purple-300 hover:from-white hover:to-white transition-all duration-300 underline decoration-2 underline-offset-4"
            >
              Create free account →
            </Link>
          </p>
          
          <p className="text-white/50 text-xs">
            By signing in, you agree to our{' '}
            <Link to="/terms" className="underline hover:text-white">Terms</Link>
            {' '}and{' '}
            <Link to="/privacy" className="underline hover:text-white">Privacy Policy</Link>
          </p>
        </div>

        {/* Features Footer */}
        <div className="pt-4 border-t border-white/10">
          <div className="flex justify-center items-center gap-6 text-white/60 text-xs flex-wrap">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
              256-bit Encryption
            </span>
            <span className="flex items-center gap-1.5">
              <Shield size={12} />
              SOC 2 Compliant
            </span>
            <span className="flex items-center gap-1.5">
              <Zap size={12} />
              99.9% Uptime
            </span>
          </div>
        </div>
      </div>

      {/* Custom Styles */}
      <style>{`
        @keyframes blob {
          0% { transform: translate(0px, 0px) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
          100% { transform: translate(0px, 0px) scale(1); }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
        
        @keyframes slideDown {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-slideDown {
          animation: slideDown 0.3s ease-out;
        }
        
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        .animate-fadeIn {
          animation: fadeIn 0.2s ease-out;
        }
        
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); }
          20%, 40%, 60%, 80% { transform: translateX(5px); }
        }
        .animate-shake {
          animation: shake 0.5s ease-in-out;
        }
        
        @keyframes successBounce {
          0% { transform: scale(0); opacity: 0; }
          50% { transform: scale(1.1); }
          100% { transform: scale(1); opacity: 1; }
        }
        .animate-success-bounce {
          animation: successBounce 0.6s ease-out;
        }
        
        /* Custom checkbox styling */
        input[type="checkbox"] {
          appearance: none;
          -webkit-appearance: none;
          background-color: rgba(255,255,255,0.1);
          border: 2px solid rgba(255,255,255,0.3);
          border-radius: 4px;
          position: relative;
          cursor: pointer;
          transition: all 0.2s;
          width: 16px;
          height: 16px;
        }
        input[type="checkbox"]:hover:not(:disabled) {
          background-color: rgba(255,255,255,0.15);
          border-color: rgba(255,255,255,0.5);
        }
        input[type="checkbox"]:checked {
          background-color: #3b82f6;
          border-color: #3b82f6;
          background-image: url("data:image/svg+xml,%3csvg viewBox='0 0 16 16' fill='white' xmlns='http://www.w3.org/2000/svg'%3e%3cpath d='M12.207 4.793a1 1 0 010 1.414l-5 5a1 1 0 01-1.414 0l-2-2a1 1 0 011.414-1.414L6.5 9.086l4.293-4.293a1 1 0 011.414 0z'/%3e%3c/svg%3e");
          background-size: 12px;
          background-position: center;
          background-repeat: no-repeat;
        }
        input[type="checkbox"]:focus {
          outline: none;
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.3);
        }
        input[type="checkbox"]:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
        
        /* Input autofill styling */
        input:-webkit-autofill,
        input:-webkit-autofill:hover,
        input:-webkit-autofill:focus {
          -webkit-text-fill-color: white;
          -webkit-box-shadow: 0 0 0px 1000px rgba(59, 130, 246, 0.1) inset;
          transition: background-color 5000s ease-in-out 0s;
        }
        
        /* Loading dots bounce */
        @keyframes bounce-dot {
          0%, 80%, 100% { transform: translateY(0); }
          40% { transform: translateY(-8px); }
        }
        .animate-bounce {
          animation: bounce-dot 1.4s infinite ease-in-out both;
        }
      `}</style>
    </div>
  );
};

export default Login;