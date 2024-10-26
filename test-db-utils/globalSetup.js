import mongoose from 'mongoose';
import Category from '../models/categoryModel.js';
import Product from '../models/productModel.js';
import Order from '../models/orderModel.js';
import User from '../models/userModel.js';

// Import sample data
import categories from './sample-data/sampleCategories.js';
import products from './sample-data/sampleProducts.js';
import users from './sample-data/sampleUsers.js';
import orders from './sample-data/sampleOrders.js';

// Function to download images
async function downloadImage(url) {
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to download image. Status: ${response.status}`);
    }

    const contentType = response.headers.get('content-type');
    const data = await response.arrayBuffer();

    return {
      data: Buffer.from(data),
      contentType: contentType,
    };
  } catch (error) {
    console.error(`Error downloading image from ${url}:`, error);
    return null;
  }
}

// Global setup function for Playwright
export default async function globalSetup() {
  try {
    // Connect to the database
    await mongoose.connect(process.env.MONGO_TEST_URL, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    // Clear existing data
    await Category.deleteMany({});
    await Product.deleteMany({});
    await User.deleteMany({});
    await Order.deleteMany({});

    // Populate categories
    const createdCategories = await Category.insertMany(categories);
    console.log('Categories created:', createdCategories);

    // Create a map of category names to their IDs
    const categoryMap = new Map(createdCategories.map(cat => [cat.name, cat._id]));

    // Populate users
    const createdUsers = await User.insertMany(users);
    console.log('Users created:', createdUsers);

    // Create a map of user emails to their IDs for easy reference
    const userMap = new Map(createdUsers.map(user => [user.email, user._id]));

    // Populate products with downloaded images
    const createdProducts = await Promise.all(products.map(async (product) => {
      const categoryId = categoryMap.get(product.category);
      if (!categoryId) {
        throw new Error(`Category not found for product: ${product.name}`);
      }

      const photo = await downloadImage(product.imageUrl);

      const newProduct = new Product({
        ...product,
        category: categoryId,
        photo: photo || { data: Buffer.alloc(0), contentType: 'image/jpeg' },
      });
      return await newProduct.save();
    }));

    // Create a map of product names to their IDs for easy order referencing
    const productMap = new Map(createdProducts.map(prod => [prod.name, prod._id]));

    // Populate orders
    const populatedOrders = await Promise.all(orders.map(async (order) => {
      const buyerId = userMap.get(order.buyerEmail); // Use buyer email to match user
      if (!buyerId) {
        throw new Error(`Buyer not found for order with transaction ID: ${order.payment.transactionId}`);
      }

      const productIds = order.productNames.map(name => productMap.get(name)).filter(id => id);
      if (productIds.length !== order.productNames.length) {
        throw new Error(`Some products not found for order with transaction ID: ${order.payment.transactionId}`);
      }

      const newOrder = new Order({
        ...order,
        buyer: buyerId,
        products: productIds,
      });
      return await newOrder.save();
    }));


    console.log('Database population completed successfully.');
  } catch (error) {
    console.error('Error during global setup:', error);
  } finally {
    mongoose.disconnect(); // Leave the database connection open for tests
  }
}
