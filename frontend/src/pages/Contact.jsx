import React, { useState } from 'react';
import './Contact.css';



const Contact = () => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        subject: '',
        message: ''
    });

    const [isSubmitted, setIsSubmitted] = useState(false);

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        // Here you would typically send data to a backend
        console.log('Form submitted:', formData);
        setIsSubmitted(true);
        setTimeout(() => setIsSubmitted(false), 3000);
        setFormData({ name: '', email: '', subject: '', message: '' });
    };

    const contactDetails = [
    {
        
        title: 'Email Us',
        detail: 'hercycle2025@gmail.com',
        description: 'For general inquiries and support'
    },
    {
        
        title: 'Call Us',
        detail: '011-25554422 HER-CYCLE',
        description: 'Mon-Fri, 9AM-6PM EST'
    },
    {
        
        title: 'Visit Us',
        detail: '155 High Level Road, Maharagama',
        detail2: 'Maharagama, Sri Lanka',
        description: 'By appointment only'
    },
    {
        
        title: 'Response Time',
        detail: 'Within 24 hours',
        description: 'For all email inquiries'
    }
];

    const faqs = [
        {
            question: "Is my health data secure?",
            answer: "Yes! We use end-to-end encryption and never share your personal health data with third parties without your explicit consent."
        },
        {
            question: "Do you offer medical advice?",
            answer: "HerCycle provides informational resources and tracking tools, but we are not a substitute for professional medical advice. Always consult with a healthcare provider."
        },
        {
            question: "Can I use HerCycle on multiple devices?",
            answer: "Yes! Your data syncs across all your devices when you're logged into your account."
        },
        {
            question: "Is there a mobile app?",
            answer: "Yes! HerCycle is available on both iOS and Android app stores. Download it to track on the go!"
        }
    ];

    return (
        <div className="contact-container">
            {/* Floating Hearts - Similar to Home page */}
            <div className="floating-hearts">
                {[...Array(10)].map((_, i) => (
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

            {/* Header - Same as Home */}
            <header className="header">
                <div className="logo">
                    <h1>HerCycle</h1>
                </div>
                <nav className="nav">
                    <a href="/" className="nav-link">Home</a>
                    <a href="/contact" className="nav-link active">Contact</a>
                    <a href="/login" className="nav-link">Login</a>
                    <a href="/register" className="nav-link btn-signup">Sign Up</a>
                </nav>
            </header>

            <main className="contact-main">
                {/* Page 1 - Contact Hero */}
                <section className="contact-hero">
                    <div className="contact-hero-content">
                        <h2>Get in Touch 💌</h2>
                        <p>We're here to help you on your menstrual health journey. Whether you have questions, feedback, or need support, our team is ready to assist you.</p>
                    </div>
                </section>

                {/* Page 2 - Contact Content */}
                <section className="contact-content">
                    <div className="contact-grid">
                        {/* Contact Form */}
                        <div className="contact-form-container">
                            <h3>Send us a Message</h3>
                            {isSubmitted && (
                                <div className="success-message">
                                    ✅ Thank you! Your message has been sent. We'll get back to you soon.
                                </div>
                            )}
                            <form onSubmit={handleSubmit} className="contact-form">
                                <div className="form-group">
                                    <input
                                        type="text"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleChange}
                                        placeholder="Your Name"
                                        required
                                        className="form-input"
                                    />
                                </div>
                                <div className="form-group">
                                    <input
                                        type="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleChange}
                                        placeholder="Your Email"
                                        required
                                        className="form-input"
                                    />
                                </div>
                                <div className="form-group">
                                    <input
                                        type="text"
                                        name="subject"
                                        value={formData.subject}
                                        onChange={handleChange}
                                        placeholder="Subject"
                                        required
                                        className="form-input"
                                    />
                                </div>
                                <div className="form-group">
                                    <textarea
                                        name="message"
                                        value={formData.message}
                                        onChange={handleChange}
                                        placeholder="Your Message"
                                        rows="5"
                                        required
                                        className="form-textarea"
                                    ></textarea>
                                </div>
                                <button type="submit" className="btn-primary contact-btn">
                                    Send Message
                                </button>
                            </form>
                        </div>

                        {/* Contact Details */}
                        <div className="contact-details">
                            <h3>Contact Information</h3>
                            <div className="details-grid">
                                {contactDetails.map((item, index) => (
                                    <div key={index} className="detail-card">
                                        <div className="detail-icon">
                                            <img 
                                                src={item.image} 
                                                alt={item.title}
                                                style={{ width: '40px', height: '40px', objectFit: 'contain' }}
                                            />
                                        </div>
                                        <h4>{item.title}</h4>
                                        <p className="detail-main">{item.detail}</p>
                                        {item.detail2 && <p className="detail-secondary">{item.detail2}</p>}
                                        <p className="detail-description">{item.description}</p>
                                    </div>
                                ))}
                            </div>

                            {/* Social Media Links */}
                            <div className="social-section">
                                <h4>Follow Us</h4>
                                <div className="social-links">
                                    <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="social-link">
                                        <img 
                                            src="https://upload.wikimedia.org/wikipedia/commons/thumb/0/05/Facebook_Logo_%282019%29.png/1024px-Facebook_Logo_%282019%29.png" 
                                            alt="Facebook"
                                            style={{ width: '20px', height: '20px', marginRight: '8px', verticalAlign: 'middle' }}
                                        />
                                        Facebook
                                    </a>
                                    <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="social-link">
                                        <img 
                                            src="https://upload.wikimedia.org/wikipedia/commons/thumb/6/6f/Logo_of_Twitter.svg/2491px-Logo_of_Twitter.svg.png" 
                                            alt="Twitter"
                                            style={{ width: '20px', height: '20px', marginRight: '8px', verticalAlign: 'middle' }}
                                        />
                                        Twitter
                                    </a>
                                    <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="social-link">
                                        <img 
                                            src="https://upload.wikimedia.org/wikipedia/commons/thumb/a/a5/Instagram_icon.png/600px-Instagram_icon.png" 
                                            alt="Instagram"
                                            style={{ width: '20px', height: '20px', marginRight: '8px', verticalAlign: 'middle' }}
                                        />
                                        Instagram
                                    </a>
                                    <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="social-link">
                                        <img 
                                            src="https://upload.wikimedia.org/wikipedia/commons/thumb/c/ca/LinkedIn_logo_initials.png/800px-LinkedIn_logo_initials.png" 
                                            alt="LinkedIn"
                                            style={{ width: '20px', height: '20px', marginRight: '8px', verticalAlign: 'middle' }}
                                        />
                                        LinkedIn
                                    </a>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* FAQs Section */}
                    <div className="faq-section">
                        <h3>Frequently Asked Questions</h3>
                        <div className="faq-grid">
                            {faqs.map((faq, index) => (
                                <div key={index} className="faq-card">
                                    <h4>❓ {faq.question}</h4>
                                    <p>{faq.answer}</p>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* CTA Section */}
                    <div className="contact-cta">
                        <h3>Need Immediate Help?</h3>
                        <p>Check our <a href="/help-center" className="cta-link">Help Center</a> for instant answers or join our community forum to connect with other users.</p>
                        <div className="cta-buttons">
                            <a href="/help-center" className="btn-secondary">Visit Help Center</a>
                            <a href="/community" className="btn-primary">Join Community</a>
                        </div>
                    </div>
                </section>
            </main>

            {/* Footer - Same as Home */}
            <footer className="footer">
                <p>&copy; 2024 HerCycle. All rights reserved.</p>
                <div className="footer-links">
                    <a href="/privacy">Privacy Policy</a>
                    <a href="/terms">Terms of Service</a>
                    <a href="/contact">Contact Us</a>
                </div>
            </footer>
        </div>
    );
};

export default Contact;