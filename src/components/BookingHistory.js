import React, { useState, useEffect, useCallback } from 'react';
import { 
  CalendarDays, MapPin, Clock, Users, DollarSign, Building2, Sparkles,
  Filter, Search, ChevronDown, ChevronUp, Eye, X, Check, AlertTriangle,
  RefreshCw, Download, Trash2, Edit, CalendarPlus, TrendingUp, XCircle
} from 'lucide-react';

// ============================================
// TOAST NOTIFICATION COMPONENT
// ============================================
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
              <AlertTriangle size={18} />;
  
  return (
    <div className={`fixed bottom-6 right-6 ${bgColor} border text-white px-6 py-3 rounded-xl shadow-lg z-50 flex items-center gap-3 animate-slideUp`}>
      {icon}
      <span>{message}</span>
    </div>
  );
};

// ============================================
// DETAIL MODAL COMPONENT
// ============================================
const DetailModal = ({ isOpen, onClose, title, data, type }) => {
  if (!isOpen || !data) return null;

  const isEvent = type === 'event';
  
  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 border border-gray-700 rounded-2xl p-6 max-w-lg w-full shadow-2xl relative animate-fadeIn max-h-[90vh] overflow-y-auto">
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
        >
          <X size={20} />
        </button>
        
        <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
          {isEvent ? <CalendarPlus size={20} className="text-purple-400" /> : <Building2 size={20} className="text-orange-400" />}
          {title}
        </h3>

        <div className="space-y-4 mt-6">
          {/* Main Info */}
          <div className="bg-gray-800/40 rounded-xl p-4 border border-gray-700/50">
            <h4 className="text-sm font-semibold text-gray-400 mb-3 uppercase tracking-wider">Details</h4>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-gray-500 mb-1">{isEvent ? 'Event Name' : 'Venue Name'}</p>
                <p className="text-white font-medium">{isEvent ? data.title : data.venueName}</p>
              </div>
              
              <div>
                <p className="text-xs text-gray-500 mb-1">Status</p>
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold capitalize ${
                  data.status === 'Confirmed' || data.status === 'confirmed' || data.status === 'published' ? 'bg-green-500/20 text-green-400 border border-green-500/30' :
                  data.status === 'Cancelled' || data.status === 'cancelled' ? 'bg-red-500/20 text-red-400 border border-red-500/30' :
                  data.status === 'Pending' || data.status === 'draft' ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30' :
                  'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                }`}>
                  {data.status}
                </span>
              </div>

              <div>
                <p className="text-xs text-gray-500 mb-1">Date</p>
                <p className="text-white font-medium flex items-center gap-2">
                  <CalendarDays size={14} className="text-indigo-400" />
                  {isEvent 
                    ? new Date(data.startDate).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })
                    : new Date(data.eventDate).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })
                  }
                </p>
              </div>

              <div>
                <p className="text-xs text-gray-500 mb-1">Time</p>
                <p className="text-white font-medium flex items-center gap-2">
                  <Clock size={14} className="text-emerald-400" />
                  {isEvent 
                    ? `${new Date(data.startDate).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}`
                    : data.eventTime || 'TBD'
                  }
                </p>
              </div>
            </div>
          </div>

          {/* Location Info */}
          <div className="bg-gray-800/40 rounded-xl p-4 border border-gray-700/50">
            <h4 className="text-sm font-semibold text-gray-400 mb-3 uppercase tracking-wider flex items-center gap-2">
              <MapPin size={16} /> Location
            </h4>
            <p className="text-white">
              {isEvent 
                ? (data.location?.city || data.location?.address || 'Not specified')
                : (data.venueName || 'Not specified')
              }
            </p>
            {data.location?.address && (
              <p className="text-sm text-gray-500 mt-1">{data.location.address}</p>
            )}
          </div>

          {/* Additional Details */}
          <div className="bg-gray-800/40 rounded-xl p-4 border border-gray-700/50">
            <h4 className="text-sm font-semibold text-gray-400 mb-3 uppercase tracking-wider">Additional Information</h4>
            
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-400 text-sm flex items-center gap-2">
                  <Users size={14} /> Guests
                </span>
                <span className="text-white font-medium">{data.guestCount || 0}</span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-gray-400 text-sm flex items-center gap-2">
                  <Clock size={14} /> Duration
                </span>
                <span className="text-white font-medium">{data.duration || (isEvent ? '1 day' : '4')} {isEvent ? 'day(s)' : 'hrs'}</span>
              </div>

              {(data.totalPrice || data.price) && (
                <div className="flex justify-between items-center pt-3 border-t border-gray-700">
                  <span className="text-gray-400 text-sm flex items-center gap-2">
                    <DollarSign size={14} /> Total Price
                  </span>
                  <span className="text-emerald-400 font-bold text-lg">₹{(data.totalPrice || data.price || 0).toLocaleString()}</span>
                </div>
              )}

              {isEvent && data.category && (
                <div className="flex justify-between items-center">
                  <span className="text-gray-400 text-sm">Category</span>
                  <span className="text-white font-medium capitalize">{data.category}</span>
                </div>
              )}

              {isEvent && data.visibility && (
                <div className="flex justify-between items-center">
                  <span className="text-gray-400 text-sm">Visibility</span>
                  <span className="text-white font-medium capitalize">{data.visibility}</span>
                </div>
              )}
            </div>
          </div>

          {/* Description (for events) */}
          {isEvent && data.description && (
            <div className="bg-gray-800/40 rounded-xl p-4 border border-gray-700/50">
              <h4 className="text-sm font-semibold text-gray-400 mb-3 uppercase tracking-wider">Description</h4>
              <p className="text-gray-300 text-sm leading-relaxed">{data.description}</p>
            </div>
          )}

          {/* Created At */}
          <div className="text-xs text-gray-600 pt-4 border-t border-gray-800">
            Created: {new Date(data.createdAt).toLocaleString()}
          </div>
        </div>

        <div className="flex gap-3 mt-6 pt-4 border-t border-gray-800">
          <button 
            onClick={onClose}
            className="flex-1 bg-gray-700 text-white py-3 rounded-xl font-semibold hover:bg-gray-600 transition-all"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

