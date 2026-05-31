import React, { useState, useEffect } from 'react';
import { Bar, Line, Pie } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { 
  RefreshCw, AlertTriangle, TrendingUp, CalendarDays, MapPin, Users, DollarSign,
  BarChart3, PieChart as PieChartIcon, Activity, Building2, Eye
} from 'lucide-react';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

// ============================================
// ANALYTICS DASHBOARD - UNIFIED DATA VERSION
// ============================================
const AnalyticsDashboard = () => {
  
  // ✅ FIX #1: SINGLE SOURCE OF TRUTH - Consistent Keys
  const EVENTS_KEY = 'events';           // Same as EventForm & AIPlanner
  const VENUE_BOOKINGS_KEY = 'venueBookings'; // Same as VenueBooking

  const [storedVenueBookings, setStoredVenueBookings] = useState([]);
  const [storedEvents, setStoredEvents] = useState([]);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(null);

  // ✅ FIX #2: Simple, direct data loading - NO multiple keys confusion
  const loadAllData = () => {
    try {
      // Load Events from SINGLE source
      const eventsData = localStorage.getItem(EVENTS_KEY);
      let events = [];
      if (eventsData) {
        try {
          const parsed = JSON.parse(eventsData);
          if (Array.isArray(parsed)) {
            events = parsed;
            console.log(`✅ Loaded ${events.length} events from "${EVENTS_KEY}"`);
          }
        } catch (e) {
          console.warn("⚠️ Failed to parse events:", e);
        }
      }

      // Load Venue Bookings from SINGLE source
      const bookingsData = localStorage.getItem(VENUE_BOOKINGS_KEY);
      let bookings = [];
      if (bookingsData) {
        try {
          const parsed = JSON.parse(bookingsData);
          if (Array.isArray(parsed)) {
            bookings = parsed;
            console.log(`✅ Loaded ${bookings.length} venue bookings from "${VENUE_BOOKINGS_KEY}"`);
          }
        } catch (e) {
          console.warn("⚠️ Failed to parse venue bookings:", e);
        }
      }

      // Remove duplicates by _id (safety measure)
      const uniqueEvents = Array.from(new Map(events.map(e => [e._id, e])).values());
      const uniqueBookings = Array.from(new Map(bookings.map(b => [b._id, b])).values());

      setStoredEvents(uniqueEvents);
      setStoredVenueBookings(uniqueBookings);
      setLastUpdated(new Date());
      
    } catch (err) {
      console.error("❌ Error loading analytics data:", err);
      // Set empty arrays on error (not sample data)
      setStoredEvents([]);
      setStoredVenueBookings([]);
    }
  };

  // ✅ FIX #3: Load on mount + Listen for REAL update events
  useEffect(() => {
    console.log("🔄 Initializing AnalyticsDashboard...");
    loadAllData();

    // Listen for updates from OTHER components
    const handleEventUpdate = () => {
      console.log("📢 eventUpdated detected - refreshing analytics...");
      loadAllData();
    };
    
    const handleVenueUpdate = () => {
      console.log("📢 venueBookingUpdated detected - refreshing analytics...");
      loadAllData();
    };

    // These events are dispatched by EventForm, AIPlanner, and VenueBooking
    window.addEventListener('eventUpdated', handleEventUpdate);
    window.addEventListener('venueBookingUpdated', handleVenueUpdate);
    
    // Also listen for storage changes (for multi-tab support)
    window.addEventListener('storage', handleEventUpdate);

    return () => {
      window.removeEventListener('eventUpdated', handleEventUpdate);
      window.removeEventListener('venueBookingUpdated', handleVenueUpdate);
      window.removeEventListener('storage', handleEventUpdate);
    };
  }, []);

  // Handle manual refresh
  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      loadAllData();
      setIsRefreshing(false);
      showToast('📊 Data refreshed successfully!', 'success');
    }, 500);
  };

  // Toast state (simple version)
  const [toast, setToast] = useState(null);
  const showToast = (message, type = 'info') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  // Use stored data directly (no props needed - reads from localStorage)
  const allEvents = storedEvents;
  const allVenueBookings = storedVenueBookings;

  // Calculate real stats from events
  const eventStats = {
    totalEvents: allEvents.length,
    upcomingEvents: allEvents.filter(e => {
      try {
        return new Date(e.startDate || e.eventDate) > new Date();
      } catch { return false; }
    }).length,
    completedEvents: allEvents.filter(e => {
      try {
        return new Date(e.endDate || e.eventDate) < new Date();
      } catch { return false; }
    }).length,
    cancelledEvents: allEvents.filter(e => e.status === 'cancelled').length,
    categories: {
      personal: allEvents.filter(e => e.category === 'personal').length,
      college: allEvents.filter(e => e.category === 'college').length,
      professional: allEvents.filter(e => e.category === 'professional').length,
      wedding: allEvents.filter(e => e.category === 'wedding').length,
      other: allEvents.filter(e => !['personal', 'college', 'professional', 'wedding'].includes(e.category)).length,
    },
    totalGuests: allEvents.reduce((sum, e) => sum + (e.guestCount || 0), 0),
  };

  // Calculate venue booking stats
  const venueStats = {
    totalBookings: allVenueBookings.length,
    activeBookings: allVenueBookings.filter(b => {
      try {
        return new Date(b.eventDate) > new Date() && b.status !== 'Cancelled' && b.status !== 'cancelled';
      } catch { return false; }
    }).length,
    completedBookings: allVenueBookings.filter(b => {
      try {
        return new Date(b.eventDate) < new Date();
      } catch { return false; }
    }).length,
    venues: [...new Set(allVenueBookings.map(b => b.venueName))].length,
    totalCapacity: allVenueBookings.reduce((sum, b) => sum + (b.guestCount || 0), 0),
    averageCapacity: allVenueBookings.length > 0 
      ? Math.round(allVenueBookings.reduce((sum, b) => sum + (b.guestCount || 0), 0) / allVenueBookings.length) 
      : 0,
    totalRevenue: allVenueBookings.reduce((sum, b) => sum + (b.totalPrice || 0), 0),
  };

  // Group events by month for bar chart
  const eventsByMonth = allEvents.reduce((acc, event) => {
    try {
      const date = new Date(event.createdAt || event.startDate || event.eventDate);
      const month = date.toLocaleString('default', { month: 'short' });
      acc[month] = (acc[month] || 0) + 1;
    } catch (e) {}
    return acc;
  }, {});

  // Group venue bookings by month
  const bookingsByMonth = allVenueBookings.reduce((acc, booking) => {
    try {
      const date = new Date(booking.createdAt || booking.eventDate);
      const month = date.toLocaleString('default', { month: 'short' });
      acc[month] = (acc[month] || 0) + 1;
    } catch (e) {}
    return acc;
  }, {});

  const barData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
    datasets: [
      {
        label: 'Events Created',
        data: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'].map(month => eventsByMonth[month] || 0),
        backgroundColor: 'rgba(99, 102, 241, 0.6)',
        borderColor: 'rgba(99, 102, 241, 1)',
        borderWidth: 1,
        borderRadius: 4,
      },
      {
        label: 'Venue Bookings',
        data: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'].map(month => bookingsByMonth[month] || 0),
        backgroundColor: 'rgba(16, 185, 129, 0.6)',
        borderColor: 'rgba(16, 185, 129, 1)',
        borderWidth: 1,
        borderRadius: 4,
      },
    ],
  };

  // Calculate events over time (last 4 weeks)
  const now = new Date();
  const weeks = [];
  for (let i = 3; i >= 0; i--) {
    const weekStart = new Date(now);
    weekStart.setDate(now.getDate() - (i * 7));
    weeks.push(weekStart);
  }

  const eventsByWeek = weeks.map((week) => {
    const weekEnd = new Date(week);
    weekEnd.setDate(week.getDate() + 7);
    return allEvents.filter(event => {
      try {
        const eventDate = new Date(event.createdAt || event.startDate || event.eventDate);
        return eventDate >= week && eventDate < weekEnd;
      } catch { return false; }
    }).length;
  });

  const bookingsByWeek = weeks.map((week) => {
    const weekEnd = new Date(week);
    weekEnd.setDate(week.getDate() + 7);
    return allVenueBookings.filter(booking => {
      try {
        const bookingDate = new Date(booking.createdAt || booking.eventDate);
        return bookingDate >= week && bookingDate < weekEnd;
      } catch { return false; }
    }).length;
  });

  const lineData = {
    labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
    datasets: [
      {
        label: 'Events',
        data: eventsByWeek,
        fill: true,
        backgroundColor: 'rgba(99, 102, 241, 0.1)',
        borderColor: 'rgba(99, 102, 241, 1)',
        tension: 0.4,
        pointBackgroundColor: 'rgba(99, 102, 241, 1)',
        pointBorderColor: '#fff',
        pointBorderWidth: 2,
        pointRadius: 5,
      },
      {
        label: 'Bookings',
        data: bookingsByWeek,
        fill: true,
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
        borderColor: 'rgba(16, 185, 129, 1)',
        tension: 0.4,
        pointBackgroundColor: 'rgba(16, 185, 129, 1)',
        pointBorderColor: '#fff',
        pointBorderWidth: 2,
        pointRadius: 5,
      },
    ],
  };

  // Event Categories Pie Chart
  const pieData = {
    labels: ['Personal', 'College', 'Professional', 'Wedding', 'Other'],
    datasets: [
      {
        label: 'Events',
        data: [
          eventStats.categories.personal,
          eventStats.categories.college,
          eventStats.categories.professional,
          eventStats.categories.wedding,
          eventStats.categories.other,
        ],
        backgroundColor: [
          'rgba(244, 63, 94, 0.7)',
          'rgba(251, 146, 60, 0.7)',
          'rgba(168, 85, 247, 0.7)',
          'rgba(34, 211, 238, 0.7)',
          'rgba(156, 163, 175, 0.7)',
        ],
        borderColor: [
          'rgba(244, 63, 94, 1)',
          'rgba(251, 146, 60, 1)',
          'rgba(168, 85, 247, 1)',
          'rgba(34, 211, 238, 1)',
          'rgba(156, 163, 175, 1)',
        ],
        borderWidth: 2,
        hoverOffset: 10,
      },
    ],
  };

  // Venue Types Pie Chart
  const venueTypes = allVenueBookings.reduce((acc, booking) => {
    const type = booking.venueName || 'Unknown Venue';
    acc[type] = (acc[type] || 0) + 1;
    return acc;
  }, {});

  const venuePieData = {
    labels: Object.keys(venueTypes).length > 0 ? Object.keys(venueTypes) : ['No Bookings'],
    datasets: [
      {
        label: 'Venues',
        data: Object.keys(venueTypes).length > 0 ? Object.values(venueTypes) : [1],
        backgroundColor: [
          'rgba(249, 115, 22, 0.7)',
          'rgba(168, 85, 247, 0.7)',
          'rgba(34, 211, 238, 0.7)',
          'rgba(74, 222, 128, 0.7)',
          'rgba(250, 204, 21, 0.7)',
          'rgba(96, 165, 250, 0.7)',
          'rgba(248, 113, 113, 0.7)',
          'rgba(236, 72, 153, 0.7)',
        ].slice(0, Math.max(Object.keys(venueTypes).length, 1)),
        borderWidth: 2,
        hoverOffset: 10,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: true,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          color: 'rgba(255, 255, 255, 0.9)',
          font: { size: 12 },
          padding: 16,
          usePointStyle: true,
          pointStyle: 'circle',
        }
      },
      tooltip: {
        backgroundColor: 'rgba(17, 24, 39, 0.95)',
        titleColor: '#fff',
        bodyColor: 'rgba(255, 255, 255, 0.9)',
        borderColor: 'rgba(255, 255, 255, 0.1)',
        borderWidth: 1,
        cornerRadius: 8,
        padding: 12,
      },
    },
    scales: {
      x: {
        ticks: { color: 'rgba(255, 255, 255, 0.7)', font: { size: 11 } },
        grid: { color: 'rgba(255, 255, 255, 0.05)', drawBorder: false }
      },
      y: {
        beginAtZero: true,
        ticks: { color: 'rgba(255, 255, 255, 0.7)', font: { size: 11 }, stepSize: 1 },
        grid: { color: 'rgba(255, 255, 255, 0.05)', drawBorder: false }
      }
    },
    interaction: { intersect: false, mode: 'index' },
  };

  const pieChartOptions = {
    responsive: true,
    maintainAspectRatio: true,
    plugins: {
      legend: {
        position: 'right',
        labels: {
          color: 'rgba(255, 255, 255, 0.9)',
          font: { size: 11 },
          padding: 16,
          usePointStyle: true,
          pointStyle: 'circle',
        }
      },
      tooltip: {
        backgroundColor: 'rgba(17, 24, 39, 0.95)',
        titleColor: '#fff',
        bodyColor: 'rgba(255, 255, 255, 0.9)',
        cornerRadius: 8,
        padding: 12,
      },
    },
  };

  // Format time ago helper
  const formatTimeAgo = (dateString) => {
    try {
      const date = new Date(dateString);
      const now = new Date();
      const diffTime = Math.abs(now - date);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      if (diffDays === 0) return 'Today';
      if (diffDays === 1) return 'Yesterday';
      if (diffDays < 7) return `${diffDays} days ago`;
      if (diffDays < 30) {
        const weeks = Math.floor(diffDays / 7);
        return `${weeks} week${weeks > 1 ? 's' : ''} ago`;
      }
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    } catch {
      return 'Unknown';
    }
  };

  // Toast Component (inline for simplicity)
  const Toast = ({ message, type }) => (
    <div className={`fixed bottom-6 right-6 ${
      type === 'success' ? 'bg-green-500/20 border-green-500' : 
      type === 'error' ? 'bg-red-500/20 border-red-500' : 
      'bg-blue-500/20 border-blue-500'
    } border text-white px-6 py-3 rounded-xl shadow-lg z-50 flex items-center gap-3 animate-slideUp`}>
      {type === 'success' ? '✅' : type === 'error' ? '❌' : 'ℹ️'}
      <span>{message}</span>
    </div>
  );

  return (
    <div className="min-h-screen p-6 relative overflow-hidden" style={{background: '#0f172a'}}>
      {/* Background Effects - Matching VenueBooking Exactly */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-gradient-to-br from-blue-500/10 to-purple-500/10 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 -right-40 w-96 h-96 bg-gradient-to-br from-emerald-500/10 to-cyan-500/10 rounded-full blur-3xl"></div>
      </div>

      {/* Toast Notification */}
      {toast && <Toast message={toast.message} type={toast.type} />}

      <div className="max-w-7xl mx-auto relative z-10 space-y-8">
        
        {/* HEADER - Matching VenueBooking Style */}
        <div className="text-center mb-10">
          <h2 className="text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-purple-400 to-emerald-400 mb-3">
            📊 Analytics Dashboard
          </h2>
          <p className="text-gray-400 text-lg">Real-time insights into your events and venue bookings</p>
        </div>

        {/* Main Dashboard Container */}
        <div className="bg-gray-900/60 backdrop-blur-xl border border-gray-700/50 rounded-3xl p-8 shadow-2xl">
          
          {/* Header with Refresh Button */}
          <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-indigo-500/20 rounded-xl text-indigo-400">
                <BarChart3 size={24} />
              </div>
              <div>
                <h3 className="text-2xl font-semibold text-white">Overview Statistics</h3>
                <p className="text-gray-400 text-sm">
                  {lastUpdated && `Last updated: ${lastUpdated.toLocaleTimeString()}`}
                </p>
              </div>
            </div>
            
            <button 
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl border border-indigo-500/30 bg-indigo-500/10 text-indigo-400 hover:bg-indigo-500/20 transition-all disabled:opacity-50"
            >
              <RefreshCw size={18} className={isRefreshing ? "animate-spin" : ""} />
              Sync Data
            </button>
          </div>

          {/* Event Stats Cards - Row 1 */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
            <div className="bg-gradient-to-br from-blue-500/20 to-blue-500/5 backdrop-blur-md p-5 rounded-2xl border border-blue-500/20 hover:border-blue-500/40 transition-all group">
              <div className="flex items-center justify-between mb-2">
                <CalendarDays className="w-5 h-5 text-blue-400 group-hover:scale-110 transition-transform" />
                <span className="text-xs text-blue-400/70 font-medium">TOTAL</span>
              </div>
              <p className="text-3xl font-bold text-white">{eventStats.totalEvents}</p>
              <p className="text-sm text-gray-400 mt-1">Total Events</p>
            </div>

            <div className="bg-gradient-to-br from-green-500/20 to-green-500/5 backdrop-blur-md p-5 rounded-2xl border border-green-500/20 hover:border-green-500/40 transition-all group">
              <div className="flex items-center justify-between mb-2">
                <TrendingUp className="w-5 h-5 text-green-400 group-hover:scale-110 transition-transform" />
                <span className="text-xs text-green-400/70 font-medium">UPCOMING</span>
              </div>
              <p className="text-3xl font-bold text-white">{eventStats.upcomingEvents}</p>
              <p className="text-sm text-gray-400 mt-1">Active Events</p>
            </div>

            <div className="bg-gradient-to-br from-emerald-500/20 to-emerald-500/5 backdrop-blur-md p-5 rounded-2xl border border-emerald-500/20 hover:border-emerald-500/40 transition-all group">
              <div className="flex items-center justify-between mb-2">
                <Check className="w-5 h-5 text-emerald-400 group-hover:scale-110 transition-transform" />
                <span className="text-xs text-emerald-400/70 font-medium">COMPLETED</span>
              </div>
              <p className="text-3xl font-bold text-white">{eventStats.completedEvents}</p>
              <p className="text-sm text-gray-400 mt-1">Finished Events</p>
            </div>

            <div className="bg-gradient-to-br from-red-500/20 to-red-500/5 backdrop-blur-md p-5 rounded-2xl border border-red-500/20 hover:border-red-500/40 transition-all group">
              <div className="flex items-center justify-between mb-2">
                <AlertTriangle className="w-5 h-5 text-red-400 group-hover:scale-110 transition-transform" />
                <span className="text-xs text-red-400/70 font-medium">CANCELLED</span>
              </div>
              <p className="text-3xl font-bold text-white">{eventStats.cancelledEvents}</p>
              <p className="text-sm text-gray-400 mt-1">Cancelled Events</p>
            </div>

            <div className="bg-gradient-to-br from-violet-500/20 to-violet-500/5 backdrop-blur-md p-5 rounded-2xl border border-violet-500/20 hover:border-violet-500/40 transition-all group">
              <div className="flex items-center justify-between mb-2">
                <Users className="w-5 h-5 text-violet-400 group-hover:scale-110 transition-transform" />
                <span className="text-xs text-violet-400/70 font-medium">GUESTS</span>
              </div>
              <p className="text-3xl font-bold text-white">{eventStats.totalGuests.toLocaleString()}</p>
              <p className="text-sm text-gray-400 mt-1">Total Guests</p>
            </div>
          </div>

          {/* Venue Stats Cards - Row 2 */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-gradient-to-br from-amber-500/20 to-amber-500/5 backdrop-blur-md p-5 rounded-2xl border border-amber-500/20 hover:border-amber-500/40 transition-all group">
              <div className="flex items-center justify-between mb-2">
                <Building2 className="w-5 h-5 text-amber-400 group-hover:scale-110 transition-transform" />
                <span className="text-xs text-amber-400/70 font-medium">BOOKINGS</span>
              </div>
              <p className="text-3xl font-bold text-white">{venueStats.totalBookings}</p>
              <p className="text-sm text-gray-400 mt-1">Total Bookings</p>
            </div>

            <div className="bg-gradient-to-br from-cyan-500/20 to-cyan-500/5 backdrop-blur-md p-5 rounded-2xl border border-cyan-500/20 hover:border-cyan-500/40 transition-all group">
              <div className="flex items-center justify-between mb-2">
                <Activity className="w-5 h-5 text-cyan-400 group-hover:scale-110 transition-transform" />
                <span className="text-xs text-cyan-400/70 font-medium">ACTIVE</span>
              </div>
              <p className="text-3xl font-bold text-white">{venueStats.activeBookings}</p>
              <p className="text-sm text-gray-400 mt-1">Active Bookings</p>
            </div>

            <div className="bg-gradient-to-br from-indigo-500/20 to-indigo-500/5 backdrop-blur-md p-5 rounded-2xl border border-indigo-500/20 hover:border-indigo-500/40 transition-all group">
              <div className="flex items-center justify-between mb-2">
                <MapPin className="w-5 h-5 text-indigo-400 group-hover:scale-110 transition-transform" />
                <span className="text-xs text-indigo-400/70 font-medium">VENUES</span>
              </div>
              <p className="text-3xl font-bold text-white">{venueStats.venues}</p>
              <p className="text-sm text-gray-400 mt-1">Unique Venues</p>
            </div>

            <div className="bg-gradient-to-br from-green-500/20 to-green-500/5 backdrop-blur-md p-5 rounded-2xl border border-green-500/20 hover:border-green-500/40 transition-all group">
              <div className="flex items-center justify-between mb-2">
                <DollarSign className="w-5 h-5 text-green-400 group-hover:scale-110 transition-transform" />
                <span className="text-xs text-green-400/70 font-medium">REVENUE</span>
              </div>
              <p className="text-3xl font-bold text-white">₹{venueStats.totalRevenue.toLocaleString()}</p>
              <p className="text-sm text-gray-400 mt-1">Total Revenue</p>
            </div>
          </div>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* Bar Chart - Monthly Overview */}
          <div className="bg-gray-900/60 backdrop-blur-xl border border-gray-700/50 p-6 rounded-2xl shadow-xl hover:border-gray-600/50 transition-all">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                <BarChart3 size={18} className="text-blue-400" /> Monthly Overview
              </h3>
              <span className="text-xs text-gray-500 bg-gray-800 px-3 py-1 rounded-full">2024</span>
            </div>
            <div className="h-[300px]">
              <Bar data={barData} options={chartOptions} />
            </div>
          </div>

          {/* Pie Chart - Event Categories */}
          <div className="bg-gray-900/60 backdrop-blur-xl border border-gray-700/50 p-6 rounded-2xl shadow-xl hover:border-gray-600/50 transition-all">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                <PieChartIcon size={18} className="text-purple-400" /> Event Categories
              </h3>
              <span className="text-xs text-gray-500 bg-gray-800 px-3 py-1 rounded-full">{eventStats.totalEvents} Total</span>
            </div>
            <div className="h-[300px]">
              <Pie data={pieData} options={pieChartOptions} />
            </div>
          </div>

          {/* Pie Chart - Venue Types */}
          <div className="bg-gray-900/60 backdrop-blur-xl border border-gray-700/50 p-6 rounded-2xl shadow-xl hover:border-gray-600/50 transition-all">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                <Building2 size={18} className="text-amber-400" /> Venue Distribution
              </h3>
              <span className="text-xs text-gray-500 bg-gray-800 px-3 py-1 rounded-full">{venueStats.venues} Venues</span>
            </div>
            <div className="h-[300px]">
              <Pie data={venuePieData} options={pieChartOptions} />
            </div>
          </div>

          {/* Line Chart - Trends */}
          <div className="lg:col-span-2 bg-gray-900/60 backdrop-blur-xl border border-gray-700/50 p-6 rounded-2xl shadow-xl hover:border-gray-600/50 transition-all">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                <Activity size={18} className="text-emerald-400" /> Trends (Last 4 Weeks)
              </h3>
              <div className="flex gap-4 text-xs">
                <span className="flex items-center gap-1">
                  <span className="w-3 h-3 rounded-full bg-indigo-500"></span> Events
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-3 h-3 rounded-full bg-emerald-500"></span> Bookings
                </span>
              </div>
            </div>
            <div className="h-[350px]">
              <Line data={lineData} options={chartOptions} />
            </div>
          </div>
        </div>

        {/* Recent Activity Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* Recent Events */}
          <div className="bg-gray-900/60 backdrop-blur-xl border border-gray-700/50 p-6 rounded-2xl shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                <CalendarDays size={18} className="text-orange-400" /> Recent Events
              </h3>
              <span className="text-xs text-gray-500 bg-gray-800 px-3 py-1 rounded-full">
                {Math.min(allEvents.length, 5)} of {allEvents.length}
              </span>
            </div>
            
            <div className="space-y-3 max-h-[350px] overflow-y-auto pr-2" style={{scrollbarWidth: 'thin', scrollbarColor: 'rgba(107,114,128,0.4) transparent'}}>
              {allEvents.length > 0 ? (
                allEvents.slice(0, 5).map((event) => (
                  <div 
                    key={event._id} 
                    className="flex justify-between items-center p-4 bg-gray-800/40 rounded-xl hover:bg-gray-800/60 transition-all border border-gray-700/30 hover:border-gray-600/50 group"
                  >
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <div className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${
                        event.status === 'published' ? 'bg-green-400' :
                        event.status === 'draft' ? 'bg-yellow-400' :
                        event.status === 'cancelled' ? 'bg-red-400' :
                        'bg-gray-400'
                      }`} />
                      <div className="min-w-0 flex-1">
                        <p className="text-white font-medium truncate group-hover:text-blue-400 transition-colors">
                          {event.title || event.eventName || 'Untitled Event'}
                        </p>
                        <p className="text-xs text-gray-500 mt-0.5 capitalize">
                          {event.category || 'other'} • {event.guestCount || 0} guests
                        </p>
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0 ml-4">
                      <span className="text-sm text-gray-400 block">{formatTimeAgo(event.createdAt || event.startDate)}</span>
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold border capitalize mt-1 ${
                        event.status === 'published' ? 'bg-green-500/20 text-green-400 border-green-500/30' :
                        event.status === 'draft' ? 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30' :
                        event.status === 'cancelled' ? 'bg-red-500/20 text-red-400 border-red-500/30' :
                        'bg-gray-500/20 text-gray-400 border-gray-500/30'
                      }`}>
                        {event.status || 'draft'}
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="flex flex-col items-center justify-center py-12 text-gray-500">
                  <CalendarDays size={48} className="mb-3 opacity-50" />
                  <p>No events found</p>
                  <p className="text-xs mt-1">Create events to see analytics</p>
                </div>
              )}
            </div>
          </div>

          {/* Recent Venue Bookings */}
          <div className="bg-gray-900/60 backdrop-blur-xl border border-gray-700/50 p-6 rounded-2xl shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                <MapPin size={18} className="text-pink-400" /> Recent Bookings
              </h3>
              <span className="text-xs text-gray-500 bg-gray-800 px-3 py-1 rounded-full">
                {Math.min(allVenueBookings.length, 5)} of {allVenueBookings.length}
              </span>
            </div>
            
            <div className="space-y-3 max-h-[350px] overflow-y-auto pr-2" style={{scrollbarWidth: 'thin', scrollbarColor: 'rgba(107,114,128,0.4) transparent'}}>
              {allVenueBookings.length > 0 ? (
                allVenueBookings.slice(0, 5).map((booking) => (
                  <div 
                    key={booking._id} 
                    className="flex justify-between items-center p-4 bg-gray-800/40 rounded-xl hover:bg-gray-800/60 transition-all border border-gray-700/30 hover:border-gray-600/50 group"
                  >
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <div className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${
                        booking.status === 'Confirmed' ? 'bg-green-400' :
                        booking.status === 'confirmed' ? 'bg-green-400' :
                        booking.status === 'Pending' ? 'bg-yellow-400' :
                        booking.status === 'pending' ? 'bg-yellow-400' :
                        'bg-gray-400'
                      }`} />
                      <div className="min-w-0 flex-1">
                        <p className="text-white font-medium truncate group-hover:text-pink-400 transition-colors">
                          {booking.venueName || 'Unknown Venue'}
                        </p>
                        <p className="text-xs text-gray-500 mt-0.5">
                          {booking.guestCount || 0} guests • {formatTimeAgo(booking.eventDate)}
                        </p>
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0 ml-4">
                      <span className="text-sm font-semibold text-green-400 block">
                        ₹{(booking.totalPrice || 0).toLocaleString()}
                      </span>
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold border capitalize mt-1 ${
                        booking.status === 'Confirmed' || booking.status === 'confirmed' ? 'bg-green-500/20 text-green-400 border-green-500/30' :
                        booking.status === 'Pending' || booking.status === 'pending' ? 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30' :
                        'bg-gray-500/20 text-gray-400 border-gray-500/30'
                      }`}>
                        {booking.status || 'unknown'}
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="flex flex-col items-center justify-center py-12 text-gray-500">
                  <Building2 size={48} className="mb-3 opacity-50" />
                  <p>No venue bookings found</p>
                  <p className="text-xs mt-1">Book venues to see analytics</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer Summary Stats */}
        <div className="bg-gray-900/60 backdrop-blur-xl border border-gray-700/50 p-6 rounded-2xl shadow-xl">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            <div className="text-center p-4 bg-gray-800/30 rounded-xl border border-gray-800">
              <div className="text-2xl font-bold text-blue-400">{eventStats.totalEvents}</div>
              <div className="text-[10px] text-gray-500 uppercase tracking-wider mt-1">Total Events</div>
            </div>
            <div className="text-center p-4 bg-gray-800/30 rounded-xl border border-gray-800">
              <div className="text-2xl font-bold text-amber-400">{venueStats.totalBookings}</div>
              <div className="text-[10px] text-gray-500 uppercase tracking-wider mt-1">Total Bookings</div>
            </div>
            <div className="text-center p-4 bg-gray-800/30 rounded-xl border border-gray-800">
              <div className="text-2xl font-bold text-indigo-400">{venueStats.venues}</div>
              <div className="text-[10px] text-gray-500 uppercase tracking-wider mt-1">Venues Used</div>
            </div>
            <div className="text-center p-4 bg-gray-800/30 rounded-xl border border-gray-800">
              <div className="text-2xl font-bold text-cyan-400">{venueStats.averageCapacity}</div>
              <div className="text-[10px] text-gray-500 uppercase tracking-wider mt-1">Avg Capacity</div>
            </div>
            <div className="text-center p-4 bg-gray-800/30 rounded-xl border border-gray-800">
              <div className="text-2xl font-bold text-violet-400">{eventStats.totalGuests.toLocaleString()}</div>
              <div className="text-[10px] text-gray-500 uppercase tracking-wider mt-1">Total Guests</div>
            </div>
            <div className="text-center p-4 bg-gray-800/30 rounded-xl border border-gray-800">
              <div className="text-2xl font-bold text-green-400">₹{venueStats.totalRevenue.toLocaleString()}</div>
              <div className="text-[10px] text-gray-500 uppercase tracking-wider mt-1">Revenue</div>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes slideUp { 
          from { opacity: 0; transform: translateY(20px); } 
          to { opacity: 1; transform: translateY(0); } 
        }
        .animate-slideUp { animation: slideUp 0.3s ease-out; }
        
        /* Custom Scrollbar */
        ::-webkit-scrollbar { width: 6px; height: 6px; }
        ::-webkit-scrollbar-track { background: rgba(31, 41, 55, 0.5); border-radius: 3px; }
        ::-webkit-scrollbar-thumb { background: rgba(107, 114, 128, 0.4); border-radius: 3px; }
        ::-webkit-scrollbar-thumb:hover { background: rgba(107, 114, 128, 0.6); }
      `}</style>
    </div>
  );
};

// Missing Check icon import
const Check = ({ size, className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <polyline points="20 6 9 17 4 12"></polyline>
  </svg>
);

export default AnalyticsDashboard;