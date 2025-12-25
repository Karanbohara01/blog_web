import mongoose, { Schema, Document, Model } from 'mongoose';

// Reaction types
export type ReactionType = 'love' | 'laugh' | 'sad' | 'fire' | 'clap';

export interface IReactions {
    love: mongoose.Types.ObjectId[];
    laugh: mongoose.Types.ObjectId[];
    sad: mongoose.Types.ObjectId[];
    fire: mongoose.Types.ObjectId[];
    clap: mongoose.Types.ObjectId[];
}

export interface IStory extends Document {
    _id: mongoose.Types.ObjectId;
    author: mongoose.Types.ObjectId;
    title: string;
    content: string;
    images: string[];
    likes: mongoose.Types.ObjectId[];
    likesCount: number;
    reactions: IReactions;
    reactionsCount: number;
    commentsCount: number;
    sharesCount: number;
    isPublic: boolean;
    tags: string[];
    // Series/Chapter fields
    series?: mongoose.Types.ObjectId;
    chapterNumber?: number;
    chapterTitle?: string;
    createdAt: Date;
    updatedAt: Date;
}

const StorySchema = new Schema<IStory>(
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
        content: {
            type: String,
            required: true,
        },
        images: [{
            type: String,
        }],
        likes: [{
            type: Schema.Types.ObjectId,
            ref: 'User',
        }],
        likesCount: {
            type: Number,
            default: 0,
        },
        reactions: {
            love: [{ type: Schema.Types.ObjectId, ref: 'User' }],
            laugh: [{ type: Schema.Types.ObjectId, ref: 'User' }],
            sad: [{ type: Schema.Types.ObjectId, ref: 'User' }],
            fire: [{ type: Schema.Types.ObjectId, ref: 'User' }],
            clap: [{ type: Schema.Types.ObjectId, ref: 'User' }],
        },
        reactionsCount: {
            type: Number,
            default: 0,
        },
        commentsCount: {
            type: Number,
            default: 0,
        },
        sharesCount: {
            type: Number,
            default: 0,
        },
        isPublic: {
            type: Boolean,
            default: true,
        },
        tags: [{
            type: String,
            lowercase: true,
            trim: true,
        }],
        // Series/Chapter fields
        series: {
            type: Schema.Types.ObjectId,
            ref: 'Series',
            index: true,
        },
        chapterNumber: {
            type: Number,
        },
        chapterTitle: {
            type: String,
            maxlength: 150,
        },
    },
    {
        timestamps: true,
    }
);

// Update likes count before saving
StorySchema.pre('save', function () {
    if (this.isModified('likes')) {
        this.likesCount = this.likes.length;
    }
});

// Indexes for efficient querying
StorySchema.index({ createdAt: -1 });
StorySchema.index({ author: 1, createdAt: -1 });
StorySchema.index({ tags: 1 });
StorySchema.index({ content: 'text' });

const Story: Model<IStory> = mongoose.models.Story || mongoose.model<IStory>('Story', StorySchema);

export default Story;
