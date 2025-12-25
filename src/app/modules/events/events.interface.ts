import { Model, Types } from 'mongoose';

export interface IEventDate {
    start?: string;
    when?: string;
}

export interface IEventVenue {
    name?: string;
    link?: string;
}

export interface IEventTicketInfo {
    source?: string;
    link?: string;
    linkType?: string;
}

export interface IEvent {
    _id: Types.ObjectId;
    title: string;
    date?: IEventDate;
    address?: string[];
    link?: string;
    venue?: IEventVenue;
    thumbnail?: string;
    ticketInfo?: IEventTicketInfo[];
    description?: string;
    location: string; // City/location where event is happening
    eventType?: string; // virtual, in-person
    serpApiId?: string; // Original ID from SerpAPI if available
    createdAt: Date;
    updatedAt: Date;
}

export type EventModel = Model<IEvent, {}, {}>;

export interface IEventQuery {
    location: string;
    dateFilter?: 'today' | 'tomorrow' | 'week' | 'weekend' | 'next_week' | 'month' | 'next_month';
    eventType?: 'virtual' | 'in-person';
    start?: number;
}

export interface IEventsResponse {
    events: IEvent[];
    totalResults: number;
    location: string;
    fromCache: boolean; // Indicates if data came from database or SerpAPI
}
