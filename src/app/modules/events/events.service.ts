import { getJson } from 'serpapi';
import { StatusCodes } from 'http-status-codes';
import ApiError from '../../../errors/ApiError';
import { Event } from './events.model';
import { IEventQuery, IEventsResponse, IEvent } from './events.interface';
import config from '../../../config';

const getEvents = async (query: IEventQuery, forceRefresh: boolean = false): Promise<IEventsResponse> => {
    const { location, dateFilter, eventType, start = 0 } = query;

    // Check if we have cached events in database (unless force refresh)
    if (!forceRefresh) {
        const cachedEvents = await Event.find({ location: new RegExp(location, 'i') })
            .sort({ createdAt: -1 })
            .lean();

        if (cachedEvents.length > 0) {
            // Filter cached events based on query parameters
            let filteredEvents = cachedEvents;

            if (eventType) {
                filteredEvents = filteredEvents.filter(event => event.eventType === eventType);
            }

            // Apply pagination
            const paginatedEvents = filteredEvents.slice(start, start + 10);

            return {
                events: paginatedEvents as IEvent[],
                totalResults: filteredEvents.length,
                location,
                fromCache: true,
            };
        }
    }

    // Fetch from SerpAPI if no cache or force refresh
    if (!config.serp_api_key) {
        throw new ApiError(StatusCodes.INTERNAL_SERVER_ERROR, 'SerpAPI key is not configured');
    }

    try {
        // Build SerpAPI query
        const searchQuery = `Events in ${location}`;
        const params: any = {
            engine: 'google_events',
            q: searchQuery,
            api_key: config.serp_api_key,
        };

        // Add filters
        if (dateFilter || eventType) {
            const filters: string[] = [];
            if (dateFilter) {
                filters.push(`date:${dateFilter}`);
            }
            if (eventType === 'virtual') {
                filters.push('event_type:Virtual-Event');
            }
            if (filters.length > 0) {
                params.htichips = filters.join(',');
            }
        }

        if (start > 0) {
            params.start = start;
        }

        // Call SerpAPI
        const response: any = await getJson(params);

        if (!response.events_results || response.events_results.length === 0) {
            return {
                events: [],
                totalResults: 0,
                location,
                fromCache: false,
            };
        }

        // Transform and save events to database
        const eventsToSave = response.events_results.map((event: any) => ({
            title: event.title,
            date: {
                start: event.date?.start_date,
                when: event.date?.when,
            },
            address: event.address,
            link: event.link,
            venue: event.venue ? {
                name: event.venue.name,
                link: event.venue.link,
            } : undefined,
            thumbnail: event.thumbnail,
            ticketInfo: event.ticket_info,
            description: event.description,
            location: location,
            eventType: eventType || (event.title?.toLowerCase().includes('virtual') || event.title?.toLowerCase().includes('online') ? 'virtual' : 'in-person'),
            serpApiId: event.event_id || `${event.title}_${event.date?.start_date}`,
        }));

        // Save to database (ignore duplicates)
        const savedEvents: IEvent[] = [];
        for (const eventData of eventsToSave) {
            try {
                const savedEvent = await Event.create(eventData);
                savedEvents.push(savedEvent);
            } catch (error: any) {
                // Skip duplicates (unique index on serpApiId)
                if (error.code !== 11000) {
                    console.error('Error saving event:', error);
                }
            }
        }

        return {
            events: savedEvents.length > 0 ? savedEvents : eventsToSave,
            totalResults: savedEvents.length,
            location,
            fromCache: false,
        };
    } catch (error: any) {
        console.error('SerpAPI Error:', error);
        throw new ApiError(
            StatusCodes.INTERNAL_SERVER_ERROR,
            `Failed to fetch events: ${error.message || 'Unknown error'}`
        );
    }
};

const getAllEventsFromDB = async (query: IEventQuery): Promise<IEventsResponse> => {
    const { location, dateFilter, eventType, start = 0 } = query;

    const filter: any = {};

    if (location) {
        filter.location = new RegExp(location, 'i');
    }

    if (eventType) {
        filter.eventType = eventType;
    }

    const events = await Event.find(filter)
        .sort({ createdAt: -1 })
        .skip(start)
        .limit(10)
        .lean();

    const totalResults = await Event.countDocuments(filter);

    return {
        events: events as IEvent[],
        totalResults,
        location: location || 'all',
        fromCache: true,
    };
};

export const EventsServices = {
    getEvents,
    getAllEventsFromDB,
};
