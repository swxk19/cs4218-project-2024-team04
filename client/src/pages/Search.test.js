import React from 'react';
import { render, fireEvent } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import '@testing-library/jest-dom/extend-expect';
import Search from './Search'
import ProductDetails from './ProductDetails';
import toast from 'react-hot-toast';
import { useSearch } from '../context/search';

// Constants
const SEARCH_INVALID_SEARCH_MESSAGE = "No Products Found";
const SEARCH_VALID_PRODUCT_DESCRIPTION = "Classic denim jeans...";
const SEARCH_VALID_PRODUCT_NAME = "Jeans";
const SEARCH_VALID_PRODUCT_SINGLE_RESULT = [{
    _id: "66db4280db0119d9234b27fb",
    category: "66db427fdb0119d9234b27ee",
    createdAt: "2024-09-06T17:57:20.029Z",
    description: "Classic denim jeans",
    name: "Jeans",
    price: 49.99,
    quantity: 75,
    shipping: true,
    slug: "jeans",
    updatedAt: "2024-09-06T17:57:20.029Z"
}];

// Mocking axios.post
jest.mock('axios');
jest.mock('react-hot-toast');

jest.mock('../context/auth', () => ({
    useAuth: jest.fn(() => [null, jest.fn()]) // Mock useAuth hook to return null state and a mock function for setAuth
  }));

jest.mock('../context/cart', () => ({
    useCart: jest.fn(() => [null, jest.fn()]) // Mock useCart hook to return null state and a mock function
}));
    
jest.mock('../context/search', () => ({
    useSearch: jest.fn(() => [{ keyword: ''}, jest.fn()]) // Mock useSearch hook to return null state and a mock function
}));  

Object.defineProperty(window, 'localStorage', {
    value: {
        setItem: jest.fn(),
        getItem: jest.fn(),
        emoveItem: jest.fn(),
    },
    writable: true,
});

window.matchMedia = window.matchMedia || function() {
    return {
      matches: false,
      addListener: function() {},
      removeListener: function() {}
    };
};

describe('Search Component', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should allow the user to search for products by name', async () => {
        useSearch.mockReturnValue([{
            results: SEARCH_VALID_PRODUCT_SINGLE_RESULT,
            keyword: SEARCH_VALID_PRODUCT_NAME
        }]);

        const { getByText, getByRole } = render(
            <MemoryRouter>
                <Search />
            </MemoryRouter>
        );

        expect(getByText(SEARCH_VALID_PRODUCT_NAME)).toBeInTheDocument();
        expect(getByRole('button', { name: "More Details" })).toBeInTheDocument();
        expect(getByRole('button', { name: "ADD TO CART" })).toBeInTheDocument();
        expect(getByText("$ " + SEARCH_VALID_PRODUCT_SINGLE_RESULT[0].price)).toBeInTheDocument();
    });

    it('should allow the user to search for products by description', async () => {
        useSearch.mockReturnValue([{
            results: SEARCH_VALID_PRODUCT_SINGLE_RESULT,
            keyword: SEARCH_VALID_PRODUCT_DESCRIPTION
        }]);

        const { getByText, getByRole } = render(
            <MemoryRouter>
                <Search />
            </MemoryRouter>
        );

        expect(getByText(SEARCH_VALID_PRODUCT_DESCRIPTION)).toBeInTheDocument();
        expect(getByRole('button', { name: "More Details" })).toBeInTheDocument();
        expect(getByRole('button', { name: "ADD TO CART" })).toBeInTheDocument();
        expect(getByText("$ " + SEARCH_VALID_PRODUCT_SINGLE_RESULT[0].price)).toBeInTheDocument();
    });

    it('should display an error message if user searches for non existent product', async () => {
        useSearch.mockReturnValue([{
            results: []
        }]);

        const { getByText } = render(
            <MemoryRouter>
                <Search />
            </MemoryRouter>
        );

        expect(getByText(SEARCH_INVALID_SEARCH_MESSAGE)).toBeInTheDocument();
    });

    // THIS SHOULD FAIL, THE MORE DETAILS BUTTON CURRENTLY DOESNT WORK
    it('should navigate to the product details page when a user clicks on the "More Details" button', async () => {
        useSearch.mockReturnValue([{
            results: SEARCH_VALID_PRODUCT_SINGLE_RESULT,
            keyword: SEARCH_VALID_PRODUCT_NAME
        }]);

        const { getByText, getByRole } = render(
            <MemoryRouter>
                <Search />
                <Routes>
                    <Route path={'/product/' + SEARCH_VALID_PRODUCT_SINGLE_RESULT[0].name.toLowerCase()} element={<ProductDetails />} />
                </Routes>
            </MemoryRouter>
        );

        fireEvent.click(getByRole('button', { name: 'More Details' }));
        expect(getByText("Product Details")).toBeInTheDocument();
    });

    // THIS SHOULD ALSO FAIL, THE ADD TO CART BUTTON CURRENTLY ALSO DOESNT WORK
    it('should add the product to the cart when a user clicks on the "ADD TO CART" button', async () => {
        useSearch.mockReturnValue([{
            results: SEARCH_VALID_PRODUCT_SINGLE_RESULT,
            keyword: SEARCH_VALID_PRODUCT_NAME
        }]);

        const { getByText, getByRole } = render(
            <MemoryRouter>
                <Search />
            </MemoryRouter>
        );

        fireEvent.click(getByRole('button', { name: 'ADD TO CART' }));
        expect(toast.success).toHaveBeenCalledWith('Item Added to cart');
    });
});