// ============================================
// MAIN BOOKING HISTORY COMPONENT
// ============================================
const BookingHistory = () => {
  
  // State Management
  const [venueBookings, setVenueBookings] = useState([]);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);
  
  // Filter States
  const [activeTab, setActiveTab] = useState('all'); // 'all', 'venues', 'events'
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeSearchQuery, setActiveSearchQuery] = useState(''); // 🔥 NEW: For explicit search
  const [sortBy, setSortBy] = useState('date-desc');
  
  // Modal States
  const [detailModal, setDetailModal] = useState({ isOpen: false, data: null, type: null });
  
  // UI States
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [expandedRows, setExpandedRows] = useState({});
  const [isSearchFocused, setIsSearchFocused] = useState(false); // 🔥 NEW: Track focus state

  // Load Data Function
  const loadAllBookings = () => {
    try {
      // Load Venue Bookings
      const storedVenueBookings = JSON.parse(localStorage.getItem('venueBookings') || '[]');
      
      // Load Events
      const storedEvents = JSON.parse(localStorage.getItem('events') || '[]');

      setVenueBookings(storedVenueBookings);
      setEvents(storedEvents);
      setLoading(false);
      
    } catch (err) {
      console.error("Error loading booking history:", err);
      setLoading(false);
    }
  };

  // Initialize
  useEffect(() => {
    loadAllBookings();

    // Listen for updates
    const handleUpdate = () => {
      loadAllBookings();
    };

    window.addEventListener('eventUpdated', handleUpdate);
    window.addEventListener('venueBookingUpdated', handleUpdate);

    return () => {
      window.removeEventListener('eventUpdated', handleUpdate);
      window.removeEventListener('venueBookingUpdated', handleUpdate);
    };
  }, []);

  // Toast Helper
  const showToast = (message, type = 'info') => {
    setToast({ message, type });
  };

  // Refresh Handler
  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      loadAllBookings();
      setIsRefreshing(false);
      showToast('📊 Booking history refreshed!', 'success');
    }, 500);
  };

  // Toggle Row Expansion
  const toggleRowExpansion = (id) => {
    setExpandedRows(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  // 🔥🔥🔥 NEW: Explicit Search Handler
  const handleSearch = useCallback(() => {
    setActiveSearchQuery(searchQuery.trim());
    if (searchQuery.trim()) {
      showToast(`🔍 Searching for: "${searchQuery.trim()}"`, 'info');
    }
  }, [searchQuery]);

  // 🔥🔥🔥 NEW: Clear Search Handler
  const handleClearSearch = useCallback(() => {
    setSearchQuery('');
    setActiveSearchQuery('');
    showToast('🔍 Search cleared', 'info');
  }, []);

  // 🔥🔥🔥 NEW: Handle Enter Key Press
  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
    if (e.key === 'Escape') {
      handleClearSearch();
    }
  };

  // ============================================
  // FILTERING & SORTING LOGIC (FIXED)
  // ============================================

  // Filtered Venue Bookings - Now uses activeSearchQuery
  const filteredVenueBookings = venueBookings.filter(booking => {
    // Status filter
    if (statusFilter !== 'all') {
      if (booking.status?.toLowerCase() !== statusFilter.toLowerCase()) return false;
    }

    // Search filter - FIXED: Use activeSearchQuery instead of searchQuery
    if (activeSearchQuery) {
      const query = activeSearchQuery.toLowerCase();
      const searchableText = [
        booking.venueName || '',
        booking.eventName || '',
        booking.eventDate || '',
        booking.status || '',
        String(booking.guestCount || ''),
        String(booking.totalPrice || '')
      ].join(' ').toLowerCase();
      
      if (!searchableText.includes(query)) return false;
    }

    return true;
  }).sort((a, b) => {
    switch(sortBy) {
      case 'date-asc':
        return new Date(a.eventDate) - new Date(b.eventDate);
      case 'date-desc':
        return new Date(b.eventDate) - new Date(a.eventDate);
      case 'price-asc':
        return (a.totalPrice || 0) - (b.totalPrice || 0);
      case 'price-desc':
        return (b.totalPrice || 0) - (a.totalPrice || 0);
      default:
        return 0;
    }
  });

  // Filtered Events - Now uses activeSearchQuery
  const filteredEvents = events.filter(event => {
    // Status filter
    if (statusFilter !== 'all') {
      if (event.status?.toLowerCase() !== statusFilter.toLowerCase()) return false;
    }

    // Search filter - FIXED: Use activeSearchQuery instead of searchQuery
    if (activeSearchQuery) {
      const query = activeSearchQuery.toLowerCase();
      const searchableText = [
        event.title || '',
        event.description || '',
        event.category || '',
        event.startDate || '',
        event.location?.city || '',
        event.location?.address || '',
        event.status || ''
      ].join(' ').toLowerCase();
      
      if (!searchableText.includes(query)) return false;
    }

    return true;
  }).sort((a, b) => {
    switch(sortBy) {
      case 'date-asc':
        return new Date(a.startDate) - new Date(b.startDate);
      case 'date-desc':
        return new Date(b.startDate) - new Date(a.startDate);
      default:
        return 0;
    }
  });

  // Calculate Statistics
  const stats = {
    totalVenueBookings: venueBookings.length,
    totalEvents: events.length,
    confirmedBookings: venueBookings.filter(b => b.status === 'Confirmed' || b.status === 'confirmed').length,
    activeEvents: events.filter(e => e.status === 'published').length,
    totalRevenue: venueBookings.reduce((sum, b) => sum + (b.totalPrice || 0), 0),
    totalGuests: [...venueBookings, ...events].reduce((sum, item) => sum + (item.guestCount || 0), 0),
    upcomingCount: [
      ...venueBookings.filter(b => new Date(b.eventDate) > new Date()),
      ...events.filter(e => new Date(e.startDate) > new Date())
    ].length
  };

  // Format helpers
  const formatDate = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatTimeAgo = (dateString) => {
    try {
      const date = new Date(dateString);
      const now = new Date();
      const diffTime = Math.abs(now - date);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      if (diffDays === 0) return 'Today';
      if (diffDays === 1) return 'Yesterday';
      if (diffDays < 7) return `${diffDays} days ago`;
      if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    } catch {
      return '-';
    }
  };

  // Delete handlers
  const handleDeleteVenueBooking = (id) => {
    if (!window.confirm('Are you sure you want to delete this venue booking?')) return;
    
    const updated = venueBookings.filter(b => b._id !== id);
    localStorage.setItem('venueBookings', JSON.stringify(updated));
    setVenueBookings(updated);
    window.dispatchEvent(new Event('venueBookingUpdated'));
    showToast('🗑️ Venue booking deleted', 'info');
  };

  const handleDeleteEvent = (id) => {
    if (!window.confirm('Are you sure you want to delete this event?')) return;
    
    const updated = events.filter(e => e._id !== id);
    localStorage.setItem('events', JSON.stringify(updated));
    setEvents(updated);
    window.dispatchEvent(new Event('eventUpdated'));
    showToast('🗑️ Event deleted', 'info');
  };

  // Export handler
  const handleExport = () => {
    const dataToExport = {
      venueBookings: venueBookings,
      events: events,
      exportDate: new Date().toISOString()
    };
    
    const blob = new Blob([JSON.stringify(dataToExport, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `booking-history-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    
    showToast('📥 Data exported successfully!', 'success');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{background: '#0f172a'}}>
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  return (
    <>
      <div className="min-h-screen p-6 relative overflow-hidden" style={{background: '#0f172a'}}>
        
        {/* Background Effects */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -left-40 w-96 h-96 bg-gradient-to-br from-blue-500/10 to-purple-500/10 rounded-full blur-3xl"></div>
          <div className="absolute top-1/2 -right-40 w-96 h-96 bg-gradient-to-br from-emerald-500/10 to-cyan-500/10 rounded-full blur-3xl"></div>
        </div>

        {/* Toast */}
        {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

        <div className="max-w-7xl mx-auto relative z-10 space-y-8">
          
          {/* HEADER */}
          <div className="text-center mb-10">
            <h2 className="text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-purple-400 to-emerald-400 mb-3">
              📋 Complete Booking History
            </h2>
            <p className="text-gray-400 text-lg">View and manage all your venue bookings and created events</p>
          </div>

          {/* STATISTICS CARDS */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            <div className="bg-gray-900/60 backdrop-blur-xl border border-gray-700/50 rounded-2xl p-5 shadow-xl hover:border-orange-500/30 transition-all group">
              <div className="flex items-center justify-between mb-2">
                <Building2 size={20} className="text-orange-400 group-hover:scale-110 transition-transform" />
                <span className="text-[10px] text-orange-400/70 font-medium uppercase tracking-wider">Venues</span>
              </div>
              <p className="text-3xl font-bold text-white">{stats.totalVenueBookings}</p>
              <p className="text-xs text-gray-400 mt-1">Total Bookings</p>
            </div>

            <div className="bg-gray-900/60 backdrop-blur-xl border border-gray-700/50 rounded-2xl p-5 shadow-xl hover:border-purple-500/30 transition-all group">
              <div className="flex items-center justify-between mb-2">
                <CalendarPlus size={20} className="text-purple-400 group-hover:scale-110 transition-transform" />
                <span className="text-[10px] text-purple-400/70 font-medium uppercase tracking-wider">Events</span>
              </div>
              <p className="text-3xl font-bold text-white">{stats.totalEvents}</p>
              <p className="text-xs text-gray-400 mt-1">Created Events</p>
            </div>

            <div className="bg-gray-900/60 backdrop-blur-xl border border-gray-700/50 rounded-2xl p-5 shadow-xl hover:border-green-500/30 transition-all group">
              <div className="flex items-center justify-between mb-2">
                <Check size={20} className="text-green-400 group-hover:scale-110 transition-transform" />
                <span className="text-[10px] text-green-400/70 font-medium uppercase tracking-wider">Active</span>
              </div>
              <p className="text-3xl font-bold text-white">{stats.confirmedBookings + stats.activeEvents}</p>
              <p className="text-xs text-gray-400 mt-1">Confirmed Items</p>
            </div>

            <div className="bg-gray-900/60 backdrop-blur-xl border border-gray-700/50 rounded-2xl p-5 shadow-xl hover:border-indigo-500/30 transition-all group">
              <div className="flex items-center justify-between mb-2">
                <TrendingUp size={20} className="text-indigo-400 group-hover:scale-110 transition-transform" />
                <span className="text-[10px] text-indigo-400/70 font-medium uppercase tracking-wider">Upcoming</span>
              </div>
              <p className="text-3xl font-bold text-white">{stats.upcomingCount}</p>
              <p className="text-xs text-gray-400 mt-1">Scheduled Soon</p>
            </div>

            <div className="bg-gray-900/60 backdrop-blur-xl border border-gray-700/50 rounded-2xl p-5 shadow-xl hover:border-emerald-500/30 transition-all group">
              <div className="flex items-center justify-between mb-2">
                <Users size={20} className="text-emerald-400 group-hover:scale-110 transition-transform" />
                <span className="text-[10px] text-emerald-400/70 font-medium uppercase tracking-wider">Guests</span>
              </div>
              <p className="text-3xl font-bold text-white">{stats.totalGuests.toLocaleString()}</p>
              <p className="text-xs text-gray-400 mt-1">Total Attendees</p>
            </div>

            <div className="bg-gray-900/60 backdrop-blur-xl border border-gray-700/50 rounded-2xl p-5 shadow-xl hover:border-pink-500/30 transition-all group">
              <div className="flex items-center justify-between mb-2">
                <DollarSign size={20} className="text-pink-400 group-hover:scale-110 transition-transform" />
                <span className="text-[10px] text-pink-400/70 font-medium uppercase tracking-wider">Revenue</span>
              </div>
              <p className="text-3xl font-bold text-white">₹{stats.totalRevenue.toLocaleString()}</p>
              <p className="text-xs text-gray-400 mt-1">Total Spent</p>
            </div>
          </div>

          {/* CONTROLS BAR */}
          <div className="bg-gray-900/60 backdrop-blur-xl border border-gray-700/50 rounded-2xl p-6 shadow-xl">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              
              {/* Left: Tab Switcher */}
              <div className="flex bg-gray-800/50 p-1 rounded-xl">
                <button
                  onClick={() => setActiveTab('all')}
                  className={`px-5 py-2.5 rounded-lg text-sm font-medium transition-all ${
                    activeTab === 'all' 
                      ? 'bg-gradient-to-r from-blue-500 via-purple-500 to-emerald-500 text-white shadow-lg' 
                      : 'text-gray-400 hover:text-white hover:bg-gray-700/50'
                  }`}
                >
                  📚 All ({venueBookings.length + events.length})
                </button>
                <button
                  onClick={() => setActiveTab('venues')}
                  className={`px-5 py-2.5 rounded-lg text-sm font-medium transition-all ${
                    activeTab === 'venues' 
                      ? 'bg-orange-500 text-white shadow-lg' 
                      : 'text-gray-400 hover:text-white hover:bg-gray-700/50'
                  }`}
                >
                  🏛️ Venues ({venueBookings.length})
                </button>
                <button
                  onClick={() => setActiveTab('events')}
                  className={`px-5 py-2.5 rounded-lg text-sm font-medium transition-all ${
                    activeTab === 'events' 
                      ? 'bg-purple-500 text-white shadow-lg' 
                      : 'text-gray-400 hover:text-white hover:bg-gray-700/50'
                  }`}
                >
                  ✨ Events ({events.length})
                </button>
              </div>

              {/* Right: Filters & Actions */}
              <div className="flex flex-wrap items-center gap-3">
                
                {/* 🔥🔥🔥 FIXED: Enhanced Search Box with Button */}
                <div className={`relative flex items-center ${isSearchFocused ? 'ring-2 ring-indigo-500/50 rounded-lg' : ''}`}>
                  <Search size={16} className="absolute left-3 text-gray-500 pointer-events-none" />
                  <input
                    type="text"
                    placeholder="Search bookings..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyPress={handleKeyPress}
                    onFocus={() => setIsSearchFocused(true)}
                    onBlur={() => setIsSearchFocused(false)}
                    className="pl-9 pr-20 py-2 bg-gray-800/50 border border-gray-700 rounded-l-lg text-white text-sm placeholder-gray-500 focus:border-indigo-500 outline-none transition-all w-48 focus:w-56"
                  />
                  
                  {/* Search Button */}
                  {searchQuery.trim() && (
                    <button
                      onClick={handleSearch}
                      className="absolute right-1 px-3 py-1.5 bg-indigo-500 hover:bg-indigo-600 text-white text-xs font-medium rounded-md transition-colors"
                    >
                      Search
                    </button>
                  )}
                  
                  {/* Clear Button */}
                  {activeSearchQuery && (
                    <button
                      onClick={handleClearSearch}
                      className="absolute right-16 p-1 hover:bg-gray-700 rounded text-gray-400 hover:text-white transition-colors"
                      title="Clear search"
                    >
                      <XCircle size={14} />
                    </button>
                  )}
                </div>

                {/* Status Filter */}
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-4 py-2 bg-gray-800/50 border border-gray-700 rounded-lg text-white text-sm focus:border-indigo-500 outline-none appearance-none cursor-pointer"
                >
                  <option value="all">All Status</option>
                  <option value="confirmed">Confirmed</option>
                  <option value="published">Published</option>
                  <option value="pending">Pending</option>
                  <option value="draft">Draft</option>
                  <option value="cancelled">Cancelled</option>
                </select>

                {/* Sort */}
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="px-4 py-2 bg-gray-800/50 border border-gray-700 rounded-lg text-white text-sm focus:border-indigo-500 outline-none appearance-none cursor-pointer"
                >
                  <option value="date-desc">Newest First</option>
                  <option value="date-asc">Oldest First</option>
                  <option value="price-desc">Price: High→Low</option>
                  <option value="price-asc">Price: Low→High</option>
                </select>

                {/* Refresh Button */}
                <button
                  onClick={handleRefresh}
                  disabled={isRefreshing}
                  className="p-2.5 bg-indigo-500/20 border border-indigo-500/30 rounded-lg text-indigo-400 hover:bg-indigo-500/30 transition-all disabled:opacity-50"
                >
                  <RefreshCw size={18} className={isRefreshing ? "animate-spin" : ""} />
                </button>

                {/* Export Button */}
                <button
                  onClick={handleExport}
                  className="p-2.5 bg-emerald-500/20 border border-emerald-500/30 rounded-lg text-emerald-400 hover:bg-emerald-500/30 transition-all"
                >
                  <Download size={18} />
                </button>
              </div>
            </div>
            
            {/* 🔥 NEW: Active Search Indicator */}
            {activeSearchQuery && (
              <div className="mt-3 flex items-center gap-2 text-sm text-indigo-400 bg-indigo-500/10 px-4 py-2 rounded-lg">
                <Search size={14} />
                <span>Showing results for: <strong>"{activeSearchQuery}"</strong></span>
                <button 
                  onClick={handleClearSearch}
                  className="ml-auto text-xs bg-indigo-500/20 hover:bg-indigo-500/30 px-2 py-1 rounded transition-colors"
                >
                  Clear
                </button>
              </div>
            )}
          </div>

          {/* ============================================ */}
          {/* VENUE BOOKINGS SECTION */}
          {/* ============================================ */}
          {(activeTab === 'all' || activeTab === 'venues') && (
            <div className="bg-gray-900/60 backdrop-blur-xl border border-gray-700/50 rounded-3xl p-8 shadow-xl">
              
              {/* Section Header */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-orange-500/20 rounded-xl text-orange-400">
                    <Building2 size={24} />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-white">Venue Bookings</h3>
                    <p className="text-sm text-gray-400">Your reserved venues and spaces</p>
                  </div>
                </div>
                <span className="px-4 py-2 bg-orange-500/20 text-orange-400 rounded-full text-sm font-bold">
                  {filteredVenueBookings.length} records
                </span>
              </div>

              {filteredVenueBookings.length === 0 ? (
                <div className="text-center py-16 border-2 border-dashed border-gray-700 rounded-2xl">
                  <Building2 size={48} className="mx-auto text-gray-600 mb-4" />
                  <h3 className="text-xl font-semibold text-gray-400 mb-2">
                    {activeSearchQuery ? 'No Matching Results Found' : 'No Venue Bookings Found'}
                  </h3>
                  <p className="text-gray-500">
                    {activeSearchQuery 
                      ? `Try adjusting your search term "${activeSearchQuery}"` 
                      : 'Start booking venues to see them here!'}
                  </p>
                  {activeSearchQuery ? (
                    <button 
                      onClick={handleClearSearch}
                      className="mt-4 px-6 py-2 bg-indigo-500 text-white rounded-xl hover:bg-indigo-600 transition-colors"
                    >
                      Clear Search
                    </button>
                  ) : (
                    <button 
                      onClick={() => window.location.href = '#venues'}
                      className="mt-4 px-6 py-2 bg-orange-500 text-white rounded-xl hover:bg-orange-600 transition-colors"
                    >
                      Browse Venues
                    </button>
                  )}
                </div>
              ) : (
                <div className="overflow-x-auto rounded-xl border border-gray-700 bg-gray-900/30">
                  <table className="w-full text-left">
                    <thead className="bg-gray-800/90 sticky top-0">
                      <tr>
                        <th className="py-4 px-5 text-gray-400 font-semibold text-xs uppercase tracking-wider">Venue</th>
                        <th className="py-4 px-5 text-gray-400 font-semibold text-xs uppercase tracking-wider">Date & Time</th>
                        <th className="py-4 px-5 text-gray-400 font-semibold text-xs uppercase tracking-wider hidden md:table-cell">Guests</th>
                        <th className="py-4 px-5 text-gray-400 font-semibold text-xs uppercase tracking-wider">Amount</th>
                        <th className="py-4 px-5 text-gray-400 font-semibold text-xs uppercase tracking-wider">Status</th>
                        <th className="py-4 px-5 text-right text-gray-400 font-semibold text-xs uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-800/50">
                      {filteredVenueBookings.map((booking) => (
                        <React.Fragment key={booking._id}>
                          <tr className="group hover:bg-gray-800/60 transition-colors">
                            <td className="py-4 px-5">
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-lg bg-orange-500/20 flex items-center justify-center flex-shrink-0 text-lg">
                                  🏛️
                                </div>
                                <div>
                                  <p className="font-semibold text-white group-hover:text-orange-400 transition-colors">
                                    {booking.venueName}
                                  </p>
                                  <p className="text-xs text-gray-500 mt-0.5">
                                    ID: {booking._id.slice(-6)}
                                  </p>
                                </div>
                              </div>
                            </td>
                            
                            <td className="py-4 px-5">
                              <div className="text-sm">
                                <div className="flex items-center gap-2 text-white font-medium">
                                  <CalendarDays size={12} className="text-indigo-400" />
                                  {formatDate(booking.eventDate)}
                                </div>
                                <div className="text-gray-500 text-xs mt-1 flex items-center gap-1 pl-5">
                                  <Clock size={10} /> {booking.eventTime || 'TBD'}
                                </div>
                              </div>
                            </td>
                            
                            <td className="py-4 px-5 hidden md:table-cell">
                              <span className="text-gray-300 flex items-center gap-1">
                                <Users size={12} className="text-emerald-400" />
                                {booking.guestCount || 0}
                              </span>
                            </td>
                            
                            <td className="py-4 px-5">
                              <span className="text-emerald-400 font-bold">
                                ₹{(booking.totalPrice || 0).toLocaleString()}
                              </span>
                            </td>
                            
                            <td className="py-4 px-5">
                              <span className={`inline-flex items-center px-3 py-1 rounded-full text-[11px] font-bold border capitalize ${
                                booking.status === 'Confirmed' || booking.status === 'confirmed' ? 'bg-green-500/20 text-green-400 border-green-500/30' :
                                booking.status === 'Pending' || booking.status === 'pending' ? 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30' :
                                booking.status === 'Completed' ? 'bg-blue-500/20 text-blue-400 border-blue-500/30' :
                                'bg-red-500/20 text-red-400 border-red-500/30'
                              }`}>
                                {booking.status || 'Unknown'}
                              </span>
                            </td>
                            
                            <td className="py-4 px-5 text-right">
                              <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                
                                <button 
                                  onClick={() => setDetailModal({ isOpen: true, data: booking, type: 'venue' })}
                                  className="p-1.5 rounded-md hover:bg-blue-500/20 text-blue-400/70 hover:text-blue-400 transition-all"
                                  title="View Details"
                                >
                                  <Eye size={14} />
                                </button>
                                
                                <button 
                                  onClick={() => handleDeleteVenueBooking(booking._id)}
                                  className="p-1.5 rounded-md hover:bg-red-500/20 text-red-400/70 hover:text-red-400 transition-all"
                                  title="Delete"
                                >
                                  <Trash2 size={14} />
                                </button>
                                
                              </div>
                            </td>
                          </tr>

                          {/* Expanded Row (Optional Details) */}
                          {expandedRows[booking._id] && (
                            <tr className="bg-gray-800/30">
                              <td colSpan="6" className="px-5 py-4">
                                <div className="bg-gray-800/50 rounded-xl p-4 space-y-2">
                                  <p className="text-sm"><strong className="text-gray-400">Duration:</strong> {booking.duration || 4} hours</p>
                                  <p className="text-sm"><strong className="text-gray-400">Capacity:</strong> {booking.capacity || 'N/A'} guests</p>
                                  <p className="text-sm"><strong className="text-gray-400">Booked on:</strong> {formatTimeAgo(booking.createdAt)}</p>
                                </div>
                              </td>
                            </tr>
                          )}
                        </React.Fragment>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* ============================================ */}
          {/* EVENTS SECTION */}
          {/* ============================================ */}
          {(activeTab === 'all' || activeTab === 'events') && (
            <div className="bg-gray-900/60 backdrop-blur-xl border border-gray-700/50 rounded-3xl p-8 shadow-xl mt-8">
              
              {/* Section Header */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-purple-500/20 rounded-xl text-purple-400">
                    <CalendarPlus size={24} />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-white">Created Events</h3>
                    <p className="text-sm text-gray-400">Your planned and scheduled events</p>
                  </div>
                </div>
                <span className="px-4 py-2 bg-purple-500/20 text-purple-400 rounded-full text-sm font-bold">
                  {filteredEvents.length} records
                </span>
              </div>

              {filteredEvents.length === 0 ? (
                <div className="text-center py-16 border-2 border-dashed border-gray-700 rounded-2xl">
                  <CalendarPlus size={48} className="mx-auto text-gray-600 mb-4" />
                  <h3 className="text-xl font-semibold text-gray-400 mb-2">
                    {activeSearchQuery ? 'No Matching Results Found' : 'No Events Found'}
                  </h3>
                  <p className="text-gray-500">
                    {activeSearchQuery 
                      ? `Try adjusting your search term "${activeSearchQuery}"` 
                      : 'Create your first event to see it here!'}
                  </p>
                  {activeSearchQuery ? (
                    <button 
                      onClick={handleClearSearch}
                      className="mt-4 px-6 py-2 bg-indigo-500 text-white rounded-xl hover:bg-indigo-600 transition-colors"
                    >
                      Clear Search
                    </button>
                  ) : (
                    <button 
                      onClick={() => window.location.href = '#create'}
                      className="mt-4 px-6 py-2 bg-purple-500 text-white rounded-xl hover:bg-purple-600 transition-colors"
                    >
                      Create Event
                    </button>
                  )}
                </div>
              ) : (
                <div className="overflow-x-auto rounded-xl border border-gray-700 bg-gray-900/30">
                  <table className="w-full text-left">
                    <thead className="bg-gray-800/90 sticky top-0">
                      <tr>
                        <th className="py-4 px-5 text-gray-400 font-semibold text-xs uppercase tracking-wider">Event</th>
                        <th className="py-4 px-5 text-gray-400 font-semibold text-xs uppercase tracking-wider">Date & Time</th>
                        <th className="py-4 px-5 text-gray-400 font-semibold text-xs uppercase tracking-wider hidden md:table-cell">Category</th>
                        <th className="py-4 px-5 text-gray-400 font-semibold text-xs uppercase tracking-wider hidden md:table-cell">Location</th>
                        <th className="py-4 px-5 text-gray-400 font-semibold text-xs uppercase tracking-wider">Status</th>
                        <th className="py-4 px-5 text-right text-gray-400 font-semibold text-xs uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-800/50">
                      {filteredEvents.map((event) => (
                        <tr key={event._id} className="group hover:bg-gray-800/60 transition-colors">
                          <td className="py-4 px-5">
                            <div className="flex items-start gap-3">
                              <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 text-lg ${
                                event.category === 'wedding' ? 'bg-pink-500/20' :
                                event.category === 'professional' ? 'bg-blue-500/20' :
                                event.category === 'college' ? 'bg-emerald-500/20' :
                                'bg-purple-500/20'
                              }`}>
                                {event.category === 'wedding' ? '💒' :
                                 event.category === 'professional' ? '💼' :
                                 event.category === 'college' ? '🎓' : '⭐'}
                              </div>
                              <div className="min-w-0">
                                <p className="font-semibold text-white truncate group-hover:text-purple-400 transition-colors max-w-xs">
                                  {event.title}
                                </p>
                                <p className="text-xs text-gray-500 mt-1 line-clamp-1 max-w-xs">
                                  {event.description?.substring(0, 50)}...
                                </p>
                              </div>
                            </div>
                          </td>
                          
                          <td className="py-4 px-5">
                            <div className="text-sm">
                              <div className="flex items-center gap-2 text-white font-medium">
                                <CalendarDays size={12} className="text-indigo-400" />
                                {formatDate(event.startDate)}
                              </div>
                              <div className="text-gray-500 text-xs mt-1 flex items-center gap-1 pl-5">
                                End: {formatDate(event.endDate)}
                              </div>
                            </div>
                          </td>
                          
                          <td className="py-4 px-5 hidden md:table-cell">
                            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-medium bg-gray-800 text-gray-300 capitalize">
                              {event.category || 'other'}
                            </span>
                          </td>
                          
                          <td className="py-4 px-5 hidden md:table-cell">
                            <span className="text-gray-300 text-sm truncate block max-w-[150px]" title={event.location?.address || event.location?.city}>
                              {event.location?.city || event.location?.address || '-'}
                            </span>
                          </td>
                          
                          <td className="py-4 px-5">
                            <span className={`inline-flex items-center px-3 py-1 rounded-full text-[11px] font-bold border capitalize ${
                              event.status === 'published' ? 'bg-green-500/20 text-green-400 border-green-500/30' :
                              event.status === 'draft' ? 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30' :
                              event.status === 'cancelled' ? 'bg-red-500/20 text-red-400 border-red-500/30' :
                              'bg-gray-500/20 text-gray-400 border-gray-500/30'
                            }`}>
                              {event.status || 'draft'}
                            </span>
                          </td>
                          
                          <td className="py-4 px-5 text-right">
                            <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                              
                              <button 
                                onClick={() => setDetailModal({ isOpen: true, data: event, type: 'event' })}
                                className="p-1.5 rounded-md hover:bg-blue-500/20 text-blue-400/70 hover:text-blue-400 transition-all"
                                title="View Details"
                              >
                                <Eye size={14} />
                              </button>
                              
                              <button 
                                onClick={() => handleDeleteEvent(event._id)}
                                className="p-1.5 rounded-md hover:bg-red-500/20 text-red-400/70 hover:text-red-400 transition-all"
                                title="Delete"
                              >
                                <Trash2 size={14} />
                              </button>
                              
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

        </div>
      </div>

      {/* DETAIL MODAL */}
      <DetailModal 
        isOpen={detailModal.isOpen}
        onClose={() => setDetailModal({ isOpen: false, data: null, type: null })}
        title={detailModal.type === 'venue' ? detailModal.data?.venueName : detailModal.data?.title}
        data={detailModal.data}
        type={detailModal.type}
      />

      <style>{`
        @keyframes fadeIn { 
          from { opacity: 0; transform: scale(0.95); } 
          to { opacity: 1; transform: scale(1); } 
        }
        @keyframes slideUp { 
          from { opacity: 0; transform: translateY(20px); } 
          to { opacity: 1; transform: translateY(0); } 
        }
        .animate-fadeIn { animation: fadeIn 0.2s ease-out; }
        .animate-slideUp { animation: slideUp 0.3s ease-out; }
        .line-clamp-1 { display: -webkit-box; -webkit-line-clamp: 1; -webkit-box-orient: vertical; overflow: hidden; }
      `}</style>
    </>
  );
};

export default BookingHistory;