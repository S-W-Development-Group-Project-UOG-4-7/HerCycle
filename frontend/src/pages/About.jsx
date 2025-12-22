import React from 'react';
import './About.css';

const About = () => {
    return (
        <div className="about-container">
            {/* Floating Hearts Background */}
            <div className="floating-hearts">
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(i => (
                    <div
                        key={i}
                        className="heart"
                        style={{
                            left: `${Math.random() * 100}%`,
                            animationDelay: `${Math.random() * 15}s`,
                            fontSize: `${Math.random() * 20 + 15}px`,
                            opacity: Math.random() * 0.3 + 0.1
                        }}
                    >
                        ❤️
                    </div>
                ))}
            </div>

            {/* Header */}
            <header className="about-header">
                <div className="logo">
                    <h1>HER CYCLE</h1>
                </div>
                <nav className="nav">
                    <a href="/" className="nav-link">Home</a>
                    <a href="/about" className="nav-link active">About</a>
                    <a href="/contact" className="nav-link">Contact</a>
                    <a href="/fundraiser" className="nav-link">Fundraiser</a>
              
                </nav>
            </header>

            {/* Main Content */}
            <main className="about-main">

                {/* About Section */}
                <section className="about-section" id="intro">
                    <div className="section-container">
                        <div className="section-header">
                            <h2 className="section-title">About HER CYCLE</h2>
                            <div className="section-divider"></div>
                        </div>
                        <div className="about-content">
                            <div className="about-text">
                                <p>
                                    <span className="highlight-text">HER CYCLE</span> is a comprehensive health and mental tracking platform designed to support girls and women in understanding their menstrual cycle and emotional well-being. 
                                    Our platform helps users track their periods, monitor mental health patterns, and access important menstrual health information in a safe, supportive, and stigma-free environment.
                                </p>
                                <div className="stats-grid">
                                    <div className="stat-item">
                                        <div className="stat-number">10K+</div>
                                        <div className="stat-label">Active Users</div>
                                    </div>
                                    <div className="stat-item">
                                        <div className="stat-number">95%</div>
                                        <div className="stat-label">Accuracy Rate</div>
                                    </div>
                                    <div className="stat-item">
                                        <div className="stat-number">24/7</div>
                                        <div className="stat-label">Support Available</div>
                                    </div>
                                </div>
                            </div>
                            <div className="about-image">
                                <div className="image-placeholder">
                                    <span className="image-icon">👩‍⚕️</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Problem Statement */}
                <section className="problem-section" id="problem">
                    <div className="section-container">
                        <div className="section-header">
                            <h2 className="section-title">Why HER CYCLE Exists</h2>
                            <div className="section-divider"></div>
                        </div>
                        <div className="problem-content">
                            <div className="problem-card">
                                <div className="problem-icon">🚫</div>
                                <h3>Lack of Awareness</h3>
                                <p>Many girls experience physical and emotional changes during their menstrual cycle but lack proper guidance and education about what's normal and what's not.</p>
                            </div>
                            <div className="problem-card">
                                <div className="problem-icon">💔</div>
                                <h3>Mental Health Challenges</h3>
                                <p>Stress, anxiety, and mood changes during menstrual cycles are often ignored or misunderstood, leading to unnecessary suffering and isolation.</p>
                            </div>
                            <div className="problem-card">
                                <div className="problem-icon">📚</div>
                                <h3>Need for Education</h3>
                                <p>Access to reliable, easy-to-understand menstrual health information remains limited, especially in simple, non-medical language.</p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Mission Section */}
                <section className="mission-section" id="mission">
                    <div className="section-container">
                        <div className="mission-content">
                            <h2 className="mission-title">Our Mission</h2>
                            <p className="mission-text">
                                To empower girls and women by promoting menstrual awareness, mental well-being, and self-care. 
                                HER CYCLE aims to break taboos around periods and mental health through technology, education, 
                                and easy-to-use tracking features that foster confidence and understanding.
                            </p>
                            <div className="mission-quote">
                                <p>"Empowering women starts with understanding their bodies"</p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Key Features */}
                <section className="features-section" id="features">
                    <div className="section-container">
                        <div className="section-header">
                            <h2 className="section-title">Key Features</h2>
                            <div className="section-divider"></div>
                            <p className="section-subtitle">Everything you need for your menstrual health journey</p>
                        </div>
                        <div className="features-grid">
                            <div className="feature-card">
                                
                                <h3>Period Tracking</h3>
                                <p>Track menstrual cycles, symptoms, and receive smart reminders for upcoming periods and ovulation.</p>
                            </div>
                            <div className="feature-card">
                                
                                <h3>Mental Health Monitoring</h3>
                                <p>Record mood changes, emotional patterns, and get insights about your mental well-being throughout your cycle.</p>
                            </div>
                            <div className="feature-card">
                                
                                <h3>Health Insights</h3>
                                <p>Visual analytics to understand body patterns, cycle phases, and correlations between physical and emotional changes.</p>
                            </div>
                            <div className="feature-card">
                                
                                <h3>Smart Reminders</h3>
                                <p>Personalized notifications for medication, self-care activities, and health check-ups.</p>
                            </div>
                            <div className="feature-card">
                                
                                <h3>Community Support</h3>
                                <p>Connect with other women, share experiences, and find support in a safe, moderated environment.</p>
                            </div>
                            <div className="feature-card">
                                
                                <h3>User-Friendly Design</h3>
                                <p>Simple, intuitive interface designed specifically for young users with privacy and ease of use in mind.</p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Education Platform */}
                <section className="education-section" id="education">
                    <div className="section-container">
                        <div className="education-content">
                            <div className="education-text">
                                <h2 className="education-title">Educational Platform</h2>
                                <p>
                                    HER CYCLE functions as a comprehensive educational platform where users can learn about menstrual health, 
                                    emotional changes, and self-care practices. Our content is designed in simple, accessible language to help 
                                    girls understand their bodies confidently and make informed health decisions.
                                </p>
                                <div className="education-points">
                                    <div className="point">
                                        <span className="point-icon">✅</span>
                                        <span>Age-appropriate menstrual health education</span>
                                    </div>
                                    <div className="point">
                                        <span className="point-icon">✅</span>
                                        <span>Mental wellness resources and coping strategies</span>
                                    </div>
                                    <div className="point">
                                        <span className="point-icon">✅</span>
                                        <span>Nutrition and lifestyle guidance for different cycle phases</span>
                                    </div>
                                    <div className="point">
                                        <span className="point-icon">✅</span>
                                        <span>Interactive learning modules and quizzes</span>
                                    </div>
                                </div>
                            </div>
                            <div className="education-image">
                                <div className="edu-icon">📚</div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Privacy & Safety */}
                <section className="privacy-section" id="privacy">
                    <div className="section-container">
                        <div className="section-header">
                            <h2 className="section-title">Privacy & Safety</h2>
                            <div className="section-divider"></div>
                        </div>
                        <div className="privacy-content">
                            <div className="privacy-card">
                                <div className="privacy-icon">1</div>
                                <h3>Data Security</h3>
                                <p>Your personal health information is encrypted and stored securely using industry-standard protocols.</p>
                            </div>
                            <div className="privacy-card">
                                <div className="privacy-icon">2</div>
                                <h3>Complete Confidentiality</h3>
                                <p>We never share your data with third parties. Your journey remains private and confidential.</p>
                            </div>
                            <div className="privacy-card">
                                <div className="privacy-icon">3</div>
                                <h3>Transparent Policies</h3>
                                <p>Clear privacy policies and user control over what data is collected and how it's used.</p>
                            </div>
                        </div>
                        <div className="privacy-commitment">
                            <p className="commitment-text">
                                <strong>Our Commitment:</strong> User privacy and data security are our top priorities. 
                                HER CYCLE ensures that personal health information is used only to improve your experience 
                                and provide better insights.
                            </p>
                        </div>
                    </div>
                </section>

                {/* Vision & Conclusion */}
                <section className="vision-section" id="vision">
                    <div className="section-container">
                        <div className="vision-content">
                           
                            <h2 className="vision-title">Our Vision</h2>
                            <p className="vision-text">
                                HER CYCLE envisions a future where girls and women feel confident, informed, and supported 
                                throughout their health journey. By combining health tracking with education, we aim to create 
                                positive awareness and long-term well-being for women everywhere.
                            </p>
                            <div className="vision-steps">
                                <div className="step">
                                    <div className="step-number">1</div>
                                    <p>Break taboos around menstrual health</p>
                                </div>
                                <div className="step">
                                    <div className="step-number">2</div>
                                    <p>Promote mental well-being awareness</p>
                                </div>
                                <div className="step">
                                    <div className="step-number">3</div>
                                    <p>Build a supportive global community</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* CTA Section */}
                <section className="cta-section">
                    <div className="cta-content">
                        <h2>Ready to Start Your Journey?</h2>
                        <p>Join thousands of women who have transformed their health journey with HER CYCLE</p>
                        <div className="cta-buttons">
                            <a href="/register" className="cta-btn primary">Join Now - It's Free!</a>
                            <a href="/contact" className="cta-btn secondary">Contact Us</a>
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

export default About;