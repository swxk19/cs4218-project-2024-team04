const mongoose = require('mongoose');
const Category = require('./models/categoryModel');
const Product = require('./models/productModel');
const User = require('./models/userModel');
const Order = require('./models/orderModel');

// Import sample data
const categories = require('./sampleData/sampleCategories');
const products = require('./sampleData/sampleProducts');
const users = require('./sampleData/sampleUsers');
const orders = require('./sampleData/sampleOrders');

async function resetDatabase() {
  try {
    // Connect to the test database
    await mongoose.connect(process.env.TEST_DB_URL || 'mongodb://localhost:27017/testdb', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    // Clear existing collections
    await Category.deleteMany({});
    await Product.deleteMany({});
    await User.deleteMany({});
    await Order.deleteMany({});

    // Insert sample categories, products, and users
    await Category.insertMany(categories);
    const createdProducts = await Product.insertMany(products);
    const createdUsers = await User.insertMany(users);

    // Dynamically fill each order with different products and users
    const populatedOrders = orders.map((order, index) => ({
      ...order,
      products: [
        createdProducts[index % createdProducts.length]._id, // Assign different products in a loop
      ],
      buyer: createdUsers[index % createdUsers.length]._id, // Assign different users in a loop
    }));

    // Insert the populated orders into the database
    await Order.insertMany(populatedOrders);

    console.log('Test database reset and populated successfully.');
  } catch (error) {
    console.error('Error resetting the test database:', error);
  } finally {
    await mongoose.disconnect();
  }
}

resetDatabase();
