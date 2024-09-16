import React from 'react'
import { render } from '@testing-library/react'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import '@testing-library/jest-dom/extend-expect'
import { useAuth } from "../../context/auth";
import AdminDashboard from "./AdminDashboard";


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

describe('Admin Dashboard Component', () => {

    beforeEach(() => {
        jest.clearAllMocks()
    })


    it('renders admin details', () => {

        useAuth.mockReturnValue([{
            user: {
                name: 'John Doe',
                email: 'john.doe@example.com',
                phone: '123456789',
            },
        }]);

        const { getByText } = render(
            <MemoryRouter initialEntries={['/dashboard/admin']}>
                <Routes>
                    <Route path="/dashboard/admin" element={<AdminDashboard />} />
                </Routes>
            </MemoryRouter>
        );

        expect(getByText('Admin Name : John Doe')).toBeInTheDocument();
        expect(getByText('Admin Email : john.doe@example.com')).toBeInTheDocument();
        expect(getByText('Admin Contact : 123456789')).toBeInTheDocument();
    });
});
