import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';

const LandingPage = () => {

  const navigate = useNavigate();

  const [scrolled, setScrolled] = useState(false);
  const [activeSection, setActiveSection] = useState('home');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // API data states
  const [landingPageData, setLandingPageData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showError, setShowError] = useState(false);

  useEffect(() => {
    // Fetch data from your actual API endpoint
    const fetchData = async () => {
      try {
        setLoading(true);

        // Use the public API endpoint
        const response = await fetch('http://localhost:5000/api/landing-page');

        if (!response.ok) {
          throw new Error(`Failed to fetch data: ${response.status}`);
        }

        const result = await response.json();

        if (result.success) {
          setLandingPageData(result.data);
          setError(null);
          setShowError(false);
          console.log('Data loaded from:', result.fromDatabase ? 'DATABASE' : 'DEFAULTS');
        } else {
          throw new Error(result.message || 'Invalid response from server');
        }
      } catch (err) {
        const errorMessage = err.message;
        setError(errorMessage);
        setShowError(true);
        console.error('API Error:', errorMessage);

        // Fallback to hardcoded data
        setLandingPageData({
          hero: {
            badgeText: "A safe space for menstrual health",
            mainHeading: "Your Circle of Strength & Support",
            subheading: "Join thousands of women in a supportive community focused on menstrual health, education, and empowerment."
          },
          about: {
            title: "More Than Just an App",
            description1: "HerCycle is a revolutionary platform that combines community support with evidence-based education about menstrual health.",
            description2: "We're breaking taboos and creating a safe space for open conversations about periods, fertility, and women's health."
          },
          mission: {
            title: "Empowering Women Worldwide",
            description: "We're on a mission to make menstrual health education accessible to every woman, regardless of background or location."
          },
          contact: {
            title: "Ready to Join?",
            description: "Be part of a growing community that's changing how we talk about menstrual health."
          },
          footer: {
            tagline: "Creating a world where menstrual health is openly discussed and properly supported.",
            supportEmail: "support@hercycle.com",
            socialLinks: [
              { name: 'Instagram', icon: 'IG', color: 'pink-purple', url: '#' },
              { name: 'Twitter', icon: 'X', color: 'blue-4', url: '#' },
              { name: 'Facebook', icon: 'FB', color: 'blue-6', url: '#' }
            ]
          },
          features: [
            { icon: '🌸', title: 'Cycle Tracking', description: 'Intuitive period tracking with predictive analytics and health insights.' },
            { icon: '💜', title: 'Community Support', description: 'Connect with others in a safe, moderated space for sharing experiences.' },
            { icon: '📚', title: 'Educational Resources', description: 'Access to verified articles, guides, and expert advice on menstrual health.' },
            { icon: '🤝', title: 'Fundraising', description: 'Support menstrual health initiatives and donate to important causes.' },
            { icon: '🔔', title: 'Smart Reminders', description: 'Personalized notifications for your cycle, medications, and appointments.' },
            { icon: '📊', title: 'Health Analytics', description: 'Detailed reports and trends to better understand your menstrual health.' }
          ],
          stats: [
            { number: '50K+', label: 'Active Users' },
            { number: '100+', label: 'Health Articles' },
            { number: '25+', label: 'Cycle Users' },
            { number: 'Rs.2M+', label: 'Funds Raised' }
          ]
        });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Add manual dismiss functionality
  const dismissError = () => {
    setShowError(false);
  };

  // Single auto-dismiss error after 1 minute
  useEffect(() => {
    if (showError) {
      const timer = setTimeout(() => {
        setShowError(false);
      }, 60000);

      return () => clearTimeout(timer);
    }
  }, [showError]);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);

      // Update active section based on scroll position
      const sections = ['home', 'community', 'fundraising'];
      for (const section of sections) {
        const element = document.getElementById(section);
        if (element) {
          const rect = element.getBoundingClientRect();
          if (rect.top <= 150 && rect.bottom >= 150) {
            setActiveSection(section);
            break;
          }
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Loading state UI
  if (loading || !landingPageData) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-gray-900 to-purple-950">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-pink-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white text-lg">Loading HerCycle...</p>
          <p className="text-gray-400 text-sm mt-2">Fetching data from backend...</p>
        </div>
      </div>
    );
  }

  // Destructure data for easier access
  const { hero = {}, about = {}, mission = {}, contact = {}, footer = {}, features = [], stats = [] } = landingPageData;

  return (
    <div className="min-h-screen w-full relative overflow-x-hidden">

      {/* Custom Styles */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800&display=swap');
        
        * {
          font-family: 'Outfit', sans-serif;
        }
        
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-20px) rotate(5deg); }
        }
        
        @keyframes pulse-glow {
          0%, 100% { box-shadow: 0 0 20px rgba(219, 39, 119, 0.3); }
          50% { box-shadow: 0 0 40px rgba(219, 39, 119, 0.6); }
        }
        
        @keyframes gradient-shift {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        
        @keyframes fade-in-up {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes shimmer {
          0% { background-position: -200% center; }
          100% { background-position: 200% center; }
        }
        
        .animate-float {
          animation: float 6s ease-in-out infinite;
        }
        
        .animate-float-delayed {
          animation: float 8s ease-in-out infinite;
          animation-delay: 2s;
        }
        
        .animate-pulse-glow {
          animation: pulse-glow 3s ease-in-out infinite;
        }
        
        .gradient-text {
          background: linear-gradient(135deg, #ffffff 0%, #f9a8d4 50%, #c084fc 100%);
          background-size: 200% 200%;
          animation: gradient-shift 3s ease infinite;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        
        .shimmer-text {
          background: linear-gradient(90deg, #ffffff 0%, #f9a8d4 25%, #ffffff 50%, #c084fc 75%, #ffffff 100%);
          background-size: 200% auto;
          animation: shimmer 3s linear infinite;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        
        .glass-card {
          background: rgba(255, 255, 255, 0.08);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          border: 1px solid rgba(255, 255, 255, 0.15);
          transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
        }
        
        .glass-card:hover {
          background: rgba(255, 255, 255, 0.15);
          border-color: rgba(255, 255, 255, 0.3);
          transform: translateY(-8px) scale(1.02);
          box-shadow: 0 25px 50px rgba(0, 0, 0, 0.3);
        }
        
        .nav-link {
          position: relative;
          overflow: hidden;
        }
        
        .nav-link::after {
          content: '';
          position: absolute;
          bottom: -2px;
          left: 50%;
          width: 0;
          height: 2px;
          background: linear-gradient(90deg, #f9a8d4, #c084fc);
          transition: all 0.3s ease;
          transform: translateX(-50%);
          border-radius: 2px;
        }
        
        .nav-link:hover::after,
        .nav-link.active::after {
          width: 100%;
        }
        
        .btn-primary {
          background: linear-gradient(135deg, #db2777 0%, #9333ea 100%);
          position: relative;
          overflow: hidden;
          transition: all 0.4s ease;
        }
        
        .btn-primary::before {
          content: '';
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent);
          transition: left 0.5s ease;
        }
        
        .btn-primary:hover::before {
          left: 100%;
        }
        
        .btn-primary:hover {
          transform: translateY(-3px);
          box-shadow: 0 15px 35px rgba(219, 39, 119, 0.4);
        }
        
        .section-fade {
          animation: fade-in-up 0.8s ease-out forwards;
        }
        
        .stat-card {
          background: linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.1);
        }
        
        .feature-icon {
          font-size: 3rem;
          filter: drop-shadow(0 0 20px rgba(255, 255, 255, 0.3));
        }
        
        /* Scrollbar Styling */
        ::-webkit-scrollbar {
          width: 8px;
        }
        
        ::-webkit-scrollbar-track {
          background: rgba(0, 0, 0, 0.2);
        }
        
        ::-webkit-scrollbar-thumb {
          background: linear-gradient(180deg, #db2777, #9333ea);
          border-radius: 4px;
        }
        
        .decorative-circle {
          position: absolute;
          border-radius: 50%;
          pointer-events: none;
        }
        
        /* Mobile Menu */
        .mobile-menu {
          transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.3s ease;
        }
        
        .mobile-menu.closed {
          transform: translateX(100%);
          opacity: 0;
          pointer-events: none;
        }
        
        .hamburger span {
          display: block;
          width: 24px;
          height: 2px;
          background: white;
          transition: all 0.3s ease;
          border-radius: 2px;
        }
        
        .hamburger.open span:nth-child(1) {
          transform: rotate(45deg) translate(5px, 5px);
        }
        
        .hamburger.open span:nth-child(2) {
          opacity: 0;
        }
        
        .hamburger.open span:nth-child(3) {
          transform: rotate(-45deg) translate(7px, -6px);
        }
        
        /* Error Message Animation */
        @keyframes slideInRight {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
        
        @keyframes slideOutRight {
          from {
            transform: translateX(0);
            opacity: 1;
          }
          to {
            transform: translateX(100%);
            opacity: 0;
          }
        }
        
        .error-message-enter {
          animation: slideInRight 0.3s ease-out forwards;
        }
        
        .error-message-exit {
          animation: slideOutRight 0.3s ease-out forwards;
        }
        
        /* Progress bar animation */
        @keyframes progressBar {
          from { width: 100%; }
          to { width: 0%; }
        }
        
        /* Responsive utilities */
        @media (max-width: 768px) {
          .decorative-circle {
            transform: scale(0.6);
          }
        }
      `}</style>

      {/* Error message if API fails */}
      {showError && (
        <div
          className={`fixed top-20 right-4 z-50 bg-gradient-to-r from-red-500 to-orange-500 text-white px-6 py-4 rounded-lg shadow-xl flex items-center gap-4 error-message-enter ${!showError ? 'error-message-exit' : ''}`}
          style={{
            maxWidth: '400px',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            backdropFilter: 'blur(10px)',
            animation: 'slideInRight 0.3s ease-out'
          }}
        >
          <div className="flex-1">
            <div className="font-bold text-sm mb-1 flex items-center gap-2">
              <span className="w-2 h-2 bg-white rounded-full animate-pulse"></span>
              API Connection Issue
            </div>
            <p className="text-sm opacity-90">Using fallback data. {error}</p>
            <div className="mt-2 text-xs opacity-75">
              Auto-dismissing in 1 minute...
            </div>
          </div>
          <button
            onClick={dismissError}
            className="text-white hover:text-gray-200 text-lg font-bold px-2 py-1 rounded-full hover:bg-white/10 transition-colors"
            aria-label="Dismiss error"
          >
            ×
          </button>

          {/* Progress bar for 1 minute countdown */}
          <div
            className="absolute bottom-0 left-0 h-1 bg-white/30 rounded-b-lg"
            style={{
              width: '100%',
              animation: 'progressBar 60s linear forwards'
            }}
          />
        </div>
      )}

      {/* Decorative Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none" style={{ zIndex: 1 }}>
        <div
          className="decorative-circle animate-float"
          style={{
            width: '600px',
            height: '600px',
            top: '-200px',
            left: '-200px',
            background: 'radial-gradient(circle, rgba(219, 39, 119, 0.3) 0%, transparent 70%)',
          }}
        />
        <div
          className="decorative-circle animate-float-delayed"
          style={{
            width: '500px',
            height: '500px',
            top: '30%',
            right: '-150px',
            background: 'radial-gradient(circle, rgba(147, 51, 234, 0.25) 0%, transparent 70%)',
          }}
        />
        <div
          className="decorative-circle animate-float"
          style={{
            width: '400px',
            height: '400px',
            bottom: '10%',
            left: '20%',
            background: 'radial-gradient(circle, rgba(20, 184, 166, 0.2) 0%, transparent 70%)',
            animationDelay: '1s',
          }}
        />

        <div
          className="decorative-circle animate-float"
          style={{
            width: '150px',
            height: '150px',
            top: '15%',
            left: '10%',
            border: '1px solid rgba(255, 255, 255, 0.15)',
          }}
        />
        <div
          className="decorative-circle animate-float-delayed"
          style={{
            width: '200px',
            height: '200px',
            top: '60%',
            right: '15%',
            border: '1px solid rgba(249, 168, 212, 0.2)',
          }}
        />
        <div
          className="decorative-circle animate-float"
          style={{
            width: '100px',
            height: '100px',
            bottom: '20%',
            left: '5%',
            background: 'rgba(255, 255, 255, 0.05)',
            animationDelay: '3s',
          }}
        />
      </div>

      {/* Navigation */}
      <header
        className={`fixed top-4 left-4 right-4 md:left-8 md:right-8 z-50 px-4 sm:px-6 md:px-10 py-3 md:py-4 flex items-center justify-between rounded-2xl transition-all duration-500 ${scrolled ? 'top-2' : 'top-4 md:top-6'
          }`}
        style={{
          backgroundColor: scrolled ? 'rgba(15, 10, 25, 0.85)' : 'rgba(255, 255, 255, 0.08)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          border: '1px solid rgba(255, 255, 255, 0.15)',
          boxShadow: scrolled ? '0 20px 40px rgba(0, 0, 0, 0.3)' : '0 8px 32px rgba(0, 0, 0, 0.1)',
        }}
      >
        {/* Logo */}
        <div className="flex items-center gap-2 sm:gap-3">
          <div
            className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center animate-pulse-glow"
            style={{
              background: 'linear-gradient(135deg, #db2777 0%, #9333ea 100%)',
            }}
          >
            <span className="text-white text-lg sm:text-xl">♡</span>
          </div>
          <span className="text-white font-bold text-lg sm:text-xl md:text-2xl tracking-wide">
            Her<span className="gradient-text">Cycle</span>
          </span>
        </div>

        {/* Desktop Nav Links */}
        <nav className="hidden md:flex items-center gap-6 lg:gap-8">

          {[
            { id: 'home', label: 'Home' },
            { id: 'community', label: 'Community' },
            { id: 'fundraising', label: 'Fundraising', link: '/fundraising' },
          ].map((item) => (
            item.link ? (
              <Link
                key={item.id}
                to={item.link}
                className={`nav-link text-white text-sm font-medium uppercase tracking-wider py-2 transition-all hover:text-pink-300 ${activeSection === item.id ? 'active text-pink-300' : ''}`}
                onClick={() => setMobileMenuOpen(false)}
              >
                {item.label}
              </Link>
            ) : (
              <a
                key={item.id}
                href={`#${item.id}`}
                className={`nav-link text-white text-sm font-medium uppercase tracking-wider py-2 transition-all hover:text-pink-300 ${activeSection === item.id ? 'active text-pink-300' : ''}`}
                onClick={() => setMobileMenuOpen(false)}
              >
                {item.label}
              </a>
            )
          ))}
        </nav>

        {/* Desktop CTA Button */}
        <button className="hidden md:block btn-primary text-white text-lg font-semibold rounded-full px-10 py-5 uppercase tracking-wide button" onClick={() => navigate('/login')}>
          Join Circle
        </button>

        {/* Mobile Menu Button */}
        <button
          className="md:hidden hamburger flex flex-col gap-1.5 p-2 z-50"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label="Toggle menu"
        >
          <span></span>
          <span></span>
          <span></span>
        </button>
      </header>

      {/* Mobile Menu */}
      <div
        className={`mobile-menu fixed top-0 right-0 h-screen w-full sm:w-80 z-40 md:hidden ${mobileMenuOpen ? '' : 'closed'}`}
        style={{
          background: 'rgba(15, 10, 25, 0.98)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
        }}
      >
        <nav className="flex flex-col items-center justify-center h-full gap-8 px-8">
          {[
            { id: 'home', label: 'Home' },
            { id: 'community', label: 'Community' },
            { id: 'fundraising', label: 'Fundraising' },
          ].map((item, index) => (
            <a
              key={item.id}
              href={`#${item.id}`}
              className={`text-white text-xl font-medium uppercase tracking-wider transition-all hover:text-pink-300 ${activeSection === item.id ? 'text-pink-300' : ''}`}
              onClick={() => setMobileMenuOpen(false)}
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              {item.label}
            </a>
          ))}
          <button
            className="btn-primary text-white font-semibold rounded-full px-10 py-4 uppercase tracking-wide mt-4 button"
            onClick={() => { navigate('/login'); setMobileMenuOpen(false); }}
          >
            Join Circle
          </button>
        </nav>
      </div>

      {/* Hero Section */}
      <section id="home" className="relative z-10 min-h-screen flex items-center justify-center px-4 sm:px-6 md:px-12 pt-24 md:pt-0">
        <div className="text-center max-w-4xl mx-auto section-fade w-full flex flex-col items-center">
          {/* Badge - using data from API */}
          <div
            className="inline-flex items-center gap-2 px-5 py-2 rounded-full mb-8"
            style={{
              background: 'rgba(255, 255, 255, 0.1)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
            }}
          >
            <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></span>
            <span className="text-white/80 text-sm font-medium">{hero.badgeText || "Empowering Women Worldwide"}</span>
          </div>

          {/* Main Heading */}
          <h1 className="text-3xl sm:text-4xl md:text-6xl lg:text-7xl xl:text-8xl font-bold text-white mb-6 leading-tight w-full text-center">
            {hero.mainHeading || "Your Circle of Strength & Support"}
          </h1>

          {/* Subheading */}
          <div className="w-full flex justify-center mb-10">
            <p className="text-white/70 text-base sm:text-lg md:text-xl max-w-2xl leading-relaxed text-center">
              {hero.subheading || "Join a compassionate community where menstrual health is understood, tracked, and supported."}
            </p>
          </div>
          <br />
          <br />
          {/* Stats - from API */}
          <div className="flex flex-wrap justify-center gap-6 sm:gap-8 md:gap-12 mt-12 sm:mt-16 w-full">
            {(stats.length > 0 ? stats : [
              { number: '50K+', label: 'Active Users' },
              { number: '100+', label: 'Health Articles' },
              { number: '25+', label: 'Cycle Users' },
              { number: 'Rs.2M+', label: 'Funds Raised' }
            ]).map((stat, index) => (
              <div key={index} className="text-center min-w-25">
                <div className="text-2xl sm:text-3xl md:text-4xl font-bold gradient-text mb-1">{stat.number}</div>
                <div className="text-white/60 text-xs sm:text-sm uppercase tracking-wider">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-10 left-1/2 transform -translate-x-1/2 flex flex-col items-center gap-2">
          <span className="text-white/50 text-xs uppercase tracking-widest">Scroll</span>
          <div className="w-6 h-10 rounded-full border-2 border-white/30 flex justify-center pt-2">
            <div className="w-1.5 h-3 bg-white/50 rounded-full animate-bounce"></div>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="relative z-10 min-h-screen flex items-center justify-center py-16 sm:py-20 md:py-24 px-4 sm:px-6 md:px-12 lg:px-24">
        <div className="max-w-7xl mx-auto w-full">
          <div className="grid lg:grid-cols-2 gap-8 sm:gap-12 lg:gap-16 items-center">
            {/* Left Content */}
            <div className="section-fade w-full flex flex-col items-center lg:items-start text-center lg:text-left">
              <div className="max-w-2xl lg:max-w-none mx-auto lg:mx-0">
                <span className="text-pink-400 font-semibold uppercase tracking-widest text-sm mb-4 block">
                  About HerCycle
                </span>
                <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 sm:mb-8 leading-tight">
                  {about.title || "More Than Just Period Tracking"}
                </h2>
                <p className="text-white/70 text-base sm:text-lg leading-relaxed mb-6 sm:mb-8">
                  {about.description1 || "HerCycle is a safe, inclusive digital community dedicated to breaking taboos around menstrual health."}
                </p>
                <p className="text-white/60 text-sm sm:text-base leading-relaxed mb-8 sm:mb-10">
                  {about.description2 || "Our platform combines intuitive cycle tracking with educational resources and community support."}
                </p>
                <div className="flex justify-center lg:justify-start">
                  <button className="btn-primary text-white font-semibold rounded-full px-6 sm:px-8 py-3 sm:py-4 text-sm sm:text-base">
                    Learn More About Us
                  </button>
                </div>
              </div>
            </div>

            {/* Right Visual */}
            <div className="relative mt-8 lg:mt-0 flex justify-center lg:justify-end">
              <div
                className="glass-card rounded-2xl sm:rounded-3xl p-6 sm:p-8 md:p-12 max-w-lg w-full"
                style={{
                  background: 'linear-gradient(135deg, rgba(219, 39, 119, 0.15) 0%, rgba(147, 51, 234, 0.1) 100%)',
                }}
              >
                <div className="grid grid-cols-2 gap-4 sm:gap-6">
                  {[
                    { emoji: "🌸", title: "Safe Space", desc: "Judgment-free community" },
                    { emoji: "💡", title: "Education", desc: "Verified health info" },
                    { emoji: "🤗", title: "Support", desc: "24/7 peer support" },
                    { emoji: "🌍", title: "Impact", desc: "Global initiatives" },
                  ].map((item, i) => (
                    <div
                      key={i}
                      className="glass-card rounded-xl sm:rounded-2xl p-4 sm:p-6 text-center"
                      style={{ animationDelay: `${i * 0.1}s` }}
                    >
                      <span className="text-2xl sm:text-3xl md:text-4xl mb-2 sm:mb-4 block">{item.emoji}</span>
                      <h4 className="text-white font-semibold mb-1 text-sm sm:text-base">{item.title}</h4>
                      <p className="text-white/50 text-xs sm:text-sm">{item.desc}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Decorative elements */}
              <div
                className="hidden lg:block absolute -top-8 -right-8 w-20 h-20 lg:w-24 lg:h-24 rounded-2xl animate-float"
                style={{
                  background: 'linear-gradient(135deg, #db2777 0%, #9333ea 100%)',
                  opacity: 0.6,
                }}
              />
              <div
                className="hidden lg:block absolute -bottom-6 -left-6 w-12 h-12 lg:w-16 lg:h-16 rounded-xl animate-float-delayed"
                style={{
                  background: 'linear-gradient(135deg, #14b8a6 0%, #0d9488 100%)',
                  opacity: 0.5,
                }}
              />
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="relative z-10 py-16 sm:py-20 md:py-24 px-4 sm:px-6 md:px-12 lg:px-24">
        <div className="w-full flex flex-col items-center justify-center">

          {/* Section Header */}
          <div className="text-center mb-12 sm:mb-16 section-fade w-full max-w-2xl">
            <span className="text-pink-400 font-semibold uppercase tracking-widest text-xs sm:text-sm mb-3 sm:mb-4 block">
              Our Features
            </span>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-4 sm:mb-6">
              Everything You <span className="gradient-text">Need</span>
            </h2>
            <p className="text-white/60 text-base sm:text-lg">
              Comprehensive tools and resources designed to support your menstrual health journey
            </p>
          </div>
          <br />
          <br />

          {/* Features Grid - from API */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 w-full max-w-6xl">
            {(features.length > 0 ? features : [
              { icon: '🌸', title: 'Cycle Tracking', description: 'Intuitive period tracking with predictive analytics and health insights.' },
              { icon: '💜', title: 'Community Support', description: 'Connect with others in a safe, moderated space for sharing experiences.' },
              { icon: '📚', title: 'Educational Resources', description: 'Access to verified articles, guides, and expert advice on menstrual health.' },
              { icon: '🤝', title: 'Fundraising', description: 'Support menstrual health initiatives and donate to important causes.' },
              { icon: '🔔', title: 'Smart Reminders', description: 'Personalized notifications for your cycle, medications, and appointments.' },
              { icon: '📊', title: 'Health Analytics', description: 'Detailed reports and trends to better understand your menstrual health.' }
            ]).map((feature, index) => (
              <div
                key={index}
                className="glass-card rounded-2xl sm:rounded-3xl p-6 sm:p-8 flex flex-col items-center justify-center text-center group cursor-pointer min-h-[280px] sm:min-h-[320px]"
                style={{ animationDelay: `${index * 0.15}s` }}
              >
                <div className="flex flex-col items-center justify-center h-full w-full">
                  <span
                    className="text-5xl sm:text-6xl md:text-7xl block mb-4 sm:mb-6 transform group-hover:scale-110 transition-transform duration-300"
                    style={{
                      filter: 'drop-shadow(0 0 20px rgba(255, 255, 255, 0.3))',
                      lineHeight: '1'
                    }}
                  >
                    {feature.icon}
                  </span>
                  <h3 className="text-white font-bold text-xl sm:text-2xl mb-3 sm:mb-4">{feature.title}</h3>
                  <p className="text-white/60 text-sm sm:text-base leading-relaxed max-w-xs mx-auto">
                    {feature.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
      <br />
      <br />
      <br />
      <br />
      <br />

      {/* Mission Section */}
      <section id="mission" className="relative z-10 py-16 sm:py-20 md:py-24 px-4 sm:px-6 md:px-12 lg:px-24">
        <div className="w-full flex justify-center items-center">
          <div className="max-w-4xl w-full">
            <div
              className="glass-card rounded-2xl sm:rounded-3xl p-8 sm:p-12 md:p-16 lg:p-20 text-center w-full flex flex-col items-center justify-center"
              style={{
                background: 'linear-gradient(135deg, rgba(147, 51, 234, 0.15) 0%, rgba(219, 39, 119, 0.1) 50%, rgba(20, 184, 166, 0.1) 100%)',
              }}
            >
              <span className="text-pink-400 font-semibold uppercase tracking-widest text-xs sm:text-sm mb-4 sm:mb-6 block text-center">
                Our Mission
              </span>
              <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 sm:mb-8 leading-tight text-center">
                {mission.title || "Breaking Barriers, Building Bridges"}
              </h2>
              <p className="text-white/70 text-base sm:text-lg md:text-xl leading-relaxed mb-8 sm:mb-10 max-w-3xl text-center mx-auto">
                {mission.description || "To create an inclusive, educated, and supportive ecosystem where every woman feels empowered and informed about her menstrual health."}
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 w-full max-w-md mx-auto">
                <button className="btn-primary text-white font-semibold rounded-full px-8 sm:px-10 py-3 sm:py-4 text-base sm:text-lg w-full sm:w-auto text-center button" onClick={() => navigate('/login')}>
                  Join Our Mission
                </button>
                <button className="glass-card text-white font-semibold rounded-full px-8 sm:px-10 py-3 sm:py-4 text-base sm:text-lg w-full sm:w-auto text-center button" onClick={() => navigate('/fundraising')}>
                  Donate Now
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>
      <br />
      <br />

      {/* Contact / CTA Section */}
      <section id="contact" className="relative z-10 py-16 sm:py-20 md:py-24 px-4 sm:px-6 md:px-12 lg:px-24">
        <div className="w-full flex flex-col items-center justify-center">

          {/* Contact Content */}
          <div className="text-center w-full max-w-2xl mb-10">
            <span className="text-pink-400 font-semibold uppercase tracking-widest text-xs sm:text-sm mb-3 sm:mb-4 block">
              Get In Touch
            </span>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-4 sm:mb-6">
              {contact.title || "Ready to Join Us?"}
            </h2>
            <p className="text-white/60 text-base sm:text-lg">
              {contact.description || "Start your journey with HerCycle today and be part of a movement that's changing how we talk about menstrual health."}
            </p>
          </div>
          <br />
          <br />

          {/* Email Signup */}
          <div className="w-full flex justify-center">
            <div
              className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3 max-w-lg w-full p-2 sm:p-2 rounded-2xl sm:rounded-full"
              style={{
                background: 'rgba(255, 255, 255, 0.1)',
                border: '1px solid rgba(255, 255, 255, 0.15)',
              }}
            >
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 bg-transparent text-white placeholder-white/50 px-4 sm:px-6 py-3 outline-none w-full rounded-xl sm:rounded-none"
              />
              <button className="btn-primary text-white font-semibold rounded-xl sm:rounded-full px-6 sm:px-8 py-3 whitespace-nowrap text-sm sm:text-base button">
                Get Started
              </button>
            </div>
          </div>

        </div>
      </section>
      <br />
      <br />

      {/* Footer - Made Bigger */}
      <footer className="relative z-10 py-20 sm:py-24 md:py-28 px-4 sm:px-6 md:px-12 lg:px-24 mt-20 sm:mt-24 md:mt-28 w-full justify-items-center"
        style={{
          background: 'linear-gradient(180deg, transparent 0%, rgba(15, 10, 25, 0.8) 100%)',
          boxShadow: '0 -20px 60px rgba(0, 0, 0, 0.2)'
        }}>
        <div className="max-w-7xl mx-auto w-full">
          {/* Main Footer Content - Expanded */}
          <br />
          <div className="grid md:grid-cols-3 gap-12 mb-16">
            {/* Logo and Description Section - Made Bigger */}
            <div className="text-center md:text-left">
              <div className="flex flex-col items-center md:items-start gap-6 mb-8">
                <div className="flex items-center gap-4">
                  <div
                    className="w-16 h-16 rounded-2xl flex items-center justify-center animate-pulse-glow"
                    style={{
                      background: 'linear-gradient(135deg, #db2777 0%, #9333ea 100%)',
                      boxShadow: '0 0 30px rgba(219, 39, 119, 0.4)'
                    }}
                  >
                    <span className="text-white text-2xl">♡</span>
                  </div>
                  <span className="text-white font-bold text-3xl">
                    Her<span className="gradient-text">Cycle</span>
                  </span>
                </div>
                <p className="text-white/70 text-lg leading-relaxed max-w-md">
                  {footer.tagline || "Empowering women worldwide through education, community, and support."}
                </p>
              </div>
            </div>

            {/* Quick Links Section */}
            <div className="text-center">
              <h4 className="text-white font-bold text-2xl mb-8">Quick Links</h4>
              <ul className="space-y-4">
                <li>
                  <a href="#home" className="text-white/70 hover:text-pink-300 text-lg transition-all">
                    Home
                  </a>
                </li>
                <li>
                  <a href="#community" className="text-white/70 hover:text-pink-300 text-lg transition-all">
                    Community
                  </a>
                </li>
                <li>
                  <a href="#features" className="text-white/70 hover:text-pink-300 text-lg transition-all">
                    Features
                  </a>
                </li>
                <li>
                  <a href="#mission" className="text-white/70 hover:text-pink-300 text-lg transition-all">
                    Our Mission
                  </a>
                </li>
                <li>
                  <Link to="/fundraising" className="text-white/70 hover:text-pink-300 text-lg transition-all">
                    Fundraising
                  </Link>
                </li>
              </ul>
            </div>

            {/* Get Involved Section - Made Bigger */}
            <div className="text-center md:text-right">

              {/* Contact Info */}
              <div className="mt-8 text-white/60 space-y-3">
                <p className="text-lg">📧 {footer.supportEmail || 'support@hercycle.com'}</p>
                <p className="text-lg">📞 +91 98765 43210</p>
                <p className="text-lg">📍 Colombo, Sri Lanka</p>
              </div>

              {/* Social Links */}
              <div className="flex gap-4 mt-8 justify-center md:justify-end">
                {(footer.socialLinks && footer.socialLinks.length > 0 ? footer.socialLinks : [
                  { name: 'Instagram', icon: 'IG', color: 'pink-purple', url: '#' },
                  { name: 'Twitter', icon: 'X', color: 'blue-4', url: '#' },
                  { name: 'Facebook', icon: 'FB', color: 'blue-6', url: '#' }
                ]).map((social, i) => (
                  <a
                    key={i}
                    href={social.url || '#'}
                    className="glass-card w-12 h-12 rounded-full flex items-center justify-center text-white hover:bg-pink-500/20 transition-all transform hover:-translate-y-1"
                    aria-label={social.name}
                    style={{
                      background: `linear-gradient(135deg, ${social.color.includes('purple') ? '#a855f7, #ec4899' : social.color.includes('blue-4') ? '#60a5fa, #2563eb' : '#3b82f6, #1d4ed8'})`,
                    }}
                  >
                    <span className="font-bold text-sm">{social.icon}</span>
                  </a>
                ))}
              </div>

              {/* Newsletter Signup */}
              <div className="mt-10">
                <p className="text-white/70 text-lg mb-4">Stay updated with our newsletter</p>
                <div className="flex flex-col sm:flex-row gap-2">
                  <input
                    type="email"
                    placeholder="Enter your email"
                    className="flex-1 glass-card rounded-full px-6 py-3 text-white placeholder-white/50 outline-none text-base"
                  />
                  <button className="btn-primary text-white font-semibold rounded-full px-6 py-3 text-base"
                    style={{ background: 'linear-gradient(135deg, #db2777 0%, #9333ea 100%)' }}
                  >
                    Subscribe
                  </button>
                </div>
              </div>
            </div>
          </div>
          <br />

          {/* Copyright Section - Made Bigger */}
          <div className="pt-12 border-t border-white/20 text-center">
            <div className="flex flex-col md:flex-row justify-between items-center gap-6 mb-6">
              <div className="flex items-center gap-6">
                <span className="text-white/50 text-lg">🔒 Secure Platform</span>
                <span className="text-white/50 text-lg">👩‍⚕️ Expert Verified</span>
                <span className="text-white/50 text-lg">🌍 Global Community</span>
              </div>
              <div className="flex gap-6">
                <a href="#" className="text-white/50 hover:text-white text-lg">Privacy Policy</a>
                <a href="#" className="text-white/50 hover:text-white text-lg">Terms of Service</a>
                <a href="#" className="text-white/50 hover:text-white text-lg">FAQ</a>
              </div>
            </div>
            <p className="text-white/40 text-lg">
              © 2026 HerCycle. All rights reserved. Made with ♡ for a healthier world.
            </p>
            <p className="text-white/30 text-sm mt-2">
              HerCycle is a registered trademark. All content is for informational purposes only.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;