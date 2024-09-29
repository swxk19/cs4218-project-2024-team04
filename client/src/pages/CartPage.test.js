// import { totalPrice, removeCartItem } from "./CartPage.test.utils";
import React from "react";
import { jest } from "@jest/globals";
import { totalPrice, removeCartItem } from "./CartPage.test.utils";
import CartPage from "./CartPage";
import { render, waitFor } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import "@testing-library/jest-dom";
import axios from "axios";
import { before } from "node:test";
import { useCart } from "../context/cart";
import { act } from "@testing-library/react";

jest.mock("axios");

jest.mock("./CartPage.test.utils", () => {
  const originalModule = jest.requireActual("./CartPage.test.utils");

  return {
    __esModule: true,
    ...originalModule,
  };
});

axios.get.mockResolvedValue({
  data: { clientToken: "fake-client-token" },
});

jest.mock("../context/search", () => ({
  useSearch: jest.fn(() => [{ keyword: "" }, jest.fn()]), // Mock useSearch hook to return null state and a mock function
}));

// const mockEmptyCart = jest.fn(() => [null, jest.fn()]);
// const mockNonEmptyCart = jest.fn(() => [
//   [
//     { price: 100, name: "pants", description: "good pants" },
//     { price: 200, name: "shirt", description: "good shirt" },
//   ],
//   jest.fn(),
// ]);

jest.mock("../context/cart", () => ({
  useCart: jest.fn(), // Mock useCart hook to return null state and a mock function
}));

// Mock useCart hook to return null state and a mock function

jest.mock("../context/auth", () => ({
  useAuth: jest.fn(() => [{ token: "token" }, jest.fn()]), // Mock useAuth hook to return null state and a mock function for setAuth
}));

const cartMock = jest.fn();
cartMock
  .mockReturnValueOnce([])
  .mockReturnValueOnce([{ price: 100 }, { price: 200 }])
  .mockReturnValueOnce([]);

describe("CartPage Component", () => {
  it("should return total price of 0 when cart is empty", () => {
    const total = totalPrice(cartMock());
    expect(total).toBe("$0.00");
  });

  it("should return total price of 300 when cart has 2 items", () => {
    const total = totalPrice(cartMock());
    expect(total).toBe("$300.00");
  });

  it("should remove item from cart", () => {
    const setCart = jest.fn();
    const localStorageMock = jest.fn();
    Object.defineProperty(window, "localStorage", {
      value: {
        setItem: localStorageMock,
      },
      writable: true,
    });

    const cart = [{ _id: 1 }, { _id: 2 }, { _id: 3 }];
    removeCartItem(2, cart, setCart);

    expect(setCart).toHaveBeenCalledTimes(1);
    expect(localStorageMock).toHaveBeenCalledTimes(1);
  });

  it("should display Make Payment button when cart has items", async () => {
    useCart.mockReturnValue([
      [
        { price: 100, name: "pants", description: "good pants" },
        { price: 200, name: "shirt", description: "good shirt" },
      ],
      jest.fn(),
    ]);
    // useCart.mockReturnValue([null, jest.fn()]);
    const { getByText, queryByText } = await act(() =>
      Promise.resolve(
        render(
          <MemoryRouter initialEntries={["/cart"]}>
            <Routes>
              <Route path="/cart" element={<CartPage />} />
            </Routes>
          </MemoryRouter>
        )
      )
    );
    // waitFor(() => {
    //  expect(getByText("Make Payment")).toBeInTheDocument();
    // });
    expect(getByText("Make Payment")).toBeInTheDocument();
  });

  it("should NOT display Make Payment button when cart is empty", async () => {
    // useCart.mockReturnValue([
    //   [
    //     { price: 100, name: "pants", description: "good pants" },
    //     { price: 200, name: "shirt", description: "good shirt" },
    //   ],
    //   jest.fn(),
    // ]);
    useCart.mockReturnValue([null, jest.fn()]);
    const { getByText, queryByText } = await act(() =>
      Promise.resolve(
        render(
          <MemoryRouter initialEntries={["/cart"]}>
            <Routes>
              <Route path="/cart" element={<CartPage />} />
            </Routes>
          </MemoryRouter>
        )
      )
    );
    expect(queryByText("Make Payment")).toBeNull();
  });
});
