import { test, expect } from "@playwright/test";

import { populateDatabase } from "../../test-db-utils/populateDatabase.js";
import { cleanupDatabase } from "../../test-db-utils/cleanupDatabase.js";

import products from "../../test-db-utils/sample-data/sampleProducts.js";
import categories from "../../test-db-utils/sample-data/sampleCategories.js";

import { getSampleUsers } from "../../test-db-utils/sample-data/sampleUsers.js";

test.beforeEach(async () => {
  await populateDatabase();
});

test.afterEach(async () => {
  await cleanupDatabase();
});

const baseUrl = "http://localhost:3000";
const pageTitle = "Virtual Vault";

var productNamesInFirstPage = [
  "Jeans",
  "Novel",
  "Laptop",
  "Jacket",
  "Smartphone",
  "Earphone",
];

productNamesInFirstPage = products
  .map((product) => product.name)
  .sort()
  .slice(0, 6);

var allProductNames = [...productNamesInFirstPage, "T-shirt", "Textbook"];

allProductNames = products.map((product) => product.name);

var electronicsNames = ["Laptop", "Smartphone", "Earphone"];

electronicsNames = products
  .filter((product) => product.category === "Electronics")
  .map((product) => product.name);

var bookNames = ["Novel", "Textbook"];

bookNames = products
  .filter((product) => product.category === "Books")
  .map((product) => product.name);

var clothingNames = ["Jeans", "T-shirt", "Jacket"];

clothingNames = products
  .filter((product) => product.category === "Clothing")
  .map((product) => product.name);

var categoryNames = ["Electronics", "Books", "Clothing"];

categoryNames = categories.map((category) => category.name);

async function fetchUser() {
  const users = await getSampleUsers();
  const nonAdminUser = users[0].find((user) => user.role === 0);
  const email = nonAdminUser.email;
  const password = users[1][email];
  const name = nonAdminUser.name;
  return { email, password, name };
}

test("User should be able to navigate to home page, apply filters and view filtered products, navigate to individual categories page, then navigate back to home page", async ({
  page,
}) => {
  await page.goto(baseUrl);

  await expect(page.getByText(pageTitle)).toBeVisible();

  console.log(productNamesInFirstPage);
  console.log(allProductNames.sort());

  // Check if all products in first page is visible

  for (var i = 0; i < productNamesInFirstPage.length; i++) {
    const productName = productNamesInFirstPage[i];
    console.log("productName: ", productName);
    await expect(
      page.getByRole("heading", { name: productName, exact: true })
    ).toBeVisible();
  }

  await page.getByRole("checkbox", { name: "Electronics" }).click();

  // Check that products are visible according to filter

  for (var i = 0; i < electronicsNames.length; i++) {
    const electronicsName = electronicsNames[i];
    await expect(
      page.getByRole("heading", { name: electronicsName, exact: true })
    ).toBeVisible();
  }

  // Check that filtered products are not visible

  for (var i = 0; i < allProductNames.length; i++) {
    const productName = allProductNames[i];
    if (!electronicsNames.includes(productName)) {
      expect(
        page.getByRole("heading", { name: productName, exact: true })
      ).not.toBeVisible();
    }
  }

  await page.getByRole("checkbox", { name: "Electronics" }).click();

  await page.getByRole("checkbox", { name: "Book" }).click();

  await page.getByRole("radio", { name: "$0 to 19" }).click();

  // Check that product is visible according to applied category and price filter

  await expect(
    page.getByRole("heading", { name: "Novel", exact: true })
  ).toBeVisible();

  // Check that filtered products are not visible

  for (var i = 0; i < bookNames.length; i++) {
    const bookName = bookNames[i];
    if (bookName !== "Novel") {
      expect(
        page.getByRole("heading", { name: bookName, exact: true })
      ).not.toBeVisible();
    }
  }

  await page.getByRole("button", { name: "RESET FILTERS" }).click();

  // Check that all products in the first page are visible after resetting filters

  for (var i = 0; i < productNamesInFirstPage.length; i++) {
    const productName = productNamesInFirstPage[i];
    await expect(
      page.getByRole("heading", { name: productName, exact: true })
    ).toBeVisible();
  }

  // Navigate to all categories page and check if all category buttons are visible

  await page.getByRole("link", { name: "Categories" }).click();
  await page.getByRole("link", { name: "All Categories" }).click();

  for (var i = 0; i < categoryNames.length; i++) {
    const category = categoryNames[i];
    await expect(page.getByRole("link", { name: category })).toBeVisible();
  }

  // Navigate to each category page and check if products are displayed correctly

  for (var i = 0; i < categoryNames.length; i++) {
    const category = categoryNames[i];
    await page.getByRole("link", { name: "Categories" }).click();
    await page
      .locator("#navbarTogglerDemo01")
      .getByRole("link", { name: category })
      .click();
    var products = [];
    switch (category) {
      case "Electronics":
        products = electronicsNames;
      case "Books":
        products = bookNames;
      case "Clothing":
        products = clothingNames;
      default:
        products = [];
    }
    for (var i = 0; i < products.length; i++) {
      const productName = products[i];
      await expect(
        page.getByRole("heading", { name: productName, exact: true })
      ).toBeVisible();
    }

    // Check that filtered products are not visible

    for (var i = 0; i < allProductNames.length; i++) {
      const productName = allProductNames[i];
      if (!products.includes(productName)) {
        expect(
          page.getByRole("heading", { name: productName, exact: true })
        ).not.toBeVisible();
      }
    }
  }

  // Navigate back to home page and check that all products in first page are visible

  await page.getByRole("link", { name: "Home" }).click();

  for (var i = 0; i < productNamesInFirstPage.length; i++) {
    const productName = productNamesInFirstPage[i];
    console.log("productName: ", productName);
    await expect(
      page.getByRole("heading", { name: productName, exact: true })
    ).toBeVisible();
  }
});

