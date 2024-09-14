// import { totalPrice, removeCartItem } from "./CartPage.test.utils";
import React from "react";
import { jest } from "@jest/globals";
import { totalPrice, removeCartItem } from "./CartPage.test.utils";

jest.mock("./CartPage.test.utils", () => {
  const originalModule = jest.requireActual("./CartPage.test.utils");

  return {
    __esModule: true,
    ...originalModule,
  };
});

const cartMock = jest.fn();
cartMock
  .mockReturnValueOnce([])
  .mockReturnValueOnce([{ price: 100 }, { price: 200 }]);

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
});
