import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import mongoose from 'mongoose';

export async function GET() {
    try {
        await dbConnect();

        // Get counts using mongoose.connection.db
        const db = mongoose.connection.db;

        if (!db) {
            return NextResponse.json({ stories: 0, users: 0, reads: 0 });
        }

        const [storiesCount, usersCount, likesAgg] = await Promise.all([
            db.collection('stories').countDocuments(),
            db.collection('users').countDocuments(),
            db.collection('stories').aggregate([
                { $group: { _id: null, total: { $sum: '$likesCount' } } }
            ]).toArray(),
        ]);

        // Calculate total reads (likes * 10 as an estimate)
        const totalReads = (likesAgg[0]?.total || 0) * 10;

        return NextResponse.json({
            stories: storiesCount,
            users: usersCount,
            reads: totalReads,
        });
    } catch (error) {
        console.error('Stats error:', error);
        return NextResponse.json({ stories: 0, users: 0, reads: 0 });
    }
}
