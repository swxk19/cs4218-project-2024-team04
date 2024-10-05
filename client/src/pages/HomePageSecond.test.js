import React from "react";
import axios from "axios";
import { jest } from "@jest/globals";
import {
  render,
  screen,
  fireEvent,
  waitFor,
  findAllByText,
} from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import "@testing-library/jest-dom";
import { act } from "@testing-library/react";

import e from "express";
import HomePage from "./HomePage";
import { productModel, categoryModel } from "./TestModels";
import { useCart } from "../context/cart";
import toast from "react-hot-toast";

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

const getCategories = () => {
  return [
    categoryModel(1, "Electronics"),
    categoryModel(2, "Books"),
    categoryModel(3, "Clothing"),
  ];
};

const getProductsInFirstPage = () => {
  const products = [];
  const categories = ["c_1", "c_2", "c_3"];
  for (let i = 0; i < 6; i++) {
    products.push(
      productModel(
        `p_${i}`,
        `Product ${i}`,
        i * 10,
        `Description ${i}`,
        `${categories[i % 3]}`
      )
    );
  }
  return products;
};

const getProductsInSecondPage = () => {
  const products = [];
  const categories = ["c_1", "c_2", "c_3"];
  for (let i = 6; i < 12; i++) {
    products.push(
      productModel(
        `p_${i}`,
        `Product ${i}`,
        i * 10,
        `Description ${i}`,
        `${categories[i % 3]}`
      )
    );
  }
  return products;
};

const getAllProducts = () => {
  return getProductsInFirstPage().concat(getProductsInSecondPage());
};

const getFilteredProducts = (categories, prices) => {
  const result = getAllProducts().filter((p) => {
    if (prices.length === 0) {
      return categories.includes(p.category);
    }
    if (categories.length === 0) {
      return p.price >= prices[0] && p.price <= prices[1];
    }
    return (
      p.price >= prices[0] &&
      p.price <= prices[1] &&
      categories.includes(p.category)
    );
  });
  return result;
};

const getTotalCount = (isSmall) => {
  return isSmall
    ? getProductsInFirstPage().length
    : getProductsInFirstPage().length + getProductsInSecondPage().length;
};

const mockGetResponses = (url, isSmall) => {
  switch (url) {
    case `/api/v1/category/get-category`:
      return { data: { success: true, category: getCategories() } };
    case `/api/v1/product/product-list/1`:
      return { data: { products: getProductsInFirstPage() } };
    case `/api/v1/product/product-list/2`:
      return { data: { products: getProductsInSecondPage() } };
    case `/api/v1/product/product-count`:
      return { data: { total: getTotalCount(isSmall) } };
    default:
      return {};
  }
};

const mockGetReponsesWithMoreProducts = (url) => mockGetResponses(url, false);
const mockGetReponsesWithLessProducts = (url) => mockGetResponses(url, true);

