// src/components/PaymentGateway/PaymentGateway.jsx
import React, { useState, useEffect } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import {
  Elements,
  CardElement,
  useStripe,
  useElements,
} from '@stripe/react-stripe-js';
import { useLocation, useNavigate } from 'react-router-dom';

// HARDCODED VALUES - NO process.env
const STRIPE_PUBLISHABLE_KEY = 'pk_test_51Sohz3HEwvbtqHzUiBLs363vQzAsEfP3LmnP2gAf68fUVMltc9Ua5RpNSMqgJGxa8UCX4twppGlMCuow5cZ4vQWN00ibUKTsyL';
const API_URL = 'http://localhost:5000';

// Initialize Stripe
const stripePromise = loadStripe(STRIPE_PUBLISHABLE_KEY);

// Predefined donation amounts
const PRE_DEFINED_AMOUNTS = [100, 250, 500, 1000, 2500, 5000];

const CheckoutForm = ({ campaign, initialAmount, onSuccess, onCancel, onAmountChange }) => {
  const stripe = useStripe();
  const elements = useElements();
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [clientSecret, setClientSecret] = useState('');
  const [donorInfo, setDonorInfo] = useState({
    name: '',
    email: '',
    phone: '',
  });
  const [paymentStatus, setPaymentStatus] = useState('');
  const [amount, setAmount] = useState(initialAmount);
  const [customAmountInput, setCustomAmountInput] = useState('');

  // Reset client secret when amount changes
  useEffect(() => {
    setClientSecret('');
  }, [amount]);

  // Create payment intent when component mounts or amount changes
  useEffect(() => {
    const createPaymentIntent = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Get the selected campaign ID from session storage
        const selectedCampaignId = sessionStorage.getItem('selectedCampaignId');
        const campaignTitle = campaign?.title || 'HerFund Campaign';
        
        console.log('Creating payment intent for amount:', amount);
        console.log('Campaign ID:', selectedCampaignId);
        console.log('API URL:', API_URL);

        const response = await fetch(`${API_URL}/api/payment/create-payment-intent`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            amount: Math.round(amount * 100), // Convert to cents
            currency: 'lkr',
            campaignId: selectedCampaignId || '1',
            campaignName: campaignTitle,
            metadata: {
              campaign_id: selectedCampaignId || '1',
              campaign_name: campaignTitle,
            }
          }),
        });

        // Log response status
        console.log('Response status:', response.status);
        
        if (!response.ok) {
          const errorText = await response.text();
          console.error('Server error response:', errorText);
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const data = await response.json();
        console.log('Payment intent response:', data);
        
        if (data.success && data.clientSecret) {
          setClientSecret(data.clientSecret);
          console.log('Payment intent created successfully');
        } else {
          throw new Error(data.error || data.message || 'Failed to create payment intent');
        }
      } catch (err) {
        console.error('Error creating payment intent:', err);
        // setError(`Payment setup failed: ${err.message}`);
      } finally {
        setLoading(false);
      }
    };

    if (amount > 0 && !clientSecret) {
      createPaymentIntent();
    }
  }, [amount, campaign, clientSecret]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setDonorInfo(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleAmountChange = (newAmount) => {
    setAmount(newAmount);
    setCustomAmountInput('');
    if (onAmountChange) {
      onAmountChange(newAmount);
    }
  };

  const handleCustomAmountInput = (e) => {
    const value = e.target.value;
    
    // Remove any non-digit characters except decimal point
    const sanitizedValue = value.replace(/[^0-9.]/g, '');
    
    // Ensure only one decimal point
    const parts = sanitizedValue.split('.');
    if (parts.length > 2) {
      return; // Don't update if multiple decimal points
    }
    
    // Limit decimal places to 2
    if (parts[1] && parts[1].length > 2) {
      return;
    }
    
    setCustomAmountInput(sanitizedValue);
    
    // Update the actual amount when we have a valid number
    if (sanitizedValue && !isNaN(parseFloat(sanitizedValue))) {
      const numValue = parseFloat(sanitizedValue);
      if (numValue >= 10 && numValue <= 1000000) {
        setAmount(numValue);
        if (onAmountChange) {
          onAmountChange(numValue);
        }
      }
    }
  };

  const handleCustomAmountBlur = () => {
    if (customAmountInput && !isNaN(parseFloat(customAmountInput))) {
      const numValue = parseFloat(customAmountInput);
      const clampedValue = Math.max(10, Math.min(numValue, 1000000));
      
      // Format with 2 decimal places if needed
      const formattedValue = clampedValue % 1 === 0 
        ? clampedValue.toString() 
        : clampedValue.toFixed(2);
      
      setCustomAmountInput(formattedValue);
      setAmount(clampedValue);
      if (onAmountChange) {
        onAmountChange(clampedValue);
      }
    } else {
      setCustomAmountInput('');
    }
  };

  const validateForm = () => {
    if (amount < 10) {
      setError('Minimum donation amount is Rs.10');
      return false;
    }
    
    if (amount > 1000000) {
      setError('Maximum donation amount is Rs.10,00,000');
      return false;
    }
    
    if (!donorInfo.name.trim()) {
      setError('Please enter your full name');
      return false;
    }
    if (!donorInfo.email.trim()) {
      setError('Please enter your email address');
      return false;
    }
    if (!/\S+@\S+\.\S+/.test(donorInfo.email)) {
      setError('Please enter a valid email address');
      return false;
    }
    return true;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    
    if (!stripe || !elements) {
      setError('Payment system not ready. Please refresh the page.');
      return;
    }

    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setError(null);
    setPaymentStatus('Processing your payment...');

    try {
      // Create payment method
      const { error: paymentMethodError, paymentMethod } = await stripe.createPaymentMethod({
        type: 'card',
        card: elements.getElement(CardElement),
        billing_details: {
          name: donorInfo.name,
          email: donorInfo.email,
          phone: donorInfo.phone || undefined,
        },
      });

      if (paymentMethodError) {
        throw new Error(`Card error: ${paymentMethodError.message}`);
      }

      setPaymentStatus('Confirming payment...');

      // If we have a client secret, use it
      if (clientSecret) {
        const { error: confirmError, paymentIntent } = await stripe.confirmCardPayment(
          clientSecret,
          {
            payment_method: paymentMethod.id,
            receipt_email: donorInfo.email,
            return_url: `${window.location.origin}/donation-success`,
          }
        );

        if (confirmError) {
          throw new Error(`Payment failed: ${confirmError.message}`);
        }

        setPaymentStatus('Payment successful! Saving details...');

        // Save donation to database
        await saveDonationToDatabase(paymentIntent, donorInfo);
        
        // Show success and redirect
        setSuccess(true);
        onSuccess(paymentIntent);
        
        // Navigate to success page
        setTimeout(() => {
          navigate('/donation-success', { 
            state: { 
              paymentId: paymentIntent.id,
              amount: amount,
              campaign: campaign,
              donorInfo: donorInfo,
              timestamp: new Date().toISOString(),
            }
          });
        }, 1500);
      } else {
        // Fallback for development/testing
        console.log('No client secret, using test mode');
        setSuccess(true);
        setPaymentStatus('Payment successful (Test Mode)');
        
        // Create mock payment intent for testing
        const mockPaymentIntent = {
          id: 'pi_test_' + Math.random().toString(36).substr(2, 9),
          status: 'succeeded',
          amount: amount * 100,
          currency: 'inr',
        };
        
        setTimeout(() => {
          navigate('/donation-success', { 
            state: { 
              paymentId: mockPaymentIntent.id,
              amount: amount,
              campaign: campaign,
              donorInfo: donorInfo,
              timestamp: new Date().toISOString(),
              isTest: true,
            }
          });
        }, 1500);
      }
    } catch (err) {
      console.error('Payment error:', err);
      setError(err.message);
      setPaymentStatus('Payment failed');
    } finally {
      setLoading(false);
    }
  };

  const saveDonationToDatabase = async (paymentIntent, donorInfo) => {
    try {
      const selectedCampaignId = sessionStorage.getItem('selectedCampaignId');
      
      const donationData = {
        paymentIntentId: paymentIntent.id,
        amount: paymentIntent.amount / 100,
        currency: paymentIntent.currency,
        status: paymentIntent.status,
        campaignId: selectedCampaignId || campaign?.id,
        campaignName: campaign?.title,
        donorName: donorInfo.name,
        donorEmail: donorInfo.email,
        donorPhone: donorInfo.phone,
        paymentMethod: paymentIntent.payment_method_types?.[0] || 'card',
        metadata: paymentIntent.metadata || {},
        timestamp: new Date().toISOString(),
      };

      console.log('Saving donation:', donationData);

      const response = await fetch(`${API_URL}/api/payment/save-donation`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(donationData),
      });

      if (!response.ok) {
        console.warn('Failed to save donation to database, but payment was successful');
      } else {
        const result = await response.json();
        console.log('Donation saved to database:', result);
      }
    } catch (err) {
      console.error('Error saving donation:', err);
      // Don't throw error here - payment was successful even if DB save fails
    }
  };

  const cardElementOptions = {
    style: {
      base: {
        color: '#ffffff',
        fontFamily: '"Outfit", sans-serif',
        fontSize: '16px',
        '::placeholder': {
          color: '#a0aec0',
        },
        iconColor: '#14b8a6',
      },
      invalid: {
        color: '#f56565',
        iconColor: '#f56565',
      },
    },
    hidePostalCode: true,
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Donation Amount Selection */}
      <div className="space-y-4">
        <h4 className="text-white text-lg font-semibold mb-4">Donation Amount</h4>
        
        <div className="mb-4">
          <p className="text-white/70 text-sm mb-3">Choose an amount or enter custom:</p>
          
          {/* Predefined Amount Buttons */}
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 mb-4">
            {PRE_DEFINED_AMOUNTS.map((preAmount) => (
              <button
                key={preAmount}
                type="button"
                onClick={() => handleAmountChange(preAmount)}
                disabled={loading || success}
                className={`glass-card rounded-xl py-3 transition-all ${
                  amount === preAmount 
                    ? 'bg-teal-500/30 border-2 border-teal-500' 
                    : 'hover:bg-white/10 border border-white/10'
                } disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                <span className="text-white font-semibold">Rs.{preAmount.toLocaleString()}</span>
              </button>
            ))}
          </div>
          <br/>
          {/* Custom Amount Input */}
          <div className="relative">
            <input
              type="text"
              inputMode="decimal"
              value={customAmountInput}
              onChange={handleCustomAmountInput}
              onBlur={handleCustomAmountBlur}
              placeholder="Enter custom amount"
              // disabled={loading || success}
              className="w-50 glass-card rounded-xl pl-10 pr-4 py-3 text-white placeholder-white/50 outline-none focus:ring-2 focus:ring-teal-500 disabled:opacity-50"
            />
            <div className="absolute right-4 top-1/2 transform -translate-y-1/2 text-white/40 text-sm">
              LKR
            </div>
          </div>
          <div className="text-xs text-white/50 mt-3">
            <span>Minimum: Rs.10</span>
            <br/>
            <span>Maximum: Rs.1,000,000</span>
          </div>
        </div>
      </div>
      {/* Payment Status */}
      {paymentStatus && !error && !success && (
        <div className="glass-card rounded-xl p-4 bg-teal-500/10 border border-teal-500/20">
          <div className="flex items-center gap-3">
            <div className="w-5 h-5 border-2 border-teal-400 border-t-transparent rounded-full animate-spin"></div>
            <span className="text-teal-300 font-medium">{paymentStatus}</span>
          </div>
        </div>
      )}

      {/* Success Message */}
      {success && (
        <div className="glass-card rounded-xl p-4 bg-green-500/10 border border-green-500/20">
          <div className="flex items-center gap-3">
            <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
              <span className="text-white text-sm">✓</span>
            </div>
            <span className="text-green-300 font-medium">Payment successful! Redirecting...</span>
          </div>
        </div>
      )}
      <br/>

      {/* Donor Information */}
      <div className="space-y-4">
        <h4 className="text-white text-lg font-semibold mb-4">Your Information</h4>
        <br/>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-white/70 text-sm mb-2">
              Full Name <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              name="name"
              value={donorInfo.name}
              onChange={handleInputChange}
              required
              disabled={loading || success}
              className="w-full glass-card rounded-xl px-4 py-3 text-white placeholder-white/50 outline-none focus:ring-2 focus:ring-teal-500 disabled:opacity-50"
              placeholder="John Doe"
            />
          </div>
          
          <div>
            <label className="block text-white/70 text-sm mb-2">
              Email Address <span className="text-red-400">*</span>
            </label>
            <input
              type="email"
              name="email"
              value={donorInfo.email}
              onChange={handleInputChange}
              required
              disabled={loading || success}
              className="w-full glass-card rounded-xl px-4 py-3 text-white placeholder-white/50 outline-none focus:ring-2 focus:ring-teal-500 disabled:opacity-50"
              placeholder="john@example.com"
            />
          </div>
        </div>
        <br/>
        <div>
          <label className="block text-white/70 text-sm mb-2">Phone Number (Optional)</label>
          <input
            type="tel"
            name="phone"
            value={donorInfo.phone}
            onChange={handleInputChange}
            disabled={loading || success}
            className="w-full glass-card rounded-xl px-4 py-3 text-white placeholder-white/50 outline-none focus:ring-2 focus:ring-teal-500 disabled:opacity-50"
            placeholder="+91 98765 43210"
          />
        </div>
      </div>
      <br/>

      {/* Card Details */}
      <div className="space-y-4">
        <h4 className="text-white text-lg font-semibold mb-4">Card Details</h4>
        
        <div className="glass-card rounded-xl p-4">
          <CardElement 
            options={cardElementOptions} 
            className={loading || success ? 'opacity-50' : ''}
          />
        </div>
        
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2 text-white/60 text-sm">
            <span className="text-teal-400">🔒</span>
            <span>Your payment is secure and encrypted</span>
          </div>
          
          <div className="text-white/40 text-xs">
            Test Card: <code className="bg-black/30 px-2 py-1 rounded">4242 4242 4242 4242</code>
          </div>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-red-500/20 border border-red-500/50 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-red-400">⚠</span>
            <h4 className="text-red-300 font-semibold">Payment Error</h4>
          </div>
          
          <p className="text-red-300 text-sm">{error}</p>
          
          <button
            type="button"
            onClick={() => setError(null)}
            className="mt-2 text-red-300 hover:text-red-200 text-sm"
          >
            Dismiss
          </button>
        </div>
      )}
      <br/>

      {/* Payment Summary */}
      <div className="glass-card rounded-xl p-4 space-y-3">
        <div className="flex justify-between items-center">
          <span className="text-white/70">Donation Amount:</span>
          <span className="text-white font-bold text-xl">Rs.{amount.toLocaleString()}</span>
        </div>
        
        <div className="flex justify-between items-center">
          <span className="text-white/70">To Campaign:</span>
          <span className="text-teal-300 font-semibold text-right max-w-[200px] truncate">
            {campaign?.title || 'HerFund Campaign'}
          </span>
        </div>
        
        <div className="pt-3 border-t border-white/20">
          <div className="flex justify-between items-center">
            <span className="text-white/70">Total:</span>
            <span className="text-white font-bold text-2xl">Rs.{amount.toLocaleString()}</span>
          </div>
        </div>
      </div>
      <br/>

      {/* Action Buttons */}
      <div className="flex gap-3 pt-4">
        <button
          type="button"
          onClick={onCancel}
          disabled={loading || success}
          className="flex-1 glass-card text-white font-semibold rounded-full py-3 hover:bg-white/10 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Cancel
        </button>
        
        <button
          type="submit"
          disabled={!stripe || loading || success}
          className="flex-1 btn-primary text-white font-semibold rounded-full py-3 disabled:opacity-50 disabled:cursor-not-allowed"
          style={{ background: 'linear-gradient(135deg, #14b8a6 0%, #0d9488 100%)' }}
        >
          {loading ? (
            <div className="flex items-center justify-center gap-2">
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              Processing...
            </div>
          ) : success ? (
            <div className="flex items-center justify-center gap-2">
              <span className="text-green-300">✓</span>
              Payment Successful
            </div>
          ) : (
            `Pay Rs.${amount.toLocaleString()}`
          )}
        </button>
      </div>

      {/* Security Info */}
      <div className="text-center pt-4">
        <p className="text-white/40 text-xs">
          Powered by Stripe • PCI DSS compliant • Your card details are never stored on our servers
        </p>
      </div>
    </form>
  );
};

const PaymentGateway = () => {
  const location = useLocation();
  const navigate = useNavigate();
  
  const [donationDetails, setDonationDetails] = useState({
    amount: 500,
    campaign: null,
  });
  const [stripeError, setStripeError] = useState(null);

  useEffect(() => {
    // Check if Stripe is loaded
    stripePromise.then(stripe => {
      if (!stripe) {
        setStripeError('Payment system failed to load. Please refresh the page.');
      }
    });

    // Try to get from location state first
    if (location.state) {
      setDonationDetails({
        amount: location.state.amount || 500,
        campaign: location.state.campaign || null,
      });
    } else {
      // Fallback to session storage
      const savedAmount = sessionStorage.getItem('donationAmount');
      const savedCampaign = sessionStorage.getItem('selectedCampaign');
      
      try {
        setDonationDetails({
          amount: savedAmount ? parseInt(savedAmount) : 500,
          campaign: savedCampaign ? JSON.parse(savedCampaign) : null,
        });
      } catch (err) {
        console.error('Error parsing stored data:', err);
        navigate('/fundraising');
      }
    }
  }, [location, navigate]);

  const handleSuccess = (paymentIntent) => {
    console.log('Payment successful:', paymentIntent);
    // Clear session storage
    sessionStorage.removeItem('selectedCampaign');
    sessionStorage.removeItem('selectedCampaignId');
    sessionStorage.removeItem('donationAmount');
  };

  const handleCancel = () => {
    navigate('/fundraising');
  };

  const handleAmountChange = (newAmount) => {
    setDonationDetails(prev => ({
      ...prev,
      amount: newAmount
    }));
  };

  if (stripeError) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 to-teal-950">
        <div className="text-center max-w-md p-8 glass-card rounded-2xl">
          <div className="text-red-400 text-5xl mb-4">⚠</div>
          
          <h2 className="text-white text-2xl font-bold mb-4">Payment System Error</h2>
          
          <p className="text-white/70 mb-6">{stripeError}</p>
          
          <button
            onClick={() => window.location.reload()}
            className="btn-primary text-white font-semibold rounded-full px-6 py-3"
            style={{ background: 'linear-gradient(135deg, #14b8a6 0%, #0d9488 100%)' }}
          >
            Refresh Page
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full relative overflow-x-hidden flex flex-col items-center justify-center bg-gradient-to-br from-gray-900 to-teal-950 p-4">
      {/* Decorative Background */}
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
      </div>

      <div className="relative z-10 w-full max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div 
              className="w-12 h-12 rounded-xl flex items-center justify-center animate-pulse-glow"
              style={{ background: 'linear-gradient(135deg, #14b8a6 0%, #0d9488 100%)' }}
            >
              <span className="text-white text-2xl">💳</span>
            </div>
            
            <h1 className="text-white font-bold text-3xl">
              Secure <span className="gradient-text">Payment</span>
            </h1>
          </div>
          
          <p className="text-white/60">Complete your donation to make a difference</p>
        </div>

        {/* Main Payment Container */}
        <div 
          className="glass-card rounded-2xl sm:rounded-3xl p-6 sm:p-8 w-full"
          style={{
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.7), 0 0 0 1px rgba(255, 255, 255, 0.15)'
          }}
        >
          {/* Campaign Info */}
          {donationDetails.campaign && (
            <div className="mb-8 p-4 rounded-xl bg-gradient-to-r from-teal-500/10 to-teal-600/10 border border-teal-500/20">
              <div className="flex items-center gap-4">
                <div className="text-3xl">{donationDetails.campaign.image}</div>
                
                <div>
                  <h3 className="text-white font-bold text-lg">{donationDetails.campaign.title}</h3>
                  <p className="text-white/60 text-sm">Supporting menstrual health</p>
                </div>
              </div>
            </div>
          )}

          {/* Stripe Elements Provider */}
          <Elements stripe={stripePromise}>
            <CheckoutForm
              campaign={donationDetails.campaign}
              initialAmount={donationDetails.amount}
              onSuccess={handleSuccess}
              onCancel={handleCancel}
              onAmountChange={handleAmountChange}
            />
          </Elements>
          <br/>

          {/* Test Mode Banner */}
          <div className="mt-8 p-4 rounded-xl bg-yellow-500/10 border border-yellow-500/20">
            <div className="flex items-center gap-3">
              <span className="text-yellow-400 text-xl">⚠</span>
              
              <div>
                <h4 className="text-yellow-300 font-semibold mb-1">Test Mode</h4>
                <p className="text-yellow-400/70 text-sm">
                  Use test card: <code className="bg-black/30 px-2 py-1 rounded text-xs">4242 4242 4242 4242</code>
                </p>
              </div>
            </div>
          </div>
          <br/>

          {/* Payment Methods Info */}
          <div className="mt-6 pt-6 border-t border-white/20 justify-items-center">
            <h4 className="text-white/70 text-sm font-semibold mb-3">Accepted Payment Methods</h4>
            
            <div className="flex flex-wrap gap-2">
              <div className="glass-card rounded-lg p-2 px-3 text-sm text-white/70">Visa</div>
              <div className="glass-card rounded-lg p-2 px-3 text-sm text-white/70">Mastercard</div>
              <div className="glass-card rounded-lg p-2 px-3 text-sm text-white/70">American Express</div>
              <div className="glass-card rounded-lg p-2 px-3 text-sm text-white/70">Discover</div>
              <div className="glass-card rounded-lg p-2 px-3 text-sm text-white/70">RuPay</div>
            </div>
          </div>
        </div>
        <br/>

        {/* Back Button */}
        <button
          onClick={handleCancel}
          className="mt-6 text-white/60 hover:text-white transition-all flex items-center gap-2 mx-auto group"
        >
          <span className="group-hover:-translate-x-1 transition-transform">←</span>
          Back to Campaigns
        </button>
      </div>
    </div>
  );
};

export default PaymentGateway;