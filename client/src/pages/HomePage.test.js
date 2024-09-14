import React from "react";
import axios from "axios";
import { jest } from "@jest/globals";
import {
  getAllCategory,
  getAllProducts,
  getTotal,
  handleFilter,
} from "./HomePage.test.utils";
import e from "express";

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

  it("should get all products", async () => {
    const setProducts = jest.fn();
    const setLoading = jest.fn();
    axios.get.mockResolvedValue({ data: { products: [] } });

    await getAllProducts(setProducts, setLoading, "");

    expect(setProducts).toHaveBeenCalledTimes(1);
    expect(setProducts).toHaveBeenCalledWith([]);
  });

  it("should get total count", async () => {
    const setTotal = jest.fn();
    axios.get.mockResolvedValue({ data: { total: 1 } });

    await getTotal(setTotal);

    expect(setTotal).toHaveBeenCalledTimes(1);
    expect(setTotal).toHaveBeenCalledWith(1);
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
});
