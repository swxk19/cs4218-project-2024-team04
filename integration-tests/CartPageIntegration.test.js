import mongoose from "mongoose";
import supertest from "supertest";
import app from "../server.js"; // Import the Express app from server.js
import Product from "../models/productModel.js";
import Category from "../models/categoryModel.js";

afterAll(async () => {
  await mongoose.connection.close();
})

describe("CartPage integration test", () => {
  test("User should be able to retrieve a valid client token and send a payment request", async () => {
    const clientTokenResponse = await supertest(app)
      .get("/api/v1/product/braintree/token")
      .expect(200);

    expect(clientTokenResponse.body.clientToken).toBeDefined();

    // Assume non-empty cart

    // const cart = products.slice(0, 2);

    // const paymentResponse = await supertest(app)
    //   .post("/api/v1/product/braintree/payment")
    //   .send({
    //     nonce: "nonce",
    //     cart: [],
    //   })
    //   .expect(200);
  });
});
