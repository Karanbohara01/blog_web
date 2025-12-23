import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';

export async function POST(request: Request) {
    try {
        const { email, password, name, username } = await request.json();

        // Validation
        if (!email || !password || !name || !username) {
            return NextResponse.json(
                { error: 'All fields are required' },
                { status: 400 }
            );
        }

        if (password.length < 6) {
            return NextResponse.json(
                { error: 'Password must be at least 6 characters' },
                { status: 400 }
            );
        }

        if (username.length < 3 || username.length > 30) {
            return NextResponse.json(
                { error: 'Username must be between 3 and 30 characters' },
                { status: 400 }
            );
        }

        if (!/^[a-zA-Z0-9_]+$/.test(username)) {
            return NextResponse.json(
                { error: 'Username can only contain letters, numbers, and underscores' },
                { status: 400 }
            );
        }

        await dbConnect();

        // Check if user already exists
        const existingUser = await User.findOne({
            $or: [{ email: email.toLowerCase() }, { username: username.toLowerCase() }],
        });

        if (existingUser) {
            if (existingUser.email === email.toLowerCase()) {
                return NextResponse.json(
                    { error: 'Email already registered' },
                    { status: 400 }
                );
            }
            return NextResponse.json(
                { error: 'Username already taken' },
                { status: 400 }
            );
        }

        // Create user
        const user = await User.create({
            email: email.toLowerCase(),
            password,
            name,
            username: username.toLowerCase(),
        });

        return NextResponse.json(
            {
                message: 'User created successfully',
                user: {
                    id: user._id,
                    email: user.email,
                    name: user.name,
                    username: user.username,
                },
            },
            { status: 201 }
        );
    } catch (error: any) {
        console.error('Registration error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
