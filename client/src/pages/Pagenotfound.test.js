import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import '@testing-library/jest-dom/extend-expect';
import Pagenotfound from './Pagenotfound'
import HomePage from './HomePage';

// Constants
const PAGENOTFOUND_ERROR_NUMBER = "404";
const PAGENOTFOUND_ERROR_MESSAGE = "Oops ! Page Not Found";
const PAGENOTFOUND_GO_BACK = "Go Back";

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
    useSearch: jest.fn(() => [{ keyword: '' }, jest.fn()]) // Mock useSearch hook to return null state and a mock function
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

describe("Pagenotfound Component", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should display the Pagenotfound Error Code', async () => {
        const { getByText } = render(
            <MemoryRouter>
            <Pagenotfound />
            </MemoryRouter>
        );

        expect(getByText(PAGENOTFOUND_ERROR_NUMBER)).toBeInTheDocument();
    });

    it('should display the Pagenotfound Error Message', async () => {
        const { getByText } = render(
            <MemoryRouter>
            <Pagenotfound />
            </MemoryRouter>
        );

        expect(getByText(PAGENOTFOUND_ERROR_MESSAGE)).toBeInTheDocument();
    });

    it('should display the Pagenotfound Go Back Button', async () => {
        const { getByText } = render(
            <MemoryRouter>
            <Pagenotfound />
            </MemoryRouter>
        );

        expect(getByText(PAGENOTFOUND_GO_BACK)).toBeInTheDocument();
    });

    it('should navigate back to the home page', async () => {
        const { getByText } = render(
            <MemoryRouter>
            <Pagenotfound />
                <Routes>
                    <Route path='/' element={<HomePage />} />
                </Routes>
            </MemoryRouter>
        );

        fireEvent.click(getByText(PAGENOTFOUND_GO_BACK));
        expect(screen.getByAltText("bannerimage")).toBeInTheDocument();
    });
});
