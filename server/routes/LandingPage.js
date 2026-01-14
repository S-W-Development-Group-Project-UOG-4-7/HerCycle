// routes/landingPage.js
const express = require('express');
const router = express.Router();
const LandingPage = require('../models/landingPage');

// Default data remains the same...

// GET landing page data - Public
router.get('/', async (req, res) => {
  try {
    console.log('Fetching landing page data...');
    
    let landingPage = await LandingPage.findOne();
    
    if (!landingPage) {
      console.log('No data found. Creating with default data...');
      landingPage = new LandingPage(defaultData);
      await landingPage.save();
      console.log('Default data saved to database');
    }
    
    res.json({
      success: true,
      data: landingPage
    });
    
  } catch (error) {
    console.error('Error in GET /:', error);
    
    res.json({
      success: true,
      data: defaultData,
      message: 'Using default data (database error)'
    });
  }
});

// GET landing page data for admin - With all details
router.get('/admin', async (req, res) => {
  try {
    let landingPage = await LandingPage.findOne();
    
    if (!landingPage) {
      landingPage = new LandingPage(defaultData);
      await landingPage.save();
    }
    
    res.json({
      success: true,
      data: landingPage
    });
    
  } catch (error) {
    console.error('Error in GET /admin:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch admin data',
      error: error.message
    });
  }
});

// UPDATE landing page data - Admin
router.put('/admin', async (req, res) => {
  try {
    console.log('Updating landing page data...');
    
    const updateData = req.body;
    
    let landingPage = await LandingPage.findOne();
    
    if (!landingPage) {
      landingPage = new LandingPage(updateData);
    } else {
      // Update all fields
      landingPage.hero = updateData.hero || landingPage.hero;
      landingPage.about = updateData.about || landingPage.about;
      landingPage.mission = updateData.mission || landingPage.mission;
      landingPage.contact = updateData.contact || landingPage.contact;
      landingPage.footer = updateData.footer || landingPage.footer;
      landingPage.features = updateData.features || landingPage.features;
      landingPage.stats = updateData.stats || landingPage.stats;
    }
    
    await landingPage.save();
    
    console.log('Data updated successfully');
    
    res.json({
      success: true,
      message: 'Landing page updated successfully',
      data: landingPage
    });
    
  } catch (error) {
    console.error('Error in PUT /admin:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update landing page',
      error: error.message
    });
  }
});

module.exports = router;