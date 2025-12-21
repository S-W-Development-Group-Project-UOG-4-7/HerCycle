import React, { useState, useEffect } from 'react';
import './Home.css';

const Home = () => {
    const [stats, setStats] = useState({
        users: 10000,
        accuracy: 95,
        days: 30
    });

    const handleStatClick = (stat) => {
        setStats(prev => ({
            ...prev,
            [stat]: prev[stat] + 1
        }));
    };

    // Generate floating hearts
    const generateHearts = () => {
        const hearts = [];
        for (let i = 0; i < 10; i++) {
            hearts.push({
                id: i,
                left: `${Math.random() * 100}%`,
                delay: `${Math.random() * 15}s`,
                size: `${Math.random() * 20 + 15}px`,
                opacity: Math.random() * 0.3 + 0.1
            });
        }
        return hearts;
    };

    const [hearts] = useState(generateHearts());

    return (
        <div className="home-container">
            {/* Floating Hearts Background Animation */}
            <div className="floating-hearts">
                {hearts.map(heart => (
                    <div
                        key={heart.id}
                        className="heart"
                        style={{
                            left: heart.left,
                            animationDelay: heart.delay,
                            fontSize: heart.size,
                            opacity: heart.opacity
                        }}
                    >
                        ❤️
                    </div>
                ))}
            </div>

            {/* Header */}
            <header className="header">
                <div className="logo">
                    <h1>HerCycle</h1>
                </div>
                <nav className="nav">
                    <a href="/" className="nav-link">Home</a>
                    <a href="/contact" className="nav-link btn-signup">Contact</a>
                    <a href="/login" className="nav-link">Login</a>
                    <a href="/register" className="nav-link btn-signup">Sign Up</a>
                    
                </nav>
            </header>

            {/* Main Content */}
            <main className="main">
                {/* Page 1 - Hero Section */}
                <section className="page-1">
                    <div className="hero-content">
                        <h2>Welcome to HerCycle 👋</h2>
                        <p>
                            Your Personal Menstrual Health Companion. Track cycles, predict periods, 
                            monitor symptoms, and gain valuable insights into your body's rhythms. 
                            Take control of your wellbeing with personalized analytics.
                        </p>
                    </div>

                    {/* Interactive Stats Boxes */}
                    <div className="interactive-stats">
                        <div className="stat-box" onClick={() => handleStatClick('users')}>
                            <div className="stat-number">{stats.users.toLocaleString()}+</div>
                            <div className="stat-label">Happy Users</div>
                        </div>
                        <div className="stat-box" onClick={() => handleStatClick('accuracy')}>
                            <div className="stat-number">{stats.accuracy}%</div>
                            <div className="stat-label">Prediction Accuracy</div>
                        </div>
                        <div className="stat-box" onClick={() => handleStatClick('days')}>
                            <div className="stat-number">{stats.days}</div>
                            <div className="stat-label">Free Trial Days</div>
                        </div>
                    </div>

                    {/* Centered Button */}
                    <div className="hero-buttons">
                        <a href="/register" className="btn-primary">
                            Start Your Free Trial
                        </a>
                    </div>
                </section>

                {/* Page 2 - Features Section */}
                <section className="page-2">
                    {/* More Floating Hearts for Page 2 */}
                    <div className="floating-hearts">
                        {hearts.map(heart => (
                            <div
                                key={`heart-${heart.id}`}
                                className="heart"
                                style={{
                                    left: heart.left,
                                    animationDelay: heart.delay,
                                    fontSize: heart.size,
                                    opacity: heart.opacity * 0.7
                                }}
                            >
                                ❤️
                            </div>
                        ))}
                    </div>

                    <div className="features-container">
                        <div className="features">
                            <h3>Why Choose HerCycle?</h3>
                            
                            <div className="feature-list">
                                <div className="feature">
                                    <span className="icon">📅</span>
                                    <h4>Accurate Cycle Tracking</h4>
                                    <p>Log periods, ovulation, and symptoms with precision. Never be surprised by your cycle again.</p>
                                </div>
                                <div className="feature">
                                    <span className="icon">📊</span>
                                    <h4>Smart Analytics</h4>
                                    <p>Visualize patterns, predict future cycles, and understand your unique health data.</p>
                                </div>
                                <div className="feature">
                                    <span className="icon">💡</span>
                                    <h4>Health Education</h4>
                                    <p>Access reliable information about menstrual health, fertility, and women's wellness.</p>
                                </div>
                                <div className="feature">
                                    <span className="icon">🔒</span>
                                    <h4>Privacy First</h4>
                                    <p>Your health data is secure, private, and always under your control.</p>
                                </div>
                            </div>

                            {/* Additional Feature Cards */}
                            <div className="feature-cards">
                                <div className="feature-card">
                                    <div className="feature-icon">🌿</div>
                                    <h4>Holistic Health Insights</h4>
                                    <p>Connect your cycle data with lifestyle factors for comprehensive wellness understanding.</p>
                                </div>
                                
                                <div className="feature-card">
                                    <div className="feature-icon">👥</div>
                                    <h4>Community Support</h4>
                                    <p>Join a supportive community of women sharing their journeys and experiences.</p>
                                </div>
                            </div>

                            {/* Final CTA Button */}
                            <div className="hero-buttons">
                                <a href="/register" className="btn-primary">
                                    Get Started - It's Free!
                                </a>
                            </div>
                        </div>
                    </div>
                </section>
            </main>

            {/* Footer */}
            <footer className="footer">
                <p>&copy; 2024 HerCycle. All rights reserved.</p>
            </footer>
        </div>
    );
};

export default Home;