import { useEffect, useState, useCallback, useRef } from 'react';

/**
 * NotificationBadge - Displays unread count for messages or modifications
 * @param {string} userId - Current user ID
 * @param {string} type - Type of notifications ('messages' or 'modifications')
 */
export default function NotificationBadge({ userId, type = 'messages' }) {
    const [count, setCount] = useState(0);
    const isMounted = useRef(true);

    /**
     * Fetch unread count from API
     * Checks every 5 seconds for real-time updates
     */
    const fetchCount = useCallback(async () => {
        if (!userId) return;

        try {
            const endpoint = type === 'messages'
                ? `http://localhost:5000/api/messages/unread-count/${userId}`
                : `http://localhost:5000/api/modification-logs/unread-count/${userId}`;

            const response = await fetch(endpoint);
            const data = await response.json();
            if (isMounted.current) {
                setCount(data.count || 0);
            }
        } catch (error) {
            console.error('Error fetching notification count:', error);
        }
    }, [userId, type]);

    // Poll for updates every 5 seconds
    useEffect(() => {
        isMounted.current = true;

        // Use async IIFE to handle initial fetch properly
        (async () => {
            await fetchCount();
        })();

        const interval = setInterval(fetchCount, 5000);
        return () => {
            isMounted.current = false;
            clearInterval(interval);
        };
    }, [fetchCount]);

    // Hide badge if no notifications
    if (count === 0) return null;

    return (
        <span className="absolute -top-1 -right-1 bg-gradient-to-r from-red-500 to-pink-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center animate-pulse shadow-lg z-10">
            {count > 9 ? '9+' : count}
        </span>
    );
}