const mockPostResponses = (url, body) => {
  console.log(url);
  console.log(body);
  console.log(getFilteredProducts(body.checked, body.radio));
  switch (url) {
    case "/api/v1/product/product-filters":
      return {
        data: { products: getFilteredProducts(body.checked, body.radio) },
      };
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

jest.mock("axios");

describe("HomePage Component_v2", () => {
  describe("when users enter the page", () => {
    test("users should be able to view all products in the first page", async () => {
      axios.get.mockImplementation((url) => {
        return mockGetReponsesWithMoreProducts(url);
      });
      const { queryByText } = await act(() =>
        Promise.resolve(
          render(
            <MemoryRouter initialEntries={["/"]}>
              <Routes>
                <Route path="/" element={<HomePage />} />
              </Routes>
            </MemoryRouter>
          )
        )
      );

      expect(queryByText("Product 0")).toBeInTheDocument();
      expect(queryByText("Product 1")).toBeInTheDocument();
      expect(queryByText("Product 2")).toBeInTheDocument();
      expect(queryByText("Product 3")).toBeInTheDocument();
      expect(queryByText("Product 4")).toBeInTheDocument();
      expect(queryByText("Product 5")).toBeInTheDocument();

      expect(queryByText("Product 6")).not.toBeInTheDocument();
      expect(queryByText("Product 7")).not.toBeInTheDocument();
      expect(queryByText("Product 8")).not.toBeInTheDocument();
      expect(queryByText("Product 9")).not.toBeInTheDocument();
      expect(queryByText("Product 10")).not.toBeInTheDocument();
      expect(queryByText("Product 11")).not.toBeInTheDocument();
    });

    test("users should be able to view all categories", async () => {
      axios.get.mockImplementation((url) => {
        return mockGetReponsesWithMoreProducts(url);
      });
      const { queryByText, getByRole } = await act(() =>
        Promise.resolve(
          render(
            <MemoryRouter initialEntries={["/"]}>
              <Routes>
                <Route path="/" element={<HomePage />} />
              </Routes>
            </MemoryRouter>
          )
        )
      );
      const electronics = getByRole("checkbox", { name: "Electronics" });
      const books = getByRole("checkbox", { name: "Books" });
      const clothing = getByRole("checkbox", { name: "Clothing" });

      expect(electronics).toBeInTheDocument();
      expect(books).toBeInTheDocument();
      expect(clothing).toBeInTheDocument();

      expect(queryByText("$0 to 19")).toBeInTheDocument();
      expect(queryByText("$20 to 39")).toBeInTheDocument();
      expect(queryByText("$40 to 59")).toBeInTheDocument();
      expect(queryByText("$60 to 79")).toBeInTheDocument();
      expect(queryByText("$80 to 99")).toBeInTheDocument();
      expect(queryByText("$100 or more")).toBeInTheDocument();
    });
  });

  test("users should be able to add products to cart", async () => {
    axios.post.mockImplementation((url, body) => {
      return mockPostResponses(url, body);
    });
    axios.get.mockImplementation((url) => {
      return mockGetReponsesWithMoreProducts(url);
    });
    const setCart = jest.fn();
    useCart.mockReturnValue([[], setCart]);
    const { queryByText, getAllByRole } = await act(() =>
      Promise.resolve(
        render(
          <MemoryRouter initialEntries={["/"]}>
            <Routes>
              <Route path="/" element={<HomePage />} />
            </Routes>
          </MemoryRouter>
        )
      )
    );

    const firstAddButton = getAllByRole("button", { name: "ADD TO CART" })[0];

    await act(async () => {
      fireEvent.click(firstAddButton);
    });

    expect(setCart).toHaveBeenCalledWith([getProductsInFirstPage()[0]]);
    expect(setCart).toHaveBeenCalledTimes(1);
    expect(toast.success).toHaveBeenCalledWith("Item Added to cart");
  });

  describe("when users apply filters", () => {
    test("users should be able to view filtered products when only 1 category filter is selected", async () => {
      axios.post.mockImplementation((url, body) => {
        return mockPostResponses(url, body);
      });
      axios.get.mockImplementation((url) => {
        return mockGetReponsesWithMoreProducts(url);
      });
      const { queryByText, getByRole } = await act(() =>
        Promise.resolve(
          render(
            <MemoryRouter initialEntries={["/"]}>
              <Routes>
                <Route path="/" element={<HomePage />} />
              </Routes>
            </MemoryRouter>
          )
        )
      );

      const electronics = getByRole("checkbox", { name: "Electronics" });

      expect(electronics).not.toBeChecked();
      await act(async () => {
        fireEvent.click(electronics);
      });
      expect(electronics).toBeChecked();

      expect(queryByText("Product 0")).toBeInTheDocument();
      expect(queryByText("Product 3")).toBeInTheDocument();
      expect(queryByText("Product 6")).toBeInTheDocument();
      expect(queryByText("Product 9")).toBeInTheDocument();

      expect(queryByText("Product 1")).not.toBeInTheDocument();
      expect(queryByText("Product 2")).not.toBeInTheDocument();
      expect(queryByText("Product 4")).not.toBeInTheDocument();
      expect(queryByText("Product 5")).not.toBeInTheDocument();
      expect(queryByText("Product 7")).not.toBeInTheDocument();
      expect(queryByText("Product 8")).not.toBeInTheDocument();
      expect(queryByText("Product 10")).not.toBeInTheDocument();
      expect(queryByText("Product 11")).not.toBeInTheDocument();
    });

    test("users should be able to view filtered products when more than 1 category filters are selected", async () => {
      axios.post.mockImplementation((url, body) => {
        return mockPostResponses(url, body);
      });
      axios.get.mockImplementation((url) => {
        return mockGetReponsesWithMoreProducts(url);
      });
      const { queryByText, getByRole } = await act(() =>
        Promise.resolve(
          render(
            <MemoryRouter initialEntries={["/"]}>
              <Routes>
                <Route path="/" element={<HomePage />} />
              </Routes>
            </MemoryRouter>
          )
        )
      );

      const electronics = getByRole("checkbox", { name: "Electronics" });
      const books = getByRole("checkbox", { name: "Books" });

      expect(electronics).not.toBeChecked();
      await act(async () => {
        fireEvent.click(electronics);
        fireEvent.click(books);
      });
      expect(electronics).toBeChecked();
      expect(books).toBeChecked();

      expect(queryByText("Product 0")).toBeInTheDocument();
      expect(queryByText("Product 1")).toBeInTheDocument();
      expect(queryByText("Product 3")).toBeInTheDocument();
      expect(queryByText("Product 4")).toBeInTheDocument();
      expect(queryByText("Product 6")).toBeInTheDocument();
      expect(queryByText("Product 7")).toBeInTheDocument();
      expect(queryByText("Product 9")).toBeInTheDocument();
      expect(queryByText("Product 10")).toBeInTheDocument();

      expect(queryByText("Product 11")).not.toBeInTheDocument();
      expect(queryByText("Product 2")).not.toBeInTheDocument();
      expect(queryByText("Product 5")).not.toBeInTheDocument();
      expect(queryByText("Product 8")).not.toBeInTheDocument();
    });

    describe("after clicking Loadmore to view more products", () => {
      test("users should be able to view filtered products", async () => {
        axios.post.mockImplementation((url, body) => {
          return mockPostResponses(url, body);
        });
        axios.get.mockImplementation((url) => {
          return mockGetReponsesWithMoreProducts(url);
        });
        const { queryByText, getByRole } = await act(() =>
          Promise.resolve(
            render(
              <MemoryRouter initialEntries={["/"]}>
                <Routes>
                  <Route path="/" element={<HomePage />} />
                </Routes>
              </MemoryRouter>
            )
          )
        );

        const electronics = getByRole("checkbox", { name: "Electronics" });
        const loadmore = getByRole("button", { name: "Loadmore" });

        await act(async () => {
          fireEvent.click(loadmore);
        });

        expect(queryByText("Product 0")).toBeInTheDocument();
        expect(queryByText("Product 1")).toBeInTheDocument();
        expect(queryByText("Product 2")).toBeInTheDocument();
        expect(queryByText("Product 3")).toBeInTheDocument();
        expect(queryByText("Product 4")).toBeInTheDocument();
        expect(queryByText("Product 5")).toBeInTheDocument();

        expect(queryByText("Product 6")).toBeInTheDocument();
        expect(queryByText("Product 7")).toBeInTheDocument();
        expect(queryByText("Product 8")).toBeInTheDocument();
        expect(queryByText("Product 9")).toBeInTheDocument();
        expect(queryByText("Product 10")).toBeInTheDocument();
        expect(queryByText("Product 11")).toBeInTheDocument();

        await act(async () => {
          fireEvent.click(electronics);
        });

        expect(queryByText("Product 0")).toBeInTheDocument();
        expect(queryByText("Product 3")).toBeInTheDocument();
        expect(queryByText("Product 6")).toBeInTheDocument();
        expect(queryByText("Product 9")).toBeInTheDocument();
      });

      //expected to fail
      test("users should be able to uncheck applied category filters to view all products", async () => {
        axios.post.mockImplementation((url, body) => {
          return mockPostResponses(url, body);
        });
        axios.get.mockImplementation((url) => {
          return mockGetReponsesWithMoreProducts(url);
        });
        const { queryByText, getByRole } = await act(() =>
          Promise.resolve(
            render(
              <MemoryRouter initialEntries={["/"]}>
                <Routes>
                  <Route path="/" element={<HomePage />} />
                </Routes>
              </MemoryRouter>
            )
          )
        );

        const electronics = getByRole("checkbox", { name: "Electronics" });
        const loadmore = getByRole("button", { name: "Loadmore" });

        await act(async () => {
          fireEvent.click(loadmore);
        });

        expect(queryByText("Product 0")).toBeInTheDocument();
        expect(queryByText("Product 1")).toBeInTheDocument();
        expect(queryByText("Product 2")).toBeInTheDocument();
        expect(queryByText("Product 3")).toBeInTheDocument();
        expect(queryByText("Product 4")).toBeInTheDocument();
        expect(queryByText("Product 5")).toBeInTheDocument();

        expect(queryByText("Product 6")).toBeInTheDocument();
        expect(queryByText("Product 7")).toBeInTheDocument();
        expect(queryByText("Product 8")).toBeInTheDocument();
        expect(queryByText("Product 9")).toBeInTheDocument();
        expect(queryByText("Product 10")).toBeInTheDocument();
        expect(queryByText("Product 11")).toBeInTheDocument();

        await act(async () => {
          fireEvent.click(electronics);
        });

        expect(queryByText("Product 0")).toBeInTheDocument();
        expect(queryByText("Product 3")).toBeInTheDocument();
        expect(queryByText("Product 6")).toBeInTheDocument();
        expect(queryByText("Product 9")).toBeInTheDocument();

        await act(async () => {
          fireEvent.click(electronics);
        });

        expect(queryByText("Product 6")).toBeInTheDocument();
        expect(queryByText("Product 7")).toBeInTheDocument();
        expect(queryByText("Product 8")).toBeInTheDocument();
        expect(queryByText("Product 9")).toBeInTheDocument();
        expect(queryByText("Product 10")).toBeInTheDocument();
        expect(queryByText("Product 11")).toBeInTheDocument();

        expect(queryByText("Product 0")).toBeInTheDocument();
        expect(queryByText("Product 1")).toBeInTheDocument();
        expect(queryByText("Product 2")).toBeInTheDocument();
        expect(queryByText("Product 3")).toBeInTheDocument();
        expect(queryByText("Product 4")).toBeInTheDocument();
        expect(queryByText("Product 5")).toBeInTheDocument();
      });
    });

    test("users should be able to view filtered products when 1 price filter is selected", async () => {
      axios.post.mockImplementation((url, body) => {
        return mockPostResponses(url, body);
      });
      axios.get.mockImplementation((url) => {
        return mockGetReponsesWithMoreProducts(url);
      });
      const { queryByText, getByRole } = await act(() =>
        Promise.resolve(
          render(
            <MemoryRouter initialEntries={["/"]}>
              <Routes>
                <Route path="/" element={<HomePage />} />
              </Routes>
            </MemoryRouter>
          )
        )
      );

      const zeroToNineteen = getByRole("radio", { name: "$0 to 19" });

      expect(zeroToNineteen).not.toBeChecked();
      await act(async () => {
        fireEvent.click(zeroToNineteen);
      });
      expect(zeroToNineteen).toBeChecked();

      expect(queryByText("Product 0")).toBeInTheDocument();
      expect(queryByText("Product 1")).toBeInTheDocument();

      expect(queryByText("Product 3")).not.toBeInTheDocument();
      expect(queryByText("Product 4")).not.toBeInTheDocument();
      expect(queryByText("Product 6")).not.toBeInTheDocument();
      expect(queryByText("Product 7")).not.toBeInTheDocument();
      expect(queryByText("Product 9")).not.toBeInTheDocument();
      expect(queryByText("Product 10")).not.toBeInTheDocument();
      expect(queryByText("Product 11")).not.toBeInTheDocument();
      expect(queryByText("Product 2")).not.toBeInTheDocument();
      expect(queryByText("Product 5")).not.toBeInTheDocument();
      expect(queryByText("Product 8")).not.toBeInTheDocument();
    });

    test("users should be able to view filtered products when 1 price filter and 1 category filter is selected", async () => {
      axios.post.mockImplementation((url, body) => {
        return mockPostResponses(url, body);
      });
      axios.get.mockImplementation((url) => {
        return mockGetReponsesWithMoreProducts(url);
      });
      const { queryByText, getByRole } = await act(() =>
        Promise.resolve(
          render(
            <MemoryRouter initialEntries={["/"]}>
              <Routes>
                <Route path="/" element={<HomePage />} />
              </Routes>
            </MemoryRouter>
          )
        )
      );

      const zeroToNineteen = getByRole("radio", { name: "$0 to 19" });
      const books = getByRole("checkbox", { name: "Books" });

      expect(zeroToNineteen).not.toBeChecked();
      expect(books).not.toBeChecked();
      await act(async () => {
        fireEvent.click(zeroToNineteen);
        fireEvent.click(books);
      });
      expect(zeroToNineteen).toBeChecked();
      expect(books).toBeChecked();

      expect(queryByText("Product 1")).toBeInTheDocument();

      expect(queryByText("Product 0")).not.toBeInTheDocument();
      expect(queryByText("Product 3")).not.toBeInTheDocument();
      expect(queryByText("Product 4")).not.toBeInTheDocument();
      expect(queryByText("Product 6")).not.toBeInTheDocument();
      expect(queryByText("Product 7")).not.toBeInTheDocument();
      expect(queryByText("Product 9")).not.toBeInTheDocument();
      expect(queryByText("Product 10")).not.toBeInTheDocument();
      expect(queryByText("Product 11")).not.toBeInTheDocument();
      expect(queryByText("Product 2")).not.toBeInTheDocument();
      expect(queryByText("Product 5")).not.toBeInTheDocument();
      expect(queryByText("Product 8")).not.toBeInTheDocument();
    });

    test("users should be able to view filtered products when 1 price filter and more than one category filters are selected", async () => {
      axios.post.mockImplementation((url, body) => {
        return mockPostResponses(url, body);
      });
      axios.get.mockImplementation((url) => {
        return mockGetReponsesWithMoreProducts(url);
      });
      const { queryByText, getByRole } = await act(() =>
        Promise.resolve(
          render(
            <MemoryRouter initialEntries={["/"]}>
              <Routes>
                <Route path="/" element={<HomePage />} />
              </Routes>
            </MemoryRouter>
          )
        )
      );

      const zeroToNineteen = getByRole("radio", { name: "$0 to 19" });
      const electronics = getByRole("checkbox", { name: "Electronics" });
      const books = getByRole("checkbox", { name: "Books" });

      expect(zeroToNineteen).not.toBeChecked();
      expect(electronics).not.toBeChecked();
      expect(books).not.toBeChecked();
      await act(async () => {
        fireEvent.click(zeroToNineteen);
        fireEvent.click(electronics);
        fireEvent.click(books);
      });
      expect(zeroToNineteen).toBeChecked();
      expect(electronics).toBeChecked();
      expect(books).toBeChecked();

      expect(queryByText("Product 0")).toBeInTheDocument();
      expect(queryByText("Product 1")).toBeInTheDocument();

      expect(queryByText("Product 3")).not.toBeInTheDocument();
      expect(queryByText("Product 4")).not.toBeInTheDocument();
      expect(queryByText("Product 6")).not.toBeInTheDocument();
      expect(queryByText("Product 7")).not.toBeInTheDocument();
      expect(queryByText("Product 9")).not.toBeInTheDocument();
      expect(queryByText("Product 10")).not.toBeInTheDocument();
      expect(queryByText("Product 11")).not.toBeInTheDocument();
      expect(queryByText("Product 2")).not.toBeInTheDocument();
      expect(queryByText("Product 5")).not.toBeInTheDocument();
      expect(queryByText("Product 8")).not.toBeInTheDocument();
    });

    test("users should be able to reset applied filters", async () => {
      axios.post.mockImplementation((url, body) => {
        return mockPostResponses(url, body);
      });
      axios.get.mockImplementation((url) => {
        return mockGetReponsesWithMoreProducts(url);
      });
      Object.defineProperty(window, "location", {
        configurable: true,
        value: { reload: jest.fn() },
      });
      const { queryByText, getByRole } = await act(() =>
        Promise.resolve(
          render(
            <MemoryRouter initialEntries={["/"]}>
              <Routes>
                <Route path="/" element={<HomePage />} />
              </Routes>
            </MemoryRouter>
          )
        )
      );

      const zeroToNineteen = getByRole("radio", { name: "$0 to 19" });
      const electronics = getByRole("checkbox", { name: "Electronics" });
      const books = getByRole("checkbox", { name: "Books" });

      expect(zeroToNineteen).not.toBeChecked();
      expect(electronics).not.toBeChecked();
      expect(books).not.toBeChecked();
      await act(async () => {
        fireEvent.click(zeroToNineteen);
        fireEvent.click(electronics);
        fireEvent.click(books);
      });
      expect(zeroToNineteen).toBeChecked();
      expect(electronics).toBeChecked();
      expect(books).toBeChecked();

      expect(queryByText("Product 0")).toBeInTheDocument();
      expect(queryByText("Product 1")).toBeInTheDocument();

      expect(queryByText("Product 3")).not.toBeInTheDocument();
      expect(queryByText("Product 4")).not.toBeInTheDocument();
      expect(queryByText("Product 6")).not.toBeInTheDocument();
      expect(queryByText("Product 7")).not.toBeInTheDocument();
      expect(queryByText("Product 9")).not.toBeInTheDocument();
      expect(queryByText("Product 10")).not.toBeInTheDocument();
      expect(queryByText("Product 11")).not.toBeInTheDocument();
      expect(queryByText("Product 2")).not.toBeInTheDocument();
      expect(queryByText("Product 5")).not.toBeInTheDocument();
      expect(queryByText("Product 8")).not.toBeInTheDocument();

      const resetFilters = getByRole("button", { name: "RESET FILTERS" });
      await act(async () => {
        fireEvent.click(resetFilters);
      });
      expect(window.location.reload).toHaveBeenCalled();
    });
  });

  describe("when current number of products is less then the total number of products", () => {
    test("users should be able to view more products when they press Loadmore button", async () => {
      axios.post.mockImplementation((url, body) => {
        return mockPostResponses(url, body);
      });
      axios.get.mockImplementation((url) => {
        return mockGetReponsesWithMoreProducts(url);
      });
      const { queryByText, getByRole } = await act(() =>
        Promise.resolve(
          render(
            <MemoryRouter initialEntries={["/"]}>
              <Routes>
                <Route path="/" element={<HomePage />} />
              </Routes>
            </MemoryRouter>
          )
        )
      );

      expect(queryByText("Loadmore")).toBeInTheDocument();

      expect(queryByText("Product 0")).toBeInTheDocument();
      expect(queryByText("Product 1")).toBeInTheDocument();
      expect(queryByText("Product 2")).toBeInTheDocument();
      expect(queryByText("Product 3")).toBeInTheDocument();
      expect(queryByText("Product 4")).toBeInTheDocument();
      expect(queryByText("Product 5")).toBeInTheDocument();

      expect(queryByText("Product 6")).not.toBeInTheDocument();
      expect(queryByText("Product 7")).not.toBeInTheDocument();
      expect(queryByText("Product 8")).not.toBeInTheDocument();
      expect(queryByText("Product 9")).not.toBeInTheDocument();
      expect(queryByText("Product 10")).not.toBeInTheDocument();
      expect(queryByText("Product 11")).not.toBeInTheDocument();

      const loadmore = getByRole("button", { name: "Loadmore" });

      await act(async () => {
        fireEvent.click(loadmore);
      });

      expect(queryByText("Product 0")).toBeInTheDocument();
      expect(queryByText("Product 1")).toBeInTheDocument();
      expect(queryByText("Product 2")).toBeInTheDocument();
      expect(queryByText("Product 3")).toBeInTheDocument();
      expect(queryByText("Product 4")).toBeInTheDocument();
      expect(queryByText("Product 5")).toBeInTheDocument();

      expect(queryByText("Product 6")).toBeInTheDocument();
      expect(queryByText("Product 7")).toBeInTheDocument();
      expect(queryByText("Product 8")).toBeInTheDocument();
      expect(queryByText("Product 9")).toBeInTheDocument();
      expect(queryByText("Product 10")).toBeInTheDocument();
      expect(queryByText("Product 11")).toBeInTheDocument();
    });
  });

  describe("when current number of products is less than or equal to the total number of products", () => {
    test("users should not be able to view Loadmore button", async () => {
      axios.post.mockImplementation((url, body) => {
        return mockPostResponses(url, body);
      });
      axios.get.mockImplementation((url) => {
        return mockGetReponsesWithLessProducts(url);
      });
      const { queryByText, getByRole } = await act(() =>
        Promise.resolve(
          render(
            <MemoryRouter initialEntries={["/"]}>
              <Routes>
                <Route path="/" element={<HomePage />} />
              </Routes>
            </MemoryRouter>
          )
        )
      );

      expect(queryByText("Loadmore")).not.toBeInTheDocument();

      expect(queryByText("Product 0")).toBeInTheDocument();
      expect(queryByText("Product 1")).toBeInTheDocument();
      expect(queryByText("Product 2")).toBeInTheDocument();
      expect(queryByText("Product 3")).toBeInTheDocument();
      expect(queryByText("Product 4")).toBeInTheDocument();
      expect(queryByText("Product 5")).toBeInTheDocument();
    });
  });
});
