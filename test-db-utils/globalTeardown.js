// tests/globalTeardown.js
import mongoose from 'mongoose';
import dotenv from 'dotenv';

// Load environment variables from .env.ui-test
dotenv.config({ path: '.env.ui-test' });

// Import models
import User from '../models/userModel.js';
import Category from '../models/categoryModel.js';
import Order from '../models/orderModel.js';
import Product from '../models/productModel.js';

const globalTeardown = async () => {
  // Connect to the database
  await mongoose.connect(process.env.MONGO_TEST_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });

  // Clear each collection after tests
  await User.deleteMany({});
  await Category.deleteMany({});
  await Order.deleteMany({});
  await Product.deleteMany({});

  console.log('Database cleaned up after tests');

  // Disconnect from the database
  await mongoose.disconnect();
};

export default globalTeardown;
