// models/LandingPage.js
const mongoose = require('mongoose');

const featureSchema = new mongoose.Schema({
  icon: String,
  title: String,
  description: String
});

const statSchema = new mongoose.Schema({
  number: String,
  label: String
});

const landingPageSchema = new mongoose.Schema({
  hero: {
    badgeText: String,
    mainHeading: String,
    subheading: String
  },
  about: {
    title: String,
    description1: String,
    description2: String
  },
  mission: {
    title: String,
    description: String
  },
  contact: {
    title: String,
    description: String
  },
  footer: {
    tagline: String,
    supportEmail: String,
    socialLinks: [{
      name: String,
      icon: String,
      color: String,
      url: String
    }]
  },
  features: [featureSchema],
  stats: [statSchema]
}, {
  timestamps: true
});

// Create and export the model
const LandingPage = mongoose.model('LandingPage', landingPageSchema);

module.exports = LandingPage;