// AdminPanel.jsx
import React, { useState, useEffect } from 'react';

const AdminPanel = () => {
  const [landingPageData, setLandingPageData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  // Form state - start with empty structure
  const [formData, setFormData] = useState({
    hero: {
      badgeText: '',
      mainHeading: '',
      subheading: ''
    },
    about: {
      title: '',
      description1: '',
      description2: ''
    },
    mission: {
      title: '',
      description: ''
    },
    contact: {
      title: '',
      description: ''
    },
    footer: {
      tagline: '',
      supportEmail: '',
      socialLinks: []
    },
    features: [],
    stats: []
  });

  // Fetch current landing page data
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await fetch('http://localhost:5000/api/landing-page/admin');
        
        if (response.ok) {
          const result = await response.json();
          console.log('Fetched data from server:', result);
          
          if (result.success && result.data) {
            const serverData = result.data;
            
            // Set the form data directly from server (no mixing with defaults)
            setFormData({
              hero: serverData.hero || { badgeText: '', mainHeading: '', subheading: '' },
              about: serverData.about || { title: '', description1: '', description2: '' },
              mission: serverData.mission || { title: '', description: '' },
              contact: serverData.contact || { title: '', description: '' },
              footer: serverData.footer || { tagline: '', supportEmail: '', socialLinks: [] },
              features: serverData.features || [],
              stats: serverData.stats || []
            });
            
            setLandingPageData(serverData);
            setMessage({ type: 'success', text: 'Data loaded successfully!' });
          }
        } else {
          setMessage({ type: 'error', text: 'Failed to load data from server. Status: ' + response.status });
        }
      } catch (error) {
        console.error('Error fetching data:', error);
        setMessage({ type: 'error', text: 'Failed to connect to server. Make sure backend is running on port 5000.' });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Handle form input changes - SIMPLIFIED VERSION
  const handleInputChange = (section, field, value) => {
    setFormData(prev => {
      if (section === 'hero' || section === 'about' || section === 'mission' || section === 'contact') {
        return {
          ...prev,
          [section]: {
            ...prev[section],
            [field]: value
          }
        };
      } else if (section === 'footer') {
        return {
          ...prev,
          footer: {
            ...prev.footer,
            [field]: value
          }
        };
      }
      return prev;
    });
  };

  // Handle feature changes
  const handleFeatureChange = (index, field, value) => {
    setFormData(prev => {
      const newFeatures = [...prev.features];
      if (!newFeatures[index]) {
        newFeatures[index] = { icon: '', title: '', description: '' };
      }
      newFeatures[index] = {
        ...newFeatures[index],
        [field]: value
      };
      return {
        ...prev,
        features: newFeatures
      };
    });
  };

  // Handle stat changes
  const handleStatChange = (index, field, value) => {
    setFormData(prev => {
      const newStats = [...prev.stats];
      if (!newStats[index]) {
        newStats[index] = { number: '', label: '' };
      }
      newStats[index] = {
        ...newStats[index],
        [field]: value
      };
      return {
        ...prev,
        stats: newStats
      };
    });
  };

  // Handle social link changes
  const handleSocialLinkChange = (index, field, value) => {
    setFormData(prev => {
      const newSocialLinks = [...(prev.footer.socialLinks || [])];
      if (!newSocialLinks[index]) {
        newSocialLinks[index] = { name: '', icon: '', color: '', url: '' };
      }
      newSocialLinks[index] = {
        ...newSocialLinks[index],
        [field]: value
      };
      return {
        ...prev,
        footer: {
          ...prev.footer,
          socialLinks: newSocialLinks
        }
      };
    });
  };

  // Save changes
  const handleSave = async () => {
    try {
      setSaving(true);
      setMessage({ type: '', text: '' });

      console.log('Sending data to server:', formData);

      const response = await fetch('http://localhost:5000/api/landing-page/admin', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData)
      });

      const result = await response.json();
      console.log('Server response:', result);

      if (result.success) {
        setMessage({ type: 'success', text: 'Landing page updated successfully!' });
        setLandingPageData(formData);
      } else {
        setMessage({ type: 'error', text: result.message || 'Failed to update' });
      }
    } catch (error) {
      console.error('Error saving data:', error);
      setMessage({ type: 'error', text: 'Failed to save changes. Please check console.' });
    } finally {
      setSaving(false);
    }
  };

  // Reset form to original data
  const handleReset = () => {
    if (landingPageData) {
      setFormData(landingPageData);
      setMessage({ type: 'info', text: 'Form reset to last saved data' });
    }
  };

  // Add a new feature
  const addFeature = () => {
    setFormData(prev => ({
      ...prev,
      features: [...prev.features, { icon: '✨', title: '', description: '' }]
    }));
  };

  // Remove a feature
  const removeFeature = (index) => {
    if (formData.features.length > 1) {
      setFormData(prev => ({
        ...prev,
        features: prev.features.filter((_, i) => i !== index)
      }));
    }
  };

  // Add a new stat
  const addStat = () => {
    setFormData(prev => ({
      ...prev,
      stats: [...prev.stats, { number: '', label: '' }]
    }));
  };

  // Remove a stat
  const removeStat = (index) => {
    if (formData.stats.length > 1) {
      setFormData(prev => ({
        ...prev,
        stats: prev.stats.filter((_, i) => i !== index)
      }));
    }
  };

  // Add a social link
  const addSocialLink = () => {
    setFormData(prev => ({
      ...prev,
      footer: {
        ...prev.footer,
        socialLinks: [...(prev.footer.socialLinks || []), { name: '', icon: '', color: '', url: '' }]
      }
    }));
  };

  // Remove a social link
  const removeSocialLink = (index) => {
    setFormData(prev => ({
      ...prev,
      footer: {
        ...prev.footer,
        socialLinks: (prev.footer.socialLinks || []).filter((_, i) => i !== index)
      }
    }));
  };

  // Predefined icons for features
  const availableIcons = ['🌸', '💜', '🤝', '✨', '📱', '💬', '🔒', '📊', '❤️', '🌟', '🎯', '💡'];

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-pink-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white text-lg">Loading admin panel...</p>
          <p className="text-gray-400 text-sm mt-2">Make sure backend server is running on port 5000</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white p-4 md:p-8">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800&display=swap');
        * { font-family: 'Outfit', sans-serif; }
        
        .glass-card {
          background: rgba(255, 255, 255, 0.05);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.1);
        }
        
        .btn-primary {
          background: linear-gradient(135deg, #db2777 0%, #9333ea 100%);
          transition: all 0.3s ease;
        }
        
        .btn-primary:hover {
          transform: translateY(-2px);
          box-shadow: 0 10px 20px rgba(219, 39, 119, 0.3);
        }
        
        .btn-secondary {
          background: rgba(255, 255, 255, 0.1);
          transition: all 0.3s ease;
        }
        
        .btn-secondary:hover {
          background: rgba(255, 255, 255, 0.2);
        }
        
        input, textarea, select {
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
          color: white;
        }
        
        input:focus, textarea:focus, select:focus {
          outline: none;
          border-color: #db2777;
          box-shadow: 0 0 0 2px rgba(219, 39, 119, 0.2);
        }
        
        ::placeholder {
          color: rgba(255, 255, 255, 0.5);
        }
      `}</style>

      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <header className="mb-8 md:mb-12">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold">
                Her<span className="bg-gradient-to-r from-pink-500 to-purple-500 bg-clip-text text-transparent">Cycle</span> Admin Panel
              </h1>
              <p className="text-gray-400 mt-2">Edit your landing page content in real-time</p>
              <div className="flex items-center gap-2 mt-2 text-sm text-gray-400">
                <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                <span>Backend: http://localhost:5000</span>
              </div>
            </div>
            <div className="flex gap-3">
              <button
                onClick={handleReset}
                className="btn-secondary px-6 py-3 rounded-lg font-medium"
                disabled={saving}
              >
                Reset
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="btn-primary px-8 py-3 rounded-lg font-medium flex items-center gap-2"
              >
                {saving ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Saving...
                  </>
                ) : 'Save Changes'}
              </button>
            </div>
          </div>

          {/* Message */}
          {message.text && (
            <div className={`mt-4 p-4 rounded-lg ${message.type === 'success' ? 'bg-green-900/30 border border-green-500' : message.type === 'error' ? 'bg-red-900/30 border border-red-500' : 'bg-blue-900/30 border border-blue-500'}`}>
              <div className="flex items-center gap-2">
                {message.type === 'success' && '✅ '}
                {message.type === 'error' && '❌ '}
                {message.type === 'info' && 'ℹ️ '}
                {message.text}
              </div>
            </div>
          )}
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Hero & About */}
          <div className="lg:col-span-2 space-y-8">
            {/* Hero Section */}
            <div className="glass-card rounded-2xl p-6">
              <h2 className="text-xl font-bold mb-6 pb-3 border-b border-gray-700 flex items-center gap-2">
                <span className="w-2 h-2 bg-pink-500 rounded-full"></span>
                Hero Section
              </h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Badge Text</label>
                  <input
                    type="text"
                    value={formData.hero.badgeText || ''}
                    onChange={(e) => handleInputChange('hero', 'badgeText', e.target.value)}
                    className="w-full p-3 rounded-lg"
                    placeholder="e.g., Empowering Women Worldwide"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2">Main Heading</label>
                  <input
                    type="text"
                    value={formData.hero.mainHeading || ''}
                    onChange={(e) => handleInputChange('hero', 'mainHeading', e.target.value)}
                    className="w-full p-3 rounded-lg"
                    placeholder="e.g., Your Circle of Strength & Support"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2">Subheading</label>
                  <textarea
                    value={formData.hero.subheading || ''}
                    onChange={(e) => handleInputChange('hero', 'subheading', e.target.value)}
                    className="w-full p-3 rounded-lg h-32"
                    placeholder="Join a compassionate community where menstrual health is understood, tracked, and supported..."
                  />
                </div>
              </div>
            </div>

            {/* About Section */}
            <div className="glass-card rounded-2xl p-6">
              <h2 className="text-xl font-bold mb-6 pb-3 border-b border-gray-700 flex items-center gap-2">
                <span className="w-2 h-2 bg-purple-500 rounded-full"></span>
                About Section
              </h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Title</label>
                  <input
                    type="text"
                    value={formData.about.title || ''}
                    onChange={(e) => handleInputChange('about', 'title', e.target.value)}
                    className="w-full p-3 rounded-lg"
                    placeholder="e.g., More Than Just Period Tracking"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2">Description Part 1</label>
                  <textarea
                    value={formData.about.description1 || ''}
                    onChange={(e) => handleInputChange('about', 'description1', e.target.value)}
                    className="w-full p-3 rounded-lg h-32"
                    placeholder="HerCycle is a safe, inclusive digital community..."
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2">Description Part 2</label>
                  <textarea
                    value={formData.about.description2 || ''}
                    onChange={(e) => handleInputChange('about', 'description2', e.target.value)}
                    className="w-full p-3 rounded-lg h-32"
                    placeholder="Our platform combines intuitive cycle tracking..."
                  />
                </div>
              </div>
            </div>

            {/* Mission Section */}
            <div className="glass-card rounded-2xl p-6">
              <h2 className="text-xl font-bold mb-6 pb-3 border-b border-gray-700 flex items-center gap-2">
                <span className="w-2 h-2 bg-teal-500 rounded-full"></span>
                Mission Section
              </h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Title</label>
                  <input
                    type="text"
                    value={formData.mission.title || ''}
                    onChange={(e) => handleInputChange('mission', 'title', e.target.value)}
                    className="w-full p-3 rounded-lg"
                    placeholder="e.g., Breaking Barriers, Building Bridges"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2">Description</label>
                  <textarea
                    value={formData.mission.description || ''}
                    onChange={(e) => handleInputChange('mission', 'description', e.target.value)}
                    className="w-full p-3 rounded-lg h-40"
                    placeholder="To create an inclusive, educated, and supportive ecosystem..."
                  />
                </div>
              </div>
            </div>

            {/* Contact Section */}
            <div className="glass-card rounded-2xl p-6">
              <h2 className="text-xl font-bold mb-6 pb-3 border-b border-gray-700 flex items-center gap-2">
                <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                Contact Section
              </h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Title</label>
                  <input
                    type="text"
                    value={formData.contact.title || ''}
                    onChange={(e) => handleInputChange('contact', 'title', e.target.value)}
                    className="w-full p-3 rounded-lg"
                    placeholder="e.g., Ready to Join Us?"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2">Description</label>
                  <textarea
                    value={formData.contact.description || ''}
                    onChange={(e) => handleInputChange('contact', 'description', e.target.value)}
                    className="w-full p-3 rounded-lg h-32"
                    placeholder="Start your journey with HerCycle today..."
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Features, Stats, Footer */}
          <div className="space-y-8">
            {/* Features Section */}
            <div className="glass-card rounded-2xl p-6">
              <div className="flex justify-between items-center mb-6 pb-3 border-b border-gray-700">
                <h2 className="text-xl font-bold flex items-center gap-2">
                  <span className="w-2 h-2 bg-yellow-500 rounded-full"></span>
                  Features
                </h2>
                <button
                  onClick={addFeature}
                  className="text-sm bg-green-600 hover:bg-green-700 px-3 py-1 rounded"
                >
                  + Add
                </button>
              </div>
              
              <div className="space-y-6">
                {formData.features.map((feature, index) => (
                  <div key={index} className="p-4 rounded-lg bg-gray-800/50">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <label className="block text-sm font-medium mb-2">Icon</label>
                        <div className="flex gap-2 mb-3">
                          <select
                            value={feature.icon || '🌸'}
                            onChange={(e) => handleFeatureChange(index, 'icon', e.target.value)}
                            className="p-2 rounded-lg"
                          >
                            {availableIcons.map((icon, i) => (
                              <option key={i} value={icon}>{icon}</option>
                            ))}
                          </select>
                          <span className="text-2xl p-2 bg-gray-900 rounded-lg flex items-center justify-center w-12">
                            {feature.icon || '🌸'}
                          </span>
                        </div>
                      </div>
                      {formData.features.length > 1 && (
                        <button
                          onClick={() => removeFeature(index)}
                          className="text-red-400 hover:text-red-300 text-sm"
                        >
                          Remove
                        </button>
                      )}
                    </div>
                    
                    <div className="mb-3">
                      <label className="block text-sm font-medium mb-2">Title</label>
                      <input
                        type="text"
                        value={feature.title || ''}
                        onChange={(e) => handleFeatureChange(index, 'title', e.target.value)}
                        className="w-full p-2 rounded-lg"
                        placeholder="Feature title"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium mb-2">Description</label>
                      <textarea
                        value={feature.description || ''}
                        onChange={(e) => handleFeatureChange(index, 'description', e.target.value)}
                        className="w-full p-2 rounded-lg h-20"
                        placeholder="Feature description"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Stats Section */}
            <div className="glass-card rounded-2xl p-6">
              <div className="flex justify-between items-center mb-6 pb-3 border-b border-gray-700">
                <h2 className="text-xl font-bold flex items-center gap-2">
                  <span className="w-2 h-2 bg-pink-400 rounded-full"></span>
                  Statistics
                </h2>
                <button
                  onClick={addStat}
                  className="text-sm bg-green-600 hover:bg-green-700 px-3 py-1 rounded"
                >
                  + Add
                </button>
              </div>
              
              <div className="space-y-4">
                {formData.stats.map((stat, index) => (
                  <div key={index} className="p-4 rounded-lg bg-gray-800/50">
                    <div className="flex justify-between items-center mb-3">
                      <span className="text-sm font-medium">Stat #{index + 1}</span>
                      {formData.stats.length > 1 && (
                        <button
                          onClick={() => removeStat(index)}
                          className="text-red-400 hover:text-red-300 text-sm"
                        >
                          Remove
                        </button>
                      )}
                    </div>
                    
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-medium mb-1">Number</label>
                        <input
                          type="text"
                          value={stat.number || ''}
                          onChange={(e) => handleStatChange(index, 'number', e.target.value)}
                          className="w-full p-2 rounded-lg"
                          placeholder="e.g., 50K+"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-xs font-medium mb-1">Label</label>
                        <input
                          type="text"
                          value={stat.label || ''}
                          onChange={(e) => handleStatChange(index, 'label', e.target.value)}
                          className="w-full p-2 rounded-lg"
                          placeholder="e.g., Active Users"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Footer Section */}
            <div className="glass-card rounded-2xl p-6">
              <div className="flex justify-between items-center mb-6 pb-3 border-b border-gray-700">
                <h2 className="text-xl font-bold flex items-center gap-2">
                  <span className="w-2 h-2 bg-indigo-500 rounded-full"></span>
                  Footer
                </h2>
                <button
                  onClick={addSocialLink}
                  className="text-sm bg-green-600 hover:bg-green-700 px-3 py-1 rounded"
                >
                  + Add Social
                </button>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Tagline</label>
                  <textarea
                    value={formData.footer.tagline || ''}
                    onChange={(e) => handleInputChange('footer', 'tagline', e.target.value)}
                    className="w-full p-3 rounded-lg h-20"
                    placeholder="Empowering women worldwide with comprehensive menstrual health support..."
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2">Support Email</label>
                  <input
                    type="email"
                    value={formData.footer.supportEmail || ''}
                    onChange={(e) => handleInputChange('footer', 'supportEmail', e.target.value)}
                    className="w-full p-3 rounded-lg"
                    placeholder="support@hercycle.com"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2">Social Links</label>
                  <div className="space-y-3">
                    {(formData.footer.socialLinks || []).map((social, index) => (
                      <div key={index} className="p-3 rounded-lg bg-gray-800/50">
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-xs font-medium">Social Link #{index + 1}</span>
                          <button
                            onClick={() => removeSocialLink(index)}
                            className="text-red-400 hover:text-red-300 text-xs"
                          >
                            Remove
                          </button>
                        </div>
                        <div className="grid grid-cols-2 gap-3 mb-2">
                          <div>
                            <label className="block text-xs font-medium mb-1">Platform</label>
                            <input
                              type="text"
                              value={social.name || ''}
                              onChange={(e) => handleSocialLinkChange(index, 'name', e.target.value)}
                              className="w-full p-2 rounded-lg"
                              placeholder="e.g., Instagram"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-medium mb-1">Icon</label>
                            <input
                              type="text"
                              value={social.icon || ''}
                              onChange={(e) => handleSocialLinkChange(index, 'icon', e.target.value)}
                              className="w-full p-2 rounded-lg"
                              placeholder="e.g., I"
                            />
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="block text-xs font-medium mb-1">Color Class</label>
                            <input
                              type="text"
                              value={social.color || ''}
                              onChange={(e) => handleSocialLinkChange(index, 'color', e.target.value)}
                              className="w-full p-2 rounded-lg"
                              placeholder="from-purple-500 to-pink-500"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-medium mb-1">URL</label>
                            <input
                              type="text"
                              value={social.url || ''}
                              onChange={(e) => handleSocialLinkChange(index, 'url', e.target.value)}
                              className="w-full p-2 rounded-lg"
                              placeholder="https://..."
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Preview Button */}
        <div className="mt-8 pt-6 border-t border-gray-700">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <p className="text-gray-400 text-sm">
                <span className="font-medium">API Status:</span>{' '}
                <a 
                  href="http://localhost:5000/api/landing-page/admin" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-blue-400 hover:text-blue-300"
                >
                  http://localhost:5000/api/landing-page/admin
                </a>
              </p>
              <p className="text-gray-400 text-sm mt-1">
                <span className="font-medium">Seed Database:</span>{' '}
                <a 
                  href="http://localhost:5000/api/seed" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-green-400 hover:text-green-300"
                >
                  http://localhost:5000/api/seed
                </a>
              </p>
            </div>
            <div className="flex gap-3">
              <a
                href="http://localhost:5000"
                target="_blank"
                rel="noopener noreferrer"
                className="btn-secondary px-6 py-3 rounded-lg font-medium"
              >
                ↗️ View Live
              </a>
              <a
                href="/"
                target="_blank"
                rel="noopener noreferrer"
                className="btn-primary px-8 py-3 rounded-lg font-medium inline-flex items-center gap-2"
              >
                🔍 Preview
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminPanel;