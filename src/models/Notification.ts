import mongoose, { Schema, Document, Model } from 'mongoose';

export interface INotification extends Document {
    _id: mongoose.Types.ObjectId;
    recipient: mongoose.Types.ObjectId;
    sender: mongoose.Types.ObjectId;
    type: 'like' | 'comment' | 'follow' | 'message' | 'mention';
    story?: mongoose.Types.ObjectId;
    comment?: mongoose.Types.ObjectId;
    message?: string;
    isRead: boolean;
    createdAt: Date;
}

const NotificationSchema = new Schema<INotification>(
    {
        recipient: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: true,
            index: true,
        },
        sender: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        type: {
            type: String,
            enum: ['like', 'comment', 'follow', 'message', 'mention'],
            required: true,
        },
        story: {
            type: Schema.Types.ObjectId,
            ref: 'Story',
        },
        comment: {
            type: Schema.Types.ObjectId,
            ref: 'Comment',
        },
        message: {
            type: String,
            maxlength: 200,
        },
        isRead: {
            type: Boolean,
            default: false,
        },
    },
    {
        timestamps: true,
    }
);

// Indexes
NotificationSchema.index({ recipient: 1, createdAt: -1 });
NotificationSchema.index({ recipient: 1, isRead: 1 });

const Notification: Model<INotification> =
    mongoose.models.Notification || mongoose.model<INotification>('Notification', NotificationSchema);

export default Notification;
