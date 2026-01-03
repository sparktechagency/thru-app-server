import express from 'express';
import { EventsController } from './events.controller';
import { EventsValidations } from './events.validation';
import validateRequest from '../../middleware/validateRequest';
import auth from '../../middleware/auth';
import { USER_ROLES } from '../../../enum/user';

const router = express.Router();

// Get events (checks DB first, then SerpAPI if needed)
router.get(
    '/',
    // auth(USER_ROLES.USER),
    validateRequest(EventsValidations.getEvents),
    EventsController.getEvents
);

// Get all events from database only (no SerpAPI call)
router.get(
    '/db',
    auth(USER_ROLES.USER),
    EventsController.getAllEventsFromDB
);

// Test endpoint
router.get(
    '/test',
    EventsController.testEvents
);

export const EventsRoutes = router;
