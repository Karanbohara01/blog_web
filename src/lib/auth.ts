import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import Google from 'next-auth/providers/google';
import type { NextAuthConfig } from 'next-auth';
import dbConnect from './mongodb';
import User from '@/models/User';

export const authConfig: NextAuthConfig = {
    providers: [
        Google({
            clientId: process.env.GOOGLE_CLIENT_ID!,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
        }),
        Credentials({
            name: 'credentials',
            credentials: {
                email: { label: 'Email', type: 'email' },
                password: { label: 'Password', type: 'password' },
            },
            async authorize(credentials) {
                if (!credentials?.email || !credentials?.password) {
                    return null;
                }

                await dbConnect();

                const user = await User.findOne({ email: credentials.email }).select('+password');

                if (!user || !user.password) {
                    return null;
                }

                const isPasswordValid = await user.comparePassword(credentials.password as string);

                if (!isPasswordValid) {
                    return null;
                }

                return {
                    id: user._id.toString(),
                    email: user.email,
                    name: user.name,
                    image: user.avatar,
                    username: user.username,
                };
            },
        }),
    ],
    callbacks: {
        async signIn({ user, account, profile }) {
            if (account?.provider === 'google') {
                await dbConnect();

                const existingUser = await User.findOne({ email: user.email });

                if (!existingUser) {
                    // Create new user from Google login
                    const username = user.email?.split('@')[0] + '_' + Date.now().toString().slice(-4);
                    const newUser = new User({
                        email: user.email,
                        name: user.name,
                        username: username.toLowerCase().replace(/[^a-z0-9_]/g, ''),
                        avatar: user.image,
                        googleId: account.providerAccountId,
                        isVerified: true,
                    });
                    await newUser.save();
                } else if (!existingUser.googleId) {
                    existingUser.googleId = account.providerAccountId;
                    // Update avatar if user doesn't have one
                    if (!existingUser.avatar && user.image) {
                        existingUser.avatar = user.image;
                    }
                    await existingUser.save();
                } else {
                    // Existing Google user - update avatar if they don't have one
                    if (!existingUser.avatar && user.image) {
                        existingUser.avatar = user.image;
                        await existingUser.save();
                    }
                }
            }
            return true;
        },
        async jwt({ token, user, account, trigger }) {
            // Initial sign in
            if (user) {
                await dbConnect();
                const dbUser = await User.findOne({ email: user.email });
                if (dbUser) {
                    token.id = dbUser._id.toString();
                    token.username = dbUser.username;
                    token.avatar = dbUser.avatar || '';
                    token.name = dbUser.name;
                }
            }

            // Always refresh avatar from database to ensure it's up-to-date
            // This runs on every session check
            if (token.id) {
                await dbConnect();
                const dbUser = await User.findById(token.id).select('avatar name');
                if (dbUser) {
                    token.avatar = dbUser.avatar || '';
                    token.name = dbUser.name;
                }
            }

            return token;
        },
        async session({ session, token }) {
            if (token && session.user) {
                session.user.id = token.id as string;
                session.user.username = token.username as string;
                session.user.image = token.avatar as string;
            }
            return session;
        },
    },
    pages: {
        signIn: '/login',
        error: '/login',
    },
    session: {
        strategy: 'jwt',
    },
    secret: process.env.NEXTAUTH_SECRET,
};

export const { handlers, auth, signIn, signOut } = NextAuth(authConfig);
