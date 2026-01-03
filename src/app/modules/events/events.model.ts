import { Schema, model } from 'mongoose';
import { IEvent, EventModel } from './events.interface';

const eventSchema = new Schema<IEvent, EventModel>({
    title: { type: String, required: true },
    date: {
        start: { type: String },
        when: { type: String }
    },
    address: { type: [String] },
    link: { type: String },
    venue: {
        name: { type: String },
        link: { type: String }
    },
    thumbnail: { type: String },
    ticketInfo: [{
        source: { type: String },
        link: { type: String },
        linkType: { type: String }
    }],
    description: { type: String },
    location: { type: String, required: true }, // City/location
    eventType: { type: String },
    rating: { type: Number },
    reviewsCount: { type: Number },
    serpApiId: { type: String }, // To avoid duplicates from SerpAPI
}, {
    timestamps: true
});

// Indexes for efficient queries
eventSchema.index({ location: 1, createdAt: -1 });
eventSchema.index({ eventType: 1 });
eventSchema.index({ 'date.start': 1 });
eventSchema.index({ serpApiId: 1 }, { unique: true, sparse: true });

export const Event = model<IEvent, EventModel>('Event', eventSchema);
