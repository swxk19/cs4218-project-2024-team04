import mongoose from "mongoose";
import supertest from "supertest";
import app from "../server.js"; // Import the Express app from server.js
import Product from "../models/productModel.js";
import Category from "../models/categoryModel.js";
import { describe } from "node:test";

const categories = [
  {
    name: "Electronics",
    slug: "electronics",
  },
  {
    name: "Clothing",
    slug: "clothing",
  },
  {
    name: "Books",
    slug: "books",
  },
];

const products = [
  {
    name: "Laptop",
    slug: "laptop",
    description: "Awesome laptop",
    price: 1000,
    category: "Electronics",
    quantity: 10,
    shipping: true,
  },
  {
    name: "Phone",
    slug: "phone",
    description: "Awesome Phone",
    price: 300,
    category: "Electronics",
    quantity: 10,
    shipping: true,
  },
  {
    name: "Good book",
    slug: "good_book",
    description: "Awesome book",
    price: 10,
    category: "Books",
    quantity: 10,
    shipping: true,
  },
  {
    name: "Shirt",
    slug: "shirt",
    description: "Awesome shirt",
    price: 30,
    category: "Clothing",
    quantity: 10,
    shipping: true,
  },
  {
    name: "Jeans",
    slug: "jeans",
    description: "Awesome jeans",
    price: 50,
    category: "Clothing",
    quantity: 100,
    shipping: true,
  },
  {
    name: "Story book",
    slug: "story_book",
    description: "Awesome story book",
    price: 5,
    category: "Books",
    quantity: 10,
    shipping: true,
  },
];

// Setup and teardown for the database
beforeAll(async () => {
  await mongoose.connection.db.collection("categories").deleteMany({});
  await mongoose.connection.db.collection("products").deleteMany({});
  await Category.insertMany(categories);
  const c = await Category.find({});
  const p = products.map((product) => {
    // const category = await Category.findOne({ name: product.category }).exec();
    // console.log(category);
    const category = c.find((category) => category.name === product.category);
    return {
      ...product,
      category: category._id.toString(),
    };
  });
  await Product.insertMany(p);
});

afterAll(async () => {
  await mongoose.connection.db.collection("categories").deleteMany({});
  await mongoose.connection.db.collection("products").deleteMany({});
  await mongoose.connection.close();
});

describe("Categories integration test", () => {
  test("User should be able to view products in each category page", async () => {
    const categories = await Category.find({});
    const categorySlugs = [];

    for (var i = 0; i < categories.length; i++) {
      const category = categories[i];
      categorySlugs.push(category.slug);
    }

    for (var i = 0; i < categorySlugs.length; i++) {
      const response = await supertest(app)
        .get(`/api/v1/product/product-category/${categorySlugs[i]}`)
        .expect(200);

      expect(response.body.products).toBeDefined();
      expect(response.body.products).toHaveLength(2);
      expect(response.body.category.slug).toBe(categorySlugs[i]);

      for (var j = 0; j < response.body.products.length; j++) {
        const product = response.body.products[j];
        expect(product.category.slug).toBe(categorySlugs[i]);
      }
    }
  });
});
