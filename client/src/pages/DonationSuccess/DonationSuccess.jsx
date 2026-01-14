// src/pages/DonationSuccess/DonationSuccess.jsx
import React, { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';

const DonationSuccess = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [donationData, setDonationData] = useState(null);

  useEffect(() => {
    if (location.state) {
      setDonationData(location.state);
      sessionStorage.setItem('lastDonation', JSON.stringify(location.state));
    } else {
      const savedDonation = sessionStorage.getItem('lastDonation');
      if (savedDonation) {
        setDonationData(JSON.parse(savedDonation));
      } else {
        navigate('/fundraising');
      }
    }
  }, [location, navigate]);

  const handleShare = () => {
    const shareText = `I just donated Rs.${donationData?.amount} to support ${donationData?.campaign?.title} via HerFund! Join me in making a difference in menstrual health.`;
    
    if (navigator.share) {
      navigator.share({
        title: 'My Donation to HerFund',
        text: shareText,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(shareText);
      alert('Share message copied to clipboard!');
    }
  };

  if (!donationData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 to-teal-950">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-teal-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white">Loading donation details...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full relative overflow-x-hidden flex flex-col items-center justify-center bg-gradient-to-br from-gray-900 to-teal-950 p-4">
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
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
      </div>

      <div className="relative z-10 w-full max-w-2xl mx-auto text-center">
        {/* Success Icon */}
        <div className="mb-8 flex justify-center">
          <div className="w-24 h-24 rounded-full bg-gradient-to-br from-green-400 to-teal-500 flex items-center justify-center animate-pulse-glow">
            <span className="text-4xl">✅</span>
          </div>
        </div>

        {/* Success Message */}
        <h1 className="text-4xl font-bold text-white mb-4">
          Thank You for Your <span className="gradient-text">Generosity!</span>
        </h1>
        
        <p className="text-white/70 text-lg mb-8 max-w-xl mx-auto justify-self-center">
          Your donation of <span className="text-teal-300 font-bold">Rs.{donationData.amount?.toLocaleString()}</span> 
          has been successfully processed and will make a real difference.
        </p>
        <br/>
        {/* Donation Details */}
        <div className="flex items-center justify-center">
          <div className="glass-card rounded-2xl p-6 max-w-md w-full">
            <h3 className="text-white font-bold text-xl mb-4">Donation Details</h3>
            
            <div className="space-y-3 text-left justify-content-center">
              <div className="flex justify-between">
                <span className="text-white/70">Amount:</span>
                <span className="text-white font-bold">Rs.{donationData.amount?.toLocaleString()}</span>
              </div>
              
              {donationData.campaign && (
                <div className="flex justify-between">
                  <span className="text-white/70">Campaign:</span>
                  <span className="text-teal-300 text-right">{donationData.campaign.title}</span>
                </div>
              )}
              
              {donationData.paymentId && (
                <div className="flex justify-between">
                  <span className="text-white/70">Transaction ID:</span>
                  <span className="text-white/60 text-sm font-mono">{donationData.paymentId.slice(0, 12)}...</span>
                </div>
              )}
              
              {donationData.donorInfo?.name && (
                <div className="flex justify-between">
                  <span className="text-white/70">Donor:</span>
                  <span className="text-white">{donationData.donorInfo.name}</span>
                </div>
              )}
            </div>
          </div>
        </div>
        <br/>

        {/* Next Steps */}
        <div className="mb-8">
          <h3 className="text-white font-bold text-xl mb-4">What Happens Next?</h3>
          <br/>
          <div className="grid md:grid-cols-3 gap-4 mb-6">
            <div className="glass-card rounded-xl p-4">
              <div className="text-2xl mb-2">📧</div>
              <h4 className="text-white font-semibold mb-2">Email Receipt</h4>
              <p className="text-white/60 text-sm">You'll receive a receipt and tax certificate via email.</p>
            </div>
            <div className="glass-card rounded-xl p-4">
              <div className="text-2xl mb-2">📊</div>
              <h4 className="text-white font-semibold mb-2">Impact Updates</h4>
              <p className="text-white/60 text-sm">Get updates on how your donation is making a difference.</p>
            </div>
            <div className="glass-card rounded-xl p-4">
              <div className="text-2xl mb-2">📈</div>
              <h4 className="text-white font-semibold mb-2">Campaign Progress</h4>
              <p className="text-white/60 text-sm">Track the progress of the campaign you supported.</p>
            </div>
          </div>
        </div>
        <br/>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={handleShare}
            className="btn-primary text-white font-semibold rounded-full px-8 py-4 button"
            style={{ background: 'linear-gradient(135deg, #14b8a6 0%, #0d9488 100%)' }}
          >
            Share Your Support
          </button>
          
          <button
            onClick={() => window.location.href = "/fundraising"}
            className="inline-flex items-center justify-center glass-card text-white font-semibold rounded-full px-8 py-4 
            hover:bg-white/10 transition-all active:scale-95 shadow-lg hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-white/30"
          >
            Explore More Campaigns
          </button>
        </div>
        <br/>

        {/* Footer Note */}
        <div className="mt-8 pt-6 border-t border-white/20">
          <p className="text-white/50 text-sm">
            Questions? Contact us at{' '}
            <a href="mailto:support@herfund.org" className="text-teal-300 hover:underline">
              support@herfund.org
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default DonationSuccess;