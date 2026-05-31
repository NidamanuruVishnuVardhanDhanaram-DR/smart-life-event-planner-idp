import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  User, Mail, Lock, Eye, EyeOff, AlertCircle, CheckCircle, 
  ArrowRight, Loader2, Sparkles, Shield, Zap, CalendarDays,
  Users, TrendingUp, ChevronDown
} from 'lucide-react';

// ============================================
// REGISTER COMPONENT - FIXED & ENHANCED VERSION
// ============================================
const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'student',
    agreeToTerms: false,
    newsletter: true,
  });
  
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [focusedField, setFocusedField] = useState(null);
  const [touchedFields, setTouchedFields] = useState({});
  const [successAnimation, setSuccessAnimation] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [step, setStep] = useState(1); // Multi-step form
  
  // Refs for auto-focus
  const nameInputRef = useRef(null);
  const emailInputRef = useRef(null);
  const passwordInputRef = useRef(null);

  // 🔧 FIX #1: Safe auth context access with fallback (same as Login)
  let register;
  try {
    const auth = require('../context/AuthContext').useAuth();
    register = auth?.register;
  } catch (err) {
    console.warn('AuthContext not available, using demo mode');
    register = async (name, email, password, role) => {
      // Demo register function for testing without backend
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Check if email already exists (simulate)
      const existingUsers = JSON.parse(localStorage.getItem('demoUsers') || '[]');
      if (existingUsers.find(u => u.email === email)) {
        return { success: false, message: 'Email already registered' };
      }
      
      // Create new user
      const newUser = { _id: `user_${Date.now()}`, name, email, role, createdAt: new Date().toISOString() };
      existingUsers.push(newUser);
      localStorage.setItem('demoUsers', JSON.stringify(existingUsers));
      localStorage.setItem('currentUser', JSON.stringify(newUser));
      
      return { success: true, user: newUser };
    };
  }

  const navigate = useNavigate();

  // Auto-focus on mount
  useEffect(() => {
    if (nameInputRef.current) {
      setTimeout(() => nameInputRef.current.focus(), 100);
    }
  }, [step]);

  // 🔧 FIX #2: Password strength calculator
  useEffect(() => {
    if (!formData.password) {
      setPasswordStrength(0);
      return;
    }

    let strength = 0;
    if (formData.password.length >= 6) strength++;
    if (formData.password.length >= 10) strength++;
    if (/[A-Z]/.test(formData.password)) strength++;
    if (/[0-9]/.test(formData.password)) strength++;
    if (/[^A-Za-z0-9]/.test(formData.password)) strength++;

    setPasswordStrength(Math.min(strength, 5));
  }, [formData.password]);

  // Validation function
  const validateField = (name, value) => {
    switch (name) {
      case 'name':
        if (!value || !value.trim()) return 'Full name is required';
        if (value.trim().length < 2) return 'Name must be at least 2 characters';
        if (value.length > 100) return 'Name is too long';
        if (!/^[a-zA-Z\s'-]+$/.test(value)) return 'Name can only contain letters, spaces, hyphens and apostrophes';
        return '';
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
      case 'confirmPassword':
        if (!value) return 'Please confirm your password';
        if (value !== formData.password) return 'Passwords do not match';
        return '';
      case 'role':
        if (!value) return 'Please select a role';
        return '';
      case 'agreeToTerms':
        if (!value) return 'You must agree to the terms and conditions';
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

  // Check if current step is valid
  const isStepValid = () => {
    if (step === 1) {
      return !validateField('name', formData.name) && 
             !validateField('email', formData.email) &&
             !validateField('role', formData.role);
    }
    if (step === 2) {
      return !validateField('password', formData.password) && 
             !validateField('confirmPassword', formData.confirmPassword);
    }
    return false;
  };

  // Check if entire form is valid
  const isFormValid = () => {
    return isStepValid() && formData.agreeToTerms;
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

  const nextStep = () => {
    // Validate current step fields
    if (step === 1) {
      setTouchedFields({ name: true, email: true, role: true });
      if (!validateField('name', formData.name) && 
          !validateField('email', formData.email) &&
          !validateField('role', formData.role)) {
        setStep(2);
      } else {
        setError('Please fill in all required fields correctly');
      }
    }
  };

  const prevStep = () => {
    setStep(1);
    setError('');
  };

  // 🔧 FIX #3: Enhanced submit handler with better error handling
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Mark all fields as touched
    setTouchedFields({
      name: true,
      email: true,
      password: true,
      confirmPassword: true,
      role: true,
      agreeToTerms: true
    });

    // Validate all fields
    const errors = [];
    ['name', 'email', 'password', 'confirmPassword', 'role', 'agreeToTerms'].forEach(field => {
      const err = validateField(field, formData[field]);
      if (err) errors.push(err);
    });

    if (errors.length > 0) {
      setError(errors[0]); // Show first error
      if (step === 2) setStep(1); // Go back to step 1 if needed
      return;
    }

    setError('');
    setLoading(true);

    try {
      const result = await register(
        formData.name.trim(),
        formData.email.trim().toLowerCase(),
        formData.password,
        formData.role
      );

      if (result.success) {
        // Show success animation
        setSuccessAnimation(true);
        
        // Store user data
        try {
          if (result.user) {
            localStorage.setItem('currentUser', JSON.stringify(result.user));
            localStorage.setItem('registrationTime', new Date().toISOString());
          }
          
          // 🔧 FIX #4: Dispatch custom event for other components
          window.dispatchEvent(new CustomEvent('userRegistered', { 
            detail: { user: result.user, timestamp: new Date() } 
          }));
        } catch (storageErr) {
          console.warn('localStorage not available:', storageErr);
        }

        // Delay navigation for animation
        setTimeout(() => {
          navigate('/dashboard', { replace: true });
        }, 1500);
      } else {
        setError(result.message || 'Registration failed. Please try again.');
      }
    } catch (err) {
      console.error('Registration error:', err);
      setError('An unexpected error occurred. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  // 🔧 FIX #5: Demo credentials helper
  const fillDemoData = () => {
    setFormData({
      name: 'Demo User',
      email: 'newuser@eventplanner.com',
      password: 'demo12345',
      confirmPassword: 'demo12345',
      role: 'organizer',
      agreeToTerms: true,
      newsletter: false,
    });
    setTouchedFields({});
    setError('');
    setStep(2);
  };

  // Get password strength label and color
  const getPasswordStrengthInfo = () => {
    if (passwordStrength === 0) return { label: '', color: '' };
    if (passwordStrength <= 2) return { label: 'Weak', color: 'bg-red-400' };
    if (passwordStrength === 3) return { label: 'Fair', color: 'bg-yellow-400' };
    if (passwordStrength === 4) return { label: 'Good', color: 'bg-blue-400' };
    return { label: 'Strong', color: 'bg-green-400' };
  };

  const strengthInfo = getPasswordStrengthInfo();

  return (
    <div className="relative min-h-screen flex items-center justify-center px-4 py-12 sm:px-6 lg:px-8 overflow-hidden">
      {/* Animated Background - Matching Login style */}
      <div className="absolute inset-0 bg-cover bg-center bg-no-repeat transition-all duration-1000">
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: "url('https://images.unsplash.com/photo-1557682250-33bd709cbe85?w=1920&q=80')",
          }}
        />
        {/* Multiple overlay layers */}
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-900/85 via-teal-900/75 to-cyan-900/85"></div>
        <div className="absolute inset-0 backdrop-blur-sm"></div>
        
        {/* Animated gradient orbs - Same as Login */}
        <div className="absolute top-0 left-0 w-96 h-96 bg-emerald-500/30 rounded-full blur-3xl animate-blob"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-teal-500/30 rounded-full blur-3xl animate-blob animation-delay-2000"></div>
        <div className="absolute top-1/2 left-1/2 w-96 h-96 bg-cyan-500/20 rounded-full blur-3xl animate-blob animation-delay-4000"></div>
      </div>

      {/* Success Overlay */}
      {successAnimation && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-white/10 backdrop-blur-md">
          <div className="text-center animate-success-bounce">
            <div className="w-24 h-24 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-2xl">
              <CheckCircle size={48} className="text-white" />
            </div>
            <p className="text-white text-xl font-bold">Account Created! 🎉</p>
            <p className="text-white/70 text-sm mt-2">Welcome to Smart Event Planner</p>
            <p className="text-white/50 text-xs mt-1">Redirecting to dashboard...</p>
            
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
      <div className="relative z-10 max-w-lg w-full space-y-8">
        
        {/* Header Section */}
        <div className="text-center space-y-4">
          {/* Logo */}
          <div className="relative inline-block">
            <div className="w-20 h-20 bg-gradient-to-br from-green-400 via-emerald-500 to-teal-500 rounded-2xl flex items-center justify-center shadow-2xl mx-auto transform hover:rotate-6 transition-transform duration-300 hover:shadow-emerald-500/30">
              <span className="text-4xl filter drop-shadow-lg">🌟</span>
            </div>
            <div className="absolute -top-1 -right-1 w-6 h-6 bg-yellow-400 rounded-full border-4 border-gray-900 flex items-center justify-center animate-pulse">
              <Sparkles size={12} className="text-white" />
            </div>
          </div>

          {/* Title */}
          <div className="space-y-2">
            <h2 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-green-200 via-emerald-200 to-teal-200">
              Create Account
            </h2>
            <p className="text-white/70 text-lg">
              Join{' '}
              <span className="font-semibold text-white">Smart Event Planner</span>{' '}
              and start planning amazing events
            </p>
          </div>

          {/* Feature badges */}
          <div className="flex justify-center gap-3 pt-2 flex-wrap">
            <span className="px-3 py-1 bg-emerald-500/20 border border-emerald-400/30 rounded-full text-xs font-medium text-emerald-200 flex items-center gap-1 backdrop-blur-sm">
              <Zap size={12} /> Free Forever
            </span>
            <span className="px-3 py-1 bg-teal-500/20 border border-teal-400/30 rounded-full text-xs font-medium text-teal-200 flex items-center gap-1 backdrop-blur-sm">
              <Shield size={12} /> Secure
            </span>
            <span className="px-3 py-1 bg-cyan-500/20 border border-cyan-400/30 rounded-full text-xs font-medium text-cyan-200 flex items-center gap-1 backdrop-blur-sm">
              <TrendingUp size={12} /> Smart Tools
            </span>
          </div>
        </div>

        {/* Registration Card */}
        <div className="bg-white/10 backdrop-blur-xl rounded-3xl shadow-2xl p-8 border border-white/20 relative overflow-hidden">
          {/* Decorative corner gradient */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-emerald-400/20 to-transparent rounded-bl-3xl"></div>
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-teal-400/10 to-transparent rounded-tr-2xl"></div>

          {/* Progress Steps Indicator */}
          <div className="flex items-center justify-between mb-8 relative">
            <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-white/20 -translate-y-1/2"></div>
            <div 
              className="absolute top-1/2 left-0 h-0.5 bg-gradient-to-r from-emerald-400 to-teal-400 -translate-y-1/2 transition-all duration-300"
              style={{ width: step === 1 ? '0%' : '50%' }}
            ></div>
            
            {[1, 2].map((s) => (
              <div key={s} className={`relative z-10 flex flex-col items-center`}>
                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-all duration-300 ${
                  step >= s 
                    ? 'bg-gradient-to-br from-emerald-400 to-teal-500 text-white shadow-lg' 
                    : 'bg-white/10 text-white/50'
                } ${step === s ? 'scale-110 ring-4 ring-emerald-400/30' : ''}`}>
                  {step > s ? <CheckCircle size={18} /> : s}
                </div>
                <span className={`text-xs mt-2 font-medium ${
                  step >= s ? 'text-emerald-300' : 'text-white/50'
                }`}>
                  {s === 1 ? 'Personal Info' : 'Security'}
                </span>
              </div>
            ))}
          </div>
          
          <form className="space-y-6 relative" onSubmit={handleSubmit}>
            
            {/* Error Alert */}
            {error && (
              <div className="bg-red-500/20 border border-red-400/50 text-red-200 px-4 py-3 rounded-xl backdrop-blur-sm animate-slideDown flex items-start gap-3">
                <AlertCircle size={20} className="mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-semibold text-sm">Registration Error</p>
                  <p className="text-sm opacity-90 mt-1">{error}</p>
                </div>
              </div>
            )}

            {/* Step 1: Personal Information */}
            {step === 1 && (
              <div className="space-y-5 animate-fadeIn">
                {/* Name Field */}
                <div className="space-y-2">
                  <label htmlFor="name" className={`block text-sm font-semibold transition-colors ${
                    focusedField === 'name' ? 'text-emerald-300' : 'text-white/90'
                  }`}>
                    Full Name *
                  </label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <User size={18} className={`transition-colors ${
                        focusedField === 'name' ? 'text-emerald-400 scale-110' : 'text-white/50'
                      }`} />
                    </div>
                    <input
                      ref={nameInputRef}
                      id="name"
                      name="name"
                      type="text"
                      autoComplete="name"
                      required
                      className={`w-full pl-11 pr-4 py-3.5 border-2 rounded-xl focus:outline-none transition-all duration-300 placeholder-white/60 bg-white/5 backdrop-blur-md text-white font-medium ${
                        getFieldError('name') 
                          ? 'border-red-400/60 bg-red-500/10 focus:border-red-400 focus:ring-4 focus:ring-red-400/20' 
                          : focusedField === 'name'
                            ? 'border-emerald-400/60 bg-white/10 focus:border-emerald-400 focus:ring-4 focus:ring-emerald-400/20 shadow-lg shadow-emerald-500/20'
                            : 'border-white/20 hover:border-white/40 focus:border-emerald-400 focus:ring-4 focus:ring-emerald-400/20'
                      }`}
                      placeholder="John Doe"
                      value={formData.name}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      onFocus={handleFocus}
                    />
                    {formData.name && !getFieldError('name') && touchedFields.name && (
                      <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
                        <CheckCircle size={18} className="text-green-400" />
                      </div>
                    )}
                  </div>
                  {getFieldError('name') && (
                    <p className="text-red-300 text-xs mt-1.5 ml-1 flex items-center gap-1 animate-fadeIn">
                      <AlertCircle size={12} />
                      {getFieldError('name')}
                    </p>
                  )}
                </div>

                {/* Email Field */}
                <div className="space-y-2">
                  <label htmlFor="email" className={`block text-sm font-semibold transition-colors ${
                    focusedField === 'email' ? 'text-emerald-300' : 'text-white/90'
                  }`}>
                    Email Address *
                  </label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <Mail size={18} className={`transition-colors ${
                        focusedField === 'email' ? 'text-emerald-400 scale-110' : 'text-white/50'
                      }`} />
                    </div>
                    <input
                      ref={emailInputRef}
                      id="email"
                      name="email"
                      type="email"
                      autoComplete="email"
                      required
                      className={`w-full pl-11 pr-4 py-3.5 border-2 rounded-xl focus:outline-none transition-all duration-300 placeholder-white/60 bg-white/5 backdrop-blur-md text-white font-medium ${
                        getFieldError('email') 
                          ? 'border-red-400/60 bg-red-500/10 focus:border-red-400 focus:ring-4 focus:ring-red-400/20' 
                          : focusedField === 'email'
                            ? 'border-emerald-400/60 bg-white/10 focus:border-emerald-400 focus:ring-4 focus:ring-emerald-400/20 shadow-lg shadow-emerald-500/20'
                            : 'border-white/20 hover:border-white/40 focus:border-emerald-400 focus:ring-4 focus:ring-emerald-400/20'
                      }`}
                      placeholder="you@example.com"
                      value={formData.email}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      onFocus={handleFocus}
                    />
                    {formData.email && !getFieldError('email') && touchedFields.email && (
                      <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
                        <CheckCircle size={18} className="text-green-400" />
                      </div>
                    )}
                  </div>
                  {getFieldError('email') && (
                    <p className="text-red-300 text-xs mt-1.5 ml-1 flex items-center gap-1 animate-fadeIn">
                      <AlertCircle size={12} />
                      {getFieldError('email')}
                    </p>
                  )}
                </div>

                {/* Role Selection */}
                <div className="space-y-2">
                  <label htmlFor="role" className={`block text-sm font-semibold transition-colors ${
                    focusedField === 'role' ? 'text-emerald-300' : 'text-white/90'
                  }`}>
                    I am a... *
                  </label>
                  <div className="relative">
                    <select
                      id="role"
                      name="role"
                      value={formData.role}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      onFocus={handleFocus}
                      className="w-full pl-4 pr-10 py-3.5 border-2 rounded-xl focus:outline-none transition-all duration-300 bg-white/5 backdrop-blur-md text-white font-medium appearance-none cursor-pointer border-white/20 hover:border-white/40 focus:border-emerald-400 focus:ring-4 focus:ring-emerald-400/20"
                    >
                      <option value="student" className="bg-gray-800">🎓 Student</option>
                      <option value="organizer" className="bg-gray-800">🎯 Event Organizer</option>
                      <option value="professional" className="bg-gray-800">💼 Professional</option>
                      <option value="admin" className="bg-gray-800">⚡ Administrator</option>
                    </select>
                    <ChevronDown size={18} className="absolute right-4 top-1/2 transform -translate-y-1/2 text-white/50 pointer-events-none" />
                  </div>
                  
                  {/* Role description cards */}
                  <div className="grid grid-cols-3 gap-2 mt-3">
                    {[
                      { role: 'student', icon: '🎓', desc: 'For students', color: 'from-blue-500/20 to-blue-600/10' },
                      { role: 'organizer', icon: '🎯', desc: 'Plan events', color: 'from-purple-500/20 to-purple-600/10' },
                      { role: 'professional', icon: '💼', desc: 'Pro tools', color: 'from-emerald-500/20 to-emerald-600/10' },
                    ].map((item) => (
                      <div 
                        key={item.role}
                        onClick={() => setFormData(prev => ({ ...prev, role: item.role }))}
                        className={`p-2 rounded-lg text-center cursor-pointer transition-all border ${
                          formData.role === item.role 
                            ? `bg-gradient-to-br ${item.color} border-emerald-400/50` 
                            : 'bg-white/5 border-transparent hover:bg-white/10'
                        }`}
                      >
                        <span className="text-lg">{item.icon}</span>
                        <p className="text-[10px] text-white/70 mt-1">{item.desc}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Next Step Button */}
                <button
                  type="button"
                  onClick={nextStep}
                  disabled={!isStepValid()}
                  className="w-full flex justify-center items-center gap-2 py-3.5 px-6 text-white text-base font-bold rounded-xl shadow-lg transform transition-all duration-300 bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 hover:scale-[1.02] hover:shadow-2xl hover:shadow-emerald-500/25 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                >
                  <span>Continue to Security</span>
                  <ArrowRight size={18} />
            </button>
              </div>
            )}

            {/* Step 2: Security (Password) */}
            {step === 2 && (
              <div className="space-y-5 animate-fadeIn">
                {/* Password Field */}
                <div className="space-y-2">
                  <label htmlFor="password" className={`block text-sm font-semibold transition-colors ${
                    focusedField === 'password' ? 'text-emerald-300' : 'text-white/90'
                  }`}>
                    Create Password *
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <Lock size={18} className={`transition-colors ${
                        focusedField === 'password' ? 'text-emerald-400 scale-110' : 'text-white/50'
                      }`} />
                    </div>
                    <input
                      ref={passwordInputRef}
                      id="password"
                      name="password"
                      type={showPassword ? 'text' : 'password'}
                      autoComplete="new-password"
                      required
                      className={`w-full pl-11 pr-12 py-3.5 border-2 rounded-xl focus:outline-none transition-all duration-300 placeholder-white/60 bg-white/5 backdrop-blur-md text-white font-medium ${
                        getFieldError('password') 
                          ? 'border-red-400/60 bg-red-500/10 focus:border-red-400 focus:ring-4 focus:ring-red-400/20' 
                          : focusedField === 'password'
                            ? 'border-emerald-400/60 bg-white/10 focus:border-emerald-400 focus:ring-4 focus:ring-emerald-400/20 shadow-lg shadow-emerald-500/20'
                            : 'border-white/20 hover:border-white/40 focus:border-emerald-400 focus:ring-4 focus:ring-emerald-400/20'
                      }`}
                      placeholder="••••••••"
                      value={formData.password}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      onFocus={handleFocus}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-4 flex items-center text-white/50 hover:text-white transition-all hover:scale-110"
                      tabIndex={-1}
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                  
                  {/* Password Strength Indicator */}
                  {formData.password && (
                    <div className="space-y-2">
                      <div className="flex gap-1">
                        {[...Array(5)].map((_, i) => (
                          <div 
                            key={i}
                            className={`h-1.5 flex-1 rounded-full transition-all ${
                              i < passwordStrength ? strengthInfo.color : 'bg-gray-700'
                            }`}
                          />
                        ))}
                      </div>
                      {strengthInfo.label && (
                        <p className={`text-xs font-medium ${
                          passwordStrength <= 2 ? 'text-red-400' :
                          passwordStrength === 3 ? 'text-yellow-400' :
                          passwordStrength === 4 ? 'text-blue-400' :
                          'text-green-400'
                        }`}>
                          Password strength: {strengthInfo.label}
                        </p>
                      )}
                      
                      {/* Password requirements checklist */}
                      <div className="grid grid-cols-2 gap-1 text-xs mt-2">
                        {[
                          { test: formData.password.length >= 6, label: 'At least 6 characters' },
                          { test: /[A-Z]/.test(formData.password), label: 'One uppercase letter' },
                          { test: /[0-9]/.test(formData.password), label: 'One number' },
                          { test: /[^A-Za-z0-9]/.test(formData.password), label: 'One special character' },
                        ].map((req, i) => (
                          <div key={i} className={`flex items-center gap-1 ${req.test ? 'text-green-400' : 'text-gray-500'}`}>
                            <span>{req.test ? '✓' : '○'}</span>
                            <span>{req.label}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {getFieldError('password') && (
                    <p className="text-red-300 text-xs mt-1.5 ml-1 flex items-center gap-1 animate-fadeIn">
                      <AlertCircle size={12} />
                      {getFieldError('password')}
                    </p>
                  )}
                </div>

                {/* Confirm Password Field */}
                <div className="space-y-2">
                  <label htmlFor="confirmPassword" className={`block text-sm font-semibold transition-colors ${
                    focusedField === 'confirmPassword' ? 'text-emerald-300' : 'text-white/90'
                  }`}>
                    Confirm Password *
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <Lock size={18} className={`transition-colors ${
                        focusedField === 'confirmPassword' ? 'text-emerald-400 scale-110' : 'text-white/50'
                      }`} />
                    </div>
                    <input
                      id="confirmPassword"
                      name="confirmPassword"
                      type={showConfirmPassword ? 'text' : 'password'}
                      autoComplete="new-password"
                      required
                      className={`w-full pl-11 pr-12 py-3.5 border-2 rounded-xl focus:outline-none transition-all duration-300 placeholder-white/60 bg-white/5 backdrop-blur-md text-white font-medium ${
                        getFieldError('confirmPassword') 
                          ? 'border-red-400/60 bg-red-500/10 focus:border-red-400 focus:ring-4 focus:ring-red-400/20' 
                          : focusedField === 'confirmPassword'
                            ? 'border-emerald-400/60 bg-white/10 focus:border-emerald-400 focus:ring-4 focus:ring-emerald-400/20 shadow-lg shadow-emerald-500/20'
                            : 'border-white/20 hover:border-white/40 focus:border-emerald-400 focus:ring-4 focus:ring-emerald-400/20'
                      }`}
                      placeholder="••••••••"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      onFocus={handleFocus}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute inset-y-0 right-0 pr-4 flex items-center text-white/50 hover:text-white transition-all hover:scale-110"
                      tabIndex={-1}
                    >
                      {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                  
                  {/* Match indicator */}
                  {formData.confirmPassword && (
                    <div className={`flex items-center gap-1 text-xs mt-1 ${
                      formData.password === formData.confirmPassword 
                        ? 'text-green-400' 
                        : 'text-red-400'
                    }`}>
                      {formData.password === formData.confirmPassword ? (
                        <>
                          <CheckCircle size={12} />
                          <span>Passwords match</span>
                        </>
                      ) : (
                        <>
                          <AlertCircle size={12} />
                          <span>Passwords do not match</span>
                        </>
                      )}
                    </div>
                  )}
                  
                  {getFieldError('confirmPassword') && (
                    <p className="text-red-300 text-xs mt-1.5 ml-1 flex items-center gap-1 animate-fadeIn">
                      <AlertCircle size={12} />
                      {getFieldError('confirmPassword')}
                    </p>
                  )}
                </div>

                {/* Terms and Conditions */}
                <div className="space-y-3 pt-2">
                  <div className="flex items-start gap-3">
                    <input
                      id="agreeToTerms"
                      name="agreeToTerms"
                      type="checkbox"
                      checked={formData.agreeToTerms}
                      onChange={handleChange}
                      className="w-4 h-4 mt-0.5 rounded border-white/30 bg-white/10 text-emerald-500 focus:ring-emerald-400/50 cursor-pointer transition-all"
                    />
                    <label 
                      htmlFor="agreeToTerms" 
                      className="text-sm text-white/80 cursor-pointer select-none leading-relaxed"
                    >
                      I agree to the{' '}
                      <Link to="/terms" className="text-emerald-400 hover:text-white underline">Terms of Service</Link>
                      {' '}and{' '}
                      <Link to="/privacy" className="text-emerald-400 hover:text-white underline">Privacy Policy</Link>
                    </label>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <input
                      id="newsletter"
                      name="newsletter"
                      type="checkbox"
                      checked={formData.newsletter}
                      onChange={handleChange}
                      className="w-4 h-4 mt-0.5 rounded border-white/30 bg-white/10 text-emerald-500 focus:ring-emerald-400/50 cursor-pointer transition-all"
                    />
                    <label 
                      htmlFor="newsletter" 
                      className="text-sm text-white/80 cursor-pointer select-none"
                    >
                      Send me event planning tips and updates (optional)
                    </label>
                  </div>
                </div>

                {/* Navigation Buttons */}
                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={prevStep}
                    className="flex-1 py-3.5 px-6 bg-white/10 border border-white/20 text-white font-semibold rounded-xl hover:bg-white/20 transition-all"
                  >
                    ← Back
                  </button>
                  <button
                    type="submit"
                    disabled={loading || !isFormValid()}
                    className={`flex-1 flex justify-center items-center gap-2 py-3.5 px-6 text-white text-base font-bold rounded-xl shadow-lg transform transition-all duration-300 ${
                      loading || !isFormValid()
                        ? 'bg-gray-600 cursor-not-allowed opacity-60'
                        : 'bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 hover:scale-[1.02] hover:shadow-2xl hover:shadow-emerald-500/25 active:scale-[0.98]'
                    }`}
                  >
                    {loading ? (
                      <>
                        <Loader2 size={20} className="animate-spin" />
                        <span>Creating Account...</span>
                      </>
                    ) : (
                      <>
                        <span>🚀 Create Account</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}

            {/* Divider */}
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-white/20"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-transparent text-white/60">or sign up with</span>
              </div>
            </div>

            {/* Social Registration Buttons */}
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                className="flex items-center justify-center gap-2 px-4 py-2.5 bg-white/10 border border-white/20 rounded-xl text-white font-medium hover:bg-white/20 transition-all duration-300 hover:scale-[1.02] group"
                onClick={() => alert('Google signup coming soon!')}
              >
                <svg className="w-5 h-5 group-hover:scale-110 transition-transform" viewBox="0 0 24 24">
                  <path fill="#EA4335" d="M5.26620003,9.76452941 C6.19878754,6.93863203 8.85444915,4.90909091 12,4.90909091 C13.6909091,4.90909091 15.2181818,5.50909091 16.4181818,6.49090909 L19.9090909,3 C17.7818182,1.14545455 15.0545455,0 12,0 C7.27006974,0 3.1977497,2.69829785 1.23999023,6.65002441 L5.26620003,9.76452941 Z"/>
                  <path fill="#34A853" d="M16.0407269,18.0125889 C14.9509167,18.7163016 13.5660892,19.0909091 12,19.0909091 C8.86648613,19.0909091 6.21911939,17.076871 5.27698177,14.2678769 L1.23746264,17.3349879 C3.19279051,21.2936293 7.26500293,24 12,24 C14.9328362,24 17.7353462,22.9573905 19.834192,20.9995801 L16.0407269,18.0125889 Z"/>
                  <path fill="#4A90E2" d="M19.834192,20.9995801 C22.0291676,18.9520994 23.4545455,15.903663 23.4545455,12 C23.4545455,11.2909091 23.3454545,10.5272727 23.1818182,9.81818182 L12,9.81818182 L12,14.4545455 L18.4363636,14.4545455 C18.1187732,16.013626 17.2662994,17.2212117 16.0407269,18.0125889 L19.834192,20.9995801Z"/>
                  <path fill="#FBBC05" d="M5.27698177,14.2678769 C5.03832634,13.556323 4.90909091,12.7937589 4.90909091,12 C4.90909091,11.2182781 5.03443647,10.4668121 5.26620003,9.76452941 L1.23999023,6.65002441 C0.43658717,8.26043162 0,10.0753848 0,12 C0,13.9195484 0.444780743,15.7301341 1.23746264,17.3349879 L5.27698177,14.2678769Z"/>
                </svg>
                <span className="text-sm">Google</span>
              </button>
              
              <button
                type="button"
                className="flex items-center justify-center gap-2 px-4 py-2.5 bg-white/10 border border-white/20 rounded-xl text-white font-medium hover:bg-white/20 transition-all duration-300 hover:scale-[1.02] group"
                onClick={() => alert('GitHub signup coming soon!')}
              >
                <svg className="w-5 h-5 group-hover:scale-110 transition-transform" fill="currentColor" viewBox="0 0 24 24">
                  <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd"/>
                </svg>
                <span className="text-sm">GitHub</span>
              </button>
            </div>

            {/* Demo Credentials Button */}
            <div className="pt-2 border-t border-white/10">
              <button
                type="button"
                onClick={fillDemoData}
                className="w-full text-sm text-emerald-300 hover:text-white py-2 px-4 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/20 hover:border-emerald-500/40 transition-all flex items-center justify-center gap-2"
              >
                <Sparkles size={14} />
                Fill Demo Data (for testing)
              </button>
            </div>
          </form>
        </div>

        {/* Login Redirect */}
        <div className="text-center space-y-2">
          <p className="text-white/70">
            Already have an account?{' '}
            <Link
              to="/login"
              className="font-bold text-transparent bg-clip-text bg-gradient-to-r from-emerald-300 to-teal-300 hover:from-white hover:to-white transition-all duration-300 underline decoration-2 underline-offset-4"
            >
              Sign in here →
            </Link>
          </p>
        </div>

        {/* Features Footer */}
        <div className="pt-4 border-t border-white/10">
          <div className="grid grid-cols-3 gap-3">
            <div className="glass p-3 rounded-xl text-center bg-white/5 backdrop-blur-sm border border-white/10 hover:bg-white/10 transition-all">
              <CalendarDays size={20} className="mx-auto text-emerald-400 mb-1" />
              <p className="text-xs text-white/70">AI Planning</p>
            </div>
            <div className="glass p-3 rounded-xl text-center bg-white/5 backdrop-blur-sm border border-white/10 hover:bg-white/10 transition-all">
              <Users size={20} className="mx-auto text-teal-400 mb-1" />
              <p className="text-xs text-white/70">Team Collab</p>
            </div>
            <div className="glass p-3 rounded-xl text-center bg-white/5 backdrop-blur-sm border border-white/10 hover:bg-white/10 transition-all">
              <TrendingUp size={20} className="mx-auto text-cyan-400 mb-1" />
              <p className="text-xs text-white/70">Analytics</p>
            </div>
          </div>
          
          <div className="flex justify-center items-center gap-6 text-white/60 text-xs mt-4 flex-wrap">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
              256-bit Encryption
            </span>
            <span className="flex items-center gap-1.5">
              <Shield size={12} />
              GDPR Compliant
            </span>
            <span className="flex items-center gap-1.5">
              <Zap size={12} />
              Free Forever
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
          animation: fadeIn 0.3s ease-out;
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
          background-color: #10b981;
          border-color: #10b981;
          background-image: url("data:image/svg+xml,%3csvg viewBox='0 0 16 16' fill='white' xmlns='http://www.w3.org/2000/svg'%3e%3cpath d='M12.207 4.793a1 1 0 010 1.414l-5 5a1 1 0 01-1.414 0l-2-2a1 1 0 011.414-1.414L6.5 9.086l4.293-4.293a1 1 0 011.414 0z'/%3e%3c/svg%3e");
          background-size: 12px;
          background-position: center;
          background-repeat: no-repeat;
        }
        input[type="checkbox"]:focus {
          outline: none;
          box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.3);
        }
        
        /* Select dropdown arrow */
        select {
          background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%23ffffff' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e");
          background-position: right 0.5rem center;
          background-repeat: no-repeat;
          background-size: 1.5em 1.5em;
          padding-right: 2.5rem;
        }
        
        /* Glass effect */
        .glass {
          background: rgba(255, 255, 255, 0.05);
          backdrop-filter: blur(10px);
        }
        
        /* Input autofill styling */
        input:-webkit-autofill,
        input:-webkit-autofill:hover,
        input:-webkit-autofill:focus {
          -webkit-text-fill-color: white;
          -webkit-box-shadow: 0 0 0px 1000px rgba(16, 185, 129, 0.1) inset;
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

export default Register;