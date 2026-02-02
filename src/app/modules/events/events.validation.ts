import { z } from 'zod';

export const EventsValidations = {
    getEvents: z.object({
        query: z.object({
            location: z.string().optional(),
            searchTerm: z.string().optional(),
            dateFilter: z.enum(['today', 'tomorrow', 'week', 'weekend', 'next_week', 'month', 'next_month', 'range']).optional(),
            startDate: z.string().optional(),
            endDate: z.string().optional(),
            eventType: z.string().optional(),
            proximity: z.string().optional(),
            rating: z.string().optional().transform((val) => val ? parseFloat(val) : 0),
            start: z.string().optional().transform((val) => val ? parseInt(val, 10) : 0),
            refresh: z.string().optional().transform((val) => val === 'true'),
        }),
    }),
};
