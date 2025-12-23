import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IComment extends Document {
    _id: mongoose.Types.ObjectId;
    story: mongoose.Types.ObjectId;
    author: mongoose.Types.ObjectId;
    content: string;
    parentComment?: mongoose.Types.ObjectId;
    likes: mongoose.Types.ObjectId[];
    likesCount: number;
    repliesCount: number;
    createdAt: Date;
    updatedAt: Date;
}

const CommentSchema = new Schema<IComment>(
    {
        story: {
            type: Schema.Types.ObjectId,
            ref: 'Story',
            required: true,
            index: true,
        },
        author: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        content: {
            type: String,
            required: true,
            maxlength: 2000,
        },
        parentComment: {
            type: Schema.Types.ObjectId,
            ref: 'Comment',
            default: null,
        },
        likes: [{
            type: Schema.Types.ObjectId,
            ref: 'User',
        }],
        likesCount: {
            type: Number,
            default: 0,
        },
        repliesCount: {
            type: Number,
            default: 0,
        },
    },
    {
        timestamps: true,
    }
);

// Update likes count
CommentSchema.pre('save', function () {
    if (this.isModified('likes')) {
        this.likesCount = this.likes.length;
    }
});

// Indexes
CommentSchema.index({ story: 1, createdAt: -1 });
CommentSchema.index({ parentComment: 1 });

const Comment: Model<IComment> = mongoose.models.Comment || mongoose.model<IComment>('Comment', CommentSchema);

export default Comment;
