import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IBookmark extends Document {
    _id: mongoose.Types.ObjectId;
    user: mongoose.Types.ObjectId;
    story: mongoose.Types.ObjectId;
    createdAt: Date;
}

const BookmarkSchema = new Schema<IBookmark>(
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
    },
    {
        timestamps: true,
    }
);

// Compound index to ensure unique bookmarks per user-story pair
BookmarkSchema.index({ user: 1, story: 1 }, { unique: true });

const Bookmark: Model<IBookmark> = mongoose.models.Bookmark || mongoose.model<IBookmark>('Bookmark', BookmarkSchema);

export default Bookmark;
