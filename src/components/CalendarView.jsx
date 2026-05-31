import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  Calendar, Clock, MapPin, Users, Search, ChevronLeft, ChevronRight, X,
  CalendarDays, Filter, BarChart3, Building2, Sparkles
} from 'lucide-react';

// Helper to format calendar day to strict YYYY-MM-DD string
const getFormattedDay = (dateObj) => {
  if (!dateObj) return '';
  const year = dateObj.getFullYear();
  const month = String(dateObj.getMonth() + 1).padStart(2, '0');
  const day = String(dateObj.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const CalendarView = ({ events = [] }) => {
  const { user } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Calendar State
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(null);
  
  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');

  // ✅ FIX #1: Load both Venue Bookings and Events from UNIFIED storage keys
  useEffect(() => {
    const loadAllData = () => {
      setLoading(true);
      
      // Use SAME keys as other components
      const storedVenueBookings = JSON.parse(localStorage.getItem('venueBookings') || '[]');
      const storedEvents = JSON.parse(localStorage.getItem('events') || '[]');
      
      // Merge prop events and stored events
      const eventMap = new Map();
      if (events && Array.isArray(events)) {
        events.forEach(e => eventMap.set(e._id, e));
      }
      storedEvents.forEach(e => eventMap.set(e._id, e));
      const allEvents = Array.from(eventMap.values());
      
      const combined = [
        ...storedVenueBookings.map(b => ({ ...b, source: 'venue' })),
        ...allEvents.map(e => ({ ...e, source: 'event' }))
      ];
      
      setBookings(combined);
      setLoading(false);
    };

    loadAllData();

    // Listen for updates from other components
    window.addEventListener('storage', loadAllData);
    window.addEventListener('venueBookingUpdated', loadAllData);
    window.addEventListener('eventUpdated', loadAllData);

    return () => {
      window.removeEventListener('storage', loadAllData);
      window.removeEventListener('venueBookingUpdated', loadAllData);
      window.removeEventListener('eventUpdated', loadAllData);
    };
  }, [events]);

  // ✅ FIX #2: Normalize Data to handle differences between formats
  const normalizedData = useMemo(() => {
    return bookings.map(item => {
      const isVenue = item.source === 'venue' || item.type === 'venue';
      
      let dateString = '';
      let timeString = item.eventTime || item.time || '';

      if (item.eventDate && typeof item.eventDate === 'string') {
        dateString = item.eventDate.split('T')[0];
      } else if (item.startDate && typeof item.startDate === 'string') {
        const parts = item.startDate.split('T');
        dateString = parts[0];
        if (!timeString && parts.length > 1) {
          timeString = parts[1];
        }
      }

      let loc = 'TBD';
      if (item.venueName) {
        loc = item.venueName;
      } else if (item.location && typeof item.location === 'object') {
        loc = [item.location.city, item.location.state].filter(Boolean).join(', ') || item.location.address || 'TBD';
      } else if (typeof item.location === 'string') {
        loc = item.location;
      }

      return {
        _id: item._id || Math.random().toString(36).substr(2, 9),
        source: isVenue ? 'venue' : 'event',
        title: item.eventName || item.title || item.eventTitle || item.purpose || 'Untitled Event',
        eventDate: dateString,
        eventTime: timeString || 'TBD',
        location: loc,
        duration: item.duration || (isVenue ? 4 : 1),
        guestCount: item.guestCount || item.participants?.length || item.attendees || 0,
        status: (item.status || 'Confirmed').toLowerCase(),
        totalPrice: item.totalPrice || item.budget?.total || 0,
      };
    }).filter(b => b.eventDate);
  }, [bookings]);

  // Calendar Grid Logic
  const navigateMonth = (direction) => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      newDate.setMonth(prev.getMonth() + direction);
      return newDate;
    });
  };

  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];
    for (let i = 0; i < startingDayOfWeek; i++) days.push(null);
    for (let i = 1; i <= daysInMonth; i++) days.push(new Date(year, month, i));
    return days;
  };

  // Filter Logic for Sidebar
  const filteredBookings = useMemo(() => {
    let result = normalizedData;
    
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(b => 
        b.title.toLowerCase().includes(term) ||
        b.location.toLowerCase().includes(term)
      );
    }
    
    if (filterType !== 'all') {
      result = result.filter(b => b.status === filterType);
    }

    if (selectedDate) {
      const targetStr = getFormattedDay(selectedDate);
      result = result.filter(b => b.eventDate === targetStr);
    } else {
      const currentMonthStr = getFormattedDay(currentDate).substring(0, 7);
      result = result.filter(b => b.eventDate.startsWith(currentMonthStr));
    }
    
    return result.sort((a, b) => a.eventDate.localeCompare(b.eventDate));
  }, [normalizedData, searchTerm, filterType, selectedDate, currentDate]);

  const monthYear = currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  const days = getDaysInMonth(currentDate);
  const todayStr = getFormattedDay(new Date());

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen" style={{background: '#0f172a'}}>
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6 relative overflow-hidden" style={{background: '#0f172a'}}>
      {/* Background Effects - EXACT MATCH WITH VENUEBOOKING */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-gradient-to-br from-blue-500/10 to-purple-500/10 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 -right-40 w-96 h-96 bg-gradient-to-br from-emerald-500/10 to-cyan-500/10 rounded-full blur-3xl"></div>
      </div>

      <div className="max-w-7xl mx-auto relative z-10 space-y-8">
        
        {/* HEADER - Matching VenueBooking Style */}
        <div className="text-center mb-10">
          <h2 className="text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-purple-400 to-emerald-400 mb-3">
            📅 Master Calendar
          </h2>
          <p className="text-gray-400 text-lg">Unified view of your venue bookings and events</p>
        </div>

        {/* Stats Cards - Unified Style */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-gray-900/60 backdrop-blur-xl border border-gray-700/50 rounded-2xl p-6 shadow-xl hover:border-blue-500/30 transition-all">
            <div className="flex items-center justify-between mb-2">
              <BarChart3 className="w-5 h-5 text-blue-400" />
              <span className="text-xs text-blue-400/70 font-medium">TOTAL</span>
            </div>
            <p className="text-3xl font-bold text-white">{normalizedData.length}</p>
            <p className="text-sm text-gray-400 mt-1">Total Activities</p>
          </div>

          <div className="bg-gray-900/60 backdrop-blur-xl border border-gray-700/50 rounded-2xl p-6 shadow-xl hover:border-orange-500/30 transition-all">
            <div className="flex items-center justify-between mb-2">
              <Building2 className="w-5 h-5 text-orange-400" />
              <span className="text-xs text-orange-400/70 font-medium">VENUES</span>
            </div>
            <p className="text-3xl font-bold text-white">
              {normalizedData.filter(b => b.source === 'venue').length}
            </p>
            <p className="text-sm text-gray-400 mt-1">Venue Bookings</p>
          </div>

          <div className="bg-gray-900/60 backdrop-blur-xl border border-gray-700/50 rounded-2xl p-6 shadow-xl hover:border-purple-500/30 transition-all">
            <div className="flex items-center justify-between mb-2">
              <Sparkles className="w-5 h-5 text-purple-400" />
              <span className="text-xs text-purple-400/70 font-medium">EVENTS</span>
            </div>
            <p className="text-3xl font-bold text-white">
              {normalizedData.filter(b => b.source === 'event').length}
            </p>
            <p className="text-sm text-gray-400 mt-1">Created Events</p>
          </div>

          <div className="bg-gray-900/60 backdrop-blur-xl border border-gray-700/50 rounded-2xl p-6 shadow-xl hover:border-emerald-500/30 transition-all">
            <div className="flex items-center justify-between mb-2">
              <CalendarDays className="w-5 h-5 text-emerald-400" />
              <span className="text-xs text-emerald-400/70 font-medium">ACTIVE</span>
            </div>
            <p className="text-3xl font-bold text-white">
              {normalizedData.filter(b => 
                b.status === 'confirmed' || b.status === 'published' || b.status === 'draft'
              ).length}
            </p>
            <p className="text-sm text-gray-400 mt-1">Active Items</p>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          
          {/* Main Calendar Area */}
          <div className="xl:col-span-2">
            <div className="bg-gray-900/60 backdrop-blur-xl border border-gray-700/50 rounded-3xl p-8 shadow-2xl">
              
              {/* Calendar Header with Icon Badge */}
              <div className="flex items-center justify-between mb-8">
                <button 
                  onClick={() => navigateMonth(-1)} 
                  className="p-3 bg-gray-800/50 hover:bg-gray-800 rounded-xl text-gray-400 hover:text-white transition-all"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                
                <div className="flex items-center gap-3">
                  <CalendarDays size={24} className="text-indigo-400" />
                  <h3 className="text-2xl font-semibold text-white">{monthYear}</h3>
                </div>
                
                <button 
                  onClick={() => navigateMonth(1)} 
                  className="p-3 bg-gray-800/50 hover:bg-gray-800 rounded-xl text-gray-400 hover:text-white transition-all"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>

              {/* Calendar Grid */}
              <div className="grid grid-cols-7 gap-2">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                  <div key={day} className="text-center text-gray-500 text-sm font-semibold py-3 uppercase tracking-wider">
                    {day}
                  </div>
                ))}
                
                {days.map((day, index) => {
                  const dayString = getFormattedDay(day);
                  const dayBookings = normalizedData.filter(b => b.eventDate === dayString);
                  
                  const isToday = dayString === todayStr;
                  const isSelected = selectedDate && dayString === getFormattedDay(selectedDate);

                  return (
                    <div
                      key={index}
                      onClick={() => day && setSelectedDate(day)}
                      className={`
                        min-h-[110px] p-2 rounded-xl border transition-all cursor-pointer overflow-hidden flex flex-col
                        ${!day ? 'invisible' : 'hover:bg-gray-800/60 hover:scale-[1.02]'}
                        ${isToday ? 'bg-indigo-500/20 border-indigo-500/50 ring-2 ring-indigo-500/30' : 'border-gray-700/30 bg-gray-800/30'}
                        ${isSelected ? 'ring-2 ring-purple-500 bg-purple-500/10 border-purple-500/50' : ''}
                      `}
                    >
                      {day && (
                        <>
                          <div className={`text-sm font-bold mb-2 ${isToday ? 'text-indigo-400' : 'text-gray-300'}`}>
                            {day.getDate()}
                            {isToday && <span className="ml-1 text-[10px] bg-indigo-500 text-white px-1.5 py-0.5 rounded-full">Today</span>}
                          </div>
                          
                          {/* Visible Data in Calendar Cells */}
                          <div className="space-y-1 flex-1 overflow-y-auto pr-1" style={{scrollbarWidth: 'thin', scrollbarColor: 'rgba(107,114,128,0.3) transparent'}}>
                            {dayBookings.slice(0, 3).map((b, i) => (
                              <div 
                                key={i} 
                                className={`text-[11px] px-2 py-1 rounded-lg truncate font-medium border ${
                                  b.source === 'venue' 
                                    ? 'bg-orange-500/15 text-orange-300 border-orange-500/25 hover:bg-orange-500/25' 
                                    : 'bg-purple-500/15 text-purple-300 border-purple-500/25 hover:bg-purple-500/25'
                                }`}
                                title={`${b.eventTime} - ${b.title}`}
                              >
                                {b.title}
                              </div>
                            ))}
                            {dayBookings.length > 3 && (
                              <div className="text-[10px] text-gray-500 text-center px-2 py-1">
                                +{dayBookings.length - 3} more
                              </div>
                            )}
                          </div>
                        </>
                      )}
                    </div>
                  );
                })}
              </div>
              
              {/* Legend - Updated Style */}
              <div className="flex gap-6 mt-8 pt-6 border-t border-gray-800">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-orange-500 shadow-lg shadow-orange-500/50"></div>
                  <span className="text-gray-400 text-sm font-medium">Venue Bookings</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-purple-500 shadow-lg shadow-purple-500/50"></div>
                  <span className="text-gray-400 text-sm font-medium">Created Events</span>
                </div>
                <div className="ml-auto flex items-center gap-2 text-xs text-gray-500">
                  <Filter size={14} /> Click any day to view details
                </div>
              </div>

            </div>
          </div>

          {/* Sidebar Detail View - Updated Style */}
          <div className="xl:col-span-1">
            <div className="bg-gray-900/60 backdrop-blur-xl border border-gray-700/50 rounded-3xl p-6 shadow-2xl h-full flex flex-col max-h-[850px]">
              
              {/* Sidebar Header & Search */}
              <div className="mb-6 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CalendarDays size={20} className="text-indigo-400" />
                    <h3 className="text-xl font-bold text-white">
                      {selectedDate 
                        ? selectedDate.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })
                        : 'Month Overview'
                      }
                    </h3>
                  </div>
                  {selectedDate && (
                    <button 
                      onClick={() => setSelectedDate(null)} 
                      className="p-2 hover:bg-red-500/20 rounded-lg text-gray-400 hover:text-red-400 transition-all"
                    >
                      <X size={18} />
                    </button>
                  )}
                </div>

                {/* Search Input - Updated Style */}
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500 w-4 h-4" />
                  <input
                    type="text"
                    placeholder="Search activities..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-11 pr-4 py-3 bg-gray-900/50 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:border-indigo-500 outline-none transition-all"
                  />
                </div>

                {/* Filter Tabs - New Feature */}
                <div className="flex gap-2 bg-gray-800/50 p-1 rounded-xl">
                  {[
                    { label: 'All', value: 'all' },
                    { label: 'Venues', value: 'confirmed' },
                    { label: 'Events', value: 'published' },
                    { label: 'Drafts', value: 'draft' },
                  ].map(filter => (
                    <button
                      key={filter.value}
                      onClick={() => setFilterType(filter.value)}
                      className={`flex-1 px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                        filterType === filter.value
                          ? 'bg-indigo-500 text-white'
                          : 'text-gray-400 hover:text-white hover:bg-gray-700/50'
                      }`}
                    >
                      {filter.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Results Count */}
              <div className="flex items-center justify-between mb-4 pb-4 border-b border-gray-800">
                <span className="text-sm text-gray-400">
                  {filteredBookings.length} {filteredBookings.length === 1 ? 'activity' : 'activities'}
                </span>
              </div>

              {/* List of Events - Updated Style */}
              <div className="flex-1 overflow-y-auto pr-2 space-y-3 pb-4" style={{scrollbarWidth: 'thin', scrollbarColor: 'rgba(107,114,128,0.3) transparent'}}>
                {filteredBookings.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-16 text-gray-500">
                    <CalendarDays size={48} className="mb-4 opacity-50" />
                    <p className="font-medium">No activities found</p>
                    <p className="text-sm mt-1">Try selecting a different date or adjusting filters</p>
                  </div>
                ) : (
                  filteredBookings.map(item => (
                    <div
                      key={item._id}
                      className={`p-5 rounded-2xl border transition-all hover:scale-[1.02] group ${
                        item.source === 'venue' 
                          ? 'bg-orange-500/10 border-orange-500/30 hover:border-orange-500/50' 
                          : 'bg-purple-500/10 border-purple-500/30 hover:border-purple-500/50'
                      }`}
                    >
                      <div className="flex justify-between items-start mb-3">
                        <h4 className="font-bold text-white text-base leading-tight group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-orange-400 group-hover:to-pink-400 transition-colors">
                          {item.title}
                        </h4>
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider ml-2 flex-shrink-0 ${
                          item.source === 'venue' 
                            ? 'bg-orange-500/20 text-orange-400 border border-orange-500/30' 
                            : 'bg-purple-500/20 text-purple-400 border border-purple-500/30'
                        }`}>
                          {item.source === 'venue' ? '🏛️ Venue' : '✨ Event'}
                        </span>
                      </div>
                      
                      <div className="space-y-2.5 text-sm">
                        <div className="flex items-center text-gray-300">
                          <CalendarDays className="w-4 h-4 mr-3 text-indigo-400 flex-shrink-0" />
                          <span className="font-medium">{item.eventDate}</span>
                          <span className={`ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold capitalize ${
                            item.status === 'cancelled' ? 'bg-red-500/20 text-red-400' :
                            item.status === 'confirmed' || item.status === 'published' ? 'bg-green-500/20 text-green-400' :
                            'bg-yellow-500/20 text-yellow-400'
                          }`}>
                            {item.status}
                          </span>
                        </div>
                        
                        <div className="flex items-center text-gray-300">
                          <Clock className="w-4 h-4 mr-3 text-emerald-400 flex-shrink-0" />
                          <span>{item.eventTime}</span>
                          <span className="ml-2 text-gray-500">({item.duration} hrs)</span>
                        </div>
                        
                        <div className="flex items-center text-gray-300">
                          <MapPin className="w-4 h-4 mr-3 text-rose-400 flex-shrink-0" />
                          <span className="truncate">{item.location}</span>
                        </div>

                        {(item.guestCount > 0 || item.totalPrice > 0) && (
                          <div className="flex items-center gap-4 pt-2 border-t border-gray-700/50 mt-2">
                            {item.guestCount > 0 && (
                              <div className="flex items-center text-gray-400 text-xs">
                                <Users size={12} className="mr-1" />
                                {item.guestCount} guests
                              </div>
                            )}
                            {item.totalPrice > 0 && (
                              <div className="flex items-center text-emerald-400 text-xs font-semibold">
                                ₹{item.totalPrice.toLocaleString()}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

        </div>

        {/* Quick Stats Footer - Optional Enhancement */}
        <div className="bg-gray-900/60 backdrop-blur-xl border border-gray-700/50 rounded-3xl p-6 shadow-2xl">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
             <div className="bg-gray-800/30 rounded-xl p-4 text-center border border-gray-800">
               <div className="text-lg font-bold text-blue-400">
                 {new Set(normalizedData.map(b => b.eventDate)).size}
               </div>
               <div className="text-[10px] text-gray-500 uppercase tracking-wider mt-1">Active Days</div>
             </div>
             <div className="bg-gray-800/30 rounded-xl p-4 text-center border border-gray-800">
               <div className="text-lg font-bold text-orange-400">
                 {normalizedData.reduce((sum, b) => sum + (b.guestCount || 0), 0)}
               </div>
               <div className="text-[10px] text-gray-500 uppercase tracking-wider mt-1">Total Guests</div>
             </div>
             <div className="bg-gray-800/30 rounded-xl p-4 text-center border border-gray-800">
               <div className="text-lg font-bold text-emerald-400">
                 ₹{normalizedData.reduce((sum, b) => sum + (b.totalPrice || 0), 0).toLocaleString()}
               </div>
               <div className="text-[10px] text-gray-500 uppercase tracking-wider mt-1">Revenue</div>
             </div>
             <div className="bg-gray-800/30 rounded-xl p-4 text-center border border-gray-800">
               <div className="text-lg font-bold text-purple-400">
                 {Math.round(normalizedData.reduce((sum, b) => sum + (b.duration || 0), 0) / normalizedData.length) || 0}h
               </div>
               <div className="text-[10px] text-gray-500 uppercase tracking-wider mt-1">Avg Duration</div>
             </div>
          </div>
        </div>
      </div>

      <style>{`
        /* Custom Scrollbar */
        ::-webkit-scrollbar { width: 6px; height: 6px; }
        ::-webkit-scrollbar-track { background: rgba(31, 41, 55, 0.5); border-radius: 3px; }
        ::-webkit-scrollbar-thumb { background: rgba(107, 114, 128, 0.4); border-radius: 3px; }
        ::-webkit-scrollbar-thumb:hover { background: rgba(107, 114, 128, 0.6); }
        
        /* Smooth transitions */
        * {
          transition-property: background-color, border-color, color, fill, stroke, opacity, box-shadow, transform;
          transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
          transition-duration: 150ms;
        }
      `}</style>
    </div>
  );
};

export default CalendarView;