import React from 'react'
import { render } from '@testing-library/react'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import '@testing-library/jest-dom/extend-expect'
import { useAuth } from "../../context/auth";
import Dashboard from './Dashboard';

jest.mock("../../components/Layout", () => ({ children, title }) => (
        <div>
            <title>
                {title}
            </title>
            <main>
                {children}
            </main>
        </div>
    )
);

jest.mock('../../context/auth', () => ({
    useAuth: jest.fn(() => [null, jest.fn()]) // Mock useAuth hook to return null state and a mock function for setAuth
}));

describe('Dashboard Component', () => {

    beforeEach(() => {
        jest.clearAllMocks()
    })


    it('renders user details', () => {

        useAuth.mockReturnValue([{
            user: {
                name: 'John Doe',
                email: 'john.doe@example.com',
                address: '1 Computing Drive',
            },
        }]);

        const { getByText, getAllByText } = render(
            <MemoryRouter initialEntries={['/dashboard']}>
                <Routes>
                    <Route path="/dashboard" element={<Dashboard />} />
                </Routes>
            </MemoryRouter>
        );

        expect(getByText('John Doe')).toBeInTheDocument();
        expect(getByText('john.doe@example.com')).toBeInTheDocument();
        expect(getByText('1 Computing Drive')).toBeInTheDocument();
    });
});
