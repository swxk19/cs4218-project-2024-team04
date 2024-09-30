import React from 'react'
import { render, fireEvent, waitFor } from '@testing-library/react'
import axios from 'axios'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import '@testing-library/jest-dom/extend-expect'
import Profile from './Profile'
import toast from "react-hot-toast";
import { useAuth } from "../../context/auth";

// Mocking axios.post
jest.mock('axios')
jest.mock('react-hot-toast')

jest.mock('../../context/auth', () => ({
    useAuth: jest.fn(() => [null, jest.fn()]) // Mock useAuth hook to return null state and a mock function for setAuth
}));

jest.mock('../../context/cart', () => ({
    useCart: jest.fn(() => [null, jest.fn()]) // Mock useCart hook to return null state and a mock function
}))

jest.mock('../../context/search', () => ({
    useSearch: jest.fn(() => [{ keyword: '' }, jest.fn()]) // Mock useSearch hook to return null state and a mock function
}))

jest.mock('../../hooks/useCategory', () => ({
    __esModule: true,
    default: jest.fn(() => [])
}));

Object.defineProperty(window, 'localStorage', {
    value: {
        setItem: jest.fn(),
        getItem: jest.fn(),
        removeItem: jest.fn(),
    },
    writable: true,
})

window.matchMedia = window.matchMedia || function() {
    return {
      matches: false,
      addListener: function() {},
      removeListener: function() {}
    }
};

