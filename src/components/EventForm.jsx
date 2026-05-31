import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  CalendarDays, MapPin, AlignLeft, Type, Tags, Eye, Activity, 
  Globe, Map, Building, Clock, X, Check, AlertTriangle, RefreshCw, Trash2, History,
  CalendarPlus, Sparkles
} from 'lucide-react';

// Modal Component (matching VenueBooking style exactly)
const ActionModal = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 border border-gray-700 rounded-2xl p-6 max-w-md w-full shadow-2xl relative animate-fadeIn">
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
        >
          <X size={20} />
        </button>
        <h3 className="text-xl font-bold text-white mb-4">{title}</h3>
        {children}
      </div>
    </div>
  );
};

// Toast Component (matching VenueBooking style exactly)
const Toast = ({ message, type, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(onClose, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  const bgColor = type === 'success' ? 'bg-green-500/20 border-green-500' : 
                 type === 'error' ? 'bg-red-500/20 border-red-500' : 
                 type === 'warning' ? 'bg-orange-500/20 border-orange-500' :
                 'bg-blue-500/20 border-blue-500';
  
  const icon = type === 'success' ? <Check size={18} /> : 
              type === 'error' ? <AlertTriangle size={18} /> :
              type === 'warning' ? <AlertTriangle size={18} /> :
              <CalendarDays size={18} />;
  
  return (
    <div className={`fixed bottom-6 right-6 ${bgColor} border text-white px-6 py-3 rounded-xl shadow-lg z-50 flex items-center gap-3 animate-slideUp`}>
      {icon}
      <span>{message}</span>
    </div>
  );
};

const EventForm = ({ onEventCreated, selectedVenue }) => {
  const { user } = useAuth();
  
  // Form State
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'personal',
    startDate: '',
    endDate: '',
    location: {
      address: '',
      city: '',
      state: '',
      country: ''
    },
    status: 'draft',
    visibility: 'private'
  });
  
  // UI States
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [events, setEvents] = useState([]);
  const [toast, setToast] = useState(null);
  const [modalState, setModalState] = useState({ isOpen: false, type: null, event: null });
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  // Date validation error state
  const [dateError, setDateError] = useState('');
  const minDateTime = new Date().toISOString().slice(0, 16);

  // Load ALL events on mount
  useEffect(() => {
    loadAllEvents();

    const handleEventUpdate = () => {
      loadAllEvents();
    };
    
    window.addEventListener('eventUpdated', handleEventUpdate);
    return () => window.removeEventListener('eventUpdated', handleEventUpdate);
  }, []);

  // Real-time date validation
  useEffect(() => {
    if (formData.startDate || formData.endDate) {
      const start = new Date(formData.startDate);
      const end = new Date(formData.endDate);
      const now = new Date();
      
      if (formData.startDate && start < now) {
        setDateError('⚠️ Start date cannot be in the past');
      } else if (formData.endDate && end < now) {
        setDateError('⚠️ End date cannot be in the past');
      } else if (formData.startDate && formData.endDate && end < start) {
        setDateError('⚠️ End date must be after start date');
      } else {
        setDateError('');
      }
    } else {
      setDateError('');
    }
  }, [formData.startDate, formData.endDate]);

  // Load events function
  const loadAllEvents = () => {
    try {
      const storedEvents = JSON.parse(localStorage.getItem('events') || '[]');
      storedEvents.sort((a, b) => new Date(b.startDate || b.createdAt) - new Date(a.startDate || a.createdAt));
      setEvents(storedEvents);
    } catch (err) {
      console.error("Error loading events:", err);
      setEvents([]);
    }
  };

  // Handle selected venue
  useEffect(() => {
    if (selectedVenue) {
      setFormData(prev => ({
        ...prev,
        location: {
          address: selectedVenue.venue?.address || selectedVenue.location || '',
          city: selectedVenue.venue?.city || '',
          state: selectedVenue.venue?.state || '',
          country: selectedVenue.venue?.country || ''
        }
      }));
    }
  }, [selectedVenue]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name.startsWith('location.')) {
      const locationField = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        location: {
          ...prev.location,
          [locationField]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const showToast = (message, type = 'info') => {
    setToast({ message, type });
  };

  // Validate dates are not in the past
  const validateDates = () => {
    const now = new Date();
    const start = new Date(formData.startDate);
    const end = new Date(formData.endDate);
    
    if (!formData.startDate || !formData.endDate) {
      setError('⚠️ Please select both start and end dates');
      return false;
    }
    
    if (start < now) {
      setError('❌ CANNOT BOOK EVENTS IN THE PAST! Start date must be in the future.');
      showToast('Cannot book past dates!', 'error');
      return false;
    }
    
    if (end < now) {
      setError('❌ End date cannot be in the past!');
      showToast('End date is in the past!', 'error');
      return false;
    }
    
    if (end < start) {
      setError('❌ End date must be after start date!');
      showToast('Invalid date range!', 'error');
      return false;
    }
    
    setError('');
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate dates BEFORE processing
    if (!validateDates()) {
      return;
    }
    
    setError('');
    setLoading(true);

    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const newEvent = {
        _id: `event_${Date.now()}`,
        userId: user?.id || 'guest',
        ...formData,
        createdAt: new Date().toISOString()
      };
      
      const updatedEvents = [...events, newEvent];
      setEvents(updatedEvents);
      localStorage.setItem('events', JSON.stringify(updatedEvents));
      window.dispatchEvent(new Event('eventUpdated'));

      showToast('🎉 Event created successfully!', 'success');

      if (onEventCreated) {
        onEventCreated(newEvent);
      }

      // Reset form
      setFormData({
        title: '',
        description: '',
        category: 'personal',
        startDate: '',
        endDate: '',
        location: { address: '', city: '', state: '', country: '' },
        status: 'draft',
        visibility: 'private'
      });
      
      setDateError('');

    } catch (err) {
      setError(err.message);
      showToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  // Event Actions
  const handleCancelEvent = (eventId) => {
    setModalState({
      isOpen: true,
      type: 'cancel',
      event: events.find(e => e._id === eventId)
    });
  };

  const confirmCancelEvent = () => {
    const updatedEvents = events.map(e => 
      e._id === modalState.event._id ? { ...e, status: 'cancelled' } : e
    );
    updateAndSave(updatedEvents);
    setModalState({ isOpen: false, type: null, event: null });
    showToast('✅ Event cancelled successfully!', 'success');
  };

  const handlePostponeEvent = (eventId) => {
    setModalState({
      isOpen: true,
      type: 'postpone',
      event: events.find(e => e._id === eventId)
    });
  };

  const handleRebookEvent = (eventId) => {
    setModalState({
      isOpen: true,
      type: 'rebook',
      event: events.find(e => e._id === eventId)
    });
  };

  const handleDeleteEvent = (eventId) => {
    const updatedEvents = events.filter(e => e._id !== eventId);
    updateAndSave(updatedEvents);
    showToast('🗑️ Event deleted permanently!', 'info');
  };

  const updateAndSave = (updatedEvents) => {
    setEvents(updatedEvents);
    localStorage.setItem('events', JSON.stringify(updatedEvents));
    window.dispatchEvent(new Event('eventUpdated'));
  };

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      loadAllEvents(); 
      setIsRefreshing(false);
      showToast('📊 Full history retrieved!', 'info');
    }, 500);
  };

  // Helper Functions
  const formatDate = (dateString) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  const isPastEvent = (dateString) => {
    return new Date(dateString) < new Date();
  };

  const getStatusBadge = (status) => {
    const colors = {
      draft: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
      published: 'bg-green-500/20 text-green-400 border-green-500/30',
      cancelled: 'bg-red-500/20 text-red-400 border-red-500/30',
      postponed: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'
    };
    return colors[status] || colors.draft;
  };

  const getCategoryIcon = (category) => {
    switch(category) {
      case 'wedding': return '💒';
      case 'professional': return '💼';
      case 'college': return '🎓';
      default: return '⭐';
    }
  };

  return (
    <div className="min-h-screen p-6 relative overflow-hidden" style={{background: '#0f172a'}}>
      {/* Background Effects - Matching VenueBooking exactly */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-gradient-to-br from-blue-500/10 to-purple-500/10 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 -right-40 w-96 h-96 bg-gradient-to-br from-emerald-500/10 to-cyan-500/10 rounded-full blur-3xl"></div>
      </div>

      {/* Toast Notification */}
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      <div className="max-w-7xl mx-auto relative z-10 space-y-8">
        
        {/* Header - Matching VenueBooking Style */}
        <div className="text-center mb-10">
          <h2 className="text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-purple-400 to-emerald-400 mb-3">
            📅 Event Management
          </h2>
          <p className="text-gray-400 text-lg">Create, schedule and manage your events with ease</p>
        </div>

        {/* EVENT CREATION FORM */}
        <div className="bg-gray-900/60 backdrop-blur-xl border border-gray-700/50 rounded-3xl p-8 shadow-2xl">
          
          <div className="flex items-center gap-3 mb-8">
            <div className="p-3 bg-purple-500/20 rounded-xl text-purple-400">
              <CalendarPlus size={24} />
            </div>
            <div>
              <h3 className="text-2xl font-semibold text-white">Create New Event</h3>
              <p className="text-gray-400 text-sm">Fill in the details below</p>
            </div>
          </div>
          
          {error && (
            <div className="bg-red-500/10 border border-red-500/50 text-red-400 p-4 rounded-xl mb-6 flex items-center gap-3">
              <AlertTriangle size={20} />
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* Section 1: Basic Information */}
            <div className="bg-gray-800/40 border border-gray-700/50 rounded-2xl p-6">
              <h4 className="text-lg font-semibold text-white mb-5 flex items-center gap-2">
                <AlignLeft className="w-5 h-5 text-blue-400" /> Basic Details
              </h4>
              
              <div className="space-y-5">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                  <div className="md:col-span-2">
                    <label className="block text-gray-300 text-sm font-medium mb-2">Event Title *</label>
                    <div className="relative">
                      <Type className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500 w-5 h-5" />
                      <input 
                        type="text" 
                        name="title" 
                        value={formData.title} 
                        onChange={handleChange} 
                        required 
                        className="w-full pl-11 pr-4 py-3 bg-gray-900/50 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:border-blue-500 outline-none transition-all" 
                        placeholder="e.g., Annual Tech Meetup" 
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-gray-300 text-sm font-medium mb-2">Category</label>
                    <div className="relative">
                      <Tags className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500 w-5 h-5" />
                      <select 
                        name="category" 
                        value={formData.category} 
                        onChange={handleChange} 
                        className="w-full pl-11 pr-4 py-3 bg-gray-900/50 border border-gray-700 rounded-xl text-white focus:border-blue-500 outline-none transition-all appearance-none"
                      >
                        <option value="personal" className="bg-gray-800">Personal</option>
                        <option value="wedding" className="bg-gray-800">Wedding</option>
                        <option value="college" className="bg-gray-800">College</option>
                        <option value="professional" className="bg-gray-800">Professional</option>
                        <option value="other" className="bg-gray-800">Other</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-gray-300 text-sm font-medium mb-2">Description *</label>
                  <textarea 
                    name="description" 
                    value={formData.description} 
                    onChange={handleChange} 
                    required 
                    rows="3" 
                    className="w-full p-4 bg-gray-900/50 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:border-blue-500 outline-none transition-all resize-none" 
                    placeholder="Provide a brief description..." 
                  />
                </div>
              </div>
            </div>

            {/* Section 2: Date & Time */}
            <div className="bg-gray-800/40 border border-gray-700/50 rounded-2xl p-6">
              <h4 className="text-lg font-semibold text-white mb-5 flex items-center gap-2">
                <Clock className="w-5 h-5 text-purple-400" /> Timing
              </h4>
              
              {/* Real-time validation error display */}
              {dateError && (
                <div className="bg-orange-500/15 border border-orange-500/40 text-orange-300 px-4 py-3 rounded-xl mb-4 text-sm flex items-center gap-2">
                  <AlertTriangle size={16} />
                  {dateError}
                </div>
              )}
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-gray-300 text-sm font-medium mb-2">Start Date & Time *</label>
                  <div className="relative">
                    <CalendarDays className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500 w-5 h-5" />
                    <input 
                      type="datetime-local" 
                      name="startDate" 
                      value={formData.startDate} 
                      onChange={handleChange} 
                      min={minDateTime}
                      required 
                      className="w-full pl-11 pr-4 py-3 bg-gray-900/50 border border-gray-700 rounded-xl text-white focus:border-purple-500 outline-none transition-all" 
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-gray-300 text-sm font-medium mb-2">End Date & Time *</label>
                  <div className="relative">
                    <CalendarDays className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500 w-5 h-5" />
                    <input 
                      type="datetime-local" 
                      name="endDate" 
                      value={formData.endDate} 
                      onChange={handleChange}
                      min={minDateTime}
                      required 
                      className="w-full pl-11 pr-4 py-3 bg-gray-900/50 border border-gray-700 rounded-xl text-white focus:border-purple-500 outline-none transition-all" 
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Section 3: Location */}
            <div className="bg-gray-800/40 border border-gray-700/50 rounded-2xl p-6">
              <h4 className="text-lg font-semibold text-white mb-5 flex items-center gap-2">
                <MapPin className="w-5 h-5 text-rose-400" /> Location Details
              </h4>
              
              <div className="space-y-5">
                <div>
                  <label className="block text-gray-300 text-sm font-medium mb-2">Street Address</label>
                  <div className="relative">
                    <Map className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500 w-5 h-5" />
                    <input 
                      type="text" 
                      name="location.address" 
                      value={formData.location.address} 
                      onChange={handleChange} 
                      className="w-full pl-11 pr-4 py-3 bg-gray-900/50 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:border-rose-500 outline-none transition-all" 
                      placeholder="123 Main St" 
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                  <div>
                    <label className="block text-gray-300 text-sm font-medium mb-2">City</label>
                    <div className="relative">
                      <Building className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500 w-5 h-5" />
                      <input 
                        type="text" 
                        name="location.city" 
                        value={formData.location.city} 
                        onChange={handleChange} 
                        className="w-full pl-11 pr-4 py-3 bg-gray-900/50 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:border-rose-500 outline-none transition-all" 
                        placeholder="City" 
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-gray-300 text-sm font-medium mb-2">State / Region</label>
                    <input 
                      type="text" 
                      name="location.state" 
                      value={formData.location.state} 
                      onChange={handleChange} 
                      className="w-full px-4 py-3 bg-gray-900/50 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:border-rose-500 outline-none transition-all" 
                      placeholder="State" 
                    />
                  </div>
                  <div>
                    <label className="block text-gray-300 text-sm font-medium mb-2">Country</label>
                    <div className="relative">
                      <Globe className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500 w-5 h-5" />
                      <input 
                        type="text" 
                        name="location.country" 
                        value={formData.location.country} 
                        onChange={handleChange} 
                        className="w-full pl-11 pr-4 py-3 bg-gray-900/50 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:border-rose-500 outline-none transition-all" 
                        placeholder="Country" 
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Section 4: Privacy & Status */}
            <div className="bg-gray-800/40 border border-gray-700/50 rounded-2xl p-6">
              <h4 className="text-lg font-semibold text-white mb-5 flex items-center gap-2">
                <Eye className="w-5 h-5 text-green-400" /> Settings
              </h4>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-gray-300 text-sm font-medium mb-2">Event Status</label>
                  <div className="relative">
                    <Activity className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500 w-5 h-5" />
                    <select 
                      name="status" 
                      value={formData.status} 
                      onChange={handleChange} 
                      className="w-full pl-11 pr-4 py-3 bg-gray-900/50 border border-gray-700 rounded-xl text-white focus:border-green-500 outline-none transition-all appearance-none"
                    >
                      <option value="draft" className="bg-gray-800">Draft (Invisible)</option>
                      <option value="published" className="bg-gray-800">Published (Live)</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-gray-300 text-sm font-medium mb-2">Visibility</label>
                  <div className="relative">
                    <Eye className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500 w-5 h-5" />
                    <select 
                      name="visibility" 
                      value={formData.visibility} 
                      onChange={handleChange} 
                      className="w-full pl-11 pr-4 py-3 bg-gray-900/50 border border-gray-700 rounded-xl text-white focus:border-green-500 outline-none transition-all appearance-none"
                    >
                      <option value="private" className="bg-gray-800">Private (Only Me)</option>
                      <option value="public" className="bg-gray-800">Public (Anyone)</option>
                      <option value="invite-only" className="bg-gray-800">Invite Only</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>

            {/* Submit Button - Matching VenueBooking Style */}
            <button 
              type="submit" 
              disabled={loading} 
              className="w-full py-4 bg-gradient-to-r from-blue-500 via-purple-500 to-emerald-500 text-white font-bold rounded-xl hover:scale-[1.02] transition-transform duration-300 shadow-lg hover:shadow-xl disabled:opacity-50"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <RefreshCw size={20} className="animate-spin" /> Processing...
                </span>
              ) : (
                <span className="flex items-center justify-center gap-2">
                  <Sparkles size={20} /> Create Event ✨
                </span>
              )}
            </button>
          </form>
        </div>

        {/* FULL HISTORY TABLE SECTION - Matching VenueBooking Style */}
        <div className="bg-gray-900/60 backdrop-blur-xl border border-gray-700/50 rounded-3xl p-8 shadow-2xl">
          <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-indigo-500/20 rounded-xl text-indigo-400">
                <History size={24} />
              </div>
              <div>
                <h3 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">
                  My Events & History
                </h3>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <button 
                onClick={handleRefresh} 
                disabled={isRefreshing}
                className="flex items-center gap-2 px-4 py-2 rounded-lg border border-indigo-500/30 bg-indigo-500/10 text-indigo-400 hover:bg-indigo-500/20 transition-all disabled:opacity-50"
              >
                <RefreshCw size={16} className={isRefreshing ? "animate-spin" : ""} />
                Sync
              </button>
              <div className="bg-gray-800 px-4 py-2 rounded-lg border border-gray-700 flex items-center gap-3">
                <span className="text-xl font-bold text-white">{events.length}</span>
                <span className="text-gray-500 text-sm border-l border-gray-600 pl-3">Total Events</span>
              </div>
            </div>
          </div>

          {events.length === 0 ? (
            <div className="text-center py-16 border-2 border-dashed border-gray-700 rounded-2xl">
              <History size={48} className="mx-auto text-gray-600 mb-4" />
              <h3 className="text-xl font-semibold text-gray-400 mb-2">No Events Found</h3>
              <p className="text-gray-500">Your events will appear here after you create them.</p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto rounded-xl border border-gray-700 bg-gray-900/30">
                <table className="w-full text-left">
                  <thead className="bg-gray-800/90 sticky top-0">
                    <tr>
                      <th className="py-4 px-5 text-gray-400 font-semibold text-xs uppercase tracking-wider">Event</th>
                      <th className="py-4 px-5 text-gray-400 font-semibold text-xs uppercase tracking-wider">Date & Time</th>
                      <th className="py-4 px-5 text-gray-400 font-semibold text-xs uppercase tracking-wider hidden md:table-cell">Location</th>
                      <th className="py-4 px-5 text-gray-400 font-semibold text-xs uppercase tracking-wider">Status</th>
                      <th className="py-4 px-5 text-right text-gray-400 font-semibold text-xs uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-800/50">
                    {events.map((event) => {
                      const past = isPastEvent(event.startDate) && event.status !== 'cancelled' && event.status !== 'postponed';
                      
                      return (
                        <tr key={event._id} className={`group transition-colors hover:bg-gray-800/60 ${past ? 'opacity-75' : ''}`}>
                          <td className="py-4 px-5">
                            <div className="flex items-start gap-3">
                              <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 text-lg ${past ? 'bg-gray-700/50 grayscale' : 'bg-gradient-to-br from-blue-500/20 to-purple-500/20'}`}>
                                {getCategoryIcon(event.category)}
                              </div>
                              <div className="min-w-0">
                                <div className="flex items-center gap-2">
                                  <h4 className={`font-semibold truncate ${past ? 'text-gray-400' : 'text-white'}`}>
                                    {event.title}
                                  </h4>
                                  {past && (
                                    <span className="px-2 py-0.5 text-[10px] font-bold rounded bg-gray-700 text-gray-400 uppercase tracking-wide shrink-0">
                                      Past
                                    </span>
                                  )}
                                </div>
                                <p className="text-gray-500 text-xs mt-1 line-clamp-1">{event.description}</p>
                              </div>
                            </div>
                          </td>
                          
                          <td className="py-4 px-5">
                            <div className="text-sm">
                              <div className="flex items-center gap-2 text-white font-medium">
                                <CalendarDays size={12} className="text-indigo-400" /> {formatDate(event.startDate)}
                              </div>
                              <div className="text-gray-500 flex items-center gap-2 pl-5 mt-1">
                                <Clock size={12} /> End: {formatDate(event.endDate)}
                              </div>
                            </div>
                          </td>
                          
                          <td className="py-4 px-5 hidden md:table-cell">
                            <div className="text-xs text-gray-400 truncate max-w-[200px]" title={`${event.location?.address}, ${event.location?.city}`}>
                              {event.location?.city || event.location?.address || '-'}
                            </div>
                          </td>
                          
                          <td className="py-4 px-5">
                            <span className={`inline-flex items-center px-3 py-1 rounded-full text-[11px] font-bold border capitalize ${getStatusBadge(event.status)}`}>
                              {event.status}
                            </span>
                          </td>
                          
                          <td className="py-4 px-5 text-right">
                            <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                              
                              {/* Postpone & Cancel only for active bookings */}
                              {(!past && event.status !== 'cancelled') && (
                                <>
                                  <button 
                                    onClick={() => handlePostponeEvent(event._id)} 
                                    className="p-1.5 rounded-md hover:bg-orange-500/20 text-orange-400/70 hover:text-orange-400 transition-all" 
                                    title="Postpone"
                                  >
                                    <Clock size={14} />
                                  </button>
                                  <button 
                                    onClick={() => handleCancelEvent(event._id)} 
                                    className="p-1.5 rounded-md hover:bg-red-500/20 text-red-400/70 hover:text-red-400 transition-all" 
                                    title="Cancel"
                                  >
                                    <X size={14} />
                                  </button>
                                </>
                              )}
                              
                              {/* REBOOK - ALWAYS VISIBLE for ALL events including CANCELLED */}
                              <button 
                                onClick={() => handleRebookEvent(event._id)} 
                                className="p-1.5 rounded-md hover:bg-blue-500/20 text-blue-400/70 hover:text-blue-400 transition-all" 
                                title="Rebook Event"
                              >
                                <RefreshCw size={14} />
                              </button>
                              
                              <button 
                                onClick={() => handleDeleteEvent(event._id)} 
                                className="p-1.5 rounded-md hover:bg-gray-500/20 text-gray-500 hover:text-red-400 transition-all" 
                                title="Delete"
                              >
                                <Trash2 size={14} />
                              </button>
                              
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Footer Stats - Optional, can remove if not needed */}
              <div className="mt-6 pt-6 border-t border-gray-800 grid grid-cols-2 md:grid-cols-4 gap-4">
                 <div className="bg-gray-800/30 rounded-lg p-3 text-center border border-gray-800">
                   <div className="text-lg font-bold text-gray-200">{events.filter(e => isPastEvent(e.startDate)).length}</div>
                   <div className="text-[10px] text-gray-500 uppercase tracking-wider">Past Events</div>
                 </div>
                 <div className="bg-gray-800/30 rounded-lg p-3 text-center border border-gray-800">
                   <div className="text-lg font-bold text-blue-400">{events.filter(e => !isPastEvent(e.startDate)).length}</div>
                   <div className="text-[10px] text-gray-500 uppercase tracking-wider">Upcoming</div>
                 </div>
                 <div className="bg-gray-800/30 rounded-lg p-3 text-center border border-gray-800">
                   <div className="text-lg font-bold text-green-400">{events.filter(e => e.status === 'published').length}</div>
                   <div className="text-[10px] text-gray-500 uppercase tracking-wider">Published</div>
                 </div>
                 <div className="bg-gray-800/30 rounded-lg p-3 text-center border border-gray-800">
                   <div className="text-lg font-bold text-yellow-400">{events.filter(e => e.status === 'draft').length}</div>
                   <div className="text-[10px] text-gray-500 uppercase tracking-wider">Drafts</div>
                 </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* MODALS - Updated to match VenueBooking pattern */}
      
      {/* Cancel Modal */}
      <ActionModal 
        isOpen={modalState.isOpen && modalState.type === 'cancel'} 
        onClose={() => setModalState({isOpen:false,type:null,event:null})} 
        title="Cancel Event"
      >
        <div className="space-y-4">
          <p className="text-gray-300">Are you sure you want to cancel this event?</p>
          <div className="bg-gray-800 rounded-xl p-4 border border-gray-700">
            <p className="font-semibold text-white">{modalState.event?.title}</p>
            <p className="text-gray-400 text-sm">{formatDate(modalState.event?.startDate)}</p>
          </div>
          <div className="flex gap-3 pt-2">
            <button 
              onClick={confirmCancelEvent} 
              className="flex-1 bg-red-500 text-white py-3 rounded-xl font-semibold hover:bg-red-600 transition-all"
            >
              Confirm Cancel
            </button>
            <button 
              onClick={() => setModalState({isOpen:false,type:null,event:null})} 
              className="flex-1 bg-gray-700 text-white py-3 rounded-xl font-semibold hover:bg-gray-600 transition-all"
            >
              Keep It
            </button>
          </div>
        </div>
      </ActionModal>

      {/* Postpone Modal - Extracted as separate component like VenueBooking */}
      <ActionModal 
        isOpen={modalState.isOpen && modalState.type === 'postpone'} 
        onClose={() => setModalState({isOpen:false,type:null,event:null})} 
        title="Postpone Event"
      >
        <PostponeModalContent 
          event={modalState.event}
          onSave={(newStart, newEnd) => {
            if (!newStart || !newEnd) {
              showToast('⚠️ Please select both dates.', 'warning');
              return;
            }
            
            if (new Date(newStart) < new Date() || new Date(newEnd) < new Date()) {
              showToast('❌ Cannot postpone to past dates!', 'error');
              return;
            }

            const updatedEvents = events.map(e => 
              e._id === modalState.event._id ? { 
                ...e, 
                startDate: newStart, 
                endDate: newEnd,
                status: 'postponed'
              } : e
            );
            updateAndSave(updatedEvents);
            setModalState({ isOpen: false, type: null, event: null });
            showToast('✅ Event postponed successfully.', 'success');
          }}
          minDateTime={minDateTime}
        />
      </ActionModal>

      {/* Rebook Modal - Extracted as separate component like VenueBooking */}
      <ActionModal 
        isOpen={modalState.isOpen && modalState.type === 'rebook'} 
        onClose={() => setModalState({isOpen:false,type:null,event:null})} 
        title="Rebook Event"
      >
        <RebookModalContent 
          event={modalState.event}
          onSave={(newData) => {
            if (!newData.startDate || !newData.endDate) {
              showToast('⚠️ Please select both dates.', 'warning');
              return;
            }

            const start = new Date(newData.startDate);
            const end = new Date(newData.endDate);
            const now = new Date();
            
            if (start < now || end < now) {
              showToast('❌ Cannot rebook to past dates!', 'error');
              return;
            }
            
            const rebookedEvent = {
              ...modalState.event,
              _id: `event_${Date.now()}`,
              title: newData.title,
              startDate: newData.startDate,
              endDate: newData.endDate,
              createdAt: new Date().toISOString(),
              status: 'published'
            };
            
            const updatedEvents = [...events, rebookedEvent];
            updateAndSave(updatedEvents);
            setModalState({ isOpen: false, type: null, event: null });
            showToast('🔄 Event rebooked successfully!', 'success');
          }}
          minDateTime={minDateTime}
        />
      </ActionModal>

      <style>{`
        @keyframes fadeIn { from { opacity: 0; transform: scale(0.95); } to { opacity: 1; transform: scale(1); } }
        @keyframes slideUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        .animate-fadeIn { animation: fadeIn 0.2s ease-out; }
        .animate-slideUp { animation: slideUp 0.3s ease-out; }
        .line-clamp-1 { display: -webkit-box; -webkit-line-clamp: 1; -webkit-box-orient: vertical; overflow: hidden; }
      `}</style>
    </div>
  );
};

// Postpone Modal Component - Extracted like VenueBooking pattern
const PostponeModalContent = ({ event, onSave, minDateTime }) => {
  const [newStart, setNewStart] = useState(event?.startDate || '');
  const [newEnd, setNewEnd] = useState(event?.endDate || '');

  return (
    <div className="space-y-4">
      <p className="text-gray-300">Select new dates for your event:</p>
      <div>
        <label className="block text-gray-300 mb-2 text-sm font-medium">New Start Date & Time</label>
        <input 
          type="datetime-local" 
          value={newStart} 
          onChange={(e) => setNewStart(e.target.value)} 
          min={minDateTime}
          className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-xl text-white focus:outline-none focus:border-purple-500" 
        />
      </div>
      <div>
        <label className="block text-gray-300 mb-2 text-sm font-medium">New End Date & Time</label>
        <input 
          type="datetime-local" 
          value={newEnd} 
          onChange={(e) => setNewEnd(e.target.value)} 
          min={minDateTime}
          className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-xl text-white focus:outline-none focus:border-purple-500" 
        />
      </div>
      <div className="flex gap-3 pt-2">
        <button 
          onClick={() => onSave(newStart, newEnd)} 
          disabled={!newStart || !newEnd}
          className="flex-1 bg-gradient-to-r from-orange-500 to-amber-500 text-white py-3 rounded-xl font-semibold disabled:opacity-50 hover:scale-[1.02] transition-transform"
        >
          Confirm Postpone
        </button>
        <button 
          onClick={() => {}} 
          className="flex-1 bg-gray-700 text-white py-3 rounded-xl font-semibold hover:bg-gray-600"
        >
          Cancel
        </button>
      </div>
    </div>
  );
};

// Rebook Modal Component - Extracted like VenueBooking pattern
const RebookModalContent = ({ event, onSave, minDateTime }) => {
  const [newData, setNewData] = useState({
    startDate: '',
    endDate: '',
    title: `${event?.title} (Rebooked)`
  });

  return (
    <div className="space-y-4">
      <p className="text-gray-300">Create a new event based on this one:</p>
      <div className="bg-gray-800 rounded-xl p-4 border border-gray-700">
        <p className="font-semibold text-white">{event?.title}</p>
        <p className="text-gray-400 text-sm">{event?.location?.city || 'No location'}</p>
      </div>
      <div>
        <label className="block text-gray-300 mb-2 text-sm font-medium">Event Title *</label>
        <input 
          type="text" 
          value={newData.title} 
          onChange={(e) => setNewData({...newData, title: e.target.value})} 
          className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-xl text-white focus:outline-none focus:border-blue-500" 
        />
      </div>
      <div>
        <label className="block text-gray-300 mb-2 text-sm font-medium">New Start Date *</label>
        <input 
          type="datetime-local" 
          value={newData.startDate} 
          onChange={(e) => setNewData({...newData, startDate: e.target.value})}
          min={minDateTime}
          className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-xl text-white focus:outline-none focus:border-blue-500" 
        />
      </div>
      <div>
        <label className="block text-gray-300 mb-2 text-sm font-medium">New End Date *</label>
        <input 
          type="datetime-local" 
          value={newData.endDate} 
          onChange={(e) => setNewData({...newData, endDate: e.target.value})}
          min={minDateTime}
          className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-xl text-white focus:outline-none focus:border-blue-500" 
        />
      </div>
      <div className="flex gap-3 pt-2">
        <button 
          onClick={() => onSave(newData)} 
          disabled={!newData.startDate || !newData.endDate}
          className="flex-1 bg-gradient-to-r from-blue-500 to-cyan-500 text-white py-3 rounded-xl font-semibold disabled:opacity-50 hover:scale-[1.02] transition-transform"
        >
          Confirm Rebook 🔄
        </button>
        <button 
          onClick={() => {}} 
          className="flex-1 bg-gray-700 text-white py-3 rounded-xl font-semibold hover:bg-gray-600"
        >
          Cancel
        </button>
      </div>
    </div>
  );
};

export default EventForm;