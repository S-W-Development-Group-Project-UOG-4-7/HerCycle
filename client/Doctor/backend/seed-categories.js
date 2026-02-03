// Optional seed script to create default categories
// Run this after setting up the backend: node seed-categories.js

const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();

const categorySchema = new mongoose.Schema({
  name: String,
  slug: String,
  description: String,
  color: String,
  isActive: Boolean,
  createdAt: Date
});

const Category = mongoose.model('Category', categorySchema);

const defaultCategories = [
  {
    name: 'Period Health',
    description: 'Articles about menstrual health, cycle tracking, and period care',
    color: '#ec4899',
    isActive: true
  },
  {
    name: 'Sex Education',
    description: 'Comprehensive sex education and reproductive health information',
    color: '#8b5cf6',
    isActive: true
  },
  {
    name: 'Reproductive Health',
    description: 'Information about reproductive system and health',
    color: '#10b981',
    isActive: true
  },
  {
    name: 'Menstrual Hygiene',
    description: 'Best practices for menstrual hygiene and product information',
    color: '#3b82f6',
    isActive: true
  },
  {
    name: 'Pregnancy & Fertility',
    description: 'Guidance on pregnancy, conception, and fertility',
    color: '#f59e0b',
    isActive: true
  },
  {
    name: 'Hormonal Health',
    description: 'Understanding hormones and their impact on health',
    color: '#06b6d4',
    isActive: true
  },
  {
    name: 'Mental Wellness',
    description: 'Mental health during menstrual cycle and hormonal changes',
    color: '#6366f1',
    isActive: true
  },
  {
    name: 'Nutrition & Diet',
    description: 'Nutritional advice for menstrual and reproductive health',
    color: '#ef4444',
    isActive: true
  }
];

const seedCategories = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Clear existing categories (optional)
    // await Category.deleteMany({});

    // Add slug to each category
    const categoriesWithSlug = defaultCategories.map(cat => ({
      ...cat,
      slug: cat.name.toLowerCase().replace(/\s+/g, '-'),
      createdAt: new Date()
    }));

    await Category.insertMany(categoriesWithSlug);
    console.log('Default categories created successfully!');

    mongoose.connection.close();
  } catch (error) {
    console.error('Error seeding categories:', error);
    process.exit(1);
  }
};

seedCategories();
