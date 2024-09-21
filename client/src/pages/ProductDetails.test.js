import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter, Routes, Route, useParams } from 'react-router-dom';
import axios from 'axios';
import '@testing-library/jest-dom/extend-expect';
import ProductDetails from './ProductDetails';
import toast from 'react-hot-toast';

// Constants
const JEANS_PRODUCT_OBJECT = {
    _id: "66db4280db0119d9234b27fb",
    category: {
        _id: "66db427fdb0119d9234b27ee",
        name: "Clothing",
        slug: "clothing"
    },
    createdAt: "2024-09-06T17:57:20.029Z",
    description: "Classic denim jeans",
    name: "Jeans",
    price: 49.99,
    quantity: 75,
    shipping: true,
    slug: "jeans",
    updatedAt: "2024-09-06T17:57:20.029Z"
};
const TSHIRT_PRODUCT_OBJECT = {
    _id: "66db427fdb0119d9234b27f7",
    category: {
        _id: "66db427fdb0119d9234b27ee",
        name: "Clothing",
        slug: "clothing"
    },
    createdAt: "2024-09-06T17:57:19.984Z",
    description: "A comfortable cotton t-shirt",
    name: "T-shirt",
    price: 19.99,
    quantity: 100,
    shipping: true,
    slug: "t-shirt",
    updatedAt: "2024-09-06T17:57:19.984Z"
};

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

jest.mock('react-router-dom', () => ({
    ...jest.requireActual('react-router-dom'), // preserve the rest of the module
    useParams: jest.fn(),
}));
  

Object.defineProperty(window, 'localStorage', {
    value: {
        setItem: jest.fn(),
        getItem: jest.fn(),
        removeItem: jest.fn(),
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

axios.get.mockImplementation((url) => {
    switch (url) {
        case `/api/v1/product/get-product/jeans`:
            return Promise.resolve({
                data: { 
                    message: "Single Product Fetched",
                    product: JEANS_PRODUCT_OBJECT,
                    success: true
                }
            })
        case `/api/v1/product/related-product/66db4280db0119d9234b27fb/66db427fdb0119d9234b27ee`:
            return Promise.resolve({
                data: {
                    products: [
                        TSHIRT_PRODUCT_OBJECT
                    ],
                    success: true
                }
            })
        case `/api/v1/product/get-product/t-shirt`:
            return Promise.resolve({
                data: { 
                    message: "Single Product Fetched",
                    product: TSHIRT_PRODUCT_OBJECT,
                    success: true
                }
            })
        case `/api/v1/product/related-product/66db427fdb0119d9234b27f7/66db427fdb0119d9234b27ee`:
            return Promise.resolve({
                data: {
                    products: [
                        JEANS_PRODUCT_OBJECT
                    ],
                    success: true
                }
            })
        default:
            break;
    }
});

describe('Product Details Component', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        useParams.mockReturnValueOnce({ slug: "jeans" });
    });

    it('should display the name of the product', async () => {
        const { getByText } = render(
            <MemoryRouter initialEntries={['/product/' + JEANS_PRODUCT_OBJECT.slug]}>
                <ProductDetails />
            </MemoryRouter>
        );

        await waitFor(() => {
            expect(axios.get).toHaveBeenCalled();
        });
        
        await waitFor(() => {
            expect(getByText("Name : " + JEANS_PRODUCT_OBJECT.name)).toBeInTheDocument();
        });
    });

    it('should display the description of the product', async () => {
        const { getByText } = render(
            <MemoryRouter initialEntries={['/product/' + JEANS_PRODUCT_OBJECT.slug]}>
                <ProductDetails />
            </MemoryRouter>
        );

        await waitFor(() => {
            expect(axios.get).toHaveBeenCalled();
        });
        
        await waitFor(() => {
            expect(getByText("Description : " + JEANS_PRODUCT_OBJECT.description)).toBeInTheDocument();
        });
    });

    it('should display the price of the product', async () => {
        const { getByText } = render(
            <MemoryRouter initialEntries={['/product/' + JEANS_PRODUCT_OBJECT.slug]}>
                <ProductDetails />
            </MemoryRouter>
        );

        await waitFor(() => {
            expect(axios.get).toHaveBeenCalled();
        });
        
        await waitFor(() => {
            expect(getByText("Price :$" + JEANS_PRODUCT_OBJECT.price.toString())).toBeInTheDocument();
        });
    });

    it('should display the Category of the product', async () => {
        const { getByText } = render(
            <MemoryRouter initialEntries={['/product/' + JEANS_PRODUCT_OBJECT.slug]}>
                <ProductDetails />
            </MemoryRouter>
        );

        await waitFor(() => {
            expect(axios.get).toHaveBeenCalled();
        });
        
        await waitFor(() => {
            expect(getByText("Category : " + JEANS_PRODUCT_OBJECT.category.name )).toBeInTheDocument();
        });
    });

    it('should allow the user to add the product to their cart', async () => {
        const { getByText, getByRole } = render(
            <MemoryRouter initialEntries={['/product/' + JEANS_PRODUCT_OBJECT.slug]}>
                <ProductDetails />
            </MemoryRouter>
        );

        await waitFor(() => {
            expect(axios.get).toHaveBeenCalled();
        });
        await waitFor(() => {
            expect(getByText("Category : " + JEANS_PRODUCT_OBJECT.category.name )).toBeInTheDocument();
        });

        fireEvent.click(getByRole('button', { name: 'ADD TO CART' }));
        expect(toast.success).toHaveBeenCalledWith('Item Added to cart');
    });

    it('should display similar products to the user', async () => {
        const { getByText, getByRole } = render(
            <MemoryRouter initialEntries={['/product/' + JEANS_PRODUCT_OBJECT.slug]}>
                <ProductDetails />
            </MemoryRouter>
        );

        await waitFor(() => {
            expect(axios.get).toHaveBeenCalled();
        });
        await waitFor(() => {
            expect(getByText(TSHIRT_PRODUCT_OBJECT.name)).toBeInTheDocument();
        });
        await waitFor(() => {
            expect(getByRole('button', { name: "More Details" })).toBeInTheDocument();
        });
    });

    it('should allow the user to navigate to the product details page of the similar product', async () => {
        // render the first product details page, with the jeans data
        const { getByText, getByRole } = render(
            <MemoryRouter>
                <ProductDetails />
            </MemoryRouter>
        );

        await waitFor(() => {
            expect(axios.get).toHaveBeenCalled();
        });
        await waitFor(() => {
            expect(getByText(TSHIRT_PRODUCT_OBJECT.name)).toBeInTheDocument();
        });
        await waitFor(() => {
            expect(getByRole('button', { name: "More Details" })).toBeInTheDocument();
        });

        // render the second product details page, with the t-shirt data
        fireEvent.click(getByRole('button', { name: "More Details" }));
        useParams.mockReturnValueOnce({ slug: "t-shirt" });
        render(<MemoryRouter><ProductDetails/></MemoryRouter>);

        await waitFor(() => {
            expect(axios.get).toHaveBeenCalled();
        });
        await waitFor(() => {
            expect(getByText("Name : " + TSHIRT_PRODUCT_OBJECT.name)).toBeInTheDocument();
        });
    });
});