describe('Profile Component', () => {
    beforeEach(() => {
        jest.clearAllMocks()
        jest.spyOn(global.console, 'log').mockImplementation(() => {});
        useAuth.mockReturnValue([{
            user: {
                name: 'John Doe',
                email: 'john.doe@example.com',
                phone: '123456789',
                address: '1 Computing Drive'
            },
        }, jest.fn()]);
        Object.defineProperty(window, 'localStorage', {
            value: {
                setItem: jest.fn(),
                getItem: jest.fn((key) =>
                    key === 'auth' ? JSON.stringify({
                        user: {
                            name: 'John Doe',
                            email: 'john.doe@example.com',
                            phone: '123456789',
                            address: '1 Computing Drive'
                        }}) : null
                ),
                removeItem: jest.fn(),
            },
            writable: true,
        })
    })

    afterEach(() => {
        console.log.mockRestore();
    });


    it('renders register form', () => {
        const { getByText, getByPlaceholderText } = render(
          <MemoryRouter initialEntries={['/user/profile']}>
            <Routes>
              <Route path="/user/profile" element={<Profile />} />
            </Routes>
          </MemoryRouter>
        );

        expect(getByText('USER PROFILE')).toBeInTheDocument();
        expect(getByPlaceholderText('Enter Your Name')).toBeInTheDocument();
        expect(getByPlaceholderText('Enter Your Email')).toBeInTheDocument();
        expect(getByPlaceholderText('Enter Your Password')).toBeInTheDocument();
        expect(getByPlaceholderText('Enter Your Phone')).toBeInTheDocument();
        expect(getByPlaceholderText('Enter Your Address')).toBeInTheDocument();
    });

    it('inputs should be initially filled with user details except password', () => {
        const { getByPlaceholderText } = render(
          <MemoryRouter initialEntries={['/user/profile']}>
            <Routes>
              <Route path="/user/profile" element={<Profile />} />
            </Routes>
          </MemoryRouter>
        );

        expect(getByPlaceholderText('Enter Your Name').value).toBe('John Doe');
        expect(getByPlaceholderText('Enter Your Email').value).toBe('john.doe@example.com');
        expect(getByPlaceholderText('Enter Your Password').value).toBe('');
        expect(getByPlaceholderText('Enter Your Phone').value).toBe('123456789');
        expect(getByPlaceholderText('Enter Your Address').value).toBe('1 Computing Drive');
    });

    it('should allow typing name, password, phone and address', () => {
        const { getByPlaceholderText } = render(
          <MemoryRouter initialEntries={['/user/profile']}>
            <Routes>
              <Route path="/user/profile" element={<Profile />} />
            </Routes>
          </MemoryRouter>
        );
        fireEvent.change(getByPlaceholderText('Enter Your Name'), { target: { value: 'John Doe 2' } });
        fireEvent.change(getByPlaceholderText('Enter Your Password'), { target: { value: 'password123' } });
        fireEvent.change(getByPlaceholderText('Enter Your Phone'), { target: { value: '987654321' } });
        fireEvent.change(getByPlaceholderText('Enter Your Address'), { target: { value: '2 Computing Drive' } });
        expect(getByPlaceholderText('Enter Your Name').value).toBe('John Doe 2');
        expect(getByPlaceholderText('Enter Your Password').value).toBe('password123');
        expect(getByPlaceholderText('Enter Your Phone').value).toBe('987654321');
        expect(getByPlaceholderText('Enter Your Address').value).toBe('2 Computing Drive');
    });

    it('should update the user successfully', async () => {
        axios.put.mockResolvedValueOnce({
            data: {
                success: true,
                updatedUser: {
                    id: 1,
                    name: 'John Doe 2',
                    email: 'john.doe@example.com',
                    phone: '987654321',
                    address: '2 Computing Drive'
                }
            }
        });

        const { getByPlaceholderText, getByText } = render(
            <MemoryRouter initialEntries={['/user/profile']}>
                <Routes>
                    <Route path="/user/profile" element={<Profile />} />
                </Routes>
            </MemoryRouter>
        );
        fireEvent.change(getByPlaceholderText('Enter Your Name'), { target: { value: 'John Doe 2' } });
        fireEvent.change(getByPlaceholderText('Enter Your Password'), { target: { value: 'password123' } });
        fireEvent.change(getByPlaceholderText('Enter Your Phone'), { target: { value: '987654321' } });
        fireEvent.change(getByPlaceholderText('Enter Your Address'), { target: { value: '2 Computing Drive' } });

        fireEvent.click(getByText('UPDATE'));

        await waitFor(() => expect(axios.put).toHaveBeenCalledWith("/api/v1/auth/profile",{
            name: 'John Doe 2',
            password: 'password123',
            email: 'john.doe@example.com',
            phone: '987654321',
            address: '2 Computing Drive'
        }));

        expect(toast.success).toHaveBeenCalledWith("Profile Updated Successfully");
    });

    it('should show error message if update fails', async () => {
        axios.put.mockRejectedValueOnce(
            new Error('Mock Error')
        );

        const { getByPlaceholderText, getByText } = render(
            <MemoryRouter initialEntries={['/user/profile']}>
                <Routes>
                    <Route path="/user/profile" element={<Profile />} />
                </Routes>
            </MemoryRouter>
        );

        fireEvent.change(getByPlaceholderText('Enter Your Name'), { target: { value: 'John Doe 2' } });
        fireEvent.change(getByPlaceholderText('Enter Your Password'), { target: { value: 'password123' } });
        fireEvent.change(getByPlaceholderText('Enter Your Phone'), { target: { value: '987654321' } });
        fireEvent.change(getByPlaceholderText('Enter Your Address'), { target: { value: '2 Computing Drive' } });

        fireEvent.click(getByText('UPDATE'));

        await waitFor(() => expect(axios.put).toHaveBeenCalled());
        expect(toast.error).toHaveBeenCalledWith("Something went wrong");
        expect(console.log).toHaveBeenCalledWith(new Error('Mock Error'));
    });

    it('should show error message if axios is successful, but internally there is an error', async () => {
        axios.put.mockResolvedValueOnce({
            data: {
                error: 'Error Message'
            }
        });

        const { getByPlaceholderText, getByText } = render(
            <MemoryRouter initialEntries={['/user/profile']}>
                <Routes>
                    <Route path="/user/profile" element={<Profile />} />
                </Routes>
            </MemoryRouter>
        );

        fireEvent.change(getByPlaceholderText('Enter Your Name'), { target: { value: 'John Doe 2' } });
        fireEvent.change(getByPlaceholderText('Enter Your Password'), { target: { value: 'password123' } });
        fireEvent.change(getByPlaceholderText('Enter Your Phone'), { target: { value: '987654321' } });
        fireEvent.change(getByPlaceholderText('Enter Your Address'), { target: { value: '2 Computing Drive' } });

        fireEvent.click(getByText('UPDATE'));

        await waitFor(() => expect(axios.put).toHaveBeenCalled())
        expect(toast.error).toHaveBeenCalledWith("Error Message");
    });

    it('should disable the email field', () => {
        const { getByPlaceholderText } = render(
            <MemoryRouter initialEntries={['/user/profile']}>
                <Routes>
                    <Route path="/user/profile" element={<Profile />} />
                </Routes>
            </MemoryRouter>
        );
        expect(getByPlaceholderText('Enter Your Email')).toBeDisabled();
    });

    it('should hide the password input', () => {
        const { getByPlaceholderText } = render(
            <MemoryRouter initialEntries={['/user/profile']}>
                <Routes>
                    <Route path="/user/profile" element={<Profile />} />
                </Routes>
            </MemoryRouter>
        );

        const passwordInput = getByPlaceholderText('Enter Your Password');
        expect(passwordInput).toHaveAttribute('type', 'password');
    });
});
