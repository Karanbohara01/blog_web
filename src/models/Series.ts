import mongoose, { Schema, Document, Model } from 'mongoose';

export interface ISeries extends Document {
    _id: mongoose.Types.ObjectId;
    author: mongoose.Types.ObjectId;
    title: string;
    description: string;
    coverImage?: string;
    tags: string[];
    storiesCount: number;
    totalReads: number;
    isComplete: boolean;
    isPublic: boolean;
    createdAt: Date;
    updatedAt: Date;
}

const SeriesSchema = new Schema<ISeries>(
    {
        author: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: true,
            index: true,
        },
        title: {
            type: String,
            required: true,
            maxlength: 150,
            trim: true,
        },
        description: {
            type: String,
            maxlength: 2000,
            default: '',
        },
        coverImage: {
            type: String,
        },
        tags: [{
            type: String,
            lowercase: true,
            trim: true,
        }],
        storiesCount: {
            type: Number,
            default: 0,
        },
        totalReads: {
            type: Number,
            default: 0,
        },
        isComplete: {
            type: Boolean,
            default: false,
        },
        isPublic: {
            type: Boolean,
            default: true,
        },
    },
    {
        timestamps: true,
    }
);

// Indexes
SeriesSchema.index({ author: 1, createdAt: -1 });
SeriesSchema.index({ title: 'text', tags: 1 });

const Series: Model<ISeries> = mongoose.models.Series || mongoose.model<ISeries>('Series', SeriesSchema);

export default Series;
