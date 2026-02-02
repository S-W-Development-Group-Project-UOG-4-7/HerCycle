// StatsWidget.jsx - Reusable widget for simple stats
import React, { useState, useEffect } from 'react';

const StatsWidget = ({ endpoint, title, icon, color = 'blue', renderValue }) => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchData();
    }, [endpoint]);

    const fetchData = async () => {
        try {
            const token = localStorage.getItem('authToken') || localStorage.getItem('token');
            const res = await fetch(`http://localhost:5000${endpoint}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const result = await res.json();
            if (result.success) setData(result.data);
        } catch (error) {
            console.error(`Error fetching ${title}:`, error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className={`stat-card ${color}`}>
                <div className="stat-value">...</div>
                <div className="stat-label">{title}</div>
            </div>
        );
    }

    return (
        <div className={`stat-card ${color}`}>
            {icon && <div className="stat-icon">{icon}</div>}
            <div className="stat-content">
                {renderValue ? renderValue(data) : (
                    <>
                        <div className="stat-value">{data?.total || 0}</div>
                        <div className="stat-label">{title}</div>
                    </>
                )}
            </div>
        </div>
    );
};

export default StatsWidget;