test("User should be able to access all buttons in navigation bar, and content of navigation bar should be rendered differently according to login status", async ({
  page,
}) => {
  const user = await fetchUser();
  const email = user.email;
  const password = user.password;
  const name = user.name;
  await page.goto(baseUrl);

  await expect(page.getByRole("link", { name: "Categories" })).toBeVisible();
  await expect(page.getByPlaceholder("Search")).toBeVisible();
  await expect(page.getByRole("button", { name: "Search" })).toBeVisible();
  await expect(page.getByRole("link", { name: "Home" })).toBeVisible();
  await expect(page.getByRole("link", { name: "Register" })).toBeVisible();
  await expect(page.getByRole("link", { name: "Login" })).toBeVisible();
  await expect(page.getByRole("link", { name: "Cart" })).toBeVisible();

  await page.getByPlaceholder("Search").fill("Novel");

  expect(
    page.getByRole("heading", { name: "Novel", exact: true })
  ).toBeVisible();

  await page.getByRole("link", { name: "Home" }).click();

  for (var i = 0; i < productNamesInFirstPage.length; i++) {
    const productName = productNamesInFirstPage[i];
    await expect(
      page.getByRole("heading", { name: productName, exact: true })
    ).toBeVisible();
  }

  await page.getByRole("link", { name: "Register" }).click();

  await expect(
    page.getByRole("heading", { name: "REGISTER FORM" })
  ).toBeVisible();

  await page.getByRole("link", { name: "Home" }).click();

  await page.getByRole("link", { name: "Login" }).click();

  await expect(page.getByRole("heading", { name: "LOGIN FORM" })).toBeVisible();

  await page.getByRole("link", { name: "Home" }).click();

  await page.getByRole("link", { name: "Cart" }).click();

  await expect(
    page.getByRole("heading", { name: "Cart Summary" })
  ).toBeVisible();

  await page.getByRole("link", { name: "Login" }).click();

  await page.getByPlaceholder("Enter Your Email ").fill(email);
  await page.getByPlaceholder("Enter Your Password").click();
  await page.getByPlaceholder("Enter Your Password").fill(password);
  await page.getByRole("button", { name: "LOGIN" }).click();

  await expect(page.getByRole("link", { name: "Categories" })).toBeVisible();
  await expect(page.getByPlaceholder("Search")).toBeVisible();
  await expect(page.getByRole("button", { name: "Search" })).toBeVisible();
  await expect(page.getByRole("link", { name: "Home" })).toBeVisible();
  await expect(page.getByRole("link", { name: "Register" })).toBeVisible();
  await expect(page.getByRole("link", { name: "Login" })).not.toBeVisible();
  await expect(page.getByRole("button", { name: name })).toBeVisible();
  await expect(page.getByRole("link", { name: "Cart" })).toBeVisible();
});

test("User should be able to view product details, add/remove product to/from cart, and login to proceed to checkout", async ({
  page,
}) => {
  const user = await fetchUser();
  const email = user.email;
  const password = user.password;
  const name = user.name;

  await page.goto(baseUrl);

  await page.locator(".card-name-price > button").first().click();

  expect(page.getByRole("heading", { name: "Product Details" })).toBeVisible();

  await page.getByRole("link", { name: "Home" }).click();

  await page.locator(".card-name-price > button:nth-child(2)").first().click();

  await page
    .locator(
      "div:nth-child(3) > .card-body > div:nth-child(3) > button:nth-child(2)"
    )
    .click();

  await page.getByRole("link", { name: "Cart" }).click();

  await expect(
    page.getByRole("heading", { name: "Cart Summary" })
  ).toBeVisible();

  await expect(
    page.getByText(productNamesInFirstPage[0], { exact: true })
  ).toBeVisible();

  await expect(
    page.getByText(productNamesInFirstPage[2], { exact: true })
  ).toBeVisible();

  await page.getByRole("button", { name: "Remove" }).first().click();

  await expect(
    page.getByText(productNamesInFirstPage[0], { exact: true })
  ).not.toBeVisible();

  await expect(
    page.getByText(productNamesInFirstPage[2], { exact: true })
  ).toBeVisible();

  await page.getByRole("button", { name: "Plase Login to checkout" }).click();

  await expect(page.getByRole("heading", { name: "LOGIN FORM" })).toBeVisible();

  await page.getByPlaceholder("Enter Your Email ").fill(email);
  await page.getByPlaceholder("Enter Your Password").click();
  await page.getByPlaceholder("Enter Your Password").fill(password);
  await page.getByRole("button", { name: "LOGIN" }).click();

  await page.getByRole("link", { name: "Cart" }).click();

  await expect(
    page.getByRole("button", { name: "Make Payment" })
  ).toBeVisible();
});
