// CountdownTimer.jsx - Countdown component for suspended users
import React, { useState, useEffect } from 'react';

const CountdownTimer = ({ targetDate, onExpire }) => {
    const [timeLeft, setTimeLeft] = useState(calculateTimeLeft());

    function calculateTimeLeft() {
        // Validate targetDate
        if (!targetDate) {
            console.warn('CountdownTimer: No targetDate provided');
            return null;
        }

        const target = new Date(targetDate);

        // Check if date is valid
        if (isNaN(target.getTime())) {
            console.warn('CountdownTimer: Invalid targetDate:', targetDate);
            return null;
        }

        const difference = target - new Date();

        if (difference <= 0) {
            return null;
        }

        return {
            days: Math.floor(difference / (1000 * 60 * 60 * 24)),
            hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
            minutes: Math.floor((difference / 1000 / 60) % 60),
            seconds: Math.floor((difference / 1000) % 60)
        };
    }

    useEffect(() => {
        const timer = setInterval(() => {
            const newTimeLeft = calculateTimeLeft();
            setTimeLeft(newTimeLeft);

            if (!newTimeLeft && onExpire) {
                onExpire();
            }
        }, 1000);

        return () => clearInterval(timer);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [targetDate, onExpire]);

    if (!timeLeft) {
        return <span style={{ color: '#4caf50', fontWeight: 'bold' }}>Ready to Unsuspend</span>;
    }

    return (
        <div style={{
            display: 'flex',
            gap: '8px',
            alignItems: 'center',
            fontSize: '0.9rem',
            fontFamily: 'monospace'
        }}>
            {timeLeft.days > 0 && (
                <span style={{ background: '#f44336', color: 'white', padding: '4px 8px', borderRadius: '4px', fontWeight: '600' }}>
                    {timeLeft.days}d
                </span>
            )}
            <span style={{ background: '#ff9800', color: 'white', padding: '4px 8px', borderRadius: '4px', fontWeight: '600' }}>
                {String(timeLeft.hours).padStart(2, '0')}h
            </span>
            <span style={{ background: '#ffc107', color: 'white', padding: '4px 8px', borderRadius: '4px', fontWeight: '600' }}>
                {String(timeLeft.minutes).padStart(2, '0')}m
            </span>
            <span style={{ background: '#4caf50', color: 'white', padding: '4px 8px', borderRadius: '4px', fontWeight: '600' }}>
                {String(timeLeft.seconds).padStart(2, '0')}s
            </span>
        </div>
    );
};

export default CountdownTimer;
