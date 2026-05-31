import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import EventForm from '../components/EventForm';
import WeatherWidget from '../components/WeatherWidget';
import CalendarView from '../components/CalendarView';
import AIPlanner from '../components/AIPlanner';
import AnalyticsDashboard from '../components/AnalyticsDashboard';
import VenueBooking from '../components/VenueBooking';
import BookingHistory from '../components/BookingHistory';
import { 
  LayoutDashboard, CalendarPlus, Building2, Brain, BarChart3, 
  CalendarDays, LogOut, User, Bell, Settings, Search,
  Sparkles, TrendingUp, Clock, MapPin, ChevronRight, X, Filter, XCircle,
  ClipboardList
} from 'lucide-react';

const Dashboard = () => {   
  const { logout, user } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [events, setEvents] = useState([]);
  const [venueBookings, setVenueBookings] = useState([]);
  const [selectedVenue, setSelectedVenue] = useState(null);
  const [loading, setLoading] = useState(true);
  const [userName, setUserName] = useState('User');
  
  // Mobile sidebar state
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // ============================================
  // 🔍 SEARCH FUNCTIONALITY STATE
  // ============================================
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [searchResults, setSearchResults] = useState({ events: [], bookings: [] });

  useEffect(() => {
    loadAllData();
    
    const userData = JSON.parse(localStorage.getItem('user')) || user;
    setUserName(userData?.name || userData?.username || 'User');

    const handleDataUpdate = () => {
      loadAllData();
    };

    window.addEventListener('eventUpdated', handleDataUpdate);
    window.addEventListener('venueBookingUpdated', handleDataUpdate);
    
    return () => {
      window.removeEventListener('eventUpdated', handleDataUpdate);
      window.removeEventListener('venueBookingUpdated', handleDataUpdate);
    };
  }, []);

  // Load all data from localStorage (UNIFIED)
  const loadAllData = () => {
    try {
      const storedEvents = JSON.parse(localStorage.getItem('events') || '[]');
      const storedBookings = JSON.parse(localStorage.getItem('venueBookings') || '[]');
      
      setEvents(storedEvents);
      setVenueBookings(storedBookings);
      setLoading(false);
    } catch (err) {
      console.error("Error loading dashboard data:", err);
      setLoading(false);
    }
  };

  // ============================================
  // 🔍 SEARCH FUNCTION - FULLY WORKING!
  // ============================================
  const handleSearch = (query) => {
    setSearchQuery(query);

    if (query.trim().length === 0) {
      setShowSearchResults(false);
      setSearchResults({ events: [], bookings: [] });
      return;
    }

    const searchTerm = query.toLowerCase().trim();

    // Search in Events
    const matchedEvents = events.filter(event => {
      return (
        (event.title && event.title.toLowerCase().includes(searchTerm)) ||
        (event.description && event.description.toLowerCase().includes(searchTerm)) ||
        (event.category && event.category.toLowerCase().includes(searchTerm)) ||
        (event.status && event.status.toLowerCase().includes(searchTerm)) ||
        (event.location?.city && event.location.city.toLowerCase().includes(searchTerm)) ||
        (event.location?.address && event.location.address.toLowerCase().includes(searchTerm))
      );
    });

    // Search in Venue Bookings
    const matchedBookings = venueBookings.filter(booking => {
      return (
        (booking.venueName && booking.venueName.toLowerCase().includes(searchTerm)) ||
        (booking.eventName && booking.eventName.toLowerCase().includes(searchTerm)) &&
        (booking.status && booking.status.toLowerCase().includes(searchTerm)) ||
        (booking.eventDate && booking.eventDate.includes(searchTerm))
      );
    });

    setSearchResults({
      events: matchedEvents,
      bookings: matchedBookings
    });
    
    setShowSearchResults(true);
  };

  const clearSearch = () => {
    setSearchQuery('');
    setShowSearchResults(false);
    setSearchResults({ events: [], bookings: [] });
  };

  const handleResultClick = (type, item) => {
    clearSearch();
    if (type === 'event') {
      setActiveTab('calendar');
    } else if (type === 'booking') {
      setActiveTab('venues');
    }
  };

  const handleVenueSelected = (venue, bookingDetails) => {
    setSelectedVenue({ venue, bookingDetails });
    setActiveTab('create');
  };

  const handleVenueBooked = (booking) => {
    setVenueBookings(prev => [...prev, booking]);
  };

  // Tab configuration - WITH NEW BOOKINGS TAB
  const tabs = [
    { id: 'overview', name: 'Overview', icon: LayoutDashboard, color: 'text-blue-400' },
    { id: 'calendar', name: 'Calendar', icon: CalendarDays, color: 'text-indigo-400' },
    { id: 'create', name: 'Create Event', icon: CalendarPlus, color: 'text-purple-400' },
    { id: 'venues', name: 'Book Venues', icon: Building2, color: 'text-orange-400' },
    { id: 'ai', name: 'AI Planner', icon: Brain, color: 'text-emerald-400' },
    { id: 'analytics', name: 'Analytics', icon: BarChart3, color: 'text-pink-400' },
    { id: 'bookings', name: 'My Bookings', icon: ClipboardList, color: 'text-cyan-400' },
  ];

  // Overview content
  const renderOverviewContent = () => {
    const upcomingEvents = events.filter(e => new Date(e.startDate || e.eventDate) > new Date());
    const recentEvents = events.slice(0, 5);
    const recentBookings = venueBookings.slice(0, 5);

    return (
      <div className="space-y-8">
        
        {/* Welcome Banner */}
        <div className="bg-gradient-to-r from-blue-500/20 via-purple-500/20 to-emerald-500/20 backdrop-blur-xl border border-gray-700/50 rounded-3xl p-8 shadow-2xl relative overflow-hidden">
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute -top-20 -right-20 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl"></div>
            <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl"></div>
          </div>
          
          <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
            <div>
              <h2 className="text-3xl font-bold text-white mb-2">
                Welcome back, <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-emerald-400">{userName}!</span> 👋
              </h2>
              <p className="text-gray-400 text-lg">
                You have <span className="text-blue-400 font-semibold">{upcomingEvents.length}</span> upcoming events and <span className="text-orange-400 font-semibold">{venueBookings.length}</span> venue bookings.
              </p>
            </div>
            
            <div className="flex gap-3 flex-shrink-0">
              <button
                onClick={() => setActiveTab('create')}
                className="px-6 py-3 bg-gradient-to-r from-blue-500 via-purple-500 to-emerald-500 text-white font-bold rounded-xl hover:scale-[1.02] transition-transform duration-300 shadow-lg hover:shadow-xl flex items-center gap-2"
              >
                <Sparkles size={18} /> Create Event
              </button>
              <button
                onClick={() => setActiveTab('venues')}
                className="px-6 py-3 bg-gray-800 border border-gray-700 text-white font-bold rounded-xl hover:bg-gray-700 hover:border-gray-600 transition-all flex items-center gap-2"
              >
                <Building2 size={18} /> Book Venue
              </button>
            </div>
          </div>

          <div className="mt-6 relative z-10">
            <WeatherWidget />
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-gray-900/60 backdrop-blur-xl border border-gray-700/50 rounded-2xl p-6 shadow-xl hover:border-blue-500/30 transition-all group">
            <div className="flex items-center justify-between mb-3">
              <CalendarDays size={22} className="text-blue-400 group-hover:scale-110 transition-transform" />
              <span className="text-xs text-blue-400/70 font-medium uppercase tracking-wider">Total</span>
            </div>
            <p className="text-4xl font-bold text-white mb-1">{events.length}</p>
            <p className="text-sm text-gray-400">Total Events</p>
          </div>

          <div className="bg-gray-900/60 backdrop-blur-xl border border-gray-700/50 rounded-2xl p-6 shadow-xl hover:border-orange-500/30 transition-all group">
            <div className="flex items-center justify-between mb-3">
              <Building2 size={22} className="text-orange-400 group-hover:scale-110 transition-transform" />
              <span className="text-xs text-orange-400/70 font-medium uppercase tracking-wider">Venues</span>
            </div>
            <p className="text-4xl font-bold text-white mb-1">{venueBookings.length}</p>
            <p className="text-sm text-gray-400">Venue Bookings</p>
          </div>

          <div className="bg-gray-900/60 backdrop-blur-xl border border-gray-700/50 rounded-2xl p-6 shadow-xl hover:border-emerald-500/30 transition-all group">
            <div className="flex items-center justify-between mb-3">
              <Brain size={22} className="text-emerald-400 group-hover:scale-110 transition-transform" />
              <span className="text-xs text-emerald-400/70 font-medium uppercase tracking-wider">AI Plans</span>
            </div>
            <p className="text-4xl font-bold text-white mb-1">{events.filter(e => e.source === 'ai').length}</p>
            <p className="text-sm text-gray-400">AI Generated</p>
          </div>

          <div className="bg-gray-900/60 backdrop-blur-xl border border-gray-700/50 rounded-2xl p-6 shadow-xl hover:border-pink-500/30 transition-all group">
            <div className="flex items-center justify-between mb-3">
              <BarChart3 size={22} className="text-pink-400 group-hover:scale-110 transition-transform" />
              <span className="text-xs text-pink-400/70 font-medium uppercase tracking-wider">Insights</span>
            </div>
            <p className="text-4xl font-bold text-white mb-1">
              ₹{venueBookings.reduce((sum, b) => sum + (b.totalPrice || 0), 0).toLocaleString()}
            </p>
            <p className="text-sm text-gray-400">Total Revenue</p>
          </div>
        </div>

        {/* Recent Events & Bookings Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* Recent Events Card */}
          <div className="bg-gray-900/60 backdrop-blur-xl border border-gray-700/50 rounded-3xl p-8 shadow-xl">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-indigo-500/20 rounded-xl text-indigo-400">
                  <CalendarDays size={20} />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white">Recent Events</h3>
                  <p className="text-sm text-gray-400">Your latest created events</p>
                </div>
              </div>
              <button 
                onClick={() => setActiveTab('calendar')}
                className="text-sm text-indigo-400 hover:text-indigo-300 transition-colors"
              >
                View All →
              </button>
            </div>

            {loading ? (
              <div className="space-y-4 animate-pulse">
                {[1,2,3].map(i => (
                  <div key={i} className="h-16 bg-gray-800/50 rounded-xl"></div>
                ))}
              </div>
            ) : recentEvents.length > 0 ? (
              <div className="space-y-3">
                {recentEvents.map((event) => (
                  <div 
                    key={event._id}
                    className="group flex items-center justify-between p-4 bg-gray-800/40 rounded-xl hover:bg-gray-800/60 transition-all border border-gray-700/30 hover:border-indigo-500/30 cursor-pointer"
                    onClick={() => setActiveTab('calendar')}
                  >
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${
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
                        <p className="font-semibold text-white truncate group-hover:text-indigo-400 transition-colors">
                          {event.title}
                        </p>
                        <p className="text-xs text-gray-500 mt-0.5">
                          {new Date(event.startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                          {' • '}
                          <span className={`capitalize px-1.5 py-0.5 rounded-full text-[10px] font-bold ${
                            event.status === 'published' ? 'bg-green-500/20 text-green-400' :
                            event.status === 'draft' ? 'bg-yellow-500/20 text-yellow-400' :
                            'bg-red-500/20 text-red-400'
                          }`}>
                            {event.status}
                          </span>
                        </p>
                      </div>
                    </div>
                    <ChevronRight size={18} className="text-gray-600 group-hover:text-indigo-400 transition-colors flex-shrink-0 ml-3" />
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <CalendarDays size={48} className="mx-auto text-gray-700 mb-3" />
                <p className="text-gray-400 font-medium">No events yet</p>
                <button 
                  onClick={() => setActiveTab('create')}
                  className="mt-4 px-6 py-2 bg-indigo-500 text-white rounded-xl hover:bg-indigo-600 transition-colors text-sm font-medium"
                >
                  Create Event
                </button>
              </div>
            )}
          </div>

          {/* Recent Venue Bookings Card */}
          <div className="bg-gray-900/60 backdrop-blur-xl border border-gray-700/50 rounded-3xl p-8 shadow-xl">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-orange-500/20 rounded-xl text-orange-400">
                  <Building2 size={20} />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white">Recent Bookings</h3>
                  <p className="text-sm text-gray-400">Your latest venue reservations</p>
                </div>
              </div>
              <button 
                onClick={() => setActiveTab('venues')}
                className="text-sm text-orange-400 hover:text-orange-300 transition-colors"
              >
                View All →
              </button>
            </div>

            {recentBookings.length > 0 ? (
              <div className="space-y-3">
                {recentBookings.map((booking) => (
                  <div 
                    key={booking._id}
                    className="group flex items-center justify-between p-4 bg-gray-800/40 rounded-xl hover:bg-gray-800/60 transition-all border border-gray-700/30 hover:border-orange-500/30 cursor-pointer"
                    onClick={() => setActiveTab('venues')}
                  >
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <div className="w-10 h-10 rounded-lg bg-orange-500/20 flex items-center justify-center flex-shrink-0">
                        🏛️
                      </div>
                      <div className="min-w-0">
                        <p className="font-semibold text-white truncate group-hover:text-orange-400 transition-colors">
                          {booking.venueName}
                        </p>
                        <p className="text-xs text-gray-500 mt-0.5">
                          {new Date(booking.eventDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                          {' • '}
                          <span className="text-emerald-400 font-medium">₹{booking.totalPrice?.toLocaleString()}</span>
                        </p>
                      </div>
                    </div>
                    <ChevronRight size={18} className="text-gray-600 group-hover:text-orange-400 transition-colors flex-shrink-0 ml-3" />
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <Building2 size={48} className="mx-auto text-gray-700 mb-3" />
                <p className="text-gray-400 font-medium">No bookings yet</p>
                <button 
                  onClick={() => setActiveTab('venues')}
                  className="mt-4 px-6 py-2 bg-orange-500 text-white rounded-xl hover:bg-orange-600 transition-colors text-sm font-medium"
                >
                  Browse Venues
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Quick Access Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          <div 
            onClick={() => setActiveTab('ai')}
            className="bg-gradient-to-br from-emerald-500/10 to-cyan-500/10 backdrop-blur-xl border border-emerald-500/30 rounded-3xl p-8 shadow-xl hover:border-emerald-500/50 transition-all cursor-pointer group hover:scale-[1.02]"
          >
            <div className="flex items-center gap-4 mb-4">
              <div className="p-4 bg-emerald-500/20 rounded-2xl group-hover:scale-110 transition-transform">
                <Brain size={28} className="text-emerald-400" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white">AI Assistant</h3>
                <p className="text-sm text-gray-400">Smart planning tools</p>
              </div>
            </div>
            <p className="text-gray-300 text-sm leading-relaxed">
              Get AI-powered suggestions for event planning, budgeting, timelines, and vendor recommendations.
            </p>
            <div className="mt-4 flex items-center text-emerald-400 text-sm font-medium group-hover:translate-x-2 transition-transform">
              Open AI Planner <ChevronRight size={16} className="ml-1" />
            </div>
          </div>

          <div 
            onClick={() => setActiveTab('analytics')}
            className="bg-gradient-to-br from-pink-500/10 to-purple-500/10 backdrop-blur-xl border border-pink-500/30 rounded-3xl p-8 shadow-xl hover:border-pink-500/50 transition-all cursor-pointer group hover:scale-[1.02]"
          >
            <div className="flex items-center gap-4 mb-4">
              <div className="p-4 bg-pink-500/20 rounded-2xl group-hover:scale-110 transition-transform">
                <BarChart3 size={28} className="text-pink-400" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white">Analytics</h3>
                <p className="text-sm text-gray-400">Data insights</p>
              </div>
            </div>
            <p className="text-gray-300 text-sm leading-relaxed">
              View detailed statistics about your events, revenue trends, and venue utilization.
            </p>
            <div className="mt-4 flex items-center text-pink-400 text-sm font-medium group-hover:translate-x-2 transition-transform">
              Open Analytics <ChevronRight size={16} className="ml-1" />
            </div>
          </div>

          <div 
            onClick={() => setActiveTab('bookings')}
            className="bg-gradient-to-br from-cyan-500/10 to-blue-500/10 backdrop-blur-xl border border-cyan-500/30 rounded-3xl p-8 shadow-xl hover:border-cyan-500/50 transition-all cursor-pointer group hover:scale-[1.02]"
          >
            <div className="flex items-center gap-4 mb-4">
              <div className="p-4 bg-cyan-500/20 rounded-2xl group-hover:scale-110 transition-transform">
                <ClipboardList size={28} className="text-cyan-400" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white">Booking History</h3>
                <p className="text-sm text-gray-400">Complete records</p>
              </div>
            </div>
            <p className="text-gray-300 text-sm leading-relaxed">
              View all your venue bookings and created events in one unified location with powerful filtering and search.
            </p>
            <div className="mt-4 flex items-center text-cyan-400 text-sm font-medium group-hover:translate-x-2 transition-transform">
              Open Bookings <ChevronRight size={16} className="ml-1" />
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Render Tab Content
  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return renderOverviewContent();

      case 'calendar':
        return <CalendarView events={events} />;

      case 'create':
        return <EventForm onEventCreated={loadAllData} selectedVenue={selectedVenue} />;

      case 'venues':
        return (
          <VenueBooking 
            onVenueSelected={handleVenueSelected}
            onBookingSuccess={handleVenueBooked}
          />
        );

      case 'ai':
        return <AIPlanner />;

      case 'analytics':
        return <AnalyticsDashboard />;
        
      case 'bookings':
        return <BookingHistory />;

      default:
        return null;
    }
  };

  // Check URL params for initial tab
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const tab = urlParams.get('tab');
    if (tab && tabs.find(t => t.id === tab)) {
      setActiveTab(tab);
    }
  }, []);

  // Close search results when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (showSearchResults && !e.target.closest('.search-container')) {
        if (!e.target.closest('.search-result-item')) {
          // Optional: uncomment to close on outside click
          // clearSearch();
        }
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showSearchResults]);

  return (
    <div className="min-h-screen relative overflow-hidden" style={{background: '#0f172a'}}>
      
      {/* Background Effects */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-gradient-to-br from-blue-500/10 to-purple-500/10 rounded-full blur-3xl"></div>
        <div className="absolute top-1/3 -right-40 w-96 h-96 bg-gradient-to-br from-emerald-500/10 to-cyan-500/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-1/3 w-96 h-96 bg-gradient-to-br from-purple-500/10 to-pink-500/10 rounded-full blur-3xl"></div>
      </div>

      {/* Header - With Working Search! */}
      <header className="relative z-20 bg-gray-900/80 backdrop-blur-xl border-b border-gray-800/50 sticky top-0">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-4">
            {/* Mobile Menu Button */}
            <button 
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="lg:hidden p-2 hover:bg-gray-800 rounded-lg text-gray-400 hover:text-white transition-all"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>

            {/* Logo */}
            <div className="flex items-center space-x-3">
              <div className="w-11 h-11 bg-gradient-to-br from-blue-500 via-purple-500 to-emerald-500 rounded-xl flex items-center justify-center shadow-lg shadow-purple-500/25">
                <span className="text-xl">🎯</span>
              </div>
              <div className="hidden sm:block">
                <h1 className="text-xl font-bold text-white">Smart Event Planner</h1>
                <p className="text-xs text-gray-500">AI-Powered Management</p>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            
            {/* 🔍 SEARCH BAR - FULLY FUNCTIONAL */}
            <div className="relative search-container hidden md:flex items-center">
              <div className={`relative flex items-center bg-gray-800/50 border rounded-xl transition-all duration-200 ${
                showSearchResults ? 'border-indigo-500 shadow-lg shadow-indigo-500/20 w-96' : 'border-gray-700 w-64 focus-within:w-80 focus-within:border-indigo-500'
              }`}>
                <Search size={16} className="absolute left-3 text-gray-500" />
                <input 
                  type="text" 
                  placeholder="Search events, venues..." 
                  value={searchQuery}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="bg-transparent text-white text-sm outline-none pl-10 pr-10 py-2.5 placeholder-gray-500 w-full"
                  autoFocus={showSearchResults}
                />
                {searchQuery && (
                  <button 
                    onClick={clearSearch}
                    className="absolute right-3 text-gray-500 hover:text-red-400 transition-colors"
                  >
                    <XCircle size={16} />
                  </button>
                )}
              </div>

              {/* Search Results Dropdown */}
              {showSearchResults && (
                <div className="absolute top-full right-0 mt-2 w-96 bg-gray-900/95 backdrop-blur-xl border border-gray-700 rounded-2xl shadow-2xl overflow-hidden z-50 animate-slideDown">
                  
                  {/* Results Header */}
                  <div className="px-4 py-3 bg-gray-800/50 border-b border-gray-700 flex items-center justify-between">
                    <span className="text-sm text-gray-300 font-medium">
                      Found <strong className="text-white">{searchResults.events.length + searchResults.bookings.length}</strong> results
                    </span>
                    <button 
                      onClick={clearSearch}
                      className="text-xs text-gray-500 hover:text-white transition-colors"
                    >
                      ESC to close
                    </button>
                  </div>

                  {/* Results List */}
                  <div className="max-h-80 overflow-y-auto">
                    
                    {(searchResults.events.length === 0 && searchResults.bookings.length === 0) ? (
                      <div className="px-4 py-8 text-center">
                        <Search size={32} className="mx-auto text-gray-600 mb-3" />
                        <p className="text-gray-400 font-medium">No results found</p>
                        <p className="text-gray-500 text-sm mt-1">Try different keywords</p>
                      </div>
                    ) : (
                      <>
                        {/* Events Section */}
                        {searchResults.events.length > 0 && (
                          <div className="py-2">
                            <div className="px-4 py-2 text-xs font-semibold text-indigo-400 uppercase tracking-wider bg-indigo-500/5">
                              Events ({searchResults.events.length})
                            </div>
                            {searchResults.events.slice(0, 5).map((event) => (
                              <div
                                key={event._id}
                                onClick={() => handleResultClick('event', event)}
                                className="search-result-item px-4 py-3 flex items-center gap-3 hover:bg-gray-800/60 cursor-pointer transition-colors"
                              >
                                <div className="w-8 h-8 rounded-lg bg-indigo-500/20 flex items-center justify-center flex-shrink-0 text-sm">
                                  {event.category === 'wedding' ? '💒' : event.category === 'professional' ? '💼' : '📅'}
                                </div>
                                <div className="min-w-0 flex-1">
                                  <p className="text-sm font-medium text-white truncate">
                                    {event.title}
                                  </p>
                                  <p className="text-xs text-gray-500">
                                    {new Date(event.startDate).toLocaleDateString()} • {event.category}
                                  </p>
                                </div>
                                <ChevronRight size={14} className="text-gray-600 flex-shrink-0" />
                              </div>
                            ))}
                          </div>
                        )}

                        {/* Bookings Section */}
                        {searchResults.bookings.length > 0 && (
                          <div className="py-2">
                            <div className="px-4 py-2 text-xs font-semibold text-orange-400 uppercase tracking-wider bg-orange-500/5">
                              Venue Bookings ({searchResults.bookings.length})
                            </div>
                            {searchResults.bookings.slice(0, 5).map((booking) => (
                              <div
                                key={booking._id}
                                onClick={() => handleResultClick('booking', booking)}
                                className="search-result-item px-4 py-3 flex items-center gap-3 hover:bg-gray-800/60 cursor-pointer transition-colors"
                              >
                                <div className="w-8 h-8 rounded-lg bg-orange-500/20 flex items-center justify-center flex-shrink-0 text-sm">
                                  🏛️
                                </div>
                                <div className="min-w-0 flex-1">
                                  <p className="text-sm font-medium text-white truncate">
                                    {booking.venueName}
                                  </p>
                                  <p className="text-xs text-gray-500">
                                    {new Date(booking.eventDate).toLocaleDateString()} • ₹{booking.totalPrice?.toLocaleString()}
                                  </p>
                                </div>
                                <ChevronRight size={14} className="text-gray-600 flex-shrink-0" />
                              </div>
                            ))}
                          </div>
                        )}
                      </>
                    )}
                  </div>

                  {/* View All Link */}
                  {(searchResults.events.length > 5 || searchResults.bookings.length > 5) && (
                    <div className="px-4 py-3 bg-gray-800/30 border-t border-gray-700 text-center">
                      <button 
                        onClick={() => {
                          clearSearch();
                          setActiveTab('calendar');
                        }}
                        className="text-sm text-indigo-400 hover:text-indigo-300 font-medium"
                      >
                        View all results in Calendar →
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Notifications */}
            <button className="relative p-2 hover:bg-gray-800 rounded-xl text-gray-400 hover:text-white transition-all">
              <Bell size={20} />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
            </button>

            {/* User Info */}
            <div className="flex items-center space-x-3 pl-4 border-l border-gray-700">
              <div className="w-9 h-9 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                {userName.charAt(0).toUpperCase()}
              </div>
              <div className="hidden md:block">
                <p className="text-sm font-semibold text-white">{userName}</p>
                <p className="text-xs text-gray-500">Admin</p>
              </div>
              
              {/* Logout Button */}
              <button
                onClick={logout}
                className="p-2 hover:bg-red-500/20 rounded-xl text-gray-400 hover:text-red-400 transition-all"
                title="Logout"
              >
                <LogOut size={18} />
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="relative z-10 flex max-w-7xl mx-auto">
        
        {/* Sidebar Navigation */}
        <aside className={`
          fixed lg:static inset-y-0 left-0 z-30 
          w-72 lg:w-64 bg-gray-900/95 backdrop-blur-xl border-r border-gray-800/50
          transform transition-transform duration-300 ease-in-out
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0
          pt-20 lg:pt-0
        `}>
          <div className="h-full overflow-y-auto p-6 pb-20 lg:pb-6">
            
            <button 
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden absolute top-4 right-4 p-2 hover:bg-gray-800 rounded-lg text-gray-400"
            >
              <X size={20} />
            </button>

            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4 px-3">
              Main Navigation
            </p>

            <nav className="space-y-2">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                
                return (
                  <button
                    key={tab.id}
                    onClick={() => {
                      setActiveTab(tab.id);
                      setSidebarOpen(false);
                    }}
                    className={`
                      w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium text-sm
                      transition-all duration-200 group
                      ${isActive 
                        ? 'bg-gradient-to-r from-blue-500/20 via-purple-500/20 to-emerald-500/20 text-white border border-gray-700/50 shadow-lg' 
                        : 'text-gray-400 hover:text-white hover:bg-gray-800/50'
                      }
                    `}
                  >
                    <Icon size={20} className={`${isActive ? tab.color : 'group-hover:' + tab.color} transition-colors`} />
                    <span className="flex-1 text-left">{tab.name}</span>
                    
                    {isActive && (
                      <div className="w-2 h-2 rounded-full bg-gradient-to-r from-blue-400 to-emerald-400 animate-pulse"></div>
                    )}
                  </button>
                );
              })}
            </nav>

            <div className="my-6 border-t border-gray-800"></div>

            <div className="space-y-3">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider px-3">
                Quick Stats
              </p>
              
              <div className="bg-gray-800/30 rounded-xl p-4 border border-gray-800">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-400">Events</span>
                  <span className="font-bold text-white">{events.length}</span>
                </div>
              </div>
              
              <div className="bg-gray-800/30 rounded-xl p-4 border border-gray-800">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-400">Bookings</span>
                  <span className="font-bold text-white">{venueBookings.length}</span>
                </div>
              </div>
            </div>
          </div>
        </aside>

        {/* Mobile Overlay */}
        {sidebarOpen && (
          <div 
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-20 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          ></div>
        )}

        {/* Main Content Area */}
        <main className="flex-1 min-h-screen p-6 lg:p-8">
          {activeTab !== 'overview' && (
            <div className="mb-8">
              <div className="flex items-center gap-3">
                {(() => {
                  const currentTab = tabs.find(t => t.id === activeTab);
                  const Icon = currentTab?.icon;
                  return Icon ? <Icon size={28} className={currentTab?.color} /> : null;
                })()}
                <div>
                  <h2 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-purple-400 to-emerald-400">
                    {tabs.find(t => t.id === activeTab)?.name || 'Page'}
                  </h2>
                  <p className="text-gray-400 text-sm mt-1">
                    {activeTab === 'create' && 'Create and manage your events'}
                    {activeTab === 'venues' && 'Browse and book perfect venues'}
                    {activeTab === 'ai' && 'Get AI-powered planning assistance'}
                    {activeTab === 'analytics' && 'View detailed insights and statistics'}
                    {activeTab === 'calendar' && 'Visual calendar view of all activities'}
                    {activeTab === 'bookings' && 'View your complete booking history'}
                  </p>
                </div>
              </div>
            </div>
          )}

          <div className="animate-fadeIn">
            {renderTabContent()}
          </div>
        </main>
      </div>

      {/* Floating Action Button (Mobile) */}
      <button
        onClick={() => setActiveTab('create')}
        className="fixed bottom-6 right-6 z-40 lg:hidden w-14 h-14 bg-gradient-to-r from-blue-500 via-purple-500 to-emerald-500 rounded-full shadow-2xl hover:shadow-3xl transform hover:scale-110 transition-all duration-300 flex items-center justify-center text-white"
      >
        <Sparkles size={24} />
      </button>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }

        @keyframes slideDown {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-slideDown {
          animation: slideDown 0.2s ease-out;
        }
        
        aside::-webkit-scrollbar {
          width: 4px;
        }
        aside::-webkit-scrollbar-track {
          background: transparent;
        }
        aside::-webkit-scrollbar-thumb {
          background: rgba(107, 114, 128, 0.3);
          border-radius: 2px;
        }
        aside::-webkit-scrollbar-thumb:hover {
          background: rgba(107, 114, 128, 0.5);
        }
      `}</style>
    </div>
  );
};

export default Dashboard;