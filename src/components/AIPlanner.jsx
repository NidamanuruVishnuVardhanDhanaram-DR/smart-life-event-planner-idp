import React, { useState, useEffect } from 'react';
import { 
  CalendarDays, MapPin, AlignLeft, Type, Tags, Eye, Activity, 
  Globe, Map, Building, Clock, X, Check, AlertTriangle, RefreshCw, Trash2, History,
  Sparkles, Brain, Zap, Target
} from 'lucide-react';

// ============================================
// CUSTOM CALENDAR PLUS ICON (Fixes "not defined" error)
// ============================================
const CalendarPlus = ({ size = 24, className = "" }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    width={size} 
    height={size} 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    className={className}
  >
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
    <line x1="16" y1="2" x2="16" y2="6"/>
    <line x1="8" y1="2" x2="8" y2="6"/>
    <line x1="3" y1="10" x2="21" y2="10"/>
    <line x1="12" y1="14" x2="12" y2="18"/>
    <line x1="10" y1="16" x2="14" y2="16"/>
  </svg>
);

// ============================================
// MODAL COMPONENT (Matching VenueBooking Style)
// ============================================
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
              type === 'warning' ? <AlertTriangle size={18} /> :
              <Brain size={18} />;
  
  return (
    <div className={`fixed bottom-6 right-6 ${bgColor} border text-white px-6 py-3 rounded-xl shadow-lg z-50 flex items-center gap-3 animate-slideUp`}>
      {icon}
      <span>{message}</span>
    </div>
  );
};

