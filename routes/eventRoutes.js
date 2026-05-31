import express from 'express';
const router = express.Router();
import {
  getEvents,
  getEvent,
  createEvent,
  updateEvent,
  deleteEvent,
  joinEvent,
  leaveEvent,
  addComment,
} from '../controllers/eventController.js';

import { authMiddleware } from '../config/authMiddleware.js';

// All routes require authentication
router.use(authMiddleware);

router.route('/')
  .get(getEvents)
  .post(createEvent);

router.route('/:id')
  .get(getEvent)
  .put(updateEvent)
  .delete(deleteEvent);

router.post('/:id/join', joinEvent);
router.post('/:id/leave', leaveEvent);
router.post('/:id/comments', addComment);

export default router;
