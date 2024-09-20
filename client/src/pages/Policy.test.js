import React from 'react';
import { render } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import '@testing-library/jest-dom/extend-expect';
import Policy from './Policy'

// Constants
const POLICY_ADD_PRIVACY_POLICY = "add privacy policy";

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

describe("Policy Component", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should allow user to view the add privacy policy', async () => {
        const { getAllByText } = render(<MemoryRouter initialEntries={['/policy']}>
          <Routes>
            <Route path="/policy" element={<Policy />} />
          </Routes>
        </MemoryRouter>);

        expect(getAllByText(POLICY_ADD_PRIVACY_POLICY)[0]).toBeInTheDocument();
    });
});
