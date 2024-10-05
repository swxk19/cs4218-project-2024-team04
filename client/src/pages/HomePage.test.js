import React from "react";
import axios from "axios";
import { jest } from "@jest/globals";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import "@testing-library/jest-dom";
import {
  getAllCategory,
  getAllProducts,
  getTotal,
  handleFilter,
} from "./HomePage.test.utils";
import e from "express";
import HomePage from "./HomePage";

jest.mock("axios");
jest.mock("react-hot-toast");

jest.mock("../context/auth", () => ({
  useAuth: jest.fn(() => [null, jest.fn()]), // Mock useAuth hook to return null state and a mock function for setAuth
}));

jest.mock("../context/cart", () => ({
  useCart: jest.fn(() => [null, jest.fn()]), // Mock useCart hook to return null state and a mock function
}));

jest.mock("../context/search", () => ({
  useSearch: jest.fn(() => [{ keyword: "" }, jest.fn()]), // Mock useSearch hook to return null state and a mock function
}));

jest.mock("./HomePage", () => {
  const originalModule = jest.requireActual("./HomePage");
  return {
    __esModule: true,
    ...originalModule,
    // getAllCategory: jest.fn(() => [
    //   { _id: 1, name: "Electronics" },
    //   { _id: 2, name: "Book" },
    //   { _id: 3, name: "Clothing" },
    // ]),
  };
});
const productModel = (id, name, price, description, slug) => ({
  _id: id,
  name: name,
  price: price,
  description: description,
  slug: slug,
});

const mockGetResponses = () => {
  switch (url) {
    case "/api/v1/category/get-category":
      return { data: { success: true, category: [] } };
    case `/api/v1/product/product-list/0`:
      return { data: { products: [] } };
    case `/api/v1/product/product-list/1`:
      return { data: { products: [] } };
    case "/api/v1/product/product-count":
      return { data: { total: 1 } };
  }
};

const mockPostResponses = () => {
  switch ((url, body)) {
    case "/api/v1/product/product-filters":
  }
};

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

jest.mock("./HomePage.test.utils", () => {
  const originalModule = jest.requireActual("./HomePage.test.utils");

  return {
    __esModule: true,
    ...originalModule,
  };
});

jest.mock("axios");

