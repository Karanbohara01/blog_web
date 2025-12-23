'use client';

import { createContext, useContext, useEffect, useState, useCallback, ReactNode } from 'react';
import { useSession } from 'next-auth/react';

interface NotificationContextType {
    messageCount: number;
    notificationCount: number;
    setMessageCount: (count: number | ((prev: number) => number)) => void;
    setNotificationCount: (count: number | ((prev: number) => number)) => void;
    refreshCounts: () => Promise<void>;
}

const NotificationContext = createContext<NotificationContextType>({
    messageCount: 0,
    notificationCount: 0,
    setMessageCount: () => { },
    setNotificationCount: () => { },
    refreshCounts: async () => { },
});

export const useNotifications = () => useContext(NotificationContext);

interface NotificationProviderProps {
    children: ReactNode;
}

export function NotificationProvider({ children }: NotificationProviderProps) {
    const { data: session, status } = useSession();
    const [messageCount, setMessageCount] = useState(0);
    const [notificationCount, setNotificationCount] = useState(0);
    const [prevMessageCount, setPrevMessageCount] = useState(0);
    const [prevNotificationCount, setPrevNotificationCount] = useState(0);

    // Play notification sound
    const playSound = useCallback(() => {
        if (typeof window !== 'undefined') {
            try {
                const audio = new Audio('/sounds/notification.mp3');
                audio.volume = 0.5;
                audio.play().catch(() => { });
            } catch (e) {
                // Silent fail
            }
        }
    }, []);

    // Fetch counts from API
    const fetchCounts = useCallback(async () => {
        if (!session?.user?.id) return;

        try {
            const [msgRes, notifRes] = await Promise.all([
                fetch('/api/messages/count'),
                fetch('/api/notifications/count'),
            ]);

            if (msgRes.ok && notifRes.ok) {
                const msgData = await msgRes.json();
                const notifData = await notifRes.json();

                const newMsgCount = msgData.count || 0;
                const newNotifCount = notifData.count || 0;

                // Play sound if counts increased
                if (newMsgCount > prevMessageCount || newNotifCount > prevNotificationCount) {
                    playSound();
                }

                setPrevMessageCount(newMsgCount);
                setPrevNotificationCount(newNotifCount);
                setMessageCount(newMsgCount);
                setNotificationCount(newNotifCount);
            }
        } catch (e) {
            console.error('Failed to fetch notification counts:', e);
        }
    }, [session?.user?.id, prevMessageCount, prevNotificationCount, playSound]);

    // Fetch initial counts on auth
    useEffect(() => {
        if (status === 'authenticated') {
            fetchCounts();
        }
    }, [status, fetchCounts]);

    // Poll every 15 seconds for real-time feel
    useEffect(() => {
        if (status !== 'authenticated') return;

        const interval = setInterval(fetchCounts, 15000);
        return () => clearInterval(interval);
    }, [status, fetchCounts]);

    // Expose refresh function for manual refresh (e.g., after sending a message)
    const refreshCounts = useCallback(async () => {
        await fetchCounts();
    }, [fetchCounts]);

    return (
        <NotificationContext.Provider value={{
            messageCount,
            notificationCount,
            setMessageCount,
            setNotificationCount,
            refreshCounts,
        }}>
            {children}
        </NotificationContext.Provider>
    );
}
