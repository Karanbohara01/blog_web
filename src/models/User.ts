import mongoose, { Schema, Document, Model } from 'mongoose';
import bcrypt from 'bcryptjs';

export interface IUser extends Document {
    _id: mongoose.Types.ObjectId;
    username: string;
    email: string;
    password?: string;
    name: string;
    bio?: string;
    avatar?: string;
    coverImage?: string;
    followers: mongoose.Types.ObjectId[];
    following: mongoose.Types.ObjectId[];
    followersCount: number;
    followingCount: number;
    storiesCount: number;
    isVerified: boolean;
    isPrivate: boolean;
    googleId?: string;
    createdAt: Date;
    updatedAt: Date;
    comparePassword(candidatePassword: string): Promise<boolean>;
}

const UserSchema = new Schema<IUser>(
    {
        username: {
            type: String,
            required: true,
            unique: true,
            trim: true,
            lowercase: true,
            minlength: 3,
            maxlength: 30,
            match: /^[a-zA-Z0-9_]+$/,
        },
        email: {
            type: String,
            required: true,
            unique: true,
            trim: true,
            lowercase: true,
        },
        password: {
            type: String,
            minlength: 6,
            select: false,
        },
        name: {
            type: String,
            required: true,
            trim: true,
            maxlength: 100,
        },
        bio: {
            type: String,
            maxlength: 500,
            default: '',
        },
        avatar: {
            type: String,
            default: '',
        },
        coverImage: {
            type: String,
            default: '',
        },
        followers: [{
            type: Schema.Types.ObjectId,
            ref: 'User',
        }],
        following: [{
            type: Schema.Types.ObjectId,
            ref: 'User',
        }],
        followersCount: {
            type: Number,
            default: 0,
        },
        followingCount: {
            type: Number,
            default: 0,
        },
        storiesCount: {
            type: Number,
            default: 0,
        },
        isVerified: {
            type: Boolean,
            default: false,
        },
        isPrivate: {
            type: Boolean,
            default: false,
        },
        googleId: {
            type: String,
            sparse: true,
        },
    },
    {
        timestamps: true,
    }
);

// Hash password before saving
UserSchema.pre('save', async function () {
    if (!this.isModified('password') || !this.password) return;

    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
});

// Compare password method
UserSchema.methods.comparePassword = async function (candidatePassword: string): Promise<boolean> {
    if (!this.password) return false;
    return bcrypt.compare(candidatePassword, this.password);
};

// Update counts
UserSchema.methods.updateCounts = async function () {
    this.followersCount = this.followers.length;
    this.followingCount = this.following.length;
    await this.save();
};

// Indexes
UserSchema.index({ username: 'text', name: 'text' });

const User: Model<IUser> = mongoose.models.User || mongoose.model<IUser>('User', UserSchema);

export default User;
