import mongoose, { Schema, Document, Model } from 'mongoose';

// Conversation model for chat
export interface IConversation extends Document {
    _id: mongoose.Types.ObjectId;
    participants: mongoose.Types.ObjectId[];
    lastMessage?: mongoose.Types.ObjectId;
    lastMessageAt: Date;
    createdAt: Date;
    updatedAt: Date;
}

const ConversationSchema = new Schema<IConversation>(
    {
        participants: [{
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        }],
        lastMessage: {
            type: Schema.Types.ObjectId,
            ref: 'Message',
        },
        lastMessageAt: {
            type: Date,
            default: Date.now,
        },
    },
    {
        timestamps: true,
    }
);

// Indexes
ConversationSchema.index({ participants: 1 });
ConversationSchema.index({ lastMessageAt: -1 });

export const Conversation: Model<IConversation> =
    mongoose.models.Conversation || mongoose.model<IConversation>('Conversation', ConversationSchema);

// Message model
export interface IMessage extends Document {
    _id: mongoose.Types.ObjectId;
    conversation: mongoose.Types.ObjectId;
    sender: mongoose.Types.ObjectId;
    content: string;
    attachments: {
        type: 'image' | 'file';
        url: string;
        name?: string;
    }[];
    readBy: mongoose.Types.ObjectId[];
    createdAt: Date;
}

const MessageSchema = new Schema<IMessage>(
    {
        conversation: {
            type: Schema.Types.ObjectId,
            ref: 'Conversation',
            required: true,
            index: true,
        },
        sender: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        content: {
            type: String,
            maxlength: 5000,
        },
        attachments: [{
            type: {
                type: String,
                enum: ['image', 'file'],
            },
            url: String,
            name: String,
        }],
        readBy: [{
            type: Schema.Types.ObjectId,
            ref: 'User',
        }],
    },
    {
        timestamps: true,
    }
);

// Indexes
MessageSchema.index({ conversation: 1, createdAt: -1 });

export const Message: Model<IMessage> =
    mongoose.models.Message || mongoose.model<IMessage>('Message', MessageSchema);
