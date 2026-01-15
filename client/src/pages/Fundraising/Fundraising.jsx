// pages/Fundraising/Fundraising.jsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useNavigate } from 'react-router-dom'

const Fundraising = () => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [donationAmount, setDonationAmount] = useState(500);
  const [selectedCampaign, setSelectedCampaign] = useState(0);
  const [showDonationModal, setShowDonationModal] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [totalSlides, setTotalSlides] = useState(0); // FIXED: Proper state declaration

  const navigate = useNavigate();

  // State for API data
  const [fundraisingData, setFundraisingData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showError, setShowError] = useState(false);

  // Default data that will be replaced by API data
  const defaultCampaigns = [
    {
      id: 1,
      title: "Sanitary Pads for Rural Schools",
      description: "Providing sustainable menstrual hygiene products to 5000+ girls in remote areas of India.",
      raised: 1250000,
      goal: 2500000,
      donors: 1245,
      daysLeft: 45,
      image: "🌸",
      category: "Education"
    },
    {
      id: 2,
      title: "Menstrual Health Workshops",
      description: "Conducting awareness workshops in 100+ communities to break taboos and provide education.",
      raised: 800000,
      goal: 1500000,
      donors: 892,
      daysLeft: 60,
      image: "📚",
      category: "Awareness"
    },
    {
      id: 3,
      title: "Sustainable Reusable Pads",
      description: "Distributing eco-friendly reusable pads to reduce waste and provide long-term solutions.",
      raised: 950000,
      goal: 1800000,
      donors: 1103,
      daysLeft: 30,
      image: "🌱",
      category: "Sustainability"
    },
    {
      id: 4,
      title: "Mobile Health Clinics",
      description: "Setting up mobile clinics to provide free menstrual health checkups in underserved areas.",
      raised: 650000,
      goal: 1200000,
      donors: 723,
      daysLeft: 90,
      image: "🏥",
      category: "Healthcare"
    }
  ];

  const defaultProgressBars = [
    { label: "Campaigns Completed", value: 42, color: "from-pink-500 to-purple-500" },
    { label: "Funds Utilized", value: 78, color: "from-green-400 to-teal-500" },
    { label: "Girls Reached", value: 65, color: "from-blue-400 to-indigo-500" },
    { label: "Communities Impacted", value: 56, color: "from-orange-400 to-red-500" },
  ];

  const defaultCarouselImages = [
    {
      id: 1,
      image: "https://images.unsplash.com/photo-1585110396000-c9ffd4e4b308?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80",
      title: "Education Empowerment",
      description: "Priya, 16, now attends school regularly thanks to sanitary pad distribution in rural Maharashtra."
    },
    {
      id: 2,
      image: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80",
      title: "Community Workshops",
      description: "Menstrual health workshops breaking taboos in Rajasthan villages."
    },
    {
      id: 3,
      image: "https://images.unsplash.com/photo-1582213782179-e0d53f98f2ca?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80",
      title: "Sustainable Solutions",
      description: "Eco-friendly reusable pads distribution in sustainable packaging."
    },
    {
      id: 4,
      image: "https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80",
      title: "Health Camp Success",
      description: "Free menstrual health checkups reaching 150+ communities."
    }
  ];

  const defaultHeroStats = [
    { number: 'Rs.4.2M+', label: 'Total Raised' },
    { number: '8.5K+', label: 'Donors' },
    { number: '42', label: 'Campaigns' },
    { number: '65K+', label: 'Lives Impacted' }
  ];

  // Initialize state with defaults
  const [campaigns, setCampaigns] = useState(defaultCampaigns);
  const [progressBars, setProgressBars] = useState(defaultProgressBars);
  const [carouselImages, setCarouselImages] = useState(defaultCarouselImages);
  const [heroStats, setHeroStats] = useState(defaultHeroStats);
  const [heroContent, setHeroContent] = useState({
    badgeText: "Making a Real Difference",
    mainHeading: "Fuel the Change in Menstrual Health",
    subheading: "Every contribution brings us closer to a world where no girl misses school, no woman lacks access to menstrual products, and menstrual health is a right, not a privilege."
  });
  const [ctaContent, setCtaContent] = useState({
    title: "Ready to Make a Difference?",
    description: "Your donation today can change a life tomorrow. Join thousands of donors who are creating lasting change in menstrual health."
  });
  const [footerContent, setFooterContent] = useState({
    description: "A HerCycle initiative dedicated to funding menstrual health projects and creating lasting impact.",
    volunteerText: "Volunteer",
    partnerText: "Partner With Us",
    copyright: "© 2026 HerFund by HerCycle. All donations are tax-deductible. 100% transparency guaranteed."
  });

  // Fetch fundraising data from API
  useEffect(() => {
    const fetchFundraisingData = async () => {
      try {
        setLoading(true);
        
        // Use the public API endpoint for fundraising
        const response = await fetch('http://localhost:5000/api/fundraising');
        
        const result = await response.json();
        
        if (result.success) {
          setFundraisingData(result.data);
          setError(null);
          setShowError(false);
          
          // Update all states with API data
          if (result.data.hero) {
            setHeroContent({
              badgeText: result.data.hero.badgeText || heroContent.badgeText,
              mainHeading: result.data.hero.mainHeading || heroContent.mainHeading,
              subheading: result.data.hero.subheading || heroContent.subheading
            });
            setHeroStats(result.data.hero.stats || heroStats);
          }
          
          if (result.data.campaigns && result.data.campaigns.length > 0) {
            // Add ids to campaigns for React keys
            const campaignsWithIds = result.data.campaigns.map((campaign, index) => ({
              ...campaign,
              id: index + 1
            }));
            setCampaigns(campaignsWithIds);
          }
          
          if (result.data.progressBars && result.data.progressBars.length > 0) {
            setProgressBars(result.data.progressBars);
          }
          
          if (result.data.carouselImages && result.data.carouselImages.length > 0) {
            // Add ids to carousel images for React keys
            const carouselWithIds = result.data.carouselImages.map((image, index) => ({
              ...image,
              id: index + 1
            }));
            setCarouselImages(carouselWithIds);
            setTotalSlides(carouselWithIds.length);
          }
          
          if (result.data.cta) {
            setCtaContent({
              title: result.data.cta.title || ctaContent.title,
              description: result.data.cta.description || ctaContent.description
            });
          }
          
          if (result.data.footer) {
            setFooterContent({
              description: result.data.footer.description || footerContent.description,
              volunteerText: result.data.footer.volunteerText || footerContent.volunteerText,
              partnerText: result.data.footer.partnerText || footerContent.partnerText,
              copyright: result.data.footer.copyright || footerContent.copyright
            });
          }
          
          console.log('Fundraising data loaded from:', result.fromDatabase ? 'DATABASE' : 'DEFAULTS');
        } else {
          throw new Error(result.message || 'Invalid response from server');
        }
      } catch (err) {
        const errorMessage = err.message;
        setError(errorMessage);
        setShowError(true);
        console.error('API Error:', errorMessage);
        
        // Use default data if API fails
        setCampaigns(defaultCampaigns);
        setProgressBars(defaultProgressBars);
        setCarouselImages(defaultCarouselImages);
        setHeroStats(defaultHeroStats);
        setTotalSlides(defaultCarouselImages.length); // Set total slides for fallback
      } finally {
        setLoading(false);
      }
    };

    fetchFundraisingData();
  }, []);

  // Add manual dismiss functionality
  const dismissError = () => {
    setShowError(false);
  };

  // Auto-dismiss error after 1 minute
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
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Auto-rotate carousel
  useEffect(() => {
    const interval = setInterval(() => {
      nextSlide();
    }, 5000); // Change slide every 5 seconds

    return () => clearInterval(interval);
  }, [currentSlide, totalSlides]); // Added totalSlides to dependency array

  const handleDonate = (campaignIndex) => {
    // Store selected campaign in session storage
    const selectedCampaign = campaigns[campaignIndex];
    sessionStorage.setItem('selectedCampaign', JSON.stringify(selectedCampaign));
    sessionStorage.setItem('selectedCampaignId', selectedCampaign.id);
    sessionStorage.setItem('donationAmount', donationAmount);
  
    // Navigate to payment gateway
    navigate('/payment', {
      state: {
        amount: donationAmount,
        campaign: selectedCampaign
      }
    });
  };

  const calculateProgress = (raised, goal) => {
    return Math.min((raised / goal) * 100, 100);
  };

  const formatCurrency = (amount) => {
    return 'Rs.' + new Intl.NumberFormat('en-IN', {
      style: 'decimal',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % totalSlides);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + totalSlides) % totalSlides);
  };

  const changeCarouselSlide = (index) => {
    setCurrentSlide(index);
  };

  // Loading state UI
  if (loading) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-gray-900 to-teal-950">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-teal-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white text-lg">Loading Fundraising Page...</p>
          <p className="text-gray-400 text-sm mt-2">Fetching data from backend...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full relative overflow-x-hidden flex flex-col items-center">
      {/* Reuse the same styles from LandingPage */}
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
          0%, 100% { box-shadow: 0 0 20px rgba(20, 184, 166, 0.3); }
          50% { box-shadow: 0 0 40px rgba(20, 184, 166, 0.6); }
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
        
        @keyframes progressBar {
          from { width: 100%; }
          to { width: 0%; }
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
          background: linear-gradient(135deg, #ffffff 0%, #7dd3fc 50%, #0d9488 100%);
          background-size: 200% 200%;
          animation: gradient-shift 3s ease infinite;
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
          background: linear-gradient(90deg, #7dd3fc, #0d9488);
          transition: all 0.3s ease;
          transform: translateX(-50%);
          border-radius: 2px;
        }
        
        .nav-link:hover::after {
          width: 100%;
        }
        
        .btn-primary {
          background: linear-gradient(135deg, #0d9488 0%, #115e59 100%);
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
          box-shadow: 0 15px 35px rgba(13, 148, 136, 0.4);
        }
        
        .section-fade {
          animation: fade-in-up 0.8s ease-out forwards;
        }
        
        .stat-card {
          background: linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.1);
        }
        
        /* Progress bar */
        .progress-bar {
          height: 8px;
          background: rgba(255, 255, 255, 0.1);
          border-radius: 4px;
          overflow: hidden;
        }
        
        .progress-fill {
          height: 100%;
          border-radius: 4px;
          transition: width 0.6s ease;
        }
        
        /* Donation Modal */
        .modal-overlay {
          background: rgba(0, 0, 0, 0.7);
          backdrop-filter: blur(10px);
        }
        
        /* Hamburger Menu */
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
        
        /* Mobile Menu */
        .mobile-menu {
          transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.3s ease;
        }
        
        .mobile-menu.closed {
          transform: translateX(100%);
          opacity: 0;
          pointer-events: none;
        }
        
        /* Scrollbar */
        ::-webkit-scrollbar {
          width: 8px;
        }
        
        ::-webkit-scrollbar-track {
          background: rgba(0, 0, 0, 0.2);
        }
        
        ::-webkit-scrollbar-thumb {
          background: linear-gradient(180deg, #0d9488, #115e59);
          border-radius: 4px;
        }
      `}</style>

      {/* Decorative Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none" style={{ zIndex: 1 }}>
        <div
          className="decorative-circle animate-float"
          style={{
            width: '600px',
            height: '600px',
            top: '-200px',
            left: '-200px',
            background: 'radial-gradient(circle, rgba(20, 184, 166, 0.3) 0%, transparent 70%)',
          }}
        />
        <div
          className="decorative-circle animate-float-delayed"
          style={{
            width: '500px',
            height: '500px',
            top: '30%',
            right: '-150px',
            background: 'radial-gradient(circle, rgba(13, 148, 136, 0.25) 0%, transparent 70%)',
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
          maxWidth: '1400px',
          margin: '0 auto',
        }}
      >
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 sm:gap-3">
          <div
            className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center animate-pulse-glow"
            style={{
              background: 'linear-gradient(135deg, #14b8a6 0%, #0d9488 100%)',
            }}
          >
            <span className="text-white text-lg sm:text-xl">🤝</span>
          </div>
          <span className="text-white font-bold text-lg sm:text-xl md:text-2xl tracking-wide">
            Her<span className="gradient-text">Fund</span>
          </span>
        </Link>

        {/* Desktop Nav Links */}
        <nav className="hidden md:flex items-center gap-6 lg:gap-8">
          <Link to="/" className="nav-link text-white text-sm font-medium uppercase tracking-wider py-2 transition-all hover:text-teal-300">
            Home
          </Link>
          <Link to="/fundraising" className="nav-link text-white text-sm font-medium uppercase tracking-wider py-2 text-teal-300">
            Fundraising
          </Link>
          <a href="#campaigns" className="nav-link text-white text-sm font-medium uppercase tracking-wider py-2 transition-all hover:text-teal-300">
            Campaigns
          </a>
          <a href="#impact" className="nav-link text-white text-sm font-medium uppercase tracking-wider py-2 transition-all hover:text-teal-300">
            Impact
          </a>
        </nav>

        {/* Desktop Donate Button */}
        <button
          onClick={handleDonate}
          className="hidden md:block btn-primary text-white text-lg font-semibold rounded-full px-10 py-5 uppercase tracking-wide button"
          style={{ background: 'linear-gradient(135deg, #14b8a6 0%, #0d9488 100%)' }}
        >
          Donate Now
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
          <Link
            to="/"
            className="text-white text-xl font-medium uppercase tracking-wider transition-all hover:text-teal-300"
            onClick={() => setMobileMenuOpen(false)}
          >
            Home
          </Link>
          <Link
            to="/fundraising"
            className="text-teal-300 text-xl font-medium uppercase tracking-wider transition-all"
            onClick={() => setMobileMenuOpen(false)}
          >
            Fundraising
          </Link>
          <a
            href="#campaigns"
            className="text-white text-xl font-medium uppercase tracking-wider transition-all hover:text-teal-300"
            onClick={() => setMobileMenuOpen(false)}
          >
            Campaigns
          </a>
          <a
            href="#impact"
            className="text-white text-xl font-medium uppercase tracking-wider transition-all hover:text-teal-300"
            onClick={() => setMobileMenuOpen(false)}
          >
            Impact
          </a>
          <button
            onClick={() => {
              setMobileMenuOpen(false);
              handleDonate();
            }}
            className="btn-primary text-white font-semibold rounded-full px-10 py-4 uppercase tracking-wide mt-4 button"
            style={{ background: 'linear-gradient(135deg, #14b8a6 0%, #0d9488 100%)' }}
          >
            Donate Now
          </button>
        </nav>
      </div>

      {/* Hero Section */}
      <section className="relative z-10 min-h-screen flex items-center justify-center px-4 sm:px-6 md:px-12 pt-24 md:pt-0 w-full">
        <div className="text-center max-w-5xl mx-auto section-fade w-full flex flex-col items-center justify-center">
          {/* Badge */}
          <div
            className="inline-flex items-center gap-2 px-5 py-2 rounded-full mb-8"
            style={{
              background: 'rgba(255, 255, 255, 0.1)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
            }}
          >
            <span className="w-2 h-2 rounded-full bg-teal-400 animate-pulse"></span>
            <span className="text-white/80 text-sm font-medium">{heroContent.badgeText}</span>
          </div>

          {/* Main Heading */}
          <h1 className="text-3xl sm:text-4xl md:text-6xl lg:text-7xl font-bold text-white mb-6 leading-tight w-full text-center">
            {heroContent.mainHeading.split('Change')[0]}
            <span className="gradient-text">Change</span>
            {heroContent.mainHeading.split('Change')[1]}
          </h1>

          {/* Subheading */}
          <div className="w-full flex justify-center mb-10">
            <p className="text-white/70 text-base sm:text-lg md:text-xl max-w-3xl leading-relaxed text-center">
              {heroContent.subheading}
            </p>
          </div>

          {/* Stats */}
          <div className="flex flex-wrap justify-center gap-6 sm:gap-8 md:gap-12 mt-12 sm:mt-16 w-full">
            {heroStats.map((stat, index) => (
              <div key={index} className="text-center min-w-25">
                <div className="text-2xl sm:text-3xl md:text-4xl font-bold gradient-text mb-1">{stat.number}</div>
                <div className="text-white/60 text-xs sm:text-sm uppercase tracking-wider">{stat.label}</div>
              </div>
            ))}
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 mt-12 justify-center">
            <button
              onClick={() => handleDonate(0)} // Default to first campaign
              className="btn-primary text-white font-semibold rounded-full px-8 sm:px-10 py-4 text-lg donatebutton"
              style={{ background: 'linear-gradient(135deg, #14b8a6 0%, #0d9488 100%)' }}
            >
              Donate Now
            </button>
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-10 left-1/2 transform -translate-x-1/2 flex flex-col items-center gap-2">
          <span className="text-white/50 text-xs uppercase tracking-widest">Explore Campaigns</span>
          <div className="w-6 h-10 rounded-full border-2 border-white/30 flex justify-center pt-2">
            <div className="w-1.5 h-3 bg-white/50 rounded-full animate-bounce"></div>
          </div>
        </div>
      </section>

      {/* Active Campaigns Section */}
      <section id="campaigns" className="relative z-10 py-16 sm:py-20 md:py-24 px-4 sm:px-6 md:px-12 lg:px-24 w-full justify-items-center">
        <div className="max-w-7xl mx-auto w-full flex flex-col items-center">
          {/* Section Header */}
          <div className="text-center mb-12 sm:mb-16 w-full">
            <span className="text-teal-400 font-semibold uppercase tracking-widest text-xs sm:text-sm mb-3 sm:mb-4 block">
              Active Campaigns
            </span>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-4 sm:mb-6">
              Where Your <span className="gradient-text">Donation</span> Goes
            </h2>
            <p className="text-white/60 text-base sm:text-lg max-w-2xl mx-auto justify-self-center">
              Choose a campaign to support and see the direct impact of your contribution
            </p>
          </div>
          <br/>

          {/* Campaigns Grid - Centered */}
          <div className="grid md:grid-cols-2 gap-6 sm:gap-8 w-full justify-items-center">
            {campaigns.map((campaign, index) => (
              <div
                key={campaign.id}
                className={`glass-card rounded-2xl sm:rounded-3xl p-6 sm:p-8 cursor-pointer w-full max-w-lg ${selectedCampaign === index ? 'ring-2 ring-teal-400' : ''}`}
                onClick={() => setSelectedCampaign(index)}
              >
                <div className="flex flex-col items-center gap-4 mb-4">
                  <div className="flex justify-center">
                    <span className="text-4xl sm:text-5xl">{campaign.image}</span>
                  </div>
                  <div className="flex-1 w-full just">
                    <div className="flex flex-col items-center mb-2 gap-2">
                      <h3 className="text-white font-bold text-xl sm:text-2xl text-center">{campaign.title}</h3>
                      <span className="px-3 py-1 rounded-full text-xs font-medium glass-card text-center">
                        {campaign.category}
                      </span>
                    </div>
                    <p className="text-white/60 text-sm sm:text-base mb-4 text-center">{campaign.description}</p>
                    
                    {/* Progress Bar */}
                    <div className="mb-4">
                      <div className="flex justify-between text-sm mb-2">
                        <span className="text-white/80">Raised: {formatCurrency(campaign.raised)}</span>
                        <span className="text-white/60">Goal: {formatCurrency(campaign.goal)}</span>
                      </div>
                      <div className="progress-bar">
                        <div 
                          className="progress-fill bg-gradient-to-r from-teal-400 to-teal-600"
                          style={{ width: `${calculateProgress(campaign.raised, campaign.goal)}%` }}
                        />
                      </div>
                    </div>

                    {/* Campaign Stats */}
                    <div className="flex justify-between text-sm">
                      <div className="text-center flex-1">
                        <div className="text-white font-bold">{campaign.donors}</div>
                        <div className="text-white/60 text-xs">Donors</div>
                      </div>
                      <div className="text-center flex-1">
                        <div className="text-white font-bold">{campaign.daysLeft}</div>
                        <div className="text-white/60 text-xs">Days Left</div>
                      </div>
                      <div className="text-center flex-1">
                        <div className="text-white font-bold">
                          {Math.round((campaign.raised / campaign.goal) * 100)}%
                        </div>
                        <div className="text-white/60 text-xs">Funded</div>
                      </div>
                    </div>

                    {/* Donate Now Button for this campaign */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedCampaign(index);
                        handleDonate(index); // Pass campaign index
                      }}
                      className="btn-primary text-white font-semibold rounded-full w-full py-3 px-2 text-lg mt-4 mb-5 donatebutton"
                      style={{ background: 'linear-gradient(135deg, #14b8a6 0%, #0d9488 100%)' }}
                    >
                      Donate Now
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
      <br/>
      <br/>
      <br/>

      {/* Impact Section */}
      <section id="impact" className="relative z-10 py-16 sm:py-20 md:py-24 px-4 sm:px-6 md:px-12 lg:px-24 w-full justify-items-center">
        <div className="max-w-7xl mx-auto w-full flex flex-col items-center">
          {/* Section Header */}
          <div className="text-center mb-12 sm:mb-16 w-full">
            <span className="text-teal-400 font-semibold uppercase tracking-widest text-xs sm:text-sm mb-3 sm:mb-4 block">
              Our Impact
            </span>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-4 sm:mb-6">
              Real <span className="gradient-text">Stories</span>
            </h2>
            <p className="text-white/60 text-base sm:text-lg max-w-2xl mx-auto justify-self-center">
              See the faces and stories behind the numbers. Every donation creates a real impact.
            </p>
          </div>
          <br/>

          {/* Image Carousel */}
          <div className="glass-card rounded-2xl sm:rounded-3xl p-6 sm:p-8 md:p-12 w-full max-w-4xl" style={{
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.7), 0 0 0 1px rgba(255, 255, 255, 0.15)'
          }}>
            <div className="relative overflow-hidden rounded-xl">
              {/* Carousel Images */}
              <div className="relative h-64 sm:h-80 md:h-96">
                {carouselImages.map((story, index) => (
                  <div
                    key={story.id}
                    className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
                      index === currentSlide ? 'opacity-100' : 'opacity-0 pointer-events-none'
                    }`}
                    id={`carousel-item-${index}`}
                    style={{
                      boxShadow: `
                        0 0 30px rgba(0, 0, 0, 0.5),
                        inset 0 0 15px rgba(0, 0, 0, 0.3)
                      `
                    }}
                  >
                    <div className="relative h-full w-full">
                      <div 
                        className="absolute inset-0 bg-cover bg-center"
                        style={{ 
                          backgroundImage: `url(${story.image})`,
                          filter: 'drop-shadow(0 0 15px rgba(0, 0, 0, 0.5))'
                        }}
                      >
                        {/* Reduced gradient overlay */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent"></div>
                      </div>
                      <div className="absolute bottom-2 left-3 right-0 p-6 sm:p-8 text-white" style={{
                        textShadow: '0 2px 8px rgba(0, 0, 0, 0.7), 0 1px 3px rgba(0, 0, 0, 0.6)',
                        background: 'linear-gradient(to top, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0.3) 50%, transparent 100%)'
                      }}>
                        <h3 className="text-xl sm:text-2xl font-bold mb-2">{story.title}</h3>
                        <p className="text-white/90 text-sm sm:text-base">{story.description}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Carousel Controls */}
              <div className="absolute bottom-4 right-4 flex gap-2">
                {carouselImages.map((_, index) => (
                  <button
                    key={index}
                    className={`w-2 h-2 rounded-full transition-all duration-300 ${
                      index === currentSlide ? 'bg-teal-400 w-8' : 'bg-white/50'
                    }`}
                    onClick={() => changeCarouselSlide(index)}
                    aria-label={`Go to slide ${index + 1}`}
                    style={{
                      boxShadow: '0 2px 10px rgba(0, 0, 0, 0.6), 0 0 0 1px rgba(255, 255, 255, 0.15)'
                    }}
                  />
                ))}
              </div>

              {/* Navigation Arrows */}
              <button
                className="absolute left-4 top-1/2 transform -translate-y-1/2 glass-card w-10 h-10 rounded-full flex items-center justify-center text-white hover:bg-white/20 transition-all"
                onClick={prevSlide}
                aria-label="Previous slide"
                style={{
                  boxShadow: '0 4px 15px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(255, 255, 255, 0.15), 0 0 15px rgba(20, 184, 166, 0.2)'
                }}
              >
                ←
              </button>
              <button
                className="absolute right-4 top-1/2 transform -translate-y-1/2 glass-card w-10 h-10 rounded-full flex items-center justify-center text-white hover:bg-white/20 transition-all"
                onClick={nextSlide}
                aria-label="Next slide"
                style={{
                  boxShadow: '0 4px 15px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(255, 255, 255, 0.15), 0 0 15px rgba(20, 184, 166, 0.2)'
                }}
              >
                →
              </button>
            </div>
          </div>
        </div>
      </section>
      <br/>
      <br/>
      <br/>

      {/* CTA Section */}
      <section className="relative z-10 py-16 sm:py-20 md:py-24 px-4 sm:px-6 md:px-12 lg:px-24 w-full justify-items-center">
        <div className="max-w-4xl mx-auto text-center w-full">
          <div
            className="glass-card rounded-2xl sm:rounded-3xl p-8 sm:p-12 md:p-16"
            style={{
              background: 'linear-gradient(135deg, rgba(20, 184, 166, 0.15) 0%, rgba(13, 148, 136, 0.1) 100%)',
            }}
          >
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-6">
              {ctaContent.title}
            </h2>
            <p className="text-white/70 text-lg mb-8 max-w-2xl mx-auto justify-self-center">
              {ctaContent.description}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={handleDonate}
                className="btn-primary text-white font-semibold rounded-full px-8 sm:px-10 py-4 text-lg donatebutton"
                style={{ background: 'linear-gradient(135deg, #14b8a6 0%, #0d9488 100%)' }}
              >
                Donate Now
              </button>
            </div>
          </div>
        </div>
      </section>
      <br/>
      <br/>
      <br/>

      {/* Footer - Made Bigger */}
      <footer className="relative z-10 py-20 sm:py-24 md:py-28 px-4 sm:px-6 md:px-12 lg:px-24 mt-20 sm:mt-24 md:mt-28 w-full justify-items-center" 
        style={{ 
          background: 'linear-gradient(180deg, transparent 0%, rgba(15, 10, 25, 0.8) 100%)', 
          boxShadow: '0 -20px 60px rgba(0, 0, 0, 0.2)'
        }}>
        <div className="max-w-7xl mx-auto w-full">
          <br/>
          {/* Main Footer Content - Expanded */}
          <div className="grid md:grid-cols-3 gap-12 mb-16">
            {/* Logo and Description Section - Made Bigger */}
            <div className="text-center md:text-left">
              <div className="flex flex-col items-center md:items-start gap-6 mb-8">
                <div className="flex items-center gap-4">
                  <div
                    className="w-16 h-16 rounded-2xl flex items-center justify-center animate-pulse-glow"
                    style={{ 
                      background: 'linear-gradient(135deg, #14b8a6 0%, #0d9488 100%)',
                      boxShadow: '0 0 30px rgba(20, 184, 166, 0.4)'
                    }}
                  >
                    <span className="text-white text-2xl">🤝</span>
                  </div>
                  <span className="text-white font-bold text-3xl">
                    Her<span className="gradient-text">Fund</span>
                  </span>
                </div>
                <p className="text-white/70 text-lg leading-relaxed max-w-md">
                  {footerContent.description}
                </p>
              </div>
              
            </div>
            
            {/* Quick Links Section */}
            <div className="text-center">
              <h4 className="text-white font-bold text-2xl mb-8">Quick Links</h4>
              <ul className="space-y-4">
                <li>
                  <Link to="/" className="text-white/70 hover:text-teal-300 text-lg transition-all">
                    Home
                  </Link>
                </li>
                <li>
                  <Link to="/fundraising" className="text-white/70 hover:text-teal-300 text-lg transition-all">
                    Fundraising
                  </Link>
                </li>
                <li>
                  <a href="#campaigns" className="text-white/70 hover:text-teal-300 text-lg transition-all">
                    Campaigns
                  </a>
                </li>
                <li>
                  <a href="#impact" className="text-white/70 hover:text-teal-300 text-lg transition-all">
                    Our Impact
                  </a>
                </li>
                <li>
                  <a href="#" className="text-white/70 hover:text-teal-300 text-lg transition-all">
                    About Us
                  </a>
                </li>
              </ul>
            </div>
            
            {/* Get Involved Section - Made Bigger */}
            <div className="text-center md:text-right">
              <h4 className="text-white font-bold text-2xl mb-8">Get Involved</h4>
              <br/>
              
              {/* Contact Info */}
              <div className="mt-10 text-white/60 space-y-3">
                <p className="text-lg">📧 contact@herfund.org</p>
                <p className="text-lg">📞 +91 98765 43210</p>
                <p className="text-lg">📍 Colombo, Sri Lanka</p>
              </div>

              {/* Social Links */}
              <div className="flex gap-4 justify-center md:justify-end">
                <button className="glass-card w-12 h-12 rounded-full flex items-center justify-center text-white hover:bg-teal-500/20 transition-all">
                  <span className="text-xl">📘</span>
                </button>
                <button className="glass-card w-12 h-12 rounded-full flex items-center justify-center text-white hover:bg-teal-500/20 transition-all">
                  <span className="text-xl">🐦</span>
                </button>
                <button className="glass-card w-12 h-12 rounded-full flex items-center justify-center text-white hover:bg-teal-500/20 transition-all">
                  <span className="text-xl">📷</span>
                </button>
                <button className="glass-card w-12 h-12 rounded-full flex items-center justify-center text-white hover:bg-teal-500/20 transition-all">
                  <span className="text-xl">📹</span>
                </button>
              </div>
              <br/>

            </div>
          </div>
          
          {/* Newsletter Subscription */}
          
          
          {/* Copyright Section - Made Bigger */}
          <div className="pt-12 border-t border-white/20 text-center">
            <div className="flex flex-col md:flex-row justify-between items-center gap-6 mb-6">
              <div className="flex items-center gap-6">
                <span className="text-white/50 text-lg">🔒 Secure Payments</span>
                <span className="text-white/50 text-lg">📊 100% Transparency</span>
                <span className="text-white/50 text-lg">💰 Tax Deductible</span>
              </div>
              <div className="flex gap-6">
                <a href="#" className="text-white/50 hover:text-white text-lg">Privacy Policy</a>
                <a href="#" className="text-white/50 hover:text-white text-lg">Terms of Service</a>
                <a href="#" className="text-white/50 hover:text-white text-lg">FAQ</a>
              </div>
            </div>
            <p className="text-white/40 text-lg">
              {footerContent.copyright}
            </p>
          </div>
        </div>
      </footer>

      {/* Donation Modal */}
      {showDonationModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 modal-overlay">
          <div className="glass-card rounded-2xl sm:rounded-3xl p-6 sm:p-8 max-w-md w-full mx-auto">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-white font-bold text-2xl">Complete Your Donation</h3>
              <button
                onClick={() => setShowDonationModal(false)}
                className="text-white/60 hover:text-white text-2xl"
              >
                ×
              </button>
            </div>
            
            <div className="mb-6">
              <div className="text-center mb-4">
                <div className="text-3xl font-bold gradient-text mb-2">
                  {formatCurrency(donationAmount)}
                </div>
                <p className="text-white/60 text-sm">to {campaigns[selectedCampaign]?.title}</p>
              </div>
              
              <div className="space-y-4">
                <input
                  type="text"
                  placeholder="Full Name"
                  className="w-full glass-card rounded-xl px-4 py-3 text-white placeholder-white/50 outline-none"
                />
                <input
                  type="email"
                  placeholder="Email Address"
                  className="w-full glass-card rounded-xl px-4 py-3 text-white placeholder-white/50 outline-none"
                />
                <div className="grid grid-cols-2 gap-3">
                  <input
                    type="tel"
                    placeholder="Phone Number"
                    className="glass-card rounded-xl px-4 py-3 text-white placeholder-white/50 outline-none"
                  />
                  <select className="glass-card rounded-xl px-4 py-3 text-white outline-none">
                    <option>Payment Method</option>
                    <option>Credit/Debit Card</option>
                    <option>UPI</option>
                    <option>Net Banking</option>
                  </select>
                </div>
              </div>
            </div>
            
            <div className="flex gap-3">
              <button
                onClick={() => setShowDonationModal(false)}
                className="flex-1 glass-card text-white font-semibold rounded-full py-3"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  alert(`Thank you for your donation of ${formatCurrency(donationAmount)}!`);
                  setShowDonationModal(false);
                }}
                className="flex-1 btn-primary text-white font-semibold rounded-full py-3"
                style={{ background: 'linear-gradient(135deg, #14b8a6 0%, #0d9488 100%)' }}
              >
                Donate Now
              </button>
            </div>
            
            <p className="text-white/40 text-xs text-center mt-4">
              Secure payment powered by Razorpay. Your data is protected.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default Fundraising;