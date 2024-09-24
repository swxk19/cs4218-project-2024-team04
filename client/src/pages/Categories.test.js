import { jest } from "@jest/globals";
import React from "react";
import axios from "axios";
import {
  render,
  screen,
  fireEvent,
  waitFor,
  findAllByAltText,
  findAllByText,
  findAllByDisplayValue,
} from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import Categories from "./Categories";
import "../hooks/useCategory";

jest.mock("../context/auth", () => ({
  useAuth: jest.fn(() => [null, jest.fn()]), // Mock useAuth hook to return null state and a mock function for setAuth
}));

jest.mock("../context/cart", () => ({
  useCart: jest.fn(() => [null, jest.fn()]), // Mock useCart hook to return null state and a mock function
}));

jest.mock("../context/search", () => ({
  useSearch: jest.fn(() => [{ keyword: "" }, jest.fn()]), // Mock useSearch hook to return null state and a mock function
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

jest.mock("./Categories.test.utils", () => {
  const originalModule = jest.requireActual("./Categories.test.utils");

  return {
    __esModule: true,
    ...originalModule,
  };
});

jest.mock("axios");

const getCategories = jest.fn(() => {});

// jest.mock("../hooks/useCategory", () => ({
//   useCategory: () => ["Electronics", "Books", "Clothing"],
//   //   jest.fn(() => ["Electronics", "Books", "Clothing"]
//   // ), // Mock useCart hook to return null state and a mock function
// }));

jest.mock("../hooks/useCategory", () => ({
  __esModule: true,
  default: () => [
    { name: "Electronics", slug: "electronics" },
    { name: "Books", slug: "books" },
    { name: "Clothing", slug: "clothing" },
  ],
}));

describe("Categories Component", () => {
  it("should render all categories", async () => {
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
});
