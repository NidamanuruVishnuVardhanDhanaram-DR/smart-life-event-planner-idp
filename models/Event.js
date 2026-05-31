import mongoose from 'mongoose';

const eventSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Please add an event title'],
    trim: true,
  },
  description: {
    type: String,
    required: [true, 'Please add an event description'],
  },
  category: {
    type: String,
    enum: ['personal', 'college', 'professional', 'other'],
    default: 'personal',
  },
  startDate: {
    type: Date,
    required: [true, 'Please add a start date'],
  },
  endDate: {
    type: Date,
    required: [true, 'Please add an end date'],
  },
  location: {
    address: String,
    city: String,
    state: String,
    country: String,
    coordinates: {
      lat: Number,
      lng: Number,
    },
  },
  organizer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  participants: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    role: {
      type: String,
      enum: ['organizer', 'volunteer', 'guest'],
      default: 'guest',
    },
    status: {
      type: String,
      enum: ['invited', 'accepted', 'declined', 'maybe'],
      default: 'invited',
    },
  }],
  budget: {
    total: {
      type: Number,
      default: 0,
    },
    items: [{
      category: String,
      amount: Number,
      description: String,
    }],
  },
  weather: {
    forecast: {
      type: Object,
      default: {},
    },
    alerts: [{
      type: String,
    }],
    suggestions: [{
      type: String,
    }],
  },
  aiGenerated: {
    description: String,
    tagline: String,
    todoList: [{
      type: String,
    }],
    nameSuggestions: [{
      type: String,
    }],
  },
  status: {
    type: String,
    enum: ['draft', 'published', 'ongoing', 'completed', 'cancelled'],
    default: 'draft',
  },
  visibility: {
    type: String,
    enum: ['public', 'private', 'invite-only'],
    default: 'private',
  },
  tags: [{
    type: String,
  }],
  attachments: [{
    name: String,
    url: String,
    type: String,
  }],
  comments: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    text: String,
    createdAt: {
      type: Date,
      default: Date.now,
    },
  }],
  analytics: {
    views: {
      type: Number,
      default: 0,
    },
    participantsCount: {
      type: Number,
      default: 0,
    },
    engagement: {
      type: Number,
      default: 0,
    },
  },
}, {
  timestamps: true,
});

// Index for better query performance
eventSchema.index({ startDate: 1, endDate: 1 });
eventSchema.index({ organizer: 1 });
eventSchema.index({ category: 1 });
eventSchema.index({ 'location.city': 1 });

export default mongoose.model('Event', eventSchema);
