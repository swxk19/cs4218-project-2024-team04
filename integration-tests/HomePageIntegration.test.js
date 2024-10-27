import mongoose from "mongoose";
import supertest from "supertest";
import app from "../server.js"; // Import the Express app from server.js
import Product from "../models/productModel.js";
import Category from "../models/categoryModel.js";

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
  {
    name: "Jacket",
    slug: "jacket",
    description: "Awesome jacket",
    price: 150,
    category: "Clothing",
    quantity: 100,
    shipping: true,
  },
  {
    name: "Documentary book",
    slug: "documentary_book",
    description: "Awesome documentary book",
    price: 15,
    category: "Books",
    quantity: 4,
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

describe("HomePage integration test", () => {
  test("User should be able to fetch all products in first page and categories from the database", async () => {
    const firstPageProductsLimit = 6;

    const categoryResponse = await supertest(app)
      .get("/api/v1/category/get-category") // Adjust the endpoint to match your routes
      .expect(200);

    // Assert for fetched categories
    expect(categoryResponse.body.success).toBe(true);

    const fetchedCategories = categoryResponse.body.category;

    expect(fetchedCategories).toHaveLength(3);
    expect(fetchedCategories[0].name).toBe("Electronics");
    expect(fetchedCategories[1].name).toBe("Clothing");
    expect(fetchedCategories[2].name).toBe("Books");

    const productCountResponse = await supertest(app)
      .get("/api/v1/product/product-count")
      .expect(200);

    // Assert for total product count

    expect(productCountResponse.body.total).toBe(8);

    const productResponse = await supertest(app)
      .get("/api/v1/product/product-list/1")
      .expect(200);

    const actualProducts = await Product.find({});

    const productNames = actualProducts.map((product) => product.name);

    // Assert for fetched products

    expect(productResponse.body.products).toHaveLength(6);
    for (var i = 0; i < firstPageProductsLimit; i++) {
      expect(productNames).toContainEqual(
        productResponse.body.products[i].name
      );
    }
  });

  test("User should be able to view filtered products according to applied filters", async () => {
    const categories = await Category.find({});
    const electronicsCategory = categories.find(
      (category) => category.name === "Electronics"
    );
    const filters = {
      radio: [],
      checked: [electronicsCategory._id],
    };
    const filterResponse = await supertest(app)
      .post("/api/v1/product/product-filters")
      .send(filters)
      .expect(200);

    expect(filterResponse.body.products).toHaveLength(2);

    const electronics = await Product.find({
      category: electronicsCategory._id,
    }).exec();

    const electronicsNames = electronics.map((product) => product.name);

    for (var i = 0; i < electronics.length; i++) {
      expect(electronicsNames).toContainEqual(
        filterResponse.body.products[i].name
      );
    }
  });

  test("User should be able to view all products over the first page after pressing the load more button", async () => {
    const firstPageProductResponse = await supertest(app)
      .get("/api/v1/product/product-list/1")
      .expect(200);

    expect(firstPageProductResponse.body.products).toHaveLength(6);

    const secondPageProductResponse = await supertest(app)
      .get("/api/v1/product/product-list/2")
      .expect(200);

    expect(secondPageProductResponse.body.products).toHaveLength(2);
  });
});
