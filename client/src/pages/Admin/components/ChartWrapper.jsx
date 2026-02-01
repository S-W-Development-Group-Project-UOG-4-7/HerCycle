import React from 'react';

/**
 * ChartWrapper Component
 * Reusable container for all analytics charts with glassmorphic styling
 */
const ChartWrapper = ({ title, children, loading = false, error = null, height = 300 }) => {
    if (loading) {
        return (
            <div className="section-card" style={{ minHeight: height }}>
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    height: height,
                    color: 'rgba(255, 255, 255, 0.04)'
                }}>
                    <div className="loading-spinner">Loading chart...</div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="section-card" style={{ minHeight: height }}>
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    height: height,
                    color: '#ef4444'
                }}>
                    <div>
                        <p style={{ marginBottom: '0.5rem', fontWeight: 600 }}>⚠️ Error Loading Chart</p>
                        <p style={{ fontSize: '0.875rem', opacity: 0.8 }}>{error}</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="section-card">
            {title && (
                <h3 style={{
                    marginBottom: '1.5rem',
                    fontWeight: 600,
                    fontSize: '1.1rem',
                    background: 'linear-gradient(135deg, #db2777 0%, #9333ea 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text'
                }}>
                    {title}
                </h3>
            )}
            <div style={{
                width: '100%',
                height: height,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
            }}>
                {children}
            </div>
        </div>
    );
};

export default ChartWrapper;
