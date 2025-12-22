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

    // Function to scroll testimonials
    const scrollTestimonials = (scrollOffset) => {
        const track = document.getElementById('testimonialsTrack');
        if (track) {
            track.scrollBy({ left: scrollOffset, behavior: 'smooth' });
        }
    };

    // Auto-scroll testimonials
    useEffect(() => {
        const interval = setInterval(() => {
            scrollTestimonials(350);
        }, 5000);

        return () => clearInterval(interval);
    }, []);

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
                    <a className="nav-link" href="/">Home</a>
                    <a className="nav-link" href="/about">About</a>
                    <a className="nav-link" href="/contact">Contact</a>
                    <a className="nav-link btn-fundraiser" href="/fundraiser">Fundraiser</a>
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
                        <a className="btn-primary" href="/features">Explore Features</a>
                    </div>

                    {/* NEW: User Type Selection Section */}
                    <div className="user-type-section">
                        <h3>Choose Your Journey</h3>
                        <div className="user-type-cards">
                            {/* Cycle User Card */}
                            <div className="user-type-card">
                                <div className="user-type-icon">👩‍🦰</div>
                                <h4 className="user-type-title">Cycle User</h4>
                                <p className="user-type-description">
                                    Track your menstrual cycles, predict periods, monitor symptoms, 
                                    and get personalized insights about your reproductive health. 
                                    Perfect for women who want to understand their body better.
                                </p>
                                <a href="/register?type=cycle-user" className="user-type-btn">
                                    Become a Cycle User
                                </a>
                            </div>

                            {/* Learner Card */}
                            <div className="user-type-card">
                                <div className="user-type-icon">📚</div>
                                <h4 className="user-type-title">Learner</h4>
                                <p className="user-type-description">
                                    Access educational resources about menstrual health, fertility awareness, 
                                    and women's wellness. Learn about reproductive health through courses, 
                                    articles, and community discussions.
                                </p>
                                <a href="/register?type=learner" className="user-type-btn">
                                    Become a Learner
                                </a>
                            </div>
                        </div>
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
                        </div>
                    </div>
                </section>

                {/* Testimonials Section - IMPROVED */}
                <section className="testimonials-section">
                    <h3>What Our Users Say</h3>
                    <p className="testimonials-subtitle">
                        Join thousands of women who transformed their menstrual health journey with HerCycle
                    </p>
                    
                    {/* Floating Quote Marks */}
                    <div className="floating-quotes">
                        {[1, 2, 3, 4, 5].map(i => (
                            <div
                                key={i}
                                className="floating-quote"
                                style={{
                                    left: `${20 * i}%`,
                                    animationDelay: `${i * 4}s`,
                                    animationDuration: `${15 + i * 2}s`
                                }}
                            >
                                "
                            </div>
                        ))}
                    </div>
                    
                    <div className="testimonials-container">
                        {/* Testimonials Track */}
                        <div className="testimonials-track" id="testimonialsTrack">
                            {/* Testimonial 1 */}
                            <div className="testimonial-card">
                                <p className="testimonial-text">
                                    "HerCycle has completely changed how I understand my body. The predictions are incredibly accurate, 
                                    and the symptom tracking helped me identify patterns I never noticed before!"
                                </p>
                                <div className="testimonial-footer">
                                    <div className="testimonial-info">
                                        <div className="testimonial-name">Amilia </div>
                                        <div className="testimonial-role">Cycle User · 8 months</div>
                                    </div>
                                    <div className="testimonial-rating">
                                        <span className="star">⭐</span>
                                        <span className="star">⭐</span>
                                        <span className="star">⭐</span>
                                        <span className="star">⭐</span>
                                        <span className="star">⭐</span>
                                    </div>
                                </div>
                            </div>
                            
                            {/* Testimonial 2 */}
                            <div className="testimonial-card">
                                <p className="testimonial-text">
                                    "As someone new to menstrual health education, the learner resources have been invaluable. 
                                    The courses are well-structured and the community support is amazing!"
                                </p>
                                <div className="testimonial-footer">
                                    
                                    <div className="testimonial-info">
                                        <div className="testimonial-name">Maria Roshel</div>
                                        <div className="testimonial-role">Learner · 4 months</div>
                                    </div>
                                    <div className="testimonial-rating">
                                        <span className="star">⭐</span>
                                        <span className="star">⭐</span>
                                        <span className="star">⭐</span>
                                        <span className="star">⭐</span>
                                        <span className="star">⭐</span>
                                    </div>
                                </div>
                            </div>
                            
                            {/* Testimonial 3 */}
                            <div className="testimonial-card">
                                <p className="testimonial-text">
                                    "The fundraiser feature helped our women's health initiative reach our goals faster than expected. 
                                    The platform made it easy to connect with donors who care about menstrual health."
                                </p>
                                <div className="testimonial-footer">
                                    
                                    <div className="testimonial-info">
                                        <div className="testimonial-name">Priyasha Perera</div>
                                        <div className="testimonial-role">Fundraiser Organizer</div>
                                    </div>
                                    <div className="testimonial-rating">
                                        <span className="star">⭐</span>
                                        <span className="star">⭐</span>
                                        <span className="star">⭐</span>
                                        <span className="star">⭐</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    {/* Stats Bar */}
                    <div className="testimonial-stats">
                        <div className="stat-item">
                            <div className="stat-number">4.9/5</div>
                            <div className="stat-label">Average Rating</div>
                        </div>
                        <div className="stat-item">
                            <div className="stat-number">10K+</div>
                            <div className="stat-label">Happy Users</div>
                        </div>
                        <div className="stat-item">
                            <div className="stat-number">98%</div>
                            <div className="stat-label">Would Recommend</div>
                        </div>
                    </div>
                    
                    {/* Add Feedback Button */}
                    <button className="add-feedback-btn" onClick={() => window.location.href = '/contact'}>
                        Share Your Experience
                    </button>
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