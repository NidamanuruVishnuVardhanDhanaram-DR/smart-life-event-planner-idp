import Event from '../models/Event.js';
import User from '../models/User.js';

// @desc    Get all events
// @route   GET /api/events
// @access  Private
const getEvents = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const filter = {};

    // Filter by user (events they created or participate in)
    if (req.query.myEvents === 'true') {
      filter.$or = [
        { organizer: req.user.id },
        { 'participants.user': req.user.id }
      ];
    }

    // Filter by category
    if (req.query.category) {
      filter.category = req.query.category;
    }

    // Filter by status
    if (req.query.status) {
      filter.status = req.query.status;
    }

    // Filter by date range
    if (req.query.startDate && req.query.endDate) {
      filter.startDate = {
        $gte: new Date(req.query.startDate),
        $lte: new Date(req.query.endDate)
      };
    }

    const events = await Event.find(filter)
      .populate('organizer', 'name email avatar')
      .populate('participants.user', 'name email avatar')
      .sort({ startDate: 1 })
      .skip(skip)
      .limit(limit);

    const total = await Event.countDocuments(filter);

    res.json({
      events,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get single event
// @route   GET /api/events/:id
// @access  Private
const getEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id)
      .populate('organizer', 'name email avatar')
      .populate('participants.user', 'name email avatar')
      .populate('comments.user', 'name avatar');

    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    // Check if user has access to this event
    const isOrganizer = event.organizer._id.toString() === req.user.id;
    const isParticipant = event.participants.some(p => p.user._id.toString() === req.user.id);

    if (event.visibility === 'private' && !isOrganizer && !isParticipant) {
      return res.status(403).json({ message: 'Access denied' });
    }

    res.json(event);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create new event
// @route   POST /api/events
// @access  Private
const createEvent = async (req, res) => {
  try {
    const eventData = {
      ...req.body,
      organizer: req.user.id,
    };

    const event = await Event.create(eventData);

    // Add event to user's created events
    await User.findByIdAndUpdate(req.user.id, {
      $push: { eventsCreated: event._id }
    });

    const populatedEvent = await Event.findById(event._id)
      .populate('organizer', 'name email avatar');

    res.status(201).json(populatedEvent);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update event
// @route   PUT /api/events/:id
// @access  Private
const updateEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);

    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    // Check if user is the organizer
    if (event.organizer.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to update this event' });
    }

    const updatedEvent = await Event.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    )
      .populate('organizer', 'name email avatar')
      .populate('participants.user', 'name email avatar');

    res.json(updatedEvent);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete event
// @route   DELETE /api/events/:id
// @access  Private
const deleteEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);

    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    // Check if user is the organizer
    if (event.organizer.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to delete this event' });
    }

    await Event.findByIdAndDelete(req.params.id);

    // Remove event from user's created events
    await User.findByIdAndUpdate(req.user.id, {
      $pull: { eventsCreated: req.params.id }
    });

    res.json({ message: 'Event removed' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Join event
// @route   POST /api/events/:id/join
// @access  Private
const joinEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);

    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    // Check if user is already a participant
    const isParticipant = event.participants.some(p => p.user.toString() === req.user.id);

    if (isParticipant) {
      return res.status(400).json({ message: 'Already participating in this event' });
    }

    event.participants.push({
      user: req.user.id,
      role: 'guest',
      status: 'accepted',
    });

    await event.save();

    // Add event to user's participating events
    await User.findByIdAndUpdate(req.user.id, {
      $push: { eventsParticipating: event._id }
    });

    res.json({ message: 'Joined event successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Leave event
// @route   POST /api/events/:id/leave
// @access  Private
const leaveEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);

    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    // Remove user from participants
    event.participants = event.participants.filter(p => p.user.toString() !== req.user.id);

    await event.save();

    // Remove event from user's participating events
    await User.findByIdAndUpdate(req.user.id, {
      $pull: { eventsParticipating: req.params.id }
    });

    res.json({ message: 'Left event successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Add comment to event
// @route   POST /api/events/:id/comments
// @access  Private
const addComment = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);

    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    const comment = {
      user: req.user.id,
      text: req.body.text,
    };

    event.comments.push(comment);
    await event.save();

    const populatedEvent = await Event.findById(req.params.id)
      .populate('comments.user', 'name avatar');

    res.status(201).json(populatedEvent.comments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export {
  getEvents,
  getEvent,
  createEvent,
  updateEvent,
  deleteEvent,
  joinEvent,
  leaveEvent,
  addComment,
};
