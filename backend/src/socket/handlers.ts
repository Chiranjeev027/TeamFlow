// teamflow/backend/src/socket/handlers.ts
import { Server, Socket } from 'socket.io';
import User from '../models/User';

// Define interface for online users
export interface OnlineUser {
    userId: string;
    name: string;
    email: string;
    socketId: string;
    status?: 'online' | 'busy' | 'offline';
    joinedAt?: string;
    currentTask?: string;
}

// Global online users tracking (independent of projects)
export const globalOnlineUsers = new Map<string, OnlineUser>();

/**
 * Setup global WebSocket event handlers
 * @param io - Socket.IO server instance
 * @param socket - Individual socket connection
 */
export function setupGlobalHandlers(io: Server, socket: Socket) {
    console.log('🔌 User connected:', socket.id);

    // Global user login event
    socket.on('global-login', async (user: { userId: string; name: string; email: string }) => {
        if (!user || !user.userId) {
            console.error('❌ Invalid global-login data:', user);
            return;
        }

        console.log(`🌐 ${user.name} logged in globally`);

        // Add user to global online users
        globalOnlineUsers.set(user.userId, {
            ...user,
            socketId: socket.id,
            status: 'online',
            joinedAt: new Date().toISOString()
        });

        // Update database
        try {
            await User.findByIdAndUpdate(user.userId, {
                isOnline: true,
                status: 'online',
                lastSeen: new Date()
            });
        } catch (error) {
            console.error('❌ Error updating user online status:', error);
        }

        // Broadcast updated online users list to all clients
        const onlineUsersList = Array.from(globalOnlineUsers.values());
        io.emit('online-users-update', onlineUsersList);

        console.log(`📊 Total online users: ${onlineUsersList.length}`);
    });

    // Status change event
    socket.on('status-change', async ({ userId, status }: { userId: string; status: 'online' | 'busy' | 'offline' }) => {
        if (!userId || !status) {
            console.error('❌ Invalid status-change data:', { userId, status });
            return;
        }

        const user = globalOnlineUsers.get(userId);
        if (user) {
            user.status = status;
            console.log(`🔄 ${user.name} changed status to ${status}`);

            // Update database
            try {
                await User.findByIdAndUpdate(userId, {
                    status,
                    lastSeen: new Date()
                });
            } catch (error) {
                console.error('❌ Error updating user status:', error);
            }

            // Broadcast updated online users list
            const onlineUsersList = Array.from(globalOnlineUsers.values());
            io.emit('online-users-update', onlineUsersList);
        }
    });

    // Join task event (for task presence)
    socket.on('join-task', ({ userId, taskId }: { userId: string; taskId: string }) => {
        if (!userId || !taskId) {
            console.error('❌ Invalid join-task data:', { userId, taskId });
            return;
        }

        const user = globalOnlineUsers.get(userId);
        if (user) {
            user.currentTask = taskId;
            console.log(`📝 ${user.name} joined task ${taskId}`);

            // Broadcast task presence update
            io.emit('task-presence-update', {
                taskId,
                userId,
                userName: user.name,
                action: 'joined'
            });
        }
    });

    // Leave task event
    socket.on('leave-task', ({ userId, taskId }: { userId: string; taskId: string }) => {
        if (!userId || !taskId) {
            console.error('❌ Invalid leave-task data:', { userId, taskId });
            return;
        }

        const user = globalOnlineUsers.get(userId);
        if (user && user.currentTask === taskId) {
            user.currentTask = undefined;
            console.log(`📝 ${user.name} left task ${taskId}`);

            // Broadcast task presence update
            io.emit('task-presence-update', {
                taskId,
                userId,
                userName: user.name,
                action: 'left'
            });
        }
    });

    // Handle disconnect - cleanup global users
    socket.on('disconnect', async (reason) => {
        console.log('🔌 User disconnected:', socket.id, 'Reason:', reason);

        // Remove user from global online users
        for (const [userId, user] of globalOnlineUsers.entries()) {
            if (user.socketId === socket.id) {
                globalOnlineUsers.delete(userId);
                console.log(`🌐 Removed ${user.name} from global online users`);

                // Update database
                try {
                    await User.findByIdAndUpdate(userId, {
                        isOnline: false,
                        status: 'offline',
                        lastSeen: new Date()
                    });
                } catch (error) {
                    console.error('❌ Error updating user offline status:', error);
                }

                // Broadcast updated online users list
                const onlineUsersList = Array.from(globalOnlineUsers.values());
                io.emit('online-users-update', onlineUsersList);
                break;
            }
        }
    });
}
