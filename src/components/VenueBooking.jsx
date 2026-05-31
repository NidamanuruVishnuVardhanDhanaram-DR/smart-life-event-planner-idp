import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  CalendarDays, MapPin, Clock, Users, DollarSign, X, Check, AlertTriangle,
  RefreshCw, Trash2, Building2, Timer, CalendarPlus, History
} from 'lucide-react';

// --- Mock Data (unchanged) ---
const mockVenues = [
  {
    _id: '1',
    name: 'Grand Ball Room',
    location: 'Downtown Convention Center',
    capacity: 500,
    pricePerHour: 1500,
    image: 'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?auto=format&fit=crop&w=800&q=80',
    amenities: ['WiFi', 'Parking', 'Catering', 'Sound System', 'AC']
  },
  {
    _id: '2',
    name: 'Garden Pavilion',
    location: 'Riverside Gardens',
    capacity: 200,
    pricePerHour: 800,
    image: 'https://images.unsplash.com/photo-1533105079780-92b9be482077?auto=format&fit=crop&w=800&q=80',
    amenities: ['Parking', 'Outdoor Seating', 'BBQ Area', 'Natural Lighting']
  },
  {
    _id: '3',
    name: 'Conference Hall',
    location: 'Business District Tower',
    capacity: 100,
    pricePerHour: 600,
    image: 'https://images.unsplash.com/photo-1431540015161-0bf868a2d407?auto=format&fit=crop&w=800&q=80',
    amenities: ['WiFi', 'Projector', 'Whiteboard', 'Video Conferencing', 'AC']
  },
  {
    _id: '4',
    name: 'Rooftop Lounge',
    location: 'Skyline Hotel',
    capacity: 150,
    pricePerHour: 1200,
    image: 'https://images.unsplash.com/photo-1517457373958-b7bdd4587205?auto=format&fit=crop&w=800&q=80',
    amenities: ['WiFi', 'Bar', 'City View', 'Parking', 'Live Music Setup']
  },
  {
    _id: '5',
    name: 'Sri Venkateswara Function Hall',
    location: 'Narakodu',
    capacity: 750,
    pricePerHour: 950,
    image: 'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?auto=format&fit=crop&w=800&q=80',
    amenities: ['Large Stage', 'Dining Hall', 'Generator', 'Parking for 200', 'Catering Kitchen']
  },
  {
    _id: '6',
    name: 'Kalyana Vedika',
    location: 'Narakodu',
    capacity: 400,
    pricePerHour: 700,
    image: 'https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?auto=format&fit=crop&w=800&q=80',
    amenities: ['Mandapam', 'AC Hall', 'Changing Rooms', 'Parking', 'Decoration Service']
  },
  {
    _id: '7',
    name: 'V. V. Mahal',
    location: 'Tenali',
    capacity: 600,
    pricePerHour: 850,
    image: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=800&q=80',
    amenities: ['Open Lawn', 'Party Hall', 'Parking', 'In-house Decorators', 'Bar Service']
  },
  {
    _id: '9',
    name: 'Vadlamudi Community Hall',
    location: 'Vadlamudi',
    capacity: 300,
    pricePerHour: 550,
    image: 'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?auto=format&fit=crop&w=800&q=80',
    amenities: ['Community Kitchen', 'Parking', 'Sound System', 'Stage', 'AC']
  },
  {
    _id: '10',
    name: 'Sai Kalyana Mandapam',
    location: 'Vadlamudi',
    capacity: 500,
    pricePerHour: 750,
    image: 'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?auto=format&fit=crop&w=800&q=80',
    amenities: ['Traditional Architecture', 'Large Hall', 'Catering', 'Priest Services', 'Parking']
  },
  {
    _id: '12',
    name: 'The Grand Guntur Hall',
    location: 'Guntur One Town',
    capacity: 1000,
    pricePerHour: 1400,
    image: 'https://images.unsplash.com/photo-1517457373958-b7bdd4587205?auto=format&fit=crop&w=800&q=80',
    amenities: ['VIP Rooms', 'Modern Sound System', 'Catering', 'Valet Parking', 'AC']
  },
  {
    _id: '13',
    name: 'Rajendra Convention Center',
    location: 'Guntur One Town',
    capacity: 450,
    pricePerHour: 800,
    image: 'https://images.unsplash.com/photo-1431540015161-0bf868a2d407?auto=format&fit=crop&w=800&q=80',
    amenities: ['Business Center', 'Projector', 'WiFi', 'Catering', 'Parking']
  },
  {
    _id: '14',
    name: 'Sri Lakshmi Narasimha Kalyana Mandapam',
    location: 'Ponnur',
    capacity: 400,
    pricePerHour: 600,
    image: 'https://images.unsplash.com/photo-1533105079780-92b9be482077?auto=format&fit=crop&w=800&q=80',
    amenities: ['Spacious Ground', 'Sound System', 'Central AC', 'Catering', 'Parking']
  },
  {
    _id: '15',
    name: 'Ponnur Town Hall',
    location: 'Ponnur',
    capacity: 250,
    pricePerHour: 450,
    image: 'https://content3.jdmagicbox.com/v2/comp/guntur/j5/9999px863.x863.180820233257.b4j5/catalogue/sajja-function-hall-ponnur-guntur-banquet-halls-omI0f4Y2Jf.jpg',
    amenities: ['Public Hall', 'Basic Amenities', 'Parking', 'Stage', 'Sound System']
  }
];

