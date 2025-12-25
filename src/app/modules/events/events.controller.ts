import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import catchAsync from '../../../shared/catchAsync';
import sendResponse from '../../../shared/sendResponse';
import { EventsServices } from './events.service';

const getEvents = catchAsync(async (req: Request, res: Response) => {
    const { location, dateFilter, eventType, start, refresh } = req.query;

    const result = await EventsServices.getEvents(
        {
            location: location as string,
            dateFilter: dateFilter as any,
            eventType: eventType as any,
            start: start ? parseInt(start as string, 10) : 0,
        },
        refresh === 'true'
    );

    sendResponse(res, {
        statusCode: StatusCodes.OK,
        success: true,
        message: result.fromCache
            ? 'Events retrieved from database'
            : 'Events fetched from SerpAPI and saved to database',
        data: result,
    });
});

const getAllEventsFromDB = catchAsync(async (req: Request, res: Response) => {
    const { location, dateFilter, eventType, start } = req.query;

    const result = await EventsServices.getAllEventsFromDB({
        location: location as string,
        dateFilter: dateFilter as any,
        eventType: eventType as any,
        start: start ? parseInt(start as string, 10) : 0,
    });

    sendResponse(res, {
        statusCode: StatusCodes.OK,
        success: true,
        message: 'Events retrieved from database',
        data: result,
    });
});

export const EventsController = {
    getEvents,
    getAllEventsFromDB,
};
