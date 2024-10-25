const { test, expect } = require("@playwright/test");

const baseUrl = "http://localhost:3000";
const pageTitle = "Virtual Vault";

const productNamesInFirstPage = [
  "Jeans",
  "Novel",
  "1",
  "T-shirt",
  "Smartphone",
  "The Law of Contract in Singapore",
];

const allProductNames = [...productNamesInFirstPage, "Laptop", "Textbook"];

const electronicsNames = ["Laptop", "Smartphone", "1"];

const bookNames = ["Novel", "Textbook", "The Law of Contract in Singapore"];

const clothingNames = ["Jeans", "T-shirt"];

const categoryNames = ["Electronics", "Book", "Clothing"];

test("User should be able to navigate to home page, apply filters and view filtered products, navigate to individual categories page, then navigate back to home page", async ({
  page,
}) => {
  await page.goto(baseUrl);

  await expect(page.getByText(pageTitle)).toBeVisible();

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
      case "Book":
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

  await page.getByPlaceholder("Enter Your Email ").fill("asdf@gmail.com");
  await page.getByPlaceholder("Enter Your Password").click();
  await page.getByPlaceholder("Enter Your Password").fill("asdf");
  await page.getByRole("button", { name: "LOGIN" }).click();

  await expect(page.getByRole("link", { name: "Categories" })).toBeVisible();
  await expect(page.getByPlaceholder("Search")).toBeVisible();
  await expect(page.getByRole("button", { name: "Search" })).toBeVisible();
  await expect(page.getByRole("link", { name: "Home" })).toBeVisible();
  await expect(page.getByRole("link", { name: "Register" })).toBeVisible();
  await expect(page.getByRole("link", { name: "Login" })).not.toBeVisible();
  await expect(page.getByRole("button", { name: "asdf" })).toBeVisible();
  await expect(page.getByRole("link", { name: "Cart" })).toBeVisible();
});

test("User should be able to view product details, add/remove product to/from cart, and login to proceed to checkout", async ({
  page,
}) => {
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
    page.getByText("The Law of Contract in Singapore")
  ).toBeVisible();

  await expect(page.getByText("Jeans", { exact: true })).toBeVisible();

  await page.getByRole("button", { name: "Remove" }).first().click();

  await expect(
    page.getByText("The Law of Contract in Singapore")
  ).not.toBeVisible();

  await expect(page.getByText("Jeans", { exact: true })).toBeVisible();

  await page.getByRole("button", { name: "Plase Login to checkout" }).click();

  await expect(page.getByRole("heading", { name: "LOGIN FORM" })).toBeVisible();

  await page.getByPlaceholder("Enter Your Email ").fill("asdf@gmail.com");
  await page.getByPlaceholder("Enter Your Password").click();
  await page.getByPlaceholder("Enter Your Password").fill("asdf");
  await page.getByRole("button", { name: "LOGIN" }).click();

  await page.getByRole("link", { name: "Cart" }).click();

  await expect(
    page.getByRole("button", { name: "Make Payment" })
  ).toBeVisible();
});