// ============================================
// EDIT MODAL COMPONENT
// ============================================
const EditModalContent = ({ event, onSave, minDateTime }) => {
  const [editFormData, setEditFormData] = useState({
    title: event?.title || '',
    description: event?.description || '',
    startDate: event?.startDate?.slice(0, 16) || '',
    endDate: event?.endDate?.slice(0, 16) || '',
    category: event?.category || 'other'
  });

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-gray-300 mb-2 text-sm font-medium">Event Title</label>
        <input 
          type="text" 
          value={editFormData.title} 
          onChange={(e) => setEditFormData({...editFormData, title: e.target.value})} 
          className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-xl text-white focus:outline-none focus:border-yellow-500" 
          required 
        />
      </div>
      <div>
        <label className="block text-gray-300 mb-2 text-sm font-medium">Description</label>
        <textarea 
          value={editFormData.description} 
          onChange={(e) => setEditFormData({...editFormData, description: e.target.value})} 
          rows="3" 
          className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-xl text-white focus:outline-none focus:border-yellow-500 resize-none" 
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-gray-300 mb-2 text-sm font-medium">Start Date</label>
          <input 
            type="datetime-local" 
            value={editFormData.startDate} 
            onChange={(e) => setEditFormData({...editFormData, startDate: e.target.value})}
            min={minDateTime}
            className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-xl text-white focus:outline-none focus:border-yellow-500" 
            required 
          />
        </div>
        <div>
          <label className="block text-gray-300 mb-2 text-sm font-medium">End Date</label>
          <input 
            type="datetime-local" 
            value={editFormData.endDate} 
            onChange={(e) => setEditFormData({...editFormData, endDate: e.target.value})}
            min={editFormData.startDate}
            className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-xl text-white focus:outline-none focus:border-yellow-500" 
            required 
          />
        </div>
      </div>
      <div className="flex gap-3 pt-2">
        <button 
          onClick={() => onSave(editFormData)} 
          className="flex-1 bg-gradient-to-r from-yellow-500 to-orange-500 text-white py-3 rounded-xl font-semibold hover:scale-[1.02] transition-transform"
        >
          Save Changes ✏️
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

// ============================================
// POSTPONE MODAL COMPONENT
// ============================================
const PostponeModalContent = ({ event, onSave, minDateTime }) => {
  const [postponeData, setPostponeData] = useState({
    newStartDate: '',
    newEndDate: ''
  });

  const getSuggestedPostponeDates = (days) => {
    if (!event) return { start: '', end: '' };
    
    const currentStart = new Date(event.startDate);
    const currentEnd = new Date(event.endDate);
    const duration = currentEnd - currentStart;
    
    const newStart = new Date(currentStart);
    newStart.setDate(newStart.getDate() + days);
    
    const newEnd = new Date(newStart.getTime() + duration);
    
    return {
      start: newStart.toISOString().slice(0, 16),
      end: newEnd.toISOString().slice(0, 16)
    };
  };

  return (
    <div className="space-y-4">
      <div className="bg-purple-500/10 border border-purple-500/30 rounded-lg p-3 mb-4">
        <p className="text-purple-300 text-sm font-semibold mb-1">Current Schedule:</p>
        <p className="text-white text-xs">{new Date(event?.startDate).toLocaleDateString()} - {new Date(event?.endDate).toLocaleDateString()}</p>
      </div>
      <p className="text-gray-300">Select new dates for your event:</p>
      <div>
        <label className="block text-gray-300 mb-2 text-sm font-medium">New Start Date & Time</label>
        <input 
          type="datetime-local" 
          value={postponeData.newStartDate} 
          onChange={(e) => setPostponeData({...postponeData, newStartDate: e.target.value})} 
          min={minDateTime}
          className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-xl text-white focus:outline-none focus:border-purple-500" 
        />
        <div className="flex gap-2 mt-2 flex-wrap">
          <button 
            type="button" 
            onClick={() => {
              const sug = getSuggestedPostponeDates(7);
              setPostponeData({...postponeData, newStartDate: sug.start, newEndDate: sug.end});
            }} 
            className="px-3 py-1 bg-purple-500/20 text-purple-300 rounded-lg text-xs hover:bg-purple-500/30 transition-colors"
          >
            +7 Days
          </button>
          <button 
            type="button" 
            onClick={() => {
              const sug = getSuggestedPostponeDates(14);
              setPostponeData({...postponeData, newStartDate: sug.start, newEndDate: sug.end});
            }} 
            className="px-3 py-1 bg-purple-500/20 text-purple-300 rounded-lg text-xs hover:bg-purple-500/30 transition-colors"
          >
            +14 Days
          </button>
          <button 
            type="button" 
            onClick={() => {
              const sug = getSuggestedPostponeDates(30);
              setPostponeData({...postponeData, newStartDate: sug.start, newEndDate: sug.end});
            }} 
            className="px-3 py-1 bg-purple-500/20 text-purple-300 rounded-lg text-xs hover:bg-purple-500/30 transition-colors"
          >
            +30 Days
          </button>
        </div>
      </div>
      <div>
        <label className="block text-gray-300 mb-2 text-sm font-medium">New End Date & Time</label>
        <input 
          type="datetime-local" 
          value={postponeData.newEndDate} 
          onChange={(e) => setPostponeData({...postponeData, newEndDate: e.target.value})} 
          min={postponeData.newStartDate || minDateTime}
          className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-xl text-white focus:outline-none focus:border-purple-500" 
        />
      </div>
      <div className="flex gap-3 pt-2">
        <button 
          onClick={() => onSave(postponeData.newStartDate, postponeData.newEndDate)} 
          disabled={!postponeData.newStartDate || !postponeData.newEndDate}
          className="flex-1 bg-gradient-to-r from-orange-500 to-amber-500 text-white py-3 rounded-xl font-semibold disabled:opacity-50 hover:scale-[1.02] transition-transform"
        >
          Confirm Postpone ⏰
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

// ============================================
// REBOOK MODAL COMPONENT
// ============================================
const RebookModalContent = ({ event, onSave, minDateTime }) => {
  const [rebookFormData, setRebookFormData] = useState({
    startDate: '',
    endDate: '',
    title: `${event?.title} (Rebooked)`
  });

  return (
    <div className="space-y-4">
      <div className="bg-cyan-500/10 border border-cyan-500/30 rounded-lg p-3 mb-4">
        <p className="text-cyan-300 text-sm">💡 Create a new booking based on "{event?.title}"</p>
      </div>
      <div className="bg-gray-800 rounded-xl p-4 border border-gray-700">
        <p className="font-semibold text-white">{event?.title}</p>
        <p className="text-gray-400 text-sm">{event?.category || 'No category'}</p>
      </div>
      <div>
        <label className="block text-gray-300 mb-2 text-sm font-medium">Event Title *</label>
        <input 
          type="text" 
          value={rebookFormData.title} 
          onChange={(e) => setRebookFormData({...rebookFormData, title: e.target.value})} 
          className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-xl text-white focus:outline-none focus:border-blue-500" 
        />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-gray-300 mb-2 text-sm font-medium">New Start *</label>
          <input 
            type="datetime-local" 
            value={rebookFormData.startDate} 
            onChange={(e) => setRebookFormData({...rebookFormData, startDate: e.target.value})}
            min={minDateTime}
            className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-xl text-white focus:outline-none focus:border-blue-500" 
          />
        </div>
        <div>
          <label className="block text-gray-300 mb-2 text-sm font-medium">New End *</label>
          <input 
            type="datetime-local" 
            value={rebookFormData.endDate} 
            onChange={(e) => setRebookFormData({...rebookFormData, endDate: e.target.value})}
            min={rebookFormData.startDate}
            className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-xl text-white focus:outline-none focus:border-blue-500" 
          />
        </div>
      </div>
      <div className="flex gap-3 pt-2">
        <button 
          onClick={() => onSave(rebookFormData)} 
          disabled={!rebookFormData.startDate || !rebookFormData.endDate}
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

// ============================================
// MAIN AI PLANNER COMPONENT
// ============================================
const AIPlanner = ({ onEventCreated }) => {
  // State for AI Prompt
  const [prompt, setPrompt] = useState("");
  const [response, setResponse] = useState("");
  const [loading, setLoading] = useState(false);
  
  // State for Quick Add Event
  const [showQuickAddForm, setShowQuickAddForm] = useState(false);
  const [quickAddData, setQuickAddData] = useState({
    title: '',
    description: '',
    startDate: '',
    endDate: '',
    category: 'personal',
    location: { address: '', city: '', state: '', country: '' },
    status: 'draft',
    visibility: 'private'
  });
  const [isCreatingEvent, setIsCreatingEvent] = useState(false);
  const [dateError, setDateError] = useState("");

  // Table data state for parsed AI responses
  const [tableData, setTableData] = useState([]);

  // State to track if new event was created
  const [eventCreatedFlag, setEventCreatedFlag] = useState(0);

  // Storage key - UNIFIED with other components
  const EVENTS_KEY = 'events';
  
  // Events State
  const [events, setEvents] = useState([]);
  const [allEvents, setAllEvents] = useState([]);
  
  // Filter mode
  const [filterMode, setFilterMode] = useState("all");
  
  // Modal States
  const [modalState, setModalState] = useState({ isOpen: false, type: null, event: null });
  
  // UI States
  const [toast, setToast] = useState(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const minDateTime = new Date().toISOString().slice(0, 16);

  // Quick Prompts
  const quickPrompts = [
    "🎉 Plan a birthday party for 20 people",
    "🎓 Organize a college tech fest for 200 students",
    "💼 Create a professional networking event",
    "👨‍👩‍👧 Plan a family reunion gathering",
    "🎬 Movie night with friends",
    "🏃‍♀️ Plan a 5k charity run",
  ];

  // AI Features
  const aiFeatures = [
    { name: "Event Planning", endpoint: "generate-plan", icon: "🎯", description: "Comprehensive event plans with schedules and themes" },
    { name: "Budget Planning", endpoint: "generate-budget", icon: "💰", description: "Detailed budget breakdowns and cost estimates" },
    { name: "Marketing Content", endpoint: "generate-marketing", icon: "📢", description: "Social media posts, emails, and press releases" },
    { name: "Vendor Recommendations", endpoint: "generate-vendors", icon: "🏢", description: "Venue, catering, and service provider suggestions" },
    { name: "Timeline Creation", endpoint: "generate-timeline", icon: "⏰", description: "Detailed event timelines and checklists" },
    { name: "Risk Assessment", endpoint: "generate-risks", icon: "⚠️", description: "Safety protocols and contingency plans" },
  ];

  // Sample data generator
  const getSampleEvents = () => [
    {
      _id: 'sample_1',
      title: 'AI Generated: Tech Conference 2024',
      description: 'AI-generated plan for a 2-day tech conference featuring keynote speakers and workshops.',
      startDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      endDate: new Date(Date.now() + 8 * 24 * 60 * 60 * 1000).toISOString(),
      category: 'professional',
      status: 'published',
      visibility: 'public',
      source: 'ai',
      createdAt: new Date().toISOString(),
      guestCount: 200,
    },
    {
      _id: 'sample_2',
      title: 'AI Event: Birthday Party Planning',
      description: 'Complete birthday party plan with theme, decorations, and activities for 25 guests.',
      startDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
      endDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
      category: 'personal',
      status: 'draft',
      visibility: 'private',
      source: 'ai-planner',
      createdAt: new Date().toISOString(),
      guestCount: 25,
    },
    {
      _id: 'sample_3',
      title: 'College Fest - AI Organized',
      description: 'AI-generated college festival plan including cultural events, technical competitions, and food stalls.',
      startDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      endDate: new Date(Date.now() + 32 * 24 * 60 * 60 * 1000).toISOString(),
      category: 'college',
      status: 'draft',
      visibility: 'public',
      source: 'ai',
      createdAt: new Date().toISOString(),
      guestCount: 500,
    }
  ];

  // Load all events function
  const loadAllEvents = () => {
    try {
      let storedEvents = [];
      
      const data = localStorage.getItem(EVENTS_KEY);
      if (data) {
        try {
          const parsed = JSON.parse(data);
          if (Array.isArray(parsed) && parsed.length > 0) {
            storedEvents = parsed;
          }
        } catch (e) {
          console.warn("Failed to parse events:", e);
        }
      }

      if (storedEvents.length === 0) {
        console.log("No events found, adding sample data...");
        storedEvents = getSampleEvents();
        localStorage.setItem(EVENTS_KEY, JSON.stringify(storedEvents));
      }

      storedEvents.sort((a, b) => new Date(b.startDate || b.createdAt) - new Date(a.startDate || a.createdAt));
      
      setAllEvents(storedEvents);
      
      if (filterMode === "ai") {
        const aiFilteredEvents = storedEvents.filter(event => {
          const title = (event.title || "").toLowerCase();
          const desc = (event.description || "").toLowerCase();
          const source = (event.source || "").toLowerCase();

          return (
            title.includes("ai") ||
            title.includes("event:") ||
            source === "ai" ||
            source === "ai-planner" ||
            desc.includes("ai generated") ||
            desc.includes("ai response")
          );
        });
        setEvents(aiFilteredEvents);
      } else {
        setEvents(storedEvents);
      }
      
    } catch (err) {
      console.error("Error loading events:", err);
      const fallbackEvents = getSampleEvents();
      setAllEvents(fallbackEvents);
      setEvents(fallbackEvents);
    }
  };

  // Load events on mount
  useEffect(() => {
    loadAllEvents();

    const handleEventUpdate = () => {
      loadAllEvents();
    };
    
    window.addEventListener('eventUpdated', handleEventUpdate);
    return () => window.removeEventListener('eventUpdated', handleEventUpdate);
  }, []);

  // Refresh when flag changes or filter mode changes
  useEffect(() => {
    loadAllEvents();
  }, [eventCreatedFlag, filterMode]);

  // Update and save events
  const updateAndSave = (updatedEvents) => {
    try {
      setAllEvents(updatedEvents);
      localStorage.setItem(EVENTS_KEY, JSON.stringify(updatedEvents));
      window.dispatchEvent(new Event('eventUpdated'));
      
      if (filterMode === "ai") {
        const aiFilteredEvents = updatedEvents.filter(event => {
          const title = (event.title || "").toLowerCase();
          const desc = (event.description || "").toLowerCase();
          const source = (event.source || "").toLowerCase();

          return (
            title.includes("ai") ||
            title.includes("event:") ||
            source === "ai" ||
            source === "ai-planner" ||
            desc.includes("ai generated") ||
            desc.includes("ai response")
          );
        });
        setEvents(aiFilteredEvents);
      } else {
        setEvents(updatedEvents);
      }
    } catch (err) {
      console.error("Error saving events:", err);
      showToast('Failed to save events', 'error');
    }
  };

  // Show toast helper
  const showToast = (message, type = 'info') => {
    setToast({ message, type });
  };

  // Parse AI response into table format
  const parseResponseToTable = (text) => {
    if (!text) return [];
    
    const lines = text.split('\n').filter(line => line.trim());
    const parsedData = [];
    
    lines.forEach((line, index) => {
      if (line.includes(':') || line.includes('-') || line.includes('•')) {
        const parts = line.replace(/[•\-*]/g, '').split(':').map(p => p.trim());
        if (parts.length >= 1) {
          parsedData.push({
            id: index + 1,
            category: parts[0] || `Item ${index + 1}`,
            details: parts.slice(1).join(':') || line,
          });
        }
      } else if (line.length > 5) {
        parsedData.push({
          id: index + 1,
          category: `Section ${index + 1}`,
          details: line,
        });
      }
    });
    
    return parsedData;
  };

  // Handle base AI event plan generation
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!prompt.trim()) return;

    setLoading(true);
    setResponse("");

    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const aiResponse = `📋 **AI Generated Plan for:** ${prompt}

**🎯 Event Overview:**
• Theme: Professional & Engaging
• Expected Attendance: Based on your requirements
• Duration: Flexible scheduling recommended

**📅 Suggested Timeline:**
• Pre-event planning: 2-4 weeks before
• Setup day: Day before event
• Event day: Main activities
• Post-event: Follow-up within 48 hours

**💰 Budget Considerations:**
• Venue: 30-40% of total budget
• Catering: 25-35% of total budget  
• Marketing: 10-15% of total budget
• Contingency: 10% reserve fund

**✅ Next Steps:**
1. Define clear objectives
2. Set budget limits
3. Book venue early
4. Create marketing plan
5. Arrange vendors & suppliers`;

      setResponse(aiResponse);
      setTableData(parseResponseToTable(aiResponse));

      setQuickAddData(prev => ({
        ...prev,
        title: `AI Event: ${prompt.substring(0, 30)}...`,
        description: aiResponse
      }));

      showToast('🤖 AI plan generated successfully!', 'success');

    } catch (err) {
      console.error("AI Planner Error:", err);
      setResponse("⚠️ Error: Unable to connect to the AI service. Please try again later.");
      setTableData([]);
      showToast('Failed to generate plan', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Handle other AI feature buttons
  const handleFeatureClick = async (endpoint, featureName) => {
    setLoading(true);
    setResponse("");

    try {
      await new Promise(resolve => setTimeout(resolve, 1200));
      
      const aiResponse = `🤖 **${featureName} Generated**

Based on your event requirements, here are the ${featureName.toLowerCase()} details:

**Key Points:**
• Comprehensive analysis completed
• Best practices applied
• Industry standards followed
• Custom recommendations provided

**Action Items:**
1. Review the generated content
2. Customize as needed
3. Implement step-by-step
4. Monitor results

*Generated by AI Assistant*`;
      
      setResponse(aiResponse);
      setTableData(parseResponseToTable(aiResponse));

      setQuickAddData(prev => ({
        ...prev,
        title: `AI ${featureName}`,
        description: aiResponse
      }));

      showToast(`✨ ${featureName} generated!`, 'success');

    } catch (err) {
      console.error(`AI ${featureName} Error:`, err);
      setResponse(`⚠️ Network error while generating ${featureName}. Please try again.`);
      setTableData([]);
      showToast(`Failed to generate ${featureName}`, 'error');
    } finally {
      setLoading(false);
    }
  };

  // Handle form changes for quick add
  const handleQuickAddChange = (e) => {
    const { name, value } = e.target;
    setQuickAddData(prev => ({ ...prev, [name]: value }));
    
    if (name === 'startDate' || name === 'endDate') {
      setDateError("");
    }
  };

  // Validate dates
  const validateDates = () => {
    const now = new Date();
    now.setSeconds(0, 0);
    const start = new Date(quickAddData.startDate);
    const end = new Date(quickAddData.endDate);

    if (!quickAddData.startDate || !quickAddData.endDate) {
      setDateError('⚠️ Please select both start and end dates');
      return false;
    }

    if (start < now) {
      setDateError('❌ Start date cannot be in the past');
      return false;
    }

    if (end < start) {
      setDateError('❌ End date must be after start date');
      return false;
    }

    setDateError('');
    return true;
  };

  // Calculate event duration in days
  const calculateDuration = () => {
    if (!quickAddData.startDate || !quickAddData.endDate) return 0;
    
    const start = new Date(quickAddData.startDate);
    const end = new Date(quickAddData.endDate);
    const diffTime = Math.abs(end - start);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  // Check if date is in the past
  const isPastDate = (dateString) => {
    if (!dateString) return false;
    return new Date(dateString) < new Date();
  };

  // Handle quick add submission
  const handleQuickAddSubmit = async (e) => {
    e.preventDefault();
    
    if (!quickAddData.title || !quickAddData.startDate || !quickAddData.endDate) {
      showToast('Please fill in required fields', 'warning');
      return;
    }

    if (!validateDates()) {
      return;
    }

    setIsCreatingEvent(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 800));
      
      const newEvent = {
        _id: `ai_event_${Date.now()}`,
        ...quickAddData,
        source: 'ai',
        createdAt: new Date().toISOString()
      };
      
      const updatedEvents = [...allEvents, newEvent];
      updateAndSave(updatedEvents);
      
      showToast(`🎉 Event created successfully! Duration: ${calculateDuration()} days`, 'success');
      
      setQuickAddData({ 
        title: '', 
        description: '', 
        startDate: '', 
        endDate: '', 
        category: 'personal',
        location: { address: '', city: '', state: '', country: '' },
        status: 'draft',
        visibility: 'private'
      });
      setShowQuickAddForm(false);
      setTableData([]);
      setDateError("");
      
      setEventCreatedFlag(prev => prev + 1);
      
      if (onEventCreated) {
        onEventCreated(newEvent);
      }
      
    } catch (error) {
      console.error("Error creating event:", error);
      showToast('❌ Failed to create event', 'error');
    } finally {
      setIsCreatingEvent(false);
    }
  };

  // Format date helper
  const formatDate = (dateString) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  // Check if event is past
  const isPastEvent = (dateString) => {
    return new Date(dateString) < new Date();
  };

  // Get status badge colors
  const getStatusBadge = (status) => {
    const colors = {
      draft: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
      published: 'bg-green-500/20 text-green-400 border-green-500/30',
      cancelled: 'bg-red-500/20 text-red-400 border-red-500/30',
      postponed: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
      upcoming: 'bg-blue-500/20 text-blue-400 border-blue-500/30'
    };
    return colors[status] || colors.draft;
  };

  // Get category icon
  const getCategoryIcon = (category) => {
    switch(category) {
      case 'wedding': return '💒';
      case 'professional': return '💼';
      case 'college': return '🎓';
      default: return '⭐';
    }
  };

  // Get displayed events based on filter mode
  const displayedEvents = filterMode === "ai" ? events : allEvents;

  // Handle refresh
  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      loadAllEvents(); 
      setIsRefreshing(false);
      showToast('📊 Full history retrieved!', 'info');
    }, 500);
  };

  // ==================== EVENT ACTIONS ====================
  
  // Edit Event
  const openEditModal = (event) => {
    setModalState({ isOpen: true, type: 'edit', event });
  };

  const handleEditSubmit = (formData) => {
    if (!formData.title || !formData.startDate || !formData.endDate) {
      showToast('Please fill in required fields', 'warning');
      return;
    }

    const updatedEvents = allEvents.map(e => 
      e._id === modalState.event._id ? { ...e, ...formData } : e
    );
    updateAndSave(updatedEvents);
    setModalState({ isOpen: false, type: null, event: null });
    showToast('✅ Event updated successfully!', 'success');
  };

  // Cancel Event
  const handleCancelEvent = (eventId) => {
    setModalState({
      isOpen: true,
      type: 'cancel',
      event: allEvents.find(e => e._id === eventId)
    });
  };

  const confirmCancelEvent = () => {
    const updatedEvents = allEvents.map(e => 
      e._id === modalState.event._id ? { ...e, status: 'cancelled' } : e
    );
    updateAndSave(updatedEvents);
    setModalState({ isOpen: false, type: null, event: null });
    showToast('✅ Event cancelled successfully!', 'success');
  };

  // Postpone Event
  const handlePostponeEvent = (eventId) => {
    const event = allEvents.find(e => e._id === eventId);
    setModalState({
      isOpen: true,
      type: 'postpone',
      event: event
    });
  };

  const handleSubmitPostpone = (newStart, newEnd) => {
    if (!newStart || !newEnd) {
      showToast('Please select new dates', 'warning');
      return;
    }

    const updatedEvents = allEvents.map(e => 
      e._id === modalState.event._id ? { 
        ...e, 
        startDate: newStart, 
        endDate: newEnd,
        status: 'postponed'
      } : e
    );
    updateAndSave(updatedEvents);
    setModalState({ isOpen: false, type: null, event: null });
    showToast('✅ Event postponed successfully!', 'success');
  };

  // Rebook Event
  const handleRebookEvent = (eventId) => {
    const event = allEvents.find(e => e._id === eventId);
    setModalState({
      isOpen: true,
      type: 'rebook',
      event: event
    });
  };

  const handleSubmitRebook = (formData) => {
    if (!formData.startDate || !formData.endDate) {
      showToast('Please select dates for rebooking', 'warning');
      return;
    }
    
    const start = new Date(formData.startDate);
    const end = new Date(formData.endDate);
    const now = new Date();
    
    if (start < now || end < now) {
      showToast('Cannot rebook to past dates!', 'error');
      return;
    }
    
    const rebookedEvent = {
      ...modalState.event,
      _id: `ai_event_${Date.now()}`,
      title: formData.title,
      startDate: formData.startDate,
      endDate: formData.endDate,
      createdAt: new Date().toISOString(),
      status: 'published',
      source: 'ai-rebook'
    };
    const updatedEvents = [...allEvents, rebookedEvent];
    updateAndSave(updatedEvents);
    setModalState({ isOpen: false, type: null, event: null });
    showToast('🔄 Event rebooked successfully!', 'success');
  };

  // Delete Event
  const handleDeleteEvent = (eventId) => {
    const updatedEvents = allEvents.filter(e => e._id !== eventId);
    updateAndSave(updatedEvents);
    showToast('🗑️ Event deleted permanently!', 'info');
  };

  return (
    <>
      {/* AI PLANNER COMPONENT */}
      <div className="min-h-screen p-6 relative overflow-hidden" style={{background: '#0f172a'}}>
        {/* Background Effects */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -left-40 w-96 h-96 bg-gradient-to-br from-blue-500/10 to-purple-500/10 rounded-full blur-3xl"></div>
          <div className="absolute top-1/2 -right-40 w-96 h-96 bg-gradient-to-br from-emerald-500/10 to-cyan-500/10 rounded-full blur-3xl"></div>
        </div>

        {/* Toast Notification */}
        {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

        <div className="max-w-7xl mx-auto relative z-10 space-y-8">
          
          {/* HEADER */}
          <div className="text-center mb-10">
            <h2 className="text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-purple-400 to-emerald-400 mb-3">
              🤖 AI Event Planner
            </h2>
            <p className="text-gray-400 text-lg">Get instant AI-powered event planning suggestions and smart tools</p>
          </div>

          {/* AI PLANNER SECTION */}
          <div className="bg-gray-900/60 backdrop-blur-xl border border-gray-700/50 rounded-3xl p-8 shadow-2xl">
            
            {/* Section Header */}
            <div className="flex items-center gap-3 mb-8">
              <div className="p-3 bg-emerald-500/20 rounded-xl text-emerald-400">
                <Brain size={24} />
              </div>
              <div>
                <h3 className="text-2xl font-semibold text-white">AI Control Panel</h3>
                <p className="text-gray-400 text-sm">Describe your event and let AI do the magic</p>
              </div>
            </div>

            {/* Quick Suggestions */}
            <div className="mb-8">
              <h4 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <Zap size={18} className="text-emerald-400" /> Quick Suggestions
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {quickPrompts.map((suggestion, i) => (
                  <button
                    key={i}
                    onClick={() => setPrompt(suggestion)}
                    className="bg-gray-800/50 border border-gray-700 text-white p-4 rounded-xl hover:bg-gray-800 hover:border-emerald-500/50 transition-all text-left hover:scale-[1.02]"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            </div>

            {/* Main Input Form */}
            <form onSubmit={handleSubmit} className="mb-8">
              <div className="bg-gray-800/40 border border-gray-700/50 rounded-2xl p-6">
                <h4 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                  <AlignLeft className="w-5 h-5 text-cyan-400" /> Describe Your Event
                </h4>
                <textarea
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="e.g., Plan a 2-day college fest for 200 students in Hyderabad"
                  className="w-full p-4 bg-gray-900/50 border border-gray-700 rounded-xl text-white placeholder-gray-500 resize-none h-32 focus:border-emerald-500 outline-none transition-all"
                  required
                />
                <button
                  type="submit"
                  disabled={loading || !prompt.trim()}
                  className="mt-4 w-full py-4 bg-gradient-to-r from-blue-500 via-purple-500 to-emerald-500 text-white font-bold rounded-xl hover:scale-[1.02] transition-transform duration-300 shadow-lg hover:shadow-xl disabled:opacity-50"
                >
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <RefreshCw size={20} className="animate-spin" /> Generating...
                    </span>
                  ) : (
                    <span className="flex items-center justify-center gap-2">
                      <Sparkles size={20} /> Generate Event Plan ✨
                    </span>
                  )}
                </button>
              </div>
            </form>

            {/* AI Feature Buttons */}
            <div className="mb-8">
              <h4 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <Target className="w-5 h-5 text-purple-400" /> AI-Powered Tools
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {aiFeatures.map((feature, i) => (
                  <button
                    key={i}
                    onClick={() => handleFeatureClick(feature.endpoint, feature.name)}
                    disabled={loading}
                    className="bg-gray-800/50 border border-gray-700 rounded-xl p-5 text-left hover:bg-gray-800 hover:border-purple-500/50 transition-all duration-300 disabled:opacity-50 hover:scale-[1.02]"
                  >
                    <div className="flex items-center mb-2">
                      <span className="text-2xl mr-3">{feature.icon}</span>
                      <h5 className="font-semibold text-white">{feature.name}</h5>
                    </div>
                    <p className="text-sm text-gray-400">{feature.description}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* Response Output */}
            {response && (
              <div className="bg-gray-800/40 border border-gray-700/50 rounded-2xl p-6 animate-slideUp">
                <div className="flex justify-between items-center mb-4">
                  <h4 className="font-semibold text-emerald-400 flex items-center gap-2">
                    <Brain size={18} /> AI Response:
                  </h4>
                  <button
                    onClick={() => setShowQuickAddForm(!showQuickAddForm)}
                    className="px-4 py-2 bg-gradient-to-r from-emerald-500 to-cyan-500 text-white text-sm rounded-xl hover:scale-[1.02] transition-transform font-semibold"
                  >
                    {showQuickAddForm ? 'Cancel' : '➕ Quick Add'}
                  </button>
                </div>

                {tableData.length > 0 ? (
                  <div className="overflow-x-auto rounded-xl border border-gray-700 bg-gray-900/30">
                    <table className="w-full text-left">
                      <thead className="bg-gray-800/90 sticky top-0">
                        <tr>
                          <th className="py-3 px-4 text-gray-400 font-semibold text-xs uppercase tracking-wider">#</th>
                          <th className="py-3 px-4 text-gray-400 font-semibold text-xs uppercase tracking-wider">Category</th>
                          <th className="py-3 px-4 text-gray-400 font-semibold text-xs uppercase tracking-wider">Details</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-800/50">
                        {tableData.map((row, idx) => (
                          <tr key={row.id} className={`hover:bg-gray-800/60 transition-colors ${idx % 2 === 0 ? 'bg-white/5' : 'bg-transparent'}`}>
                            <td className="py-3 px-4 text-gray-500">{row.id}</td>
                            <td className="py-3 px-4 font-medium text-emerald-400">{row.category}</td>
                            <td className="py-3 px-4 text-gray-300">{row.details}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="bg-gray-900/30 rounded-xl p-4 border border-gray-700">
                    <pre className="text-gray-300 text-sm whitespace-pre-wrap">{response}</pre>
                  </div>
                )}
                
                <details className="mt-4">
                  <summary className="cursor-pointer text-gray-500 text-sm hover:text-gray-300 transition-colors">
                    📋 View Raw Text Format
                  </summary>
                  <pre className="mt-2 p-3 bg-black/30 rounded-xl text-xs text-gray-500 whitespace-pre-wrap overflow-x-auto border border-gray-800">
                    {response}
                  </pre>
                </details>
              </div>
            )}

            {/* Quick Add Event Form */}
            {showQuickAddForm && (
              <div className="mt-8 bg-gray-800/40 border border-gray-700/50 rounded-2xl p-6 animate-slideUp">
                <h4 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
                  <CalendarPlus size={24} className="text-emerald-400" /> Quick Add Event
                </h4>
                
                <form onSubmit={handleQuickAddSubmit} className="space-y-6">
                  <div>
                    <label className="block text-gray-300 text-sm font-medium mb-2">Event Title *</label>
                    <input
                      type="text"
                      name="title"
                      value={quickAddData.title}
                      onChange={handleQuickAddChange}
                      className="w-full px-4 py-3 bg-gray-900/50 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:border-emerald-500 outline-none transition-all"
                      placeholder="Enter event title..."
                      required
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div className="relative">
                      <label className="block text-gray-300 text-sm font-medium mb-2">Start Date & Time *</label>
                      <div className="relative">
                        <CalendarDays className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500 w-5 h-5" />
                        <input
                          type="datetime-local"
                          name="startDate"
                          value={quickAddData.startDate}
                          onChange={handleQuickAddChange}
                          min={minDateTime}
                          className={`w-full pl-11 pr-4 py-3 bg-gray-900/50 border rounded-xl text-white focus:border-emerald-500 outline-none transition-all ${
                            isPastDate(quickAddData.startDate) ? 'border-red-500' : 'border-gray-700'
                          }`}
                          required
                        />
                      </div>
                      {isPastDate(quickAddData.startDate) && (
                        <p className="text-red-400 text-xs mt-1 flex items-center gap-1">
                          <AlertTriangle size={12} /> This date is in the past!
                        </p>
                      )}
                    </div>
                    <div className="relative">
                      <label className="block text-gray-300 text-sm font-medium mb-2">End Date & Time *</label>
                      <div className="relative">
                        <CalendarDays className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500 w-5 h-5" />
                        <input
                          type="datetime-local"
                          name="endDate"
                          value={quickAddData.endDate}
                          onChange={handleQuickAddChange}
                          min={quickAddData.startDate || minDateTime}
                          className="w-full pl-11 pr-4 py-3 bg-gray-900/50 border border-gray-700 rounded-xl text-white focus:border-emerald-500 outline-none transition-all"
                          required
                        />
                      </div>
                    </div>
                  </div>

                  {dateError && (
                    <div className="bg-orange-500/15 border border-orange-500/40 text-orange-300 px-4 py-3 rounded-xl text-sm flex items-center gap-2">
                      <AlertTriangle size={16} />
                      {dateError}
                    </div>
                  )}

                  {quickAddData.startDate && quickAddData.endDate && !dateError && (
                    <div className={`px-4 py-3 rounded-xl text-center ${
                      calculateDuration() > 90 ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30' :
                      calculateDuration() > 0 ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' :
                      'bg-yellow-500/20 text-yellow-300 border border-yellow-500/30'
                    }`}>
                      ⏱️ Event Duration: <strong>{calculateDuration()} days</strong>
                    </div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div className="relative">
                      <label className="block text-gray-300 text-sm font-medium mb-2">Category</label>
                      <div className="relative">
                        <Tags className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500 w-5 h-5" />
                        <select
                          name="category"
                          value={quickAddData.category}
                          onChange={handleQuickAddChange}
                          className="w-full pl-11 pr-4 py-3 bg-gray-900/50 border border-gray-700 rounded-xl text-white focus:border-emerald-500 outline-none transition-all appearance-none"
                        >
                          <option value="personal" className="bg-gray-800">Personal</option>
                          <option value="wedding" className="bg-gray-800">Wedding</option>
                          <option value="college" className="bg-gray-800">College</option>
                          <option value="professional" className="bg-gray-800">Professional</option>
                          <option value="other" className="bg-gray-800">Other</option>
                        </select>
                      </div>
                    </div>
                    <div className="relative">
                      <label className="block text-gray-300 text-sm font-medium mb-2">Visibility</label>
                      <div className="relative">
                        <Eye className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500 w-5 h-5" />
                        <select
                          name="visibility"
                          value={quickAddData.visibility}
                          onChange={handleQuickAddChange}
                          className="w-full pl-11 pr-4 py-3 bg-gray-900/50 border border-gray-700 rounded-xl text-white focus:border-emerald-500 outline-none transition-all appearance-none"
                        >
                          <option value="private" className="bg-gray-800">Private (Only Me)</option>
                          <option value="public" className="bg-gray-800">Public (Anyone)</option>
                          <option value="invite-only" className="bg-gray-800">Invite Only</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-gray-300 text-sm font-medium mb-2">Description</label>
                    <textarea
                      name="description"
                      value={quickAddData.description}
                      onChange={handleQuickAddChange}
                      rows={4}
                      className="w-full p-4 bg-gray-900/50 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:border-emerald-500 outline-none transition-all resize-none"
                      placeholder="Provide additional details..."
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isCreatingEvent || isPastDate(quickAddData.startDate)}
                    className="w-full py-4 bg-gradient-to-r from-blue-500 via-purple-500 to-emerald-500 text-white font-bold rounded-xl hover:scale-[1.02] transition-transform duration-300 shadow-lg hover:shadow-xl disabled:opacity-50"
                  >
                    {isCreatingEvent ? (
                      <span className="flex items-center justify-center gap-2">
                        <RefreshCw size={20} className="animate-spin" /> Creating...
                      </span>
                    ) : (
                      <span className="flex items-center justify-center gap-2">
                        <Sparkles size={20} /> Create Event 🎉
                      </span>
                    )}
                  </button>
                </form>
              </div>
            )}
          </div>

          {/* EVENTS TABLE SECTION */}
          <div className="bg-gray-900/60 backdrop-blur-xl border border-gray-700/50 rounded-3xl p-8 shadow-2xl">
            <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-indigo-500/20 rounded-xl text-indigo-400">
                  <History size={24} />
                </div>
                <div>
                  <h3 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">
                    My AI Events & History
                  </h3>
                </div>
              </div>
              
              <div className="flex items-center gap-4">
                <div className="flex bg-gray-800 rounded-xl p-1 border border-gray-700">
                  <button
                    onClick={() => setFilterMode("ai")}
                    className={`px-4 py-2 rounded-lg text-sm transition-all font-medium ${
                      filterMode === "ai" 
                        ? "bg-emerald-500 text-white" 
                        : "text-gray-400 hover:text-white"
                    }`}
                  >
                    🤖 AI Only
                  </button>
                  <button
                    onClick={() => setFilterMode("all")}
                    className={`px-4 py-2 rounded-lg text-sm transition-all font-medium ${
                      filterMode === "all" 
                        ? "bg-blue-500 text-white" 
                        : "text-gray-400 hover:text-white"
                    }`}
                  >
                    📁 All
                  </button>
                </div>
                
                <button 
                  onClick={handleRefresh} 
                  disabled={isRefreshing}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg border border-indigo-500/30 bg-indigo-500/10 text-indigo-400 hover:bg-indigo-500/20 transition-all disabled:opacity-50"
                >
                  <RefreshCw size={16} className={isRefreshing ? "animate-spin" : ""} />
                  Sync
                </button>
                
                <div className="bg-gray-800 px-4 py-2 rounded-lg border border-gray-700 flex items-center gap-3">
                  <span className="text-xl font-bold text-white">{displayedEvents.length}</span>
                  <span className="text-gray-500 text-sm border-l border-gray-600 pl-3">Records</span>
                </div>
              </div>
            </div>

            {displayedEvents.length === 0 ? (
              <div className="text-center py-16 border-2 border-dashed border-gray-700 rounded-2xl">
                <Brain size={48} className="mx-auto text-gray-600 mb-4" />
                <h3 className="text-xl font-semibold text-gray-400 mb-2">No Events Found</h3>
                <p className="text-gray-500">Use the AI Planner above to generate and create your first AI-powered event!</p>
              </div>
            ) : (
              <>
                <div className="overflow-x-auto rounded-xl border border-gray-700 bg-gray-900/30">
                  <table className="w-full text-left">
                    <thead className="bg-gray-800/90 sticky top-0">
                      <tr>
                        <th className="py-4 px-5 text-gray-400 font-semibold text-xs uppercase tracking-wider">Event</th>
                        <th className="py-4 px-5 text-gray-400 font-semibold text-xs uppercase tracking-wider">Date & Time</th>
                        <th className="py-4 px-5 text-gray-400 font-semibold text-xs uppercase tracking-wider hidden md:table-cell">Category</th>
                        <th className="py-4 px-5 text-gray-400 font-semibold text-xs uppercase tracking-wider">Status</th>
                        <th className="py-4 px-5 text-right text-gray-400 font-semibold text-xs uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-800/50">
                      {displayedEvents.map((event) => {
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
                              <span className="inline-flex items-center px-3 py-1 rounded-full text-[11px] font-medium bg-gray-800 text-gray-300 capitalize">
                                {event.category || 'other'}
                              </span>
                            </td>
                            
                            <td className="py-4 px-5">
                              <span className={`inline-flex items-center px-3 py-1 rounded-full text-[11px] font-bold border capitalize ${getStatusBadge(event.status)}`}>
                                {event.status || 'draft'}
                              </span>
                            </td>
                            
                            <td className="py-4 px-5 text-right">
                              <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                
                                <button 
                                  onClick={() => alert(`Event Details:\n\nTitle: ${event.title}\nDescription: ${(event.description || '').substring(0, 200)}...`)}
                                  className="p-1.5 rounded-md hover:bg-blue-500/20 text-blue-400/70 hover:text-blue-400 transition-all" 
                                  title="View Details"
                                >
                                  <Eye size={14} />
                                </button>
                                
                                <button 
                                  onClick={() => openEditModal(event)} 
                                  className="p-1.5 rounded-md hover:bg-yellow-500/20 text-yellow-400/70 hover:text-yellow-400 transition-all" 
                                  title="Edit Event"
                                >
                                  ✏️
                                </button>
                                
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
                                  title="Delete Forever"
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

                {/* Footer Stats */}
                <div className="mt-6 pt-6 border-t border-gray-800 grid grid-cols-2 md:grid-cols-4 gap-4">
                   <div className="bg-gray-800/30 rounded-lg p-3 text-center border border-gray-800">
                     <div className="text-lg font-bold text-gray-200">{displayedEvents.filter(e => isPastEvent(e.startDate)).length}</div>
                     <div className="text-[10px] text-gray-500 uppercase tracking-wider">Past Events</div>
                   </div>
                   <div className="bg-gray-800/30 rounded-lg p-3 text-center border border-gray-800">
                     <div className="text-lg font-bold text-blue-400">{displayedEvents.filter(e => !isPastEvent(e.startDate)).length}</div>
                     <div className="text-[10px] text-gray-500 uppercase tracking-wider">Upcoming</div>
                   </div>
                   <div className="bg-gray-800/30 rounded-lg p-3 text-center border border-gray-800">
                     <div className="text-lg font-bold text-green-400">{displayedEvents.filter(e => e.status === 'published').length}</div>
                     <div className="text-[10px] text-gray-500 uppercase tracking-wider">Published</div>
                   </div>
                   <div className="bg-gray-800/30 rounded-lg p-3 text-center border border-gray-800">
                     <div className="text-lg font-bold text-yellow-400">{displayedEvents.filter(e => e.status === 'draft').length}</div>
                     <div className="text-[10px] text-gray-500 uppercase tracking-wider">Drafts</div>
                   </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* MODALS */}
      
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

      {/* Edit Modal */}
      <ActionModal 
        isOpen={modalState.isOpen && modalState.type === 'edit'} 
        onClose={() => setModalState({isOpen:false,type:null,event:null})} 
        title="Edit Event"
      >
        <EditModalContent 
          event={modalState.event}
          onSave={handleEditSubmit}
          minDateTime={minDateTime}
        />
      </ActionModal>

      {/* Postpone Modal */}
      <ActionModal 
        isOpen={modalState.isOpen && modalState.type === 'postpone'} 
        onClose={() => setModalState({isOpen:false,type:null,event:null})} 
        title="Postpone Event"
      >
        <PostponeModalContent 
          event={modalState.event}
          onSave={handleSubmitPostpone}
          minDateTime={minDateTime}
        />
      </ActionModal>

      {/* Rebook Modal */}
      <ActionModal 
        isOpen={modalState.isOpen && modalState.type === 'rebook'} 
        onClose={() => setModalState({isOpen:false,type:null,event:null})} 
        title="Rebook Event"
      >
        <RebookModalContent 
          event={modalState.event}
          onSave={handleSubmitRebook}
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
    </>
  );
};

export default AIPlanner;