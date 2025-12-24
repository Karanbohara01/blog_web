import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IReadingProgress extends Document {
    _id: mongoose.Types.ObjectId;
    user: mongoose.Types.ObjectId;
    story: mongoose.Types.ObjectId;
    progress: number; // 0-100 percentage
    scrollPosition: number; // pixel position
    lastReadAt: Date;
    completed: boolean;
    createdAt: Date;
    updatedAt: Date;
}

const ReadingProgressSchema = new Schema<IReadingProgress>(
    {
        user: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: true,
            index: true,
        },
        story: {
            type: Schema.Types.ObjectId,
            ref: 'Story',
            required: true,
        },
        progress: {
            type: Number,
            default: 0,
            min: 0,
            max: 100,
        },
        scrollPosition: {
            type: Number,
            default: 0,
        },
        lastReadAt: {
            type: Date,
            default: Date.now,
        },
        completed: {
            type: Boolean,
            default: false,
        },
    },
    {
        timestamps: true,
    }
);

// Compound index for unique progress per user-story
ReadingProgressSchema.index({ user: 1, story: 1 }, { unique: true });

// Index for getting recent reading
ReadingProgressSchema.index({ user: 1, lastReadAt: -1 });

const ReadingProgress: Model<IReadingProgress> = mongoose.models.ReadingProgress || mongoose.model<IReadingProgress>('ReadingProgress', ReadingProgressSchema);

export default ReadingProgress;
