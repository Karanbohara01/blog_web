import { NextApiRequest, NextApiResponse } from 'next';
import { Server as SocketIOServer } from 'socket.io';
import { setIO } from '@/lib/socketEmitter';

export const config = {
    api: {
        bodyParser: false,
    },
};

const connectedUsers = new Map<string, string[]>();

export default function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method === 'GET') {
        try {
            // Check if io already exists on the server
            if ((res.socket as any)?.server?.io) {
                res.status(200).json({ success: true, message: 'Socket already running' });
                return;
            }

            const io = new SocketIOServer((res.socket as any).server, {
                path: '/api/socketio',
                addTrailingSlash: false,
                cors: {
                    origin: '*',
                    methods: ['GET', 'POST'],
                },
            });

            // Store globally for API routes to use
            setIO(io);
            (res.socket as any).server.io = io;

            io.on('connection', (socket) => {
                console.log('Client connected:', socket.id);

                // Join user's personal room for notifications
                socket.on('join', (userId: string) => {
                    if (userId) {
                        socket.join(`user:${userId}`);

                        // Track connected users
                        const userSockets = connectedUsers.get(userId) || [];
                        userSockets.push(socket.id);
                        connectedUsers.set(userId, userSockets);

                        console.log(`User ${userId} joined their room`);
                    }
                });

                socket.on('disconnect', () => {
                    // Remove socket from connected users tracking
                    for (const [userId, sockets] of connectedUsers.entries()) {
                        const index = sockets.indexOf(socket.id);
                        if (index > -1) {
                            sockets.splice(index, 1);
                            if (sockets.length === 0) {
                                connectedUsers.delete(userId);
                            } else {
                                connectedUsers.set(userId, sockets);
                            }
                            break;
                        }
                    }
                    console.log('Client disconnected:', socket.id);
                });
            });

            res.status(200).json({ success: true });
        } catch (error) {
            console.error('Socket init error:', error);
            res.status(500).json({ error: 'Failed to initialize socket' });
        }
    } else {
        res.status(405).json({ error: 'Method not allowed' });
    }
}

