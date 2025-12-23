import { Server as SocketIOServer } from 'socket.io';
import type { Server as HTTPServer } from 'http';
import type { NextApiResponse } from 'next';
import type { Socket as NetSocket } from 'net';

interface SocketServer extends HTTPServer {
    io?: SocketIOServer;
}

interface SocketWithIO extends NetSocket {
    server: SocketServer;
}

interface NextApiResponseWithSocket extends NextApiResponse {
    socket: SocketWithIO;
}

// Store connected users and their socket IDs
const connectedUsers = new Map<string, string[]>();

export const initSocket = (res: NextApiResponseWithSocket) => {
    if (res.socket.server.io) {
        return res.socket.server.io;
    }

    const io = new SocketIOServer(res.socket.server, {
        path: '/api/socketio',
        addTrailingSlash: false,
        cors: {
            origin: '*',
            methods: ['GET', 'POST'],
        },
    });

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

    res.socket.server.io = io;
    return io;
};

// Helper to get the io instance globally
export const getIO = (res: NextApiResponseWithSocket): SocketIOServer | undefined => {
    return res.socket.server.io;
};

// Emit notification to a specific user
export const emitToUser = (io: SocketIOServer, userId: string, event: string, data: any) => {
    io.to(`user:${userId}`).emit(event, data);
};
