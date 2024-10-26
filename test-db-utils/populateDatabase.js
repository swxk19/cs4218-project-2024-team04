import mongoose from 'mongoose';
import Category from '../models/categoryModel.js';
import Product from '../models/productModel.js';
import Order from '../models/orderModel.js';
import User from '../models/userModel.js';
import { hashPassword } from '../helpers/authHelper.js'; // Import the hashPassword function

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

// Function to populate the database
export const populateDatabase = async () => {
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
    const categoryMap = new Map(createdCategories.map(cat => [cat.name, cat._id]));

    // Hash passwords and populate users
    const usersWithHashedPasswords = await Promise.all(users.map(async (user) => {
      const hashedPassword = await hashPassword(user.password);
      return {
        ...user,
        password: hashedPassword, // Replace plain password with hashed password
      };
    }));

    const createdUsers = await User.insertMany(usersWithHashedPasswords);
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

    const productMap = new Map(createdProducts.map(prod => [prod.name, prod._id]));

    // Populate orders
    await Promise.all(orders.map(async (order) => {
      const buyerId = userMap.get(order.buyerEmail);
      if (!buyerId) {
        throw new Error(`Buyer not found for email: ${order.buyerEmail} (Transaction ID: ${order.payment.transactionId})`);
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
    console.error('Error during database population:', error);
  } finally {
    await mongoose.disconnect(); // Ensure the database connection is closed
  }
};