// Modal Component (matching EventForm style)
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

// Toast Component (matching EventForm style)
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

const VenueBooking = ({ onBookingSuccess }) => {
  const { user } = useAuth();
  const [venues, setVenues] = useState([]);
  const [selectedVenue, setSelectedVenue] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Booking Form State
  const [bookingData, setBookingData] = useState({
    eventName: '',
    eventDate: '',
    eventTime: '',
    duration: 4,
    guestCount: 50,
    notes: ''
  });
  
  // User Bookings State
  const [myBookings, setMyBookings] = useState([]);
  const [filterMonth, setFilterMonth] = useState(new Date().toISOString().slice(0, 7));
  const [toast, setToast] = useState(null);
  const [modalState, setModalState] = useState({ isOpen: false, type: null, booking: null });
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  // NEW: Past date prevention
  const minDateTime = new Date().toISOString().slice(0, 16);

  // --- HELPER FUNCTIONS ---
  const showToast = (message, type = 'info') => {
    setToast({ message, type });
  };

  const loadBookings = () => {
    const stored = JSON.parse(localStorage.getItem('venueBookings') || '[]');
    setMyBookings(stored.sort((a, b) => new Date(a.eventDate) - new Date(b.eventDate)));
  };

  useEffect(() => {
    const fetchVenues = async () => {
      setLoading(true);
      await new Promise(resolve => setTimeout(resolve, 800)); 
      setVenues(mockVenues);
      loadBookings();
      setLoading(false);
    };
    fetchVenues();
  }, []);

  const saveBookingToStorage = (booking) => {
    const existingBookings = JSON.parse(localStorage.getItem('venueBookings') || '[]');
    const updatedBookings = [...existingBookings, booking];
    localStorage.setItem('venueBookings', JSON.stringify(updatedBookings));
    return updatedBookings;
  };

  const parseTime = (timeStr) => {
    const [hours, minutes] = timeStr.split(':').map(Number);
    return hours * 60 + minutes; 
  };

  const checkBookingConflict = (venueId, date, time, duration, ignoreBookingId = null) => {
    const existingBookings = JSON.parse(localStorage.getItem('venueBookings') || '[]');
    
    for (const existing of existingBookings) {
      if (existing.status === 'Cancelled') continue;
      if (ignoreBookingId && existing._id === ignoreBookingId) continue;

      if (existing.venue === venueId && existing.eventDate === date) {
        const newStartMinutes = parseTime(time);
        const existingStartMinutes = parseTime(existing.eventTime);
        
        const newEndMinutes = newStartMinutes + (duration * 60);
        const existingEndMinutes = existingStartMinutes + ((existing.duration || 4) * 60);
        
        if (newStartMinutes < existingEndMinutes && newEndMinutes > existingStartMinutes) {
          return {
            conflict: true,
            message: `This venue is already booked on ${date} from ${existing.eventTime} for ${existing.duration || 4} hours.`
          };
        }
      }
    }
    return { conflict: false, message: '' };
  };

  // --- HANDLERS ---
  const handleBookingSubmit = (e) => {
    e.preventDefault();

    if (!selectedVenue) {
      showToast('Please select a venue first.', 'warning');
      return;
    }

    // NEW: Prevent past dates
    if (bookingData.eventDate && new Date(bookingData.eventDate) < new Date()) {
      showToast('❌ Cannot book venues in the past! Please select a future date.', 'error');
      return;
    }

    const conflictCheck = checkBookingConflict(selectedVenue._id, bookingData.eventDate, bookingData.eventTime, bookingData.duration);
    if (conflictCheck.conflict) {
      showToast(conflictCheck.message, 'error');
      return;
    }

    const newBooking = {
      _id: Date.now().toString(),
      userId: user?.id || 'guest',
      venue: selectedVenue._id,
      venueName: selectedVenue.name,
      location: selectedVenue.location,
      eventName: bookingData.eventName,
      eventDate: bookingData.eventDate,
      eventTime: bookingData.eventTime,
      duration: bookingData.duration,
      guestCount: bookingData.guestCount,
      notes: bookingData.notes,
      totalPrice: selectedVenue.pricePerHour * bookingData.duration,
      status: 'Confirmed',
      createdAt: new Date().toISOString()
    };

    saveBookingToStorage(newBooking);
    loadBookings();
    showToast(`🏛️ Venue "${selectedVenue.name}" booked successfully!`, 'success');
    
    setSelectedVenue(null);
    setBookingData({ eventName: '', eventDate: '', eventTime: '', duration: 4, guestCount: 50, notes: '' });

    if (onBookingSuccess) onBookingSuccess(newBooking);
  };

  const handleCancelBooking = (id) => {
    setModalState({
      isOpen: true,
      type: 'cancel',
      booking: myBookings.find(b => b._id === id)
    });
  };

  const confirmCancelBooking = () => {
    const updated = myBookings.map(b => 
      b._id === modalState.booking._id ? { ...b, status: 'Cancelled' } : b
    );
    localStorage.setItem('venueBookings', JSON.stringify(updated));
    setMyBookings(updated);
    setModalState({ isOpen: false, type: null, booking: null });
    showToast('✅ Booking cancelled successfully', 'success');
  };

  const handlePostponeInit = (booking) => {
    setModalState({
      isOpen: true,
      type: 'postpone',
      booking: booking
    });
  };

  // NEW: Handle Rebook for cancelled bookings
  const handleRebookInit = (booking) => {
    setModalState({
      isOpen: true,
      type: 'rebook',
      booking: booking
    });
  };

  const handlePostponeSave = (newDate, newTime) => {
    if (!newDate || !newTime) {
      showToast('⚠️ Please select both date and time.', 'warning');
      return;
    }

    // Check past date
    if (new Date(newDate) < new Date()) {
      showToast('❌ Cannot postpone to a past date!', 'error');
      return;
    }

    const conflictCheck = checkBookingConflict(modalState.booking.venue, newDate, newTime, modalState.booking.duration, modalState.booking._id);
    if (conflictCheck.conflict) {
      showToast(conflictCheck.message, 'error');
      return;
    }

    const updated = myBookings.map(b => {
      if (b._id === modalState.booking._id) {
        return { ...b, eventDate: newDate, eventTime: newTime, status: 'Postponed' };
      }
      return b;
    });

    localStorage.setItem('venueBookings', JSON.stringify(updated));
    setMyBookings(updated);
    setModalState({ isOpen: false, type: null, booking: null });
    showToast('✅ Booking postponed successfully.', 'success');
  };

  const handleRebookSave = (newDate, newTime) => {
    if (!newDate || !newTime) {
      showToast('⚠️ Please select both date and time.', 'warning');
      return;
    }

    // Check past date
    if (new Date(newDate) < new Date()) {
      showToast('❌ Cannot rebook to a past date!', 'error');
      return;
    }

    // Create new booking from cancelled one
    const rebooked = {
      ...modalState.booking,
      _id: Date.now().toString(),
      eventDate: newDate,
      eventTime: newTime,
      status: 'Confirmed',
      createdAt: new Date().toISOString(),
      eventName: modalState.booking.eventName + ' (Rebooked)'
    };

    saveBookingToStorage(rebooked);
    loadBookings();
    setModalState({ isOpen: false, type: null, booking: null });
    showToast('🔄 Booking rebooked successfully!', 'success');
  };

  const calculateTotal = () => {
    if (!selectedVenue) return 0;
    return selectedVenue.pricePerHour * bookingData.duration;
  };

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      loadBookings(); 
      setIsRefreshing(false);
      showToast('📊 Bookings refreshed!', 'info');
    }, 500);
  };

  // --- FILTER BOOKINGS ---
  const filteredBookings = myBookings.filter(b => b.eventDate.startsWith(filterMonth));

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen" style={{background: '#0f172a'}}>
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6 relative overflow-hidden" style={{background: '#0f172a'}}>
      {/* Background Effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-gradient-to-br from-blue-500/10 to-purple-500/10 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 -right-40 w-96 h-96 bg-gradient-to-br from-emerald-500/10 to-cyan-500/10 rounded-full blur-3xl"></div>
      </div>

      {/* Toast Notification */}
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      <div className="max-w-7xl mx-auto relative z-10 space-y-8">
        
        {/* Header */}
        <div className="text-center mb-10">
          <h2 className="text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-purple-400 to-emerald-400 mb-3">
            🏛️ Venue Booking
          </h2>
          <p className="text-gray-400 text-lg">Find and book the perfect venue for your next event</p>
        </div>

        {/* VENUE SELECTION & BOOKING FORM */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Venue List */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-gray-900/60 backdrop-blur-xl border border-gray-700/50 rounded-3xl p-8 shadow-2xl">
              <h3 className="text-2xl font-semibold text-white mb-6 flex items-center gap-3">
                <Building2 className="w-6 h-6 text-blue-400" /> Available Venues
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {venues.map((venue) => (
                  <div
                    key={venue._id}
                    onClick={() => setSelectedVenue(venue)}
                    className={`bg-gray-800/40 border rounded-2xl overflow-hidden transition-all duration-300 hover:scale-[1.02] cursor-pointer ${
                      selectedVenue?._id === venue._id ? 'ring-2 ring-blue-500 border-blue-500' : 'border-gray-700/50 hover:border-blue-500/50'
                    }`}
                  >
                    <div className="h-48 overflow-hidden">
                      <img src={venue.image} alt={venue.name} className="w-full h-full object-cover" />
                    </div>
                    <div className="p-5">
                      <h4 className="text-xl font-bold text-white mb-2">{venue.name}</h4>
                      <p className="text-gray-400 text-sm flex items-center gap-2">
                        <MapPin size={14} className="text-rose-400" /> {venue.location}
                      </p>
                      <div className="flex items-center justify-between mt-3">
                        <span className="text-gray-300 flex items-center gap-1">
                          <Users size={14} /> {venue.capacity}
                        </span>
                        <span className="text-green-400 font-bold">₹{venue.pricePerHour}/hr</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Booking Form Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-gray-900/60 backdrop-blur-xl border border-gray-700/50 rounded-3xl p-8 shadow-2xl sticky top-6">
              <h3 className="text-2xl font-semibold text-white mb-6 flex items-center gap-3">
                <CalendarPlus className="w-6 h-6 text-purple-400" /> Book Your Venue
              </h3>
              
              {!selectedVenue ? (
                <div className="text-center py-12">
                  <Building2 size={48} className="mx-auto text-gray-600 mb-4" />
                  <p className="text-gray-400">Select a venue from the list to start booking</p>
                </div>
              ) : (
                <form onSubmit={handleBookingSubmit} className="space-y-5">
                  <div className="bg-blue-500/20 border border-blue-500/30 rounded-xl p-4">
                    <p className="text-white font-semibold">{selectedVenue.name}</p>
                    <p className="text-blue-300 text-sm">₹{selectedVenue.pricePerHour}/hour</p>
                  </div>
                  
                  <div>
                    <label className="block text-gray-300 text-sm font-medium mb-2">Event Name *</label>
                    <input 
                      type="text" 
                      required 
                      value={bookingData.eventName} 
                      onChange={(e) => setBookingData({...bookingData, eventName: e.target.value})} 
                      className="w-full px-4 py-3 bg-gray-900/50 border border-gray-700 rounded-xl text-white focus:border-blue-500 outline-none transition-all" 
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-gray-300 text-sm font-medium mb-2">Date *</label>
                      <input 
                        type="date" 
                        required 
                        min={minDateTime.split('T')[0]} 
                        value={bookingData.eventDate} 
                        onChange={(e) => setBookingData({...bookingData, eventDate: e.target.value})} 
                        className="w-full px-4 py-3 bg-gray-900/50 border border-gray-700 rounded-xl text-white focus:border-purple-500 outline-none transition-all" 
                      />
                    </div>
                    <div>
                      <label className="block text-gray-300 text-sm font-medium mb-2">Time *</label>
                      <input 
                        type="time" 
                        required 
                        value={bookingData.eventTime} 
                        onChange={(e) => setBookingData({...bookingData, eventTime: e.target.value})} 
                        className="w-full px-4 py-3 bg-gray-900/50 border border-gray-700 rounded-xl text-white focus:border-purple-500 outline-none transition-all" 
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-gray-300 text-sm font-medium mb-2">Duration</label>
                      <select 
                        value={bookingData.duration} 
                        onChange={(e) => setBookingData({...bookingData, duration: parseInt(e.target.value)})} 
                        className="w-full px-4 py-3 bg-gray-900/50 border border-gray-700 rounded-xl text-white focus:border-green-500 outline-none transition-all"
                      >
                        {[2,4,6,8,10,12].map(hrs => (
                          <option key={hrs} value={hrs} className="bg-gray-800">{hrs} hours</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-gray-300 text-sm font-medium mb-2">Guests</label>
                      <input 
                        type="number" 
                        min="1" 
                        max={selectedVenue.capacity} 
                        value={bookingData.guestCount} 
                        onChange={(e) => setBookingData({...bookingData, guestCount: parseInt(e.target.value)})} 
                        className="w-full px-4 py-3 bg-gray-900/50 border border-gray-700 rounded-xl text-white focus:border-green-500 outline-none transition-all" 
                      />
                    </div>
                  </div>
                  
                  <div className="bg-gradient-to-r from-green-500/20 to-emerald-500/20 border border-green-500/30 rounded-xl p-4">
                    <div className="flex justify-between items-center text-xl font-bold">
                      <span className="text-white flex items-center gap-2"><DollarSign size={20} className="text-green-400" /> Total</span>
                      <span className="text-green-400">₹{calculateTotal()}</span>
                    </div>
                  </div>
                  
                  <button 
                    type="submit" 
                    className="w-full py-4 bg-gradient-to-r from-blue-500 via-purple-500 to-emerald-500 text-white font-bold rounded-xl hover:scale-[1.02] transition-transform duration-300 shadow-lg hover:shadow-xl"
                  >
                    Confirm Booking ✨
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>

        {/* MY BOOKINGS TABLE - UPDATED STYLE */}
        <div className="bg-gray-900/60 backdrop-blur-xl border border-gray-700/50 rounded-3xl p-8 shadow-2xl">
          <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-indigo-500/20 rounded-xl text-indigo-400">
                <History size={24} />
              </div>
              <div>
                <h3 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">
                  My Events & Bookings
                </h3>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <label className="text-gray-300 font-medium flex items-center gap-2">
                <CalendarDays size={16} /> Filter:
              </label>
              <input 
                type="month" 
                value={filterMonth} 
                onChange={(e) => setFilterMonth(e.target.value)}
                className="px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:ring-2 focus:ring-indigo-500 outline-none"
              />
              <button 
                onClick={handleRefresh} 
                disabled={isRefreshing}
                className="flex items-center gap-2 px-4 py-2 rounded-lg border border-indigo-500/30 bg-indigo-500/10 text-indigo-400 hover:bg-indigo-500/20 transition-all disabled:opacity-50"
              >
                <RefreshCw size={16} className={isRefreshing ? "animate-spin" : ""} />
                Sync
              </button>
            </div>
          </div>

          {filteredBookings.length === 0 ? (
            <div className="text-center py-16 border-2 border-dashed border-gray-700 rounded-2xl">
              <History size={48} className="mx-auto text-gray-600 mb-4" />
              <h3 className="text-xl font-semibold text-gray-400 mb-2">No Bookings Found</h3>
              <p className="text-gray-500">Your bookings will appear here after you book a venue.</p>
            </div>
          ) : (
            <div className="overflow-x-auto rounded-xl border border-gray-700 bg-gray-900/30">
              <table className="w-full text-left">
                <thead className="bg-gray-800/90 sticky top-0">
                  <tr>
                    <th className="py-4 px-5 text-gray-400 font-semibold text-xs uppercase tracking-wider">Event</th>
                    <th className="py-4 px-5 text-gray-400 font-semibold text-xs uppercase tracking-wider">Venue</th>
                    <th className="py-4 px-5 text-gray-400 font-semibold text-xs uppercase tracking-wider">Date & Time</th>
                    <th className="py-4 px-5 text-gray-400 font-semibold text-xs uppercase tracking-wider">Status</th>
                    <th className="py-4 px-5 text-right text-gray-400 font-semibold text-xs uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-800/50">
                  {filteredBookings.map((booking) => (
                    <tr key={booking._id} className="group transition-colors hover:bg-gray-800/60">
                      <td className="py-4 px-5">
                        <span className="font-semibold text-white">{booking.eventName}</span>
                      </td>
                      <td className="py-4 px-5 text-gray-300">{booking.venueName}</td>
                      <td className="py-4 px-5">
                        <div className="text-sm">
                          <div className="flex items-center gap-2 text-white font-medium">
                            <CalendarDays size={12} className="text-indigo-400" /> {booking.eventDate}
                          </div>
                          <div className="text-gray-500 flex items-center gap-2 pl-5">
                            <Clock size={12} /> {booking.eventTime} ({booking.duration}hrs)
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-5">
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-[11px] font-bold border capitalize ${
                          booking.status === 'Confirmed' ? 'bg-green-500/20 text-green-400 border-green-500/30' : 
                          booking.status === 'Postponed' ? 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30' :
                          'bg-red-500/20 text-red-400 border-red-500/30'
                        }`}>
                          {booking.status}
                        </span>
                      </td>
                      
                      {/* ✅ UPDATED ACTIONS - REBOOK FOR CANCELLED BOOKINGS */}
                      <td className="py-4 px-5 text-right">
                        <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          
                          {/* Postpone & Cancel only for active bookings */}
                          {booking.status !== 'Cancelled' && (
                            <>
                              <button 
                                onClick={() => handlePostponeInit(booking)} 
                                className="p-1.5 rounded-md hover:bg-orange-500/20 text-orange-400/70 hover:text-orange-400 transition-all" 
                                title="Postpone"
                              >
                                <Clock size={14} />
                              </button>
                              <button 
                                onClick={() => handleCancelBooking(booking._id)} 
                                className="p-1.5 rounded-md hover:bg-red-500/20 text-red-400/70 hover:text-red-400 transition-all" 
                                title="Cancel"
                              >
                                <X size={14} />
                              </button>
                            </>
                          )}
                          
                          {/* ✅ REBOOK - ALWAYS VISIBLE for ALL bookings including CANCELLED */}
                          <button 
                            onClick={() => handleRebookInit(booking)} 
                            className="p-1.5 rounded-md hover:bg-blue-500/20 text-blue-400/70 hover:text-blue-400 transition-all" 
                            title="Rebook Booking"
                          >
                            <RefreshCw size={14} />
                          </button>
                          
                          <button 
                            onClick={() => {}} 
                            className="p-1.5 rounded-md hover:bg-gray-500/20 text-gray-500 hover:text-red-400 transition-all" 
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
      </div>

      {/* MODALS */}
      
      {/* Cancel Modal */}
      <ActionModal 
        isOpen={modalState.isOpen && modalState.type === 'cancel'} 
        onClose={() => setModalState({isOpen:false,type:null,booking:null})} 
        title="Cancel Booking"
      >
        <div className="space-y-4">
          <p className="text-gray-300">Are you sure you want to cancel this booking?</p>
          <div className="bg-gray-800 rounded-xl p-4 border border-gray-700">
            <p className="font-semibold text-white">{modalState.booking?.eventName}</p>
            <p className="text-gray-400 text-sm">{modalState.booking?.venueName} • {modalState.booking?.eventDate}</p>
          </div>
          <div className="flex gap-3 pt-2">
            <button 
              onClick={confirmCancelBooking} 
              className="flex-1 bg-red-500 text-white py-3 rounded-xl font-semibold hover:bg-red-600 transition-all"
            >
              Confirm Cancel
            </button>
            <button 
              onClick={() => setModalState({isOpen:false,type:null,booking:null})} 
              className="flex-1 bg-gray-700 text-white py-3 rounded-xl font-semibold hover:bg-gray-600 transition-all"
            >
              Keep It
            </button>
          </div>
        </div>
      </ActionModal>

      {/* Postpone Modal */}
      <ActionModal 
        isOpen={modalState.isOpen && modalState.type === 'postpone'} 
        onClose={() => setModalState({isOpen:false,type:null,booking:null})} 
        title="Postpone Booking"
      >
        <PostponeModalContent 
          booking={modalState.booking}
          onSave={(date, time) => handlePostponeSave(date, time)}
          minDateTime={minDateTime}
        />
      </ActionModal>

      {/* Rebook Modal */}
      <ActionModal 
        isOpen={modalState.isOpen && modalState.type === 'rebook'} 
        onClose={() => setModalState({isOpen:false,type:null,booking:null})} 
        title="Rebook Booking"
      >
        <RebookModalContent 
          booking={modalState.booking}
          onSave={(date, time) => handleRebookSave(date, time)}
          minDateTime={minDateTime}
        />
      </ActionModal>

      <style>{`
        @keyframes fadeIn { from { opacity: 0; transform: scale(0.95); } to { opacity: 1; transform: scale(1); } }
        @keyframes slideUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        .animate-fadeIn { animation: fadeIn 0.2s ease-out; }
        .animate-slideUp { animation: slideUp 0.3s ease-out; }
      `}</style>
    </div>
  );
};

// Postpone Modal Component
const PostponeModalContent = ({ booking, onSave, minDateTime }) => {
  const [newDate, setNewDate] = useState(booking?.eventDate || '');
  const [newTime, setNewTime] = useState(booking?.eventTime || '');

  return (
    <div className="space-y-4">
      <p className="text-gray-300">Select new date and time:</p>
      <div>
        <label className="block text-gray-300 mb-2 text-sm font-medium">New Date</label>
        <input 
          type="date" 
          min={minDateTime.split('T')[0]}
          value={newDate} 
          onChange={(e) => setNewDate(e.target.value)} 
          className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-xl text-white focus:outline-none focus:border-purple-500" 
        />
      </div>
      <div>
        <label className="block text-gray-300 mb-2 text-sm font-medium">New Time</label>
        <input 
          type="time" 
          value={newTime} 
          onChange={(e) => setNewTime(e.target.value)} 
          className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-xl text-white focus:outline-none focus:border-purple-500" 
        />
      </div>
      <div className="flex gap-3 pt-2">
        <button 
          onClick={() => onSave(newDate, newTime)} 
          disabled={!newDate || !newTime}
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

// Rebook Modal Component
const RebookModalContent = ({ booking, onSave, minDateTime }) => {
  const [newDate, setNewDate] = useState('');
  const [newTime, setNewTime] = useState('');

  return (
    <div className="space-y-4">
      <p className="text-gray-300">Create a new booking based on this one:</p>
      <div className="bg-gray-800 rounded-xl p-4 border border-gray-700">
        <p className="font-semibold text-white">{booking?.eventName}</p>
        <p className="text-gray-400 text-sm">{booking?.venueName}</p>
      </div>
      <div>
        <label className="block text-gray-300 mb-2 text-sm font-medium">New Date *</label>
        <input 
          type="date" 
          min={minDateTime.split('T')[0]}
          value={newDate} 
          onChange={(e) => setNewDate(e.target.value)} 
          className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-xl text-white focus:outline-none focus:border-blue-500" 
        />
      </div>
      <div>
        <label className="block text-gray-300 mb-2 text-sm font-medium">New Time *</label>
        <input 
          type="time" 
          value={newTime} 
          onChange={(e) => setNewTime(e.target.value)} 
          className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-xl text-white focus:outline-none focus:border-blue-500" 
        />
      </div>
      <div className="flex gap-3 pt-2">
        <button 
          onClick={() => onSave(newDate, newTime)} 
          disabled={!newDate || !newTime}
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

export default VenueBooking;