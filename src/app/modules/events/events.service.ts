import { getJson } from 'serpapi';
import { StatusCodes } from 'http-status-codes';
import ApiError from '../../../errors/ApiError';
import { Event } from './events.model';
import { IEventQuery, IEventsResponse, IEvent } from './events.interface';
import config from '../../../config';

const getEvents = async (query: IEventQuery, forceRefresh: boolean = false): Promise<IEventsResponse> => {
    const { location, dateFilter, eventType, startDate, endDate, rating, proximity, start = 0 } = query;

    // Check if we have cached events in database (unless force refresh)
    if (!forceRefresh) {
        const filter: any = {};
        if (location) filter.location = new RegExp(location, 'i');
        if (eventType) {
            filter.$or = [
                { eventType: new RegExp(eventType, 'i') },
                { title: new RegExp(eventType, 'i') },
                { description: new RegExp(eventType, 'i') }
            ];
        }
        if (rating) filter.rating = { $gte: rating };

        // Date range filter for cache
        if (dateFilter === 'range' && startDate && endDate) {
            filter['date.start'] = { $gte: startDate, $lte: endDate };
        }

        // const cachedEvents = await Event.find(filter)
        //     .sort({ rating: -1, createdAt: -1 })
        //     .lean();

        // if (cachedEvents.length > 0) {
        //     // Apply pagination on cached results
        //     const paginatedEvents = cachedEvents.slice(start, start + 10);

        //     return {
        //         events: paginatedEvents as IEvent[],
        //         totalResults: cachedEvents.length,
        //         location,
        //         fromCache: true,
        //     };
        // }
    }

    // Fetch from SerpAPI if no cache or force refresh
    if (!config.serp_api_key) {
        throw new ApiError(StatusCodes.INTERNAL_SERVER_ERROR, 'SerpAPI key is not configured');
    }

    try {
        // Build SerpAPI query - combine location and eventType for better search
        let searchQuery = `Events in ${location}`;
        if (eventType && eventType !== 'virtual' && eventType !== 'in-person') {
            searchQuery = `${eventType} ${searchQuery}`;
        }

        const params: any = {
            engine: 'google_events',
            q: searchQuery,
            api_key: config.serp_api_key,
        };

        // Add filters for SerpAPI
        const filters: string[] = [];
        if (dateFilter && dateFilter !== 'range') {
            filters.push(`date:${dateFilter}`);
        } else if (dateFilter === 'range' && startDate && endDate) {
            // Google Events API date range format is usually specific, but often handled via q or htichips
            // Most reliable is often adding it to the query or using specific chips if known.
            // For now, we'll try the common htichips format for range if supported.
            filters.push(`date:range:${startDate},${endDate}`);
        }

        if (eventType === 'virtual') {
            filters.push('event_type:Virtual-Event');
        } else if (eventType === 'in-person') {
            filters.push('event_type:In-Person-Event');
        }

        if (filters.length > 0) {
            params.htichips = filters.join(',');
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
            rating: event.rating?.rating,
            reviewsCount: event.rating?.reviews,
            serpApiId: event.event_id || `${event.title}_${event.date?.start_date}`,
        }));

        // Save to database (ignore duplicates)
        const savedEvents: IEvent[] = [];
        for (const eventData of eventsToSave) {
            try {
                // Use findOneAndUpdate with upsert to avoid duplicate key errors better and update ratings
                const savedEvent = await Event.findOneAndUpdate(
                    { serpApiId: eventData.serpApiId },
                    eventData,
                    { upsert: true, new: true, lean: true }
                );
                savedEvents.push(savedEvent as any);
            } catch (error: any) {
                console.error('Error saving event:', error);
            }
        }

        // Sort by rating if requested (though SerpAPI usually returns relevant first)
        const finalEvents = savedEvents.length > 0 ? savedEvents : eventsToSave;

        return {
            events: finalEvents as IEvent[],
            totalResults: response.search_information?.total_results || finalEvents.length,
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
    const { location, dateFilter, eventType, startDate, endDate, rating, start = 0 } = query;

    const filter: any = {};

    if (location) {
        filter.location = new RegExp(location, 'i');
    }

    if (eventType) {
        filter.$or = [
            { eventType: new RegExp(eventType, 'i') },
            { title: new RegExp(eventType, 'i') },
            { description: new RegExp(eventType, 'i') }
        ];
    }

    if (rating) {
        filter.rating = { $gte: rating };
    }

    if (dateFilter === 'range' && startDate && endDate) {
        filter['date.start'] = { $gte: startDate, $lte: endDate };
    } else if (dateFilter && dateFilter !== 'range') {
        // For simplicity, we can map common dateFilters to ranges or just rely on SerpAPI's pre-filtering
        // If we are in DB-only mode, we might need a more complex mapping here.
    }

    const events = await Event.find(filter)
        .sort({ rating: -1, createdAt: -1 })
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
