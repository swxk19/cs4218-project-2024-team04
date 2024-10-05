// import { totalPrice, removeCartItem } from "./CartPage.test.utils";
import React from "react";
import { jest } from "@jest/globals";
import CartPage from "./CartPage";
import { fireEvent, render, waitFor } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import "@testing-library/jest-dom";
import axios from "axios";
import { before, describe } from "node:test";
import { useCart } from "../context/cart";
import { act } from "@testing-library/react";
import { authModel, userModel, productModel } from "./TestModels";
import { useAuth } from "../context/auth";
import toast from "react-hot-toast";
import DropIn from "braintree-web-drop-in-react";

jest.mock("axios");
jest.mock("react-hot-toast");

// jest.mock("../hooks/useCategory", () => ({
//   useCategory: jest.fn(),
// }));

axios.get.mockResolvedValue({
  data: { clientToken: "fake-client-token" },
});

jest.mock("../context/search", () => ({
  useSearch: jest.fn(() => [{ keyword: "" }, jest.fn()]), // Mock useSearch hook to return null state and a mock function
}));

jest.mock("../context/cart", () => ({
  useCart: jest.fn(), // Mock useCart hook to return null state and a mock function
}));

jest.mock("../context/auth", () => ({
  useAuth: jest.fn(() => [{ token: "token" }, jest.fn()]), // Mock useAuth hook to return null state and a mock function for setAuth
}));

jest.mock("braintree-web-drop-in-react", () => {
  return jest.fn(() => <div>Mock DropIn Component</div>);
});

const mockGetResponses = (url, tokenValue) => {
  switch (url) {
    case `/api/v1/product/braintree/token`:
      return { data: { clientToken: tokenValue } };

    default:
      return {};
  }
};

const mockPostResponses = (url, body) => {
  console.log(url);
  console.log(body);
  switch (url) {
    case `/api/v1/product/braintree/payment`:
      return { data: { success: true } };
    default:
      return {};
  }
};

const loggedInNoTokenNoNameAddressAuth = authModel(
  null,
  userModel(null, "address")
);
const notLoggedInNoTokenNoNameNoAddressAuth = authModel(null, null);
const loggedInTokenNameNoAddressAuth = authModel(
  "token",
  userModel("name", null)
);
const loggedInTokenNameAddressAuth = authModel(
  "token",
  userModel("name", "address")
);

const nonEmptyCart = [
  productModel("1", "pants", 100, "good pants", "Clothing"),
  productModel("2", "phone", 200, "good phone", "Electronics"),
];
const emptyCart = [];

const noClientTokenResponse = (url) => mockGetResponses(url, null);
const clientTokenResponse = (url) => mockGetResponses(url, "clientToken");

