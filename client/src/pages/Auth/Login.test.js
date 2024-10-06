import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import axios from 'axios'
import { MemoryRouter, Routes, Route, useNavigate} from 'react-router-dom'
import '@testing-library/jest-dom/extend-expect'
import toast from 'react-hot-toast'
import Login from './Login'

// Mocking axios.post and other dependencies
jest.mock('axios')
jest.mock('react-hot-toast')
const mockNavigate = jest.fn()
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}))


jest.mock('../../context/auth', () => ({
  useAuth: jest.fn(() => [null, jest.fn()]) // Mock useAuth hook to return null state and a mock function for setAuth
}))

jest.mock('../../context/cart', () => ({
  useCart: jest.fn(() => [null, jest.fn()]) // Mock useCart hook to return null state and a mock function
}))

jest.mock('../../context/search', () => ({
  useSearch: jest.fn(() => [{ keyword: '' }, jest.fn()]) // Mock useSearch hook to return null state and a mock function
}))

Object.defineProperty(window, 'localStorage', {
  value: {
    setItem: jest.fn(),
    getItem: jest.fn(),
    removeItem: jest.fn(),
  },
  writable: true,
})

window.matchMedia = window.matchMedia || function () {
  return {
    matches: false,
    addListener: function () {},
    removeListener: function () {}
  }
}

