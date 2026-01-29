// pages/Admin/FundraisingAdminPanel.jsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './FundraisingAdminPanel.css';

const FundraisingAdminPanel = () => {
  // All necessary states
  const [fundraisingData, setFundraisingData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [_error, setError] = useState(null);
  const [notification, setNotification] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(null); // [index, isCampaign]
  
  // Emoji categories
  const emojiCategories = {
    nature: ['🌸', '🌺', '🌻', '🌹', '🌷', '💐', '🌳', '🌴', '🌵', '🌾', '🌿', '🍀', '🍁', '🍂', '🍃'],
    education: ['📚', '🎓', '✏️', '📝', '📖', '🔬', '🔭', '🧮', '🧪', '📊', '📈'],
    healthcare: ['🏥', '🚑', '💊', '❤️', '🩺', '🧑‍⚕️', '👨‍⚕️', '👩‍⚕️', '🩹', '🩸'],
    environment: ['🌍', '🌎', '🌏', '♻️', '🌱', '🌲', '🌳', '💧', '🔥', '🌈'],
    emergency: ['🚨', '🚒', '🚓', '🚑', '⚠️', '❗', '🆘', '⛑️', '🌪️', '🔥'],
    community: ['👨‍👩‍👧‍👦', '🤝', '🙌', '👥', '🏘️', '🏠', '🏡', '🌇', '🌃'],
    animals: ['🐶', '🐱', '🐭', '🐹', '🐰', '🦊', '🐻', '🐼', '🐨', '🐯', '🦁'],
    food: ['🍎', '🍞', '🥦', '🍚', '🥛', '💧', '🍲', '🥘', '🍽️'],
    default: ['⭐', '🌟', '✨', '💫', '🎉', '🎊', '🎈', '🎁', '🏆', '🥇', '🎗️', '💖', '💕', '💞']
  };

  // Form data state
  const [formData, setFormData] = useState({
    hero: {
      badgeText: "",
      mainHeading: "",
      subheading: "",
      stats: [
        { number: '', label: '', order: 0 },
        { number: '', label: '', order: 1 },
        { number: '', label: '', order: 2 },
        { number: '', label: '', order: 3 }
      ]
    },
    campaigns: [],
    progressBars: [
      { label: "", value: 0, color: "from-pink-500 to-purple-500", order: 0 },
      { label: "", value: 0, color: "from-green-400 to-teal-500", order: 1 },
      { label: "", value: 0, color: "from-blue-400 to-indigo-500", order: 2 },
      { label: "", value: 0, color: "from-orange-400 to-red-500", order: 3 }
    ],
    carouselImages: [],
    cta: {
      title: "",
      description: ""
    },
    footer: {
      description: "",
      volunteerText: "",
      partnerText: "",
      copyright: ""
    }
  });

  // Fetch data from API
  const fetchFundraisingData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch('http://localhost:5000/api/fundraising/admin');
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const result = await response.json();
      
      if (result.success) {
        setFundraisingData(result.data);
        
        // Ensure all sections exist
        const fullData = {
          hero: {
            badgeText: "",
            mainHeading: "",
            subheading: "",
            stats: [
              { number: '', label: '', order: 0 },
              { number: '', label: '', order: 1 },
              { number: '', label: '', order: 2 },
              { number: '', label: '', order: 3 }
            ],
            ...result.data.hero
          },
          campaigns: result.data.campaigns || [],
          progressBars: result.data.progressBars || [
            { label: "", value: 0, color: "from-pink-500 to-purple-500", order: 0 },
            { label: "", value: 0, color: "from-green-400 to-teal-500", order: 1 },
            { label: "", value: 0, color: "from-blue-400 to-indigo-500", order: 2 },
            { label: "", value: 0, color: "from-orange-400 to-red-500", order: 3 }
          ],
          carouselImages: result.data.carouselImages || [],
          cta: result.data.cta || { title: "", description: "" },
          footer: result.data.footer || {
            description: "",
            volunteerText: "",
            partnerText: "",
            copyright: ""
          }
        };
        
        setFormData(fullData);
        console.log('Data loaded successfully');
      } else {
        throw new Error(result.message || 'Failed to load data');
      }
    } catch (err) {
      console.error('Error fetching data:', err);
      setError(err.message);
      setNotification({
        type: 'error',
        message: `Failed to load data: ${err.message}`
      });
    } finally {
      setLoading(false);
    }
  };

  // Load data on component mount
  useEffect(() => {
    fetchFundraisingData();
  }, []);

  // Handle form input changes
  const handleInputChange = (section, field, value) => {
    setFormData(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value
      }
    }));
  };

  // Handle array item changes
  const handleArrayItemChange = (arrayName, index, field, value) => {
    setFormData(prev => {
      const newArray = [...prev[arrayName]];
      newArray[index] = {
        ...newArray[index],
        [field]: value
      };
      return {
        ...prev,
        [arrayName]: newArray
      };
    });
  };

  // Handle nested array item changes (for hero stats)
  const handleNestedArrayItemChange = (section, arrayName, index, field, value) => {
    setFormData(prev => {
      const newSection = { ...prev[section] };
      const newArray = [...newSection[arrayName]];
      newArray[index] = {
        ...newArray[index],
        [field]: value
      };
      newSection[arrayName] = newArray;
      return {
        ...prev,
        [section]: newSection
      };
    });
  };

  // Compress image function
  const compressImage = (file, maxWidth = 800, maxHeight = 600, quality = 0.7) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target.result;
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;
          
          // Calculate new dimensions
          if (width > height) {
            if (width > maxWidth) {
              height = Math.round((height * maxWidth) / width);
              width = maxWidth;
            }
          } else {
            if (height > maxHeight) {
              width = Math.round((width * maxHeight) / height);
              height = maxHeight;
            }
          }
          
          canvas.width = width;
          canvas.height = height;
          
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, width, height);
          
          // Convert to base64 with quality
          const base64 = canvas.toDataURL('image/jpeg', quality);
          resolve(base64);
        };
        img.onerror = reject;
      };
      reader.onerror = reject;
    });
  };

  // Handle image upload with compression
  const handleImageUpload = async (event, index, isCampaign = false) => {
    const file = event?.target?.files?.[0];
    if (!file) return;

    // Check file size (max 10MB before compression)
    if (file.size > 10 * 1024 * 1024) {
      alert('Image size should be less than 10MB');
      return;
    }

    if (!file.type.startsWith('image/')) {
      alert('Please select an image file');
      return;
    }

    try {
      setNotification({
        type: 'info',
        message: 'Compressing image...'
      });

      // Properly call compressImage with selected dimensions/quality
      const maxWidth = isCampaign ? 400 : 800;   // smaller for campaigns
      const maxHeight = isCampaign ? 400 : 600;
      const quality = isCampaign ? 0.6 : 0.7;

      const compressedBase64 = await compressImage(file, maxWidth, maxHeight, quality);

      // Update form data
      if (isCampaign) {
        setFormData(prev => {
          const newCampaigns = [...prev.campaigns];
          newCampaigns[index] = {
            ...newCampaigns[index],
            image: compressedBase64
          };
          return {
            ...prev,
            campaigns: newCampaigns
          };
        });
      } else {
        setFormData(prev => {
          const newCarouselImages = [...prev.carouselImages];
          newCarouselImages[index] = {
            ...newCarouselImages[index],
            image: compressedBase64
          };
          return {
            ...prev,
            carouselImages: newCarouselImages
          };
        });
      }

      setNotification({
        type: 'success',
        message: `Image uploaded and compressed! (${Math.round(compressedBase64.length / 1024)} KB)`
      });
      
      // Clear the file input
      event.target.value = '';
    } catch (error) {
      console.error('Error processing image:', error);
      setNotification({
        type: 'error',
        message: 'Failed to process image'
      });
    }
  };

  // Add new campaign
  const addCampaign = () => {
    setFormData(prev => ({
      ...prev,
      campaigns: [
        ...prev.campaigns,
        {
          title: "",
          description: "",
          raised: 0,
          goal: 1000000,
          donors: 0,
          daysLeft: 30,
          image: "🌸",
          category: "Education",
          order: prev.campaigns.length,
          active: true
        }
      ]
    }));
  };

  // Add new carousel image
  const addCarouselImage = () => {
    setFormData(prev => ({
      ...prev,
      carouselImages: [
        ...prev.carouselImages,
        {
          image: "",
          title: "",
          description: "",
          order: prev.carouselImages.length,
          active: true
        }
      ]
    }));
  };

  // Remove image data (convert to emoji to reduce size)
  const removeImageData = (index, isCampaign = false) => {
    if (isCampaign) {
      setFormData(prev => {
        const newCampaigns = [...prev.campaigns];
        newCampaigns[index] = {
          ...newCampaigns[index],
          image: "🌸" // Reset to default emoji
        };
        return {
          ...prev,
          campaigns: newCampaigns
        };
      });
    } else {
      setFormData(prev => {
        const newCarouselImages = [...prev.carouselImages];
        newCarouselImages[index] = {
          ...newCarouselImages[index],
          image: "" // Reset to empty
        };
        return {
          ...prev,
          carouselImages: newCarouselImages
        };
      });
    }
    
    setNotification({
      type: 'info',
      message: 'Image removed (size reduced)'
    });
  };

  // Handle emoji selection for campaign
  const handleEmojiSelect = (index, emoji) => {
    setFormData(prev => {
      const newCampaigns = [...prev.campaigns];
      newCampaigns[index] = {
        ...newCampaigns[index],
        image: emoji
      };
      return {
        ...prev,
        campaigns: newCampaigns
      };
    });
    setShowEmojiPicker(null);
  };

  // Remove campaign
  const removeCampaign = (index) => {
    setFormData(prev => {
      const newCampaigns = [...prev.campaigns];
      newCampaigns.splice(index, 1);
      return {
        ...prev,
        campaigns: newCampaigns.map((campaign, i) => ({
          ...campaign,
          order: i
        }))
      };
    });
  };

  // Remove carousel image
  const removeCarouselImage = (index) => {
    setFormData(prev => {
      const newImages = [...prev.carouselImages];
      newImages.splice(index, 1);
      return {
        ...prev,
        carouselImages: newImages.map((image, i) => ({
          ...image,
          order: i
        }))
      };
    });
  };

  // Optimize data before saving (remove unnecessary base64 data)
  const optimizeDataForSave = (data) => {
    const optimized = { ...data };
    
    // Check and optimize carousel images
    if (optimized.carouselImages) {
      optimized.carouselImages = optimized.carouselImages.map(img => {
        // If image is base64 and hasn't changed, keep only a reference
        if (img.image && img.image.startsWith('data:image')) {
          // For existing images with _id, we can send minimal data
          if (img._id) {
            return {
              ...img,
              image: img.image.substring(0, 100) + '...' // Just send first 100 chars as reference
            };
          }
        }
        return img;
      });
    }
    
    // Check and optimize campaign images
    if (optimized.campaigns) {
      optimized.campaigns = optimized.campaigns.map(campaign => {
        if (campaign.image && campaign.image.startsWith('data:image')) {
          if (campaign._id) {
            return {
              ...campaign,
              image: campaign.image.substring(0, 100) + '...'
            };
          }
        }
        return campaign;
      });
    }
    
    return optimized;
  };

  // Handle save data with optimization
  const handleSave = async () => {
    try {
      setIsSaving(true);
      setNotification(null);
      
      // Calculate data size
      const dataSize = JSON.stringify(formData).length;
      console.log('Original data size:', (dataSize / 1024 / 1024).toFixed(2), 'MB');
      
      // Optimize data if too large
      let dataToSend = { ...formData };
      if (dataSize > 10 * 1024 * 1024) { // If > 10MB
        setNotification({
          type: 'warning',
          message: 'Data is large, optimizing...'
        });
        dataToSend = optimizeDataForSave(formData);
        const optimizedSize = JSON.stringify(dataToSend).length;
        console.log('Optimized data size:', (optimizedSize / 1024 / 1024).toFixed(2), 'MB');
      }
      
      const response = await fetch('http://localhost:5000/api/fundraising/admin', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(dataToSend)
      });
      
      // First, get the raw response text
      const responseText = await response.text();
      console.log('Response status:', response.status);
      
      // Check if it's HTML (server error page)
      if (responseText.includes('<!DOCTYPE') || responseText.includes('<html')) {
        console.error('Server returned HTML:', responseText.substring(0, 500));
        throw new Error('Server returned an error page. Check if backend is running properly.');
      }
      
      // Try to parse as JSON
      let result;
      try {
        result = JSON.parse(responseText);
      } catch {
        console.error('Failed to parse JSON. Response:', responseText.substring(0, 500));
        throw new Error('Server returned invalid JSON. Make sure backend is running and payload limit is increased.');
      }
      
      if (!response.ok) {
        throw new Error(result.message || `HTTP ${response.status}: ${response.statusText}`);
      }
      
      if (result.success) {
        setNotification({
          type: 'success',
          message: 'Data saved successfully!'
        });
        fetchFundraisingData();
      } else {
        throw new Error(result.message || 'Failed to save data');
      }
    } catch (error) {
      console.error('Error saving data:', error);
      setNotification({
        type: 'error',
        message: `Save failed: ${error.message}. Try removing large images first.`
      });
    } finally {
      setIsSaving(false);
    }
  };

  // Quick save without images (for testing)
  const handleQuickSave = async () => {
    try {
      setIsSaving(true);
      
      // Create data without images
      const dataWithoutImages = {
        ...formData,
        carouselImages: formData.carouselImages.map(img => ({
          ...img,
          image: img.image && !img.image.startsWith('data:image') ? img.image : ""
        })),
        campaigns: formData.campaigns.map(campaign => ({
          ...campaign,
          image: campaign.image && !campaign.image.startsWith('data:image') ? campaign.image : "🌸"
        }))
      };
      
      const response = await fetch('http://localhost:5000/api/fundraising/admin', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dataWithoutImages)
      });
      
      const result = await response.json();
      
      if (result.success) {
        setNotification({
          type: 'success',
          message: 'Data saved (without images)'
        });
      }
    } catch (error) {
      console.error('Quick save error:', error);
    } finally {
      setIsSaving(false);
    }
  };

  // Seed database
  const handleSeed = async () => {
    if (!window.confirm('Seed database with default data? This will replace current data.')) {
      return;
    }
    
    try {
      setLoading(true);
      const response = await fetch('http://localhost:5000/api/fundraising/seed', {
        method: 'POST'
      });
      
      const result = await response.json();
      
      if (result.success) {
        setNotification({
          type: 'success',
          message: 'Database seeded successfully!'
        });
        fetchFundraisingData();
      }
    } catch (error) {
      console.error('Error seeding:', error);
    } finally {
      setLoading(false);
    }
  };

  // Check if string is base64 image
  const isBase64Image = (str) => {
    return str && str.startsWith('data:image/');
  };

  // Check if string is emoji
  const isEmoji = (str) => {
    return str && str.length <= 3 && /[\uD800-\uDBFF][\uDC00-\uDFFF]|[\u2600-\u26FF]|[\u2700-\u27BF]|[\uE000-\uF8FF]|\uD83C[\uDC00-\uDFFF]|\uD83D[\uDC00-\uDFFF]/.test(str);
  };

  // Loading state
  if (loading && !fundraisingData) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-teal-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-300 text-lg">Loading Admin Panel...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="hcp-admin min-h-screen bg-gray-900 text-gray-100 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header with data size info */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-white">Her Cycle Fundraising Page Manager</h1>
            <p className="text-gray-400 mt-2">
              Current data size: {Math.round(JSON.stringify(formData).length / 1024)} KB
            </p>
            <p className="text-sm text-yellow-400 mt-1">
              ⚠️ Tip: Compress images before uploading to avoid size issues
            </p>
          </div>
          
          <div className="flex flex-wrap gap-3">
            <button
              onClick={handleSave}
              disabled={isSaving}
              className={`px-6 py-3 rounded-lg font-semibold ${
                isSaving ? 'bg-gray-700' : 'bg-green-600 hover:bg-green-700'
              } text-white`}
            >
              {isSaving ? 'Saving...' : 'Save All Changes'}
            </button>
            
            <button
              onClick={handleSeed}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Seed Default Data
            </button>
            
            <Link
              to="/fundraising"
              className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700"
            >
              View Live
            </Link>
          </div>
        </div>

        {/* Notification */}
        {notification && (
          <div className={`p-4 mb-6 rounded-lg ${
            notification.type === 'success' ? 'bg-green-900/30 text-green-300 border-green-700' :
            notification.type === 'error' ? 'bg-red-900/30 text-red-300 border-red-700' :
            notification.type === 'warning' ? 'bg-yellow-900/30 text-yellow-300 border-yellow-700' :
            'bg-blue-900/30 text-blue-300 border-blue-700'
          } border`}>
            <div className="flex justify-between items-center">
              <span>{notification.message}</span>
              <button onClick={() => setNotification(null)} className="text-gray-400 hover:text-white">×</button>
            </div>
          </div>
        )}

        {/* Sections container: uniform gaps and alignment */}
        <div className="hcp-sections">
          {/* Hero Section */}
          <div className="hcp-panel bg-gray-800 rounded-xl shadow-lg p-6 mb-8 border border-gray-700">
            <h2 className="text-2xl font-bold text-white mb-6 pb-3 border-b border-gray-700">
              Hero Section
            </h2>
            
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Badge Text
                </label>
                <input
                  type="text"
                  value={formData.hero.badgeText}
                  onChange={(e) => handleInputChange('hero', 'badgeText', e.target.value)}
                  className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded text-white placeholder-gray-500 focus:border-teal-500 focus:ring-1 focus:ring-teal-500"
                  placeholder="e.g., Making a Real Difference"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Main Heading
                </label>
                <input
                  type="text"
                  value={formData.hero.mainHeading}
                  onChange={(e) => handleInputChange('hero', 'mainHeading', e.target.value)}
                  className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded text-white placeholder-gray-500 focus:border-teal-500 focus:ring-1 focus:ring-teal-500"
                  placeholder="e.g., Fuel the Change in Menstrual Health"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Subheading
                </label>
                <textarea
                  value={formData.hero.subheading}
                  onChange={(e) => handleInputChange('hero', 'subheading', e.target.value)}
                  rows="3"
                  className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded text-white placeholder-gray-500 focus:border-teal-500 focus:ring-1 focus:ring-teal-500"
                  placeholder="Description text for hero section"
                />
              </div>
              
              {/* Hero Stats */}
              <div>
                <h3 className="text-lg font-semibold text-white mb-4">Hero Statistics</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {formData.hero.stats.map((stat, index) => (
                    <div key={index} className="bg-gray-900/50 p-4 rounded-lg border border-gray-700">
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="text-sm font-medium text-gray-300">Stat {index + 1}</h4>
                        <span className="text-xs text-gray-500">Order: {stat.order}</span>
                      </div>
                      <div className="space-y-3">
                        <div>
                          <label className="block text-xs text-gray-400 mb-1">Number</label>
                          <input
                            type="text"
                            value={stat.number}
                            onChange={(e) => handleNestedArrayItemChange('hero', 'stats', index, 'number', e.target.value)}
                            className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded text-white text-sm focus:border-teal-500 focus:ring-1 focus:ring-teal-500"
                            placeholder="e.g., Rs.4.2M+"
                          />
                        </div>
                        <div>
                          <label className="block text-xs text-gray-400 mb-1">Label</label>
                          <input
                            type="text"
                            value={stat.label}
                            onChange={(e) => handleNestedArrayItemChange('hero', 'stats', index, 'label', e.target.value)}
                            className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded text-white text-sm focus:border-teal-500 focus:ring-1 focus:ring-teal-500"
                            placeholder="e.g., Total Raised"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Carousel Images Section with Compression */}
          <div className="hcp-panel bg-gray-800 rounded-xl shadow-lg p-6 mb-8 border border-gray-700">
            <div className="flex justify-between items-center mb-6 pb-3 border-b border-gray-700">
              <div>
                <h2 className="text-2xl font-bold text-white">Carousel Images</h2>
                <p className="text-sm text-gray-400 mt-1">
                  Images are compressed to 800x600px before saving
                </p>
              </div>
              <button
                onClick={addCarouselImage}
                className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors"
              >
                + Add Image
              </button>
            </div>
            
            {formData.carouselImages.map((image, index) => (
              <div key={index} className="border border-gray-700 rounded-lg p-6 mb-6 bg-gray-800/50">
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-lg font-semibold text-white">
                    Image {index + 1}: {image.title || 'Untitled'}
                  </h3>
                  <div className="flex gap-2">
                    {isBase64Image(image.image) && (
                      <button
                        onClick={() => removeImageData(index, false)}
                        className="px-3 py-1 bg-yellow-900/30 text-yellow-300 text-sm rounded hover:bg-yellow-800/50 transition-colors"
                      >
                        Remove Image Data
                      </button>
                    )}
                    <button
                      onClick={() => removeCarouselImage(index)}
                      className="text-red-400 hover:text-red-300 transition-colors"
                    >
                      Remove
                    </button>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Image Upload */}
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Upload Local Image
                    </label>
                    <div className="border-2 border-dashed border-gray-600 rounded-lg p-4 hover:border-gray-500 transition-colors">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleImageUpload(e, index, false)}
                        className="hidden"
                        id={`carousel-upload-${index}`}
                      />
                      <label htmlFor={`carousel-upload-${index}`} className="cursor-pointer block text-center">
                        <div className="text-gray-500 mb-2">
                          <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                        </div>
                        <span className="text-teal-400">Upload & Compress Image</span>
                        <p className="text-xs text-gray-400 mt-1">Max 10MB, will be compressed to 800x600px</p>
                      </label>
                    </div>
                    
                    {/* Preview */}
                    {image.image && (
                      <div className="mt-4">
                        <div className="text-sm text-gray-400 mb-2">
                          Preview {isBase64Image(image.image) ? 
                            `(${Math.round(image.image.length / 1024)} KB)` : ''}
                        </div>
                        <div className="h-48 bg-gray-900 rounded-lg overflow-hidden border border-gray-700">
                          {isBase64Image(image.image) ? (
                            <img src={image.image} alt="Preview" className="w-full h-full object-cover" />
                          ) : image.image ? (
                            <img src={image.image} alt="Preview" className="w-full h-full object-cover" />
                          ) : (
                            <div className="flex items-center justify-center h-full text-gray-500">
                              No image
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                  
                  {/* Image Details */}
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Title
                      </label>
                      <input
                        type="text"
                        value={image.title}
                        onChange={(e) => handleArrayItemChange('carouselImages', index, 'title', e.target.value)}
                        className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded text-white placeholder-gray-500 focus:border-teal-500 focus:ring-1 focus:ring-teal-500"
                        placeholder="Image title"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Description
                      </label>
                      <textarea
                        value={image.description}
                        onChange={(e) => handleArrayItemChange('carouselImages', index, 'description', e.target.value)}
                        rows="3"
                        className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded text-white placeholder-gray-500 focus:border-teal-500 focus:ring-1 focus:ring-teal-500"
                        placeholder="Image description"
                      />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                          Order
                        </label>
                        <input
                          type="number"
                          value={image.order}
                          onChange={(e) => handleArrayItemChange('carouselImages', index, 'order', parseInt(e.target.value) || 0)}
                          className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded text-white focus:border-teal-500 focus:ring-1 focus:ring-teal-500"
                        />
                      </div>
                      
                      <div className="flex items-center">
                        <label className="flex items-center space-x-2 mt-6">
                          <input
                            type="checkbox"
                            checked={image.active}
                            onChange={(e) => handleArrayItemChange('carouselImages', index, 'active', e.target.checked)}
                            className="rounded border-gray-600 bg-gray-800 text-teal-500 focus:ring-teal-500"
                          />
                          <span className="text-sm text-gray-300">Active</span>
                        </label>
                      </div>
                    </div>
                    
                    {/* URL fallback */}
                    <div className="pt-4 border-t border-gray-700">
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Or use URL instead (external image):
                      </label>
                      <input
                        type="text"
                        value={!isBase64Image(image.image) ? image.image : ''}
                        onChange={(e) => handleArrayItemChange('carouselImages', index, 'image', e.target.value)}
                        className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded text-white placeholder-gray-500 focus:border-teal-500 focus:ring-1 focus:ring-teal-500"
                        placeholder="https://example.com/image.jpg"
                      />
                    </div>
                  </div>
                </div>
              </div>
            ))}
            
            {formData.carouselImages.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                No carousel images added yet
              </div>
            )}
          </div>

          {/* Campaign Section with Emoji Selection */}
          <div className="hcp-panel bg-gray-800 rounded-xl shadow-lg p-6 mb-8 border border-gray-700">
            <div className="flex justify-between items-center mb-6 pb-3 border-b border-gray-700">
              <div>
                <h2 className="text-2xl font-bold text-white">Campaigns</h2>
                <p className="text-sm text-gray-400 mt-1">
                  Use emojis or small images for campaign icons
                </p>
              </div>
              <button
                onClick={addCampaign}
                className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors"
              >
                + Add Campaign
              </button>
            </div>
            
            {formData.campaigns.map((campaign, index) => (
              <div key={index} className="border border-gray-700 rounded-lg p-6 mb-6 bg-gray-800/50">
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-lg font-semibold text-white">
                    Campaign {index + 1}: {campaign.title || 'Untitled'}
                  </h3>
                  <div className="flex gap-2">
                    {isBase64Image(campaign.image) && (
                      <button
                        onClick={() => removeImageData(index, true)}
                        className="px-3 py-1 bg-yellow-900/30 text-yellow-300 text-sm rounded hover:bg-yellow-800/50 transition-colors"
                      >
                        Remove Image Data
                      </button>
                    )}
                    <button
                      onClick={() => removeCampaign(index)}
                      className="text-red-400 hover:text-red-300 transition-colors"
                    >
                      Remove
                    </button>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Campaign Image/Emoji Selection */}
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Campaign Icon
                    </label>
                    
                    {/* Emoji Picker */}
                    {showEmojiPicker === index && (
                      <div className="mb-4 bg-gray-900 border border-gray-700 rounded-lg p-4">
                        <div className="flex justify-between items-center mb-3">
                          <h4 className="text-sm font-medium text-white">Select Emoji</h4>
                          <button
                            onClick={() => setShowEmojiPicker(null)}
                            className="text-gray-400 hover:text-white"
                          >
                            ×
                          </button>
                        </div>
                        <div className="space-y-4 max-h-60 overflow-y-auto">
                          {Object.entries(emojiCategories).map(([category, emojis]) => (
                            <div key={category}>
                              <h5 className="text-xs font-medium text-gray-400 mb-2 capitalize">
                                {category}
                              </h5>
                              <div className="flex flex-wrap gap-2 mb-3">
                                {emojis.map((emoji, emojiIndex) => (
                                  <button
                                    key={emojiIndex}
                                    onClick={() => handleEmojiSelect(index, emoji)}
                                    className="text-2xl hover:bg-gray-800 p-2 rounded-lg transition-colors"
                                  >
                                    {emoji}
                                  </button>
                                ))}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {/* Current Icon Display */}
                    <div className="mb-4">
                      <div className="text-sm text-gray-400 mb-2">Current Icon:</div>
                      <div className="h-32 bg-gray-900 rounded-lg border border-gray-700 flex items-center justify-center">
                        {isBase64Image(campaign.image) ? (
                          <img 
                            src={campaign.image} 
                            alt="Campaign Preview" 
                            className="w-full h-full object-cover rounded-lg"
                          />
                        ) : isEmoji(campaign.image) ? (
                          <div className="text-7xl">{campaign.image}</div>
                        ) : campaign.image ? (
                          <img 
                            src={campaign.image} 
                            alt="Campaign Preview" 
                            className="w-full h-full object-cover rounded-lg"
                          />
                        ) : (
                          <div className="flex items-center justify-center h-full text-gray-500">
                            No icon
                          </div>
                        )}
                      </div>
                    </div>
                    
                    {/* Selection Options */}
                    <div className="space-y-3">
                      <button
                        onClick={() => setShowEmojiPicker(index)}
                        className="w-full px-4 py-3 bg-gray-900 hover:bg-gray-800 text-gray-300 rounded-lg border border-gray-700 flex items-center justify-center gap-2 transition-colors"
                      >
                        <span className="text-xl">😊</span>
                        <span>Select Emoji</span>
                      </button>
                      
                      <div className="text-center">
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                          Or upload small image (max 400x400px):
                        </label>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => handleImageUpload(e, index, true)}
                          className="hidden"
                          id={`campaign-upload-${index}`}
                        />
                        <label
                          htmlFor={`campaign-upload-${index}`}
                          className="inline-block px-4 py-2 bg-gray-700 hover:bg-gray-600 text-gray-300 rounded-lg cursor-pointer transition-colors"
                        >
                          Upload Image
                        </label>
                      </div>
                    </div>
                  </div>
                  
                  {/* Campaign Details */}
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Campaign Title
                      </label>
                      <input
                        type="text"
                        value={campaign.title}
                        onChange={(e) => handleArrayItemChange('campaigns', index, 'title', e.target.value)}
                        className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded text-white placeholder-gray-500 focus:border-teal-500 focus:ring-1 focus:ring-teal-500"
                        placeholder="Campaign title"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Description
                      </label>
                      <textarea
                        value={campaign.description}
                        onChange={(e) => handleArrayItemChange('campaigns', index, 'description', e.target.value)}
                        rows="3"
                        className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded text-white placeholder-gray-500 focus:border-teal-500 focus:ring-1 focus:ring-teal-500"
                        placeholder="Campaign description"
                      />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                          Category
                        </label>
                        <select
                          value={campaign.category}
                          onChange={(e) => handleArrayItemChange('campaigns', index, 'category', e.target.value)}
                          className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded text-white focus:border-teal-500 focus:ring-1 focus:ring-teal-500"
                        >
                          <option value="Education">Education</option>
                          <option value="Healthcare">Healthcare</option>
                          <option value="Environment">Environment</option>
                          <option value="Emergency">Emergency</option>
                          <option value="Community">Community</option>
                          <option value="Awareness">Awareness</option>
                          <option value="Sustainability">Sustainability</option>
                        </select>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                          Order
                        </label>
                        <input
                          type="number"
                          value={campaign.order}
                          onChange={(e) => handleArrayItemChange('campaigns', index, 'order', parseInt(e.target.value) || 0)}
                          className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded text-white focus:border-teal-500 focus:ring-1 focus:ring-teal-500"
                        />
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                          Raised (Rs.)
                        </label>
                        <input
                          type="number"
                          value={campaign.raised}
                          onChange={(e) => handleArrayItemChange('campaigns', index, 'raised', parseInt(e.target.value) || 0)}
                          className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded text-white focus:border-teal-500 focus:ring-1 focus:ring-teal-500"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                          Goal (Rs.)
                        </label>
                        <input
                          type="number"
                          value={campaign.goal}
                          onChange={(e) => handleArrayItemChange('campaigns', index, 'goal', parseInt(e.target.value) || 1000000)}
                          className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded text-white focus:border-teal-500 focus:ring-1 focus:ring-teal-500"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                          Days Left
                        </label>
                        <input
                          type="number"
                          value={campaign.daysLeft}
                          onChange={(e) => handleArrayItemChange('campaigns', index, 'daysLeft', parseInt(e.target.value) || 30)}
                          className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded text-white focus:border-teal-500 focus:ring-1 focus:ring-teal-500"
                        />
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                          Donors
                        </label>
                        <input
                          type="number"
                          value={campaign.donors}
                          onChange={(e) => handleArrayItemChange('campaigns', index, 'donors', parseInt(e.target.value) || 0)}
                          className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded text-white focus:border-teal-500 focus:ring-1 focus:ring-teal-500"
                        />
                      </div>
                      
                      <div className="flex items-center">
                        <label className="flex items-center space-x-2 mt-6">
                          <input
                            type="checkbox"
                            checked={campaign.active}
                            onChange={(e) => handleArrayItemChange('campaigns', index, 'active', e.target.checked)}
                            className="rounded border-gray-600 bg-gray-800 text-teal-500 focus:ring-teal-500"
                          />
                          <span className="text-sm text-gray-300">Active</span>
                        </label>
                      </div>
                    </div>
                    
                    {/* URL fallback for campaign image */}
                    <div className="pt-4 border-t border-gray-700">
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Or use URL instead (external image):
                      </label>
                      <input
                        type="text"
                        value={!isBase64Image(campaign.image) && !isEmoji(campaign.image) ? campaign.image : ''}
                        onChange={(e) => handleArrayItemChange('campaigns', index, 'image', e.target.value)}
                        className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded text-white placeholder-gray-500 focus:border-teal-500 focus:ring-1 focus:ring-teal-500"
                        placeholder="https://example.com/image.jpg"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Leave empty to use emoji
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
            
            {formData.campaigns.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                No campaigns added yet
              </div>
            )}
          </div>

          {/* CTA Section */}
          <div className="hcp-panel bg-gray-800 rounded-xl shadow-lg p-6 mb-8 border border-gray-700">
            <h2 className="text-2xl font-bold text-white mb-6 pb-3 border-b border-gray-700">
              Call to Action Section
            </h2>
            
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  CTA Title
                </label>
                <input
                  type="text"
                  value={formData.cta.title}
                  onChange={(e) => handleInputChange('cta', 'title', e.target.value)}
                  className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded text-white placeholder-gray-500 focus:border-teal-500 focus:ring-1 focus:ring-teal-500"
                  placeholder="e.g., Ready to Make a Difference?"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  CTA Description
                </label>
                <textarea
                  value={formData.cta.description}
                  onChange={(e) => handleInputChange('cta', 'description', e.target.value)}
                  rows="3"
                  className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded text-white placeholder-gray-500 focus:border-teal-500 focus:ring-1 focus:ring-teal-500"
                  placeholder="Description text for CTA section"
                />
              </div>
            </div>
          </div>

          {/* Footer Section */}
          <div className="hcp-panel bg-gray-800 rounded-xl shadow-lg p-6 mb-8 border border-gray-700">
            <h2 className="text-2xl font-bold text-white mb-6 pb-3 border-b border-gray-700">
              Footer Section
            </h2>
            
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Footer Description
                </label>
                <textarea
                  value={formData.footer.description}
                  onChange={(e) => handleInputChange('footer', 'description', e.target.value)}
                  rows="3"
                  className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded text-white placeholder-gray-500 focus:border-teal-500 focus:ring-1 focus:ring-teal-500"
                  placeholder="Footer description text"
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Volunteer Button Text
                  </label>
                  <input
                    type="text"
                    value={formData.footer.volunteerText}
                    onChange={(e) => handleInputChange('footer', 'volunteerText', e.target.value)}
                    className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded text-white placeholder-gray-500 focus:border-teal-500 focus:ring-1 focus:ring-teal-500"
                    placeholder="e.g., Volunteer"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Partner Button Text
                  </label>
                  <input
                    type="text"
                    value={formData.footer.partnerText}
                    onChange={(e) => handleInputChange('footer', 'partnerText', e.target.value)}
                    className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded text-white placeholder-gray-500 focus:border-teal-500 focus:ring-1 focus:ring-teal-500"
                    placeholder="e.g., Partner With Us"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Copyright Text
                </label>
                <textarea
                  value={formData.footer.copyright}
                  onChange={(e) => handleInputChange('footer', 'copyright', e.target.value)}
                  rows="2"
                  className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded text-white placeholder-gray-500 focus:border-teal-500 focus:ring-1 focus:ring-teal-500"
                  placeholder="e.g., © 2026 HerFund by HerCycle. All donations are tax-deductible."
                />
              </div>
            </div>
          </div>
        </div>

        {/* Save Button with Warning */}
        <div className="sticky bottom-0 bg-gray-900/95 backdrop-blur-sm py-4 border-t border-gray-800 mt-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="text-sm text-gray-400">
              Total data: {Math.round(JSON.stringify(formData).length / 1024)} KB
              {JSON.stringify(formData).length > 5 * 1024 * 1024 && (
                <span className="ml-2 text-yellow-400 font-semibold">
                  ⚠️ Large data may cause issues
                </span>
              )}
            </div>
            
            <div className="flex flex-wrap gap-3">
              <button
                onClick={handleQuickSave}
                disabled={isSaving}
                className="px-4 py-2 bg-yellow-700 hover:bg-yellow-600 text-white rounded-lg transition-colors disabled:opacity-50"
              >
                Save Without Images
              </button>
              
              <button
                onClick={handleSave}
                disabled={isSaving}
                className={`px-6 py-3 rounded-lg font-semibold ${
                  isSaving ? 'bg-gray-700' : 'bg-green-600 hover:bg-green-700'
                } text-white transition-colors`}
              >
                {isSaving ? 'Saving...' : 'Save All Changes'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FundraisingAdminPanel;