import { jest } from "@jest/globals";
import React from "react";
import axios from "axios";
import { render } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import Categories from "./Categories";
import "../hooks/useCategory";
import "@testing-library/jest-dom";
import { act } from "@testing-library/react";

import useCategory from "../hooks/useCategory";
import { productModel } from "./TestModels";
import CategoryProduct from "./CategoryProduct";

jest.mock("../context/auth", () => ({
  useAuth: jest.fn(() => [null, jest.fn()]), // Mock useAuth hook to return null state and a mock function for setAuth
}));

jest.mock("../context/cart", () => ({
  useCart: jest.fn(() => [null, jest.fn()]), // Mock useCart hook to return null state and a mock function
}));

jest.mock("../context/search", () => ({
  useSearch: jest.fn(() => [{ keyword: "" }, jest.fn()]), // Mock useSearch hook to return null state and a mock function
}));

jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"), // use actual for all non-hook parts
  useParams: () => ({
    slug: "electronics",
  }),
}));

Object.defineProperty(window, "localStorage", {
  value: {
    setItem: jest.fn(),
    getItem: jest.fn(),
    removeItem: jest.fn(),
  },
  writable: true,
});

window.matchMedia =
  window.matchMedia ||
  function () {
    return {
      matches: false,
      addListener: function () {},
      removeListener: function () {},
    };
  };

const mockGetResponses = (url, products) => {
  switch (url) {
    case `/api/v1/product/product-category/electronics`:
      return {
        data: {
          category: { name: "Electronics" },
          products: products,
        },
      };

    default:
      return {};
  }
};

const mockGetReponsesWithProducts = (url) =>
  mockGetResponses(url, [
    productModel(1, "phone", 100, "good phone", "Electronics"),
    productModel(2, "tablet", 200, "good tablet", "Electronics"),
    productModel(3, "computer", 100, "good computer", "Electronics"),
  ]);

const mockGetResponsesWithoutProducts = (url) => mockGetResponses(url, []);

jest.mock("axios");

jest.mock("../hooks/useCategory", () => ({
  __esModule: true, // Required to handle ES module default export
  default: jest.fn(() => []), // Default mock implementation returns an empty array
}));

jest.mock("../context/auth", () => ({
  useAuth: jest.fn(() => [null, jest.fn()]), // Mock useAuth hook to return null state and a mock function for setAuth
}));

describe("Categories Component", () => {
  describe("when there are no categories", () => {
    it("page should not render any categories", async () => {
      useCategory.mockReturnValue([]);

      const { queryAllByRole } = render(
        <MemoryRouter initialEntries={["/categories"]}>
          <Routes>
            <Route path="/categories" element={<Categories />} />
          </Routes>
        </MemoryRouter>
      );

      const categories = queryAllByRole("a");
      expect(categories).toHaveLength(0);
    });

    describe("when there are categories", () => {
      it("page should render all categories", async () => {
        useCategory.mockReturnValue([
          { name: "Electronics", slug: "electronics" },
          { name: "Books", slug: "books" },
          { name: "Clothing", slug: "clothing" },
        ]);
        const { findAllByText } = render(
          <MemoryRouter initialEntries={["/categories"]}>
            <Routes>
              <Route path="/categories" element={<Categories />} />
            </Routes>
          </MemoryRouter>
        );
        expect(await findAllByText("Electronics")).toHaveLength(2);
        expect(await findAllByText("Books")).toHaveLength(2);
        expect(await findAllByText("Clothing")).toHaveLength(2);
      });

      it("page should link each category to their page", async () => {
        useCategory.mockReturnValue([
          { name: "Electronics", slug: "electronics" },
          { name: "Books", slug: "books" },
          { name: "Clothing", slug: "clothing" },
        ]);
        const { findAllByText } = render(
          <MemoryRouter initialEntries={["/categories"]}>
            <Routes>
              <Route path="/categories" element={<Categories />} />
            </Routes>
          </MemoryRouter>
        );
        expect((await findAllByText("Electronics"))[0].href).toBe(
          "http://localhost/category/electronics"
        );
        expect((await findAllByText("Books"))[0].href).toBe(
          "http://localhost/category/books"
        );
        expect((await findAllByText("Clothing"))[0].href).toBe(
          "http://localhost/category/clothing"
        );
      });
    });
  });

  describe("within the category page for each category", () => {
    describe("when there are more than one products", () => {
      test("page is rendered with products", async () => {
        axios.get.mockImplementation((url) => mockGetReponsesWithProducts(url));
        const { queryByText } = await act(() =>
          Promise.resolve(
            render(
              <MemoryRouter initialEntries={["/category/electronics"]}>
                <Routes>
                  <Route
                    path="/category/electronics"
                    element={<CategoryProduct />}
                  />
                </Routes>
              </MemoryRouter>
            )
          )
        );

        expect(queryByText("phone")).toBeInTheDocument();
        expect(queryByText("tablet")).toBeInTheDocument();
        expect(queryByText("computer")).toBeInTheDocument();

        expect(queryByText("Category - Electronics")).toBeInTheDocument();
        expect(queryByText("3 result found")).toBeInTheDocument();
      });
    });

    describe("when there are no products", () => {
      test("page is rendered without any products", async () => {
        axios.get.mockImplementation((url) =>
          mockGetResponsesWithoutProducts(url)
        );
        const { queryByText } = await act(() =>
          Promise.resolve(
            render(
              <MemoryRouter initialEntries={["/category/electronics"]}>
                <Routes>
                  <Route
                    path="/category/electronics"
                    element={<CategoryProduct />}
                  />
                </Routes>
              </MemoryRouter>
            )
          )
        );

        expect(queryByText("Category - Electronics")).toBeInTheDocument();
      });
    });
  });
});
