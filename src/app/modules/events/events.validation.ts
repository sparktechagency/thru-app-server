import { z } from 'zod';

export const EventsValidations = {
    getEvents: z.object({
        query: z.object({
            location: z.string({
                required_error: 'Location is required',
            }).min(1, 'Location cannot be empty'),
            dateFilter: z.enum(['today', 'tomorrow', 'week', 'weekend', 'next_week', 'month', 'next_month']).optional(),
            eventType: z.enum(['virtual', 'in-person']).optional(),
            start: z.string().optional().transform((val) => val ? parseInt(val, 10) : 0),
            refresh: z.string().optional().transform((val) => val === 'true'), // Force refresh from SerpAPI
        }),
    }),
};
