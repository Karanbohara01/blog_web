import { Server as SocketIOServer } from 'socket.io';

// Global socket instance (set by Pages API route)
let io: SocketIOServer | null = null;

export const setIO = (socketIO: SocketIOServer) => {
    io = socketIO;
};

export const getIO = (): SocketIOServer | null => {
    return io;
};

// Emit event to a specific user
export const emitToUser = (userId: string, event: string, data: any) => {
    if (io) {
        io.to(`user:${userId}`).emit(event, data);
    }
};

// Emit new message notification
export const emitNewMessage = (recipientId: string, message: any) => {
    emitToUser(recipientId, 'new_message', message);
};

// Emit new notification
export const emitNewNotification = (recipientId: string, notification: any) => {
    emitToUser(recipientId, 'new_notification', notification);
};