describe("CartPage Component", () => {
  describe("when user is logged in", () => {
    describe("and has token, name, and address, with valid client token and non empty cart", () => {
      it("should render page accordingly", async () => {
        useAuth.mockReturnValue([loggedInTokenNameNoAddressAuth, jest.fn()]);
        useCart.mockReturnValue([nonEmptyCart, jest.fn()]);
        axios.get.mockImplementation((url) => clientTokenResponse(url));

        const { queryByText } = await act(() =>
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

        expect(queryByText("Hello name")).toBeInTheDocument();
        expect(queryByText("Current Address")).not.toBeInTheDocument();
        expect(queryByText("Update Address")).toBeInTheDocument();
        expect(queryByText("Make Payment")).toBeInTheDocument();
        expect(queryByText("pants")).toBeInTheDocument();
        expect(queryByText("phone")).toBeInTheDocument();
        expect(queryByText("Total : $300.00")).toBeInTheDocument();
      });
    });

    describe("and has no token, no name, but has address, with valid client token and non empty cart", async () => {
      it("should render page accordingly", async () => {
        useAuth.mockReturnValue([loggedInNoTokenNoNameAddressAuth, jest.fn()]);
        useCart.mockReturnValue([nonEmptyCart, jest.fn()]);
        axios.get.mockImplementation((url) => clientTokenResponse(url));

        const { queryByText } = await act(() =>
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

        expect(queryByText("Hello")).not.toBeInTheDocument();
        expect(queryByText("Current Address")).toBeInTheDocument();
        expect(queryByText("address")).toBeInTheDocument();
        expect(queryByText("Update Address")).toBeInTheDocument();
        expect(queryByText("Make Payment")).not.toBeInTheDocument();
        expect(queryByText("pants")).toBeInTheDocument();
        expect(queryByText("phone")).toBeInTheDocument();
        expect(queryByText("Total : $300.00")).toBeInTheDocument();
        expect(
          queryByText(
            "You Have 2 items in your cart please login to checkout !"
          )
        ).toBeInTheDocument();
        expect(queryByText("Make Payment")).not.toBeInTheDocument();
      });
    });
  });

  describe("when user is not logged in", () => {
    describe("and has token, no name, no address, without client token and empty cart", () => {
      it("should render page accordingly", async () => {
        useAuth.mockReturnValue([
          notLoggedInNoTokenNoNameNoAddressAuth,
          jest.fn(),
        ]);
        useCart.mockReturnValue([emptyCart, jest.fn()]);
        axios.get.mockImplementation((url) => noClientTokenResponse(url));

        const { queryByText } = await act(() =>
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

        expect(queryByText("Hello Guest")).toBeInTheDocument();
        expect(queryByText("Plase Login to checkout")).toBeInTheDocument();
        expect(queryByText("Current Address")).not.toBeInTheDocument();
        expect(queryByText("Update Address")).not.toBeInTheDocument();
        expect(queryByText("Make Payment")).not.toBeInTheDocument();
        expect(queryByText("Your Cart Is Empty")).toBeInTheDocument();
        expect(queryByText("pants")).not.toBeInTheDocument();
        expect(queryByText("phone")).not.toBeInTheDocument();
        expect(queryByText("Total : $0.00")).toBeInTheDocument();
      });
    });
  });

  describe("when the cart contains items", () => {
    it("users should be able to remove items from the cart", async () => {
      const setCart = jest.fn();
      useCart.mockReturnValue([nonEmptyCart, setCart]);
      const { queryByText, queryAllByText, getAllByRole } = await act(() =>
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

      expect(queryByText("pants")).toBeInTheDocument();
      expect(queryByText("phone")).toBeInTheDocument();
      expect(queryByText("Total : $300.00")).toBeInTheDocument();

      const removePantsButton = getAllByRole("button", { name: "Remove" })[0];

      await act(async () => {
        fireEvent.click(removePantsButton);
      });

      expect(setCart).toHaveBeenCalledTimes(1);
      expect(setCart).toHaveBeenCalledWith([
        productModel("2", "phone", 200, "good phone", "Electronics"),
      ]);
    });

    test("errors should be caught while trying to remove items from the cart", async () => {
      const setCart = jest.fn().mockImplementation(() => {
        throw new Error("Cart remove error");
      });
      //   .mockRejectedValue("Cart remove error");
      useCart.mockReturnValue([nonEmptyCart, setCart]);
      const { queryByText, getAllByRole } = await act(() =>
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

      expect(queryByText("pants")).toBeInTheDocument();
      expect(queryByText("phone")).toBeInTheDocument();
      expect(queryByText("Total : $300.00")).toBeInTheDocument();

      const removePantsButton = getAllByRole("button", { name: "Remove" })[0];
      const logSpy = jest.spyOn(console, "log");

      await act(async () => {
        fireEvent.click(removePantsButton);
      });

      expect(setCart).toHaveBeenCalledTimes(1);
      expect(setCart).toHaveBeenCalledWith([
        productModel("2", "phone", 200, "good phone", "Electronics"),
      ]);

      expect(logSpy).toHaveBeenCalledTimes(1);
      expect(logSpy).toHaveBeenCalledWith(new Error("Cart remove error"));
    });

    test("users should be able to make payment", async () => {
      useAuth.mockReturnValue([loggedInTokenNameAddressAuth, jest.fn()]);
      useCart.mockReturnValue([nonEmptyCart, jest.fn()]);

      axios.get.mockImplementation((url) => clientTokenResponse(url));
      axios.post.mockImplementation((url, body) =>
        mockPostResponses(url, body)
      );

      //   class Instance {
      //     requestPaymentMethod() {
      //       return { nonce: "fake-nonce" };
      //     }
      //     map() {}
      //   }
      //   // axios.get.mockRestore();
      //   const originalUseState = React.useState;
      //   jest.spyOn(React, "useState").mockImplementation((initialState) => {
      //     console.log("initialState: ", initialState);
      //     if (initialState === "") {
      //       return originalUseState(new Instance());
      //     }
      //     return originalUseState(initialState);
      //   });
      const mockRequestPaymentMethod = jest
        .fn()
        .mockResolvedValueOnce({ nonce: "fake-nonce" });

      DropIn.mockImplementationOnce(({ onInstance }) => {
        // Pass the mocked instance back through onInstance callback
        onInstance({
          requestPaymentMethod: mockRequestPaymentMethod,
        });
        return <div>Mock DropIn Component</div>;
      });
      const { queryByText } = await act(() =>
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

      expect(queryByText("Make Payment")).toBeInTheDocument();
      const makePaymentButton = queryByText("Make Payment");
      await act(async () => {
        fireEvent.click(makePaymentButton);
      });

      expect(axios.post).toHaveBeenCalledTimes(1);

      expect(toast.success).toHaveBeenCalledTimes(1);
    });
  });
});
