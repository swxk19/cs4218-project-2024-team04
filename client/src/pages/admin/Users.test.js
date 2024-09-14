import React from 'react'
import { render } from '@testing-library/react'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import '@testing-library/jest-dom/extend-expect'
import Users from "./Users";

jest.mock('../../context/auth', () => ({
    useAuth: jest.fn(() => [null, jest.fn()]) // Mock useAuth hook to return null state and a mock function for setAuth
}));

jest.mock('../../context/cart', () => ({
    useCart: jest.fn(() => [null, jest.fn()]) // Mock useCart hook to return null state and a mock function
}));

jest.mock('../../context/search', () => ({
    useSearch: jest.fn(() => [{ keyword: '' }, jest.fn()]) // Mock useSearch hook to return null state and a mock function
}));

Object.defineProperty(window, 'localStorage', {
    value: {
        setItem: jest.fn(),
        getItem: jest.fn(),
        removeItem: jest.fn(),
    },
    writable: true,
});

describe('Users Component', () => {

    beforeEach(() => {
        jest.clearAllMocks()
    })

    it('renders all users title', () => {

        const { getByText } = render(
            <MemoryRouter initialEntries={['/admin/users']}>
                <Routes>
                    <Route path="/admin/users" element={<Users />} />
                </Routes>
            </MemoryRouter>
        );

        expect(getByText('All Users')).toBeInTheDocument();
    });
});
