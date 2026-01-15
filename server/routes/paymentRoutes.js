// backend/routes/paymentRoutes.js
const express = require('express');
const router = express.Router();
const Stripe = require('stripe');

// Initialize Stripe with YOUR secret key
const stripe = new Stripe('sk_test_51Sohz3HEwvbtqHzUuV4TF924emk7sIbNJ9lcsADvwaWUqi6wiicdmbcExTHUKUY3S1b8qRUgCMI4HJ1FDQ8B4FVI0077r9FXTz');

// Create payment intent
router.post('/create-payment-intent', async (req, res) => {
  try {
    const { amount, currency = 'inr', campaignId, campaignName } = req.body;

    console.log('Creating payment intent for:', {
      amount,
      currency,
      campaignId,
      campaignName
    });

    // Validate amount
    if (!amount || amount < 100) { // Minimum Rs.1
      return res.status(400).json({
        success: false,
        error: 'Amount must be at least Rs.1'
      });
    }

    // Create a PaymentIntent with the order amount and currency
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount), // Amount in smallest currency unit (paise)
      currency: currency.toLowerCase(),
      metadata: {
        campaign_id: campaignId || 'unknown',
        campaign_name: campaignName || 'HerFund Donation',
        timestamp: new Date().toISOString(),
      },
      description: `Donation for ${campaignName || 'HerFund Campaign'}`,
      shipping: {
        name: 'Digital Delivery',
        address: {
          line1: 'Colombo',
          city: 'Colombo',
          state: 'Western',
          country: 'LK',
          postal_code: '00100'
        }
      },
      // For testing, you can add automatic confirmation
      confirmation_method: 'manual',
      confirm: false,
    });

    console.log('PaymentIntent created:', paymentIntent.id);

    res.json({
      success: true,
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
      amount: paymentIntent.amount / 100,
      currency: paymentIntent.currency,
      status: paymentIntent.status,
    });
  } catch (error) {
    console.error('Error creating payment intent:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      type: error.type,
      code: error.code,
    });
  }
});

// Confirm payment intent
router.post('/confirm-payment', async (req, res) => {
  try {
    const { paymentIntentId, paymentMethodId } = req.body;

    const paymentIntent = await stripe.paymentIntents.confirm(paymentIntentId, {
      payment_method: paymentMethodId,
      return_url: `${req.headers.origin}/donation-success`,
    });

    res.json({
      success: true,
      paymentIntent,
    });
  } catch (error) {
    console.error('Error confirming payment:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

// Save donation to database
router.post('/save-donation', async (req, res) => {
  try {
    const {
      paymentIntentId,
      amount,
      currency,
      status,
      campaignId,
      donorName,
      donorEmail,
      donorPhone,
      paymentMethod,
      metadata,
    } = req.body;

    console.log('Saving donation to database:', {
      paymentIntentId,
      amount,
      campaignId,
      donorName,
      donorEmail: donorEmail ? `${donorEmail.substring(0, 3)}...` : 'none',
      status,
    });

    // Here you would save to your actual database
    // For now, we'll simulate saving to a file or console
    
    const donationRecord = {
      id: paymentIntentId,
      amount,
      currency,
      status,
      campaignId,
      donorName,
      donorEmail,
      donorPhone,
      paymentMethod,
      metadata,
      timestamp: new Date().toISOString(),
      processedAt: new Date().toISOString(),
    };

    // Log the donation (in production, save to MongoDB/PostgreSQL)
    console.log('Donation saved:', JSON.stringify(donationRecord, null, 2));

    // Simulate database save
    // await saveToDatabase(donationRecord);

    res.json({
      success: true,
      message: 'Donation saved successfully',
      donationId: paymentIntentId,
      timestamp: new Date().toISOString(),
      data: {
        amount,
        donorName,
        campaignId,
        status,
      }
    });
  } catch (error) {
    console.error('Error saving donation:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

// Get payment intent status
router.get('/payment-status/:paymentIntentId', async (req, res) => {
  try {
    const { paymentIntentId } = req.params;

    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

    res.json({
      success: true,
      paymentIntent,
    });
  } catch (error) {
    console.error('Error fetching payment status:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

// Webhook endpoint for Stripe events (optional for now)
router.post('/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;

  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET || 'whsec_test'
    );
  } catch (err) {
    console.error('Webhook signature verification failed:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Handle the event
  switch (event.type) {
    case 'payment_intent.succeeded':
      const paymentIntent = event.data.object;
      console.log('PaymentIntent was successful:', paymentIntent.id);
      // Update your database here
      break;
      
    case 'payment_intent.payment_failed':
      const failedPaymentIntent = event.data.object;
      console.log('PaymentIntent failed:', failedPaymentIntent.id);
      // Update your database here
      break;
      
    default:
      console.log(`Unhandled event type ${event.type}`);
  }

  res.json({ received: true });
});

// Test endpoint
router.get('/test', (req, res) => {
  res.json({
    success: true,
    message: 'Payment API is working',
    timestamp: new Date().toISOString(),
    stripe: 'Connected with test key',
  });
});

module.exports = router;