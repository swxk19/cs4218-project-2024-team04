import React from 'react';
import { render } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import '@testing-library/jest-dom/extend-expect';
import Contact from './Contact'

// Constants
const CONTACT_EMAIL = ": www.help@ecommerceapp.com";
const CONTACT_TELEPHONE_NUMBER = ": 012-3456789";
const CONTACT_TOLL_FREE_TELEPHONE = ": 1800-0000-0000 (toll free)";

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

describe("Contact Component", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should allow user to contact the company via email', async () => {
        const { getByText } = render(<MemoryRouter initialEntries={['/contact']}>
          <Routes>
            <Route path="/contact" element={<Contact />} />
          </Routes>
        </MemoryRouter>);

        expect(getByText(CONTACT_EMAIL)).toBeInTheDocument();
    });

    it('should allow the user to contact the company via telephone', async () => {
        const { getByText } = render(<MemoryRouter initialEntries={['/contact']}>
            <Routes>
              <Route path="/contact" element={<Contact />} />
            </Routes>
          </MemoryRouter>);
  
          expect(getByText(CONTACT_TELEPHONE_NUMBER)).toBeInTheDocument();
    });

    it('should allow the user to contact the company via toll-free telephone number', async () => {
        const { getByText } = render(<MemoryRouter initialEntries={['/contact']}>
            <Routes>
              <Route path="/contact" element={<Contact />} />
            </Routes>
          </MemoryRouter>);
  
          expect(getByText(CONTACT_TOLL_FREE_TELEPHONE)).toBeInTheDocument();
    });
});
