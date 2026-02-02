import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import catchAsync from '../../../shared/catchAsync';
import sendResponse from '../../../shared/sendResponse';
import { EventsServices } from './events.service';

const getEvents = catchAsync(async (req: Request, res: Response) => {
    const { location, searchTerm, dateFilter, eventType, startDate, endDate, rating, proximity, start, refresh } = req.query;

    const result = await EventsServices.getEvents(
        {
            location: location as string,
            searchTerm: searchTerm as string,
            dateFilter: dateFilter as any,
            eventType: eventType as string,
            startDate: startDate as string,
            endDate: endDate as string,
            rating: rating ? parseFloat(rating as string) : undefined,
            proximity: proximity as string,
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
    const { location, dateFilter, eventType, startDate, endDate, rating, proximity, start } = req.query;

    const result = await EventsServices.getAllEventsFromDB({
        location: location as string,
        dateFilter: dateFilter as any,
        eventType: eventType as string,
        startDate: startDate as string,
        endDate: endDate as string,
        rating: rating ? parseFloat(rating as string) : undefined,
        proximity: proximity as string,
        start: start ? parseInt(start as string, 10) : 0,
    });

    sendResponse(res, {
        statusCode: StatusCodes.OK,
        success: true,
        message: 'Events retrieved from database',
        data: result,
    });
});

const testEvents = catchAsync(async (req: Request, res: Response) => {
    const result = await EventsServices.getEvents({
        location: 'Dhaka',
        eventType: 'Music',
        // dateFilter: 'week',
        startDate: '2026-02-01',
        endDate: '2026-02-29',
        rating: 4,
        proximity: '10',
        start: 0,
    });

    sendResponse(res, {
        statusCode: StatusCodes.OK,
        success: true,
        message: 'Test events retrieved successfully',
        data: result,
    });
});

export const EventsController = {
    getEvents,
    getAllEventsFromDB,
    testEvents,
};
