// tests/globalSetup.js
import mongoose from 'mongoose';
import dotenv from 'dotenv';

// Load environment variables from .env.ui-test
dotenv.config({ path: '.env.ui-test' });

// Import models
import User from '../models/userModel.js';
import Product from '../models/productModel.js';
import Order from '../models/orderModel.js';
import Category from '../models/categoryModel.js';

// Import sample data
import users from '../test-db-utils/sample-data/sampleUsers.js';
import products from '../test-db-utils/sample-data/sampleProducts.js';
import categories from '../test-db-utils/sample-data/sampleCategories.js';
import orders from '../test-db-utils/sample-data/sampleOrders.js';

const globalSetup = async () => {
  // Connect to the database without deprecated options
  await mongoose.connect(process.env.MONGO_TEST_URL);

  // Clear existing data
  await User.deleteMany({});
  await Product.deleteMany({});
  await Category.deleteMany({});
  await Order.deleteMany({});

  // Insert categories and create a mapping of category names to their ObjectIds
  const insertedCategories = await Category.insertMany(categories);
  const categoryMap = insertedCategories.reduce((acc, category) => {
    acc[category.name] = category._id;
    return acc;
  }, {});

  // Insert users
  const insertedUsers = await User.insertMany(users);

  // Update products with ObjectId references for categories, and log any missing categories
  const updatedProducts = products.map(product => {
    const categoryId = categoryMap[product.category];
    if (!categoryId) {
      console.warn(`Category "${product.category}" not found in categories. Make sure it exists in sampleCategories.js.`);
    }
    return {
      ...product,
      category: categoryId, // Convert category name to ObjectId (or undefined if not found)
    };
  });

  // Insert updated products, filter out any products with missing categories
  const insertedProducts = await Product.insertMany(updatedProducts.filter(product => product.category));

  // Update orders with references to user IDs and product IDs if needed
  const userMap = insertedUsers.reduce((acc, user) => {
    acc[user.email] = user._id;
    return acc;
  }, {});

  const updatedOrders = orders.map(order => ({
    ...order,
    buyer: userMap[order.buyerEmail], // Map buyerEmail to user ID
    products: insertedProducts.slice(0, 2).map(product => product._id), // Use first 2 products for each order
  }));

  // Insert updated orders
  await Order.insertMany(updatedOrders);

  console.log('Database populated with sample data for tests');

  // Disconnect from the database
  await mongoose.disconnect();
};

export default globalSetup;