describe('Login Component', () => {
  let getByPlaceholderText
  let getByText

  beforeEach(() => {
    jest.clearAllMocks()
    const component = render(
      <MemoryRouter initialEntries={['/login']}>
        <Routes>
          <Route path="/login" element={<Login />} />
        </Routes>
      </MemoryRouter>
    )
    getByPlaceholderText = component.getByPlaceholderText
    getByText = component.getByText
  })
  describe('Initial Render', () => {
    it('renders login form', () => {
      expect(getByText('LOGIN FORM')).toBeInTheDocument()
      expect(getByPlaceholderText('Enter Your Email')).toBeInTheDocument()
      expect(getByPlaceholderText('Enter Your Password')).toBeInTheDocument()
    })

    it('inputs should be initially empty', () => {
      expect(getByPlaceholderText('Enter Your Email').value).toBe('')
      expect(getByPlaceholderText('Enter Your Password').value).toBe('')
    })
  })

  describe('Login Form Input', () => {
    it('should allow typing email and password', () => {
      fireEvent.change(getByPlaceholderText('Enter Your Email'), { target: { value: 'test@example.com' } })
      fireEvent.change(getByPlaceholderText('Enter Your Password'), { target: { value: 'password123' } })
      expect(getByPlaceholderText('Enter Your Email').value).toBe('test@example.com')
      expect(getByPlaceholderText('Enter Your Password').value).toBe('password123')
    })

    describe('Valid Form Inputs', () => {
      describe('Email Field', () => {
        it('should accept a valid email address', () => {
          const emailInput = getByPlaceholderText('Enter Your Email')

          fireEvent.change(emailInput, { target: { value: 'valid_email@domain.com' } })

          expect(emailInput).toBeValid()
        })
      })
      describe('Password Field', () => {
        it('should accept a valid password', () => {
          const passwordInput = getByPlaceholderText('Enter Your Password')

          fireEvent.change(passwordInput, { target: { value: '123abc098' } })

          expect(passwordInput).toBeValid()
        })
      })
    })

    describe('Invalid Form Inputs', () => {
      it('should not allow form submission if any field is invalid', async () => {
        const passwordInput = getByPlaceholderText('Enter Your Password')

        fireEvent.change(passwordInput, { target: { value: '' } })
        fireEvent.click(getByText('LOGIN'))

        await waitFor(() => {
          expect(axios.post).not.toHaveBeenCalled()
        })
      })

      describe('Password Field', () => {
        it('should be invalid for empty password', () => {
          const passwordInput = getByPlaceholderText('Enter Your Password')

          fireEvent.change(passwordInput, { target: { value: '' } })

          expect(passwordInput).toBeInvalid()
        })
      })
      describe('Email Field', () => {
        it('should be invalid for empty email', () => {
          const emailInput = getByPlaceholderText('Enter Your Email')

          fireEvent.change(emailInput, { target: { value: '' } })

          expect(emailInput).toBeInvalid()
        })

        it('should show an error if user enters an email without "@"', () => {
          const emailInput = getByPlaceholderText('Enter Your Email')

          fireEvent.change(emailInput, { target: { value: 'invalid_email' } })

          expect(emailInput).toBeInvalid()
        })

        it('should show an error if user enters without a domain', () => {
          const emailInput = getByPlaceholderText('Enter Your Email')

          fireEvent.change(emailInput, { target: { value: 'invalid_email@' } })

          expect(emailInput).toBeInvalid()
        })

        it.failing('should show an error if user enters email without top-level domain', () => {
          const emailInput = getByPlaceholderText('Enter Your Email')

          fireEvent.change(emailInput, { target: { value: 'invalid_email@domain' } })

          expect(emailInput).toBeInvalid()
        })
      })
    })
  })

  describe('Login Form Submission', () => {
    describe('API Calls & Responses', () => {
      it('should handle a falsy API response', async () => {
        axios.post.mockResolvedValueOnce(undefined)

        fireEvent.change(getByPlaceholderText('Enter Your Email'), { target: { value: 'test@example.com' } })
        fireEvent.change(getByPlaceholderText('Enter Your Password'), { target: { value: 'password123' } })
        fireEvent.click(getByText('LOGIN'))

        await waitFor(() => expect(axios.post).toHaveBeenCalled())

        expect(toast.error).toHaveBeenCalledWith('Something went wrong')
      })
      it('should call the API with values based on the login form', async () => {
        axios.post.mockResolvedValueOnce({
          data: {
            success: true,
            user: { id: 1, name: 'Test Name', email: 'test@example.com' },
            token: 'mockToken'
          }
        })

        fireEvent.change(getByPlaceholderText('Enter Your Email'), { target: { value: 'test@example.com' } });
        fireEvent.change(getByPlaceholderText('Enter Your Password'), { target: { value: 'password123' } });

        fireEvent.click(getByText('LOGIN'));

        await waitFor(() => expect(axios.post).toHaveBeenCalled());

        expect(axios.post).toHaveBeenCalledWith('/api/v1/auth/login', {
          email: 'test@example.com',
          password: 'password123'
        });
      })
    })
    describe('Successful Response', () => {
      it('should login the user successfully', async () => {
        axios.post.mockResolvedValueOnce({
          data: {
            success: true,
            user: { id: 1, name: 'John Doe', email: 'test@example.com' },
            token: 'mockToken'
          }
        })

        fireEvent.change(getByPlaceholderText('Enter Your Email'), { target: { value: 'test@example.com' } })
        fireEvent.change(getByPlaceholderText('Enter Your Password'), { target: { value: 'password123' } })
        fireEvent.click(getByText('LOGIN'))

        await waitFor(() => expect(axios.post).toHaveBeenCalled())
        expect(toast.success).toHaveBeenCalledWith(undefined, {
          duration: 5000,
          icon: '🙏',
          style: {
            background: 'green',
            color: 'white'
          }
        })

        expect(localStorage.setItem).toHaveBeenCalledWith(
          'auth',
          JSON.stringify({
            success: true,
            user: { id: 1, name: 'John Doe', email: 'test@example.com' },
            token: 'mockToken'
          })
        )

        expect(mockNavigate).toHaveBeenCalledWith('/')

      })
    })

    describe('Invalid Login Credentials', () => {
      it('should display error message if API returns invalid credentials error', async () => {
        axios.post.mockResolvedValueOnce({ data: {
          success: false,
          message: "Invalid email or password"
         }})

        fireEvent.change(getByPlaceholderText('Enter Your Email'), { target: { value: 'test@example.com' } })
        fireEvent.change(getByPlaceholderText('Enter Your Password'), { target: { value: 'password123' } })
        fireEvent.click(getByText('LOGIN'))

        await waitFor(() => expect(axios.post).toHaveBeenCalled())
        expect(toast.error).toHaveBeenCalledWith('Invalid email or password')
      })
    })
  })
})