describe("HomePage Component", () => {
  it("should get all categories", async () => {
    const setCategories = jest.fn();

    axios.get.mockResolvedValue({ data: { success: true, category: [] } });

    await getAllCategory(setCategories);

    expect(setCategories).toHaveBeenCalledTimes(1);
    expect(setCategories).toHaveBeenCalledWith([]);
  });

  it("should catch error encountered during fetching all categories", async () => {
    axios.get.mockRejectedValueOnce("categories error");
    const setCategories = jest.fn();
    const logSpy = jest.spyOn(console, "log");
    await getAllCategory(setCategories);
    expect(logSpy).toHaveBeenCalledWith("categories error");
    expect(setCategories).toHaveBeenCalledTimes(0);
  });

  it("should get all products", async () => {
    const setProducts = jest.fn();
    const setLoading = jest.fn();
    axios.get.mockResolvedValue({ data: { products: [] } });

    await getAllProducts(setProducts, setLoading, "");

    expect(setProducts).toHaveBeenCalledTimes(1);
    expect(setProducts).toHaveBeenCalledWith([]);
    expect(setLoading).toHaveBeenCalledTimes(2);
    expect(setLoading).toHaveBeenCalledWith(true);
    expect(setLoading).toHaveBeenCalledWith(false);
  });

  it("should catch error encountered during fetching all products", async () => {
    axios.get.mockRejectedValueOnce("product error");
    const setProducts = jest.fn();
    const setLoading = jest.fn();
    const logSpy = jest.spyOn(console, "log");
    await getAllProducts(setProducts, setLoading, "");
    expect(logSpy).toHaveBeenCalledWith("product error");
    expect(setLoading).toHaveBeenCalledTimes(2);
    expect(setLoading).toHaveBeenCalledWith(true);
    expect(setLoading).toHaveBeenCalledWith(false);
    expect(setProducts).toHaveBeenCalledTimes(0);
  });

  it("should get total count", async () => {
    const setTotal = jest.fn();
    axios.get.mockResolvedValue({ data: { total: 1 } });

    await getTotal(setTotal);

    expect(setTotal).toHaveBeenCalledTimes(1);
    expect(setTotal).toHaveBeenCalledWith(1);
  });

  it("should catch error encountered during fetching total count", async () => {
    axios.get.mockRejectedValueOnce("total error");
    const setTotal = jest.fn();
    const logSpy = jest.spyOn(console, "log");
    await getTotal(setTotal);
    expect(logSpy).toHaveBeenCalledWith("total error");
    expect(setTotal).toHaveBeenCalledTimes(0);
  });

  it("should remove filter", () => {
    const setChecked = jest.fn();
    const checked = [1, 2, 3];
    handleFilter(false, 2, checked, setChecked);

    expect(setChecked).toHaveBeenCalledTimes(1);
    expect(setChecked).toHaveBeenCalledWith([1, 3]);
  });

  it("should add filter", () => {
    const setChecked = jest.fn();
    const checked = [1, 2, 3];
    handleFilter(true, 4, checked, setChecked);

    expect(setChecked).toHaveBeenCalledTimes(1);
    expect(setChecked).toHaveBeenCalledWith([1, 2, 3, 4]);
  });

  it("renders price filters correctly", () => {
    const { getByText, getByDisplayValue } = render(
      <MemoryRouter initialEntries={["/"]}>
        <Routes>
          <Route path="/" element={<HomePage />} />
        </Routes>
      </MemoryRouter>
    );
    expect(getByText("$0 to 19")).toBeInTheDocument();
    expect(getByText("$20 to 39")).toBeInTheDocument();
    expect(getByText("$40 to 59")).toBeInTheDocument();
    expect(getByText("$60 to 79")).toBeInTheDocument();
    expect(getByText("$80 to 99")).toBeInTheDocument();
    expect(getByText("$100 or more")).toBeInTheDocument();
  });

  it("checks the filter when it's clicked", () => {
    const { getByText, getByDisplayValue } = render(
      <MemoryRouter initialEntries={["/"]}>
        <Routes>
          <Route path="/" element={<HomePage />} />
        </Routes>
      </MemoryRouter>
    );

    fireEvent.click(getByText("$0 to 19"));
    expect(getByDisplayValue("0,19")).toBeChecked();
  });

  const mockFn = jest.fn({
    data: {
      category: [
        { _id: 1, name: "Electronics" },
        { _id: 2, name: "Book" },
        { _id: 3, name: "Clothing" },
      ],
    },
  });

  it("renders category filters correctly", () => {
    axios.get.mockImplementation(
      (url) => {
        switch (url) {
          case "http://localhost:3000/api/v1/category/get-category":
            return mockFn();
        }
      }
      //   }
    );

    const { getByText, getByDisplayValue } = render(
      <MemoryRouter initialEntries={["/"]}>
        <Routes>
          <Route path="/" element={<HomePage />} />
        </Routes>
      </MemoryRouter>
    );
    waitFor(() => {
      expect(getByText("Electronics")).toBeInTheDocument();
      expect(getByText("Book")).toBeInTheDocument();
      expect(getByText("Clothing")).toBeInTheDocument();
    });
  });

  it("shows all categories when category tab is clicked", () => {
    const { getAllByText } = render(
      <MemoryRouter initialEntries={["/"]}>
        <Routes>
          <Route path="/" element={<HomePage />} />
        </Routes>
      </MemoryRouter>
    );
    screen.getAllByText("Categories").forEach((element) => {
      expect(element).toBeVisible();
    });
  });
});
