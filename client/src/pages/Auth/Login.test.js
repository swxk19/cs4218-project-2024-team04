import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import axios from 'axios'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import '@testing-library/jest-dom/extend-expect'
import toast from 'react-hot-toast'
import Login from './Login'

// Mocking axios.post and other dependencies
jest.mock('axios')
jest.mock('react-hot-toast')

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
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('Initial Render', () => {
    it('renders login form', () => {
      const { getByText, getByPlaceholderText } = render(
        <MemoryRouter initialEntries={['/login']}>
          <Routes>
            <Route path="/login" element={<Login />} />
          </Routes>
        </MemoryRouter>
      )

      expect(getByText('LOGIN FORM')).toBeInTheDocument()
      expect(getByPlaceholderText('Enter Your Email')).toBeInTheDocument()
      expect(getByPlaceholderText('Enter Your Password')).toBeInTheDocument()
    })

    it('inputs should be initially empty', () => {
      const { getByPlaceholderText } = render(
        <MemoryRouter initialEntries={['/login']}>
          <Routes>
            <Route path="/login" element={<Login />} />
          </Routes>
        </MemoryRouter>
      )

      expect(getByPlaceholderText('Enter Your Email').value).toBe('')
      expect(getByPlaceholderText('Enter Your Password').value).toBe('')
    })
  })

  describe('Login Form Input', () => {
    it('should allow typing email and password', () => {
      const { getByPlaceholderText } = render(
        <MemoryRouter initialEntries={['/login']}>
          <Routes>
            <Route path="/login" element={<Login />} />
          </Routes>
        </MemoryRouter>
      )
      fireEvent.change(getByPlaceholderText('Enter Your Email'), { target: { value: 'test@example.com' } })
      fireEvent.change(getByPlaceholderText('Enter Your Password'), { target: { value: 'password123' } })
      expect(getByPlaceholderText('Enter Your Email').value).toBe('test@example.com')
      expect(getByPlaceholderText('Enter Your Password').value).toBe('password123')
    })

    describe('Valid Form Inputs', () => {
      describe('Valid Email Inputs', () => {
        it('should accept a valid email address', () => {
          const { getByPlaceholderText, getByText } = render(
            <MemoryRouter initialEntries={['/login']}>
              <Routes>
                <Route path="/login" element={<Login />} />
              </Routes>
            </MemoryRouter>
          )
          const emailInput = getByPlaceholderText('Enter Your Email')
          const loginButton = getByText('LOGIN')

          fireEvent.change(emailInput, { target: { value: 'valid_email@domain.com' } })
          fireEvent.click(loginButton)

          expect(emailInput).toBeValid()
        })
      })
    })

    describe('Invalid Form Inputs', () => {
      describe('Invalid Email Inputs', () => {
        it('should show an error if user enters an empty email', () => {
          const { getByPlaceholderText, getByText } = render(
            <MemoryRouter initialEntries={['/login']}>
              <Routes>
                <Route path="/login" element={<Login />} />
              </Routes>
            </MemoryRouter>
          )
          const emailInput = getByPlaceholderText('Enter Your Email')
          const loginButton = getByText('LOGIN')

          fireEvent.change(emailInput, { target: { value: '' } })
          fireEvent.click(loginButton)

          expect(emailInput).toBeInvalid()
        })

        it('should show an error if user enters an email without "@"', () => {
          const { getByPlaceholderText, getByText } = render(
            <MemoryRouter initialEntries={['/login']}>
              <Routes>
                <Route path="/login" element={<Login />} />
              </Routes>
            </MemoryRouter>
          )
          const emailInput = getByPlaceholderText('Enter Your Email')
          const loginButton = getByText('LOGIN')

          fireEvent.change(emailInput, { target: { value: 'invalid_email' } })
          fireEvent.click(loginButton)

          expect(emailInput).toBeInvalid()
        })

        it('should show an error if user enters email with "@" but without a domain', () => {
          const { getByPlaceholderText, getByText } = render(
            <MemoryRouter initialEntries={['/login']}>
              <Routes>
                <Route path="/login" element={<Login />} />
              </Routes>
            </MemoryRouter>
          )
          const emailInput = getByPlaceholderText('Enter Your Email')
          const loginButton = getByText('LOGIN')

          fireEvent.change(emailInput, { target: { value: 'invalid_email@' } })
          fireEvent.click(loginButton)

          expect(emailInput).toBeInvalid()
        })

        it.failing('should show an error if user enters email without top-level domain', () => {
          const { getByPlaceholderText, getByText } = render(
            <MemoryRouter initialEntries={['/login']}>
              <Routes>
                <Route path="/login" element={<Login />} />
              </Routes>
            </MemoryRouter>
          )
          const emailInput = getByPlaceholderText('Enter Your Email')
          const loginButton = getByText('LOGIN')

          fireEvent.change(emailInput, { target: { value: 'invalid_email@domain' } })
          fireEvent.click(loginButton)

          expect(emailInput).toBeInvalid()
        })
      })
    })
  })

  describe('Successful Login', () => {
    it('should login the user successfully', async () => {
      axios.post.mockResolvedValueOnce({
        data: {
          success: true,
          user: { id: 1, name: 'John Doe', email: 'test@example.com' },
          token: 'mockToken'
        }
      })

      const { getByPlaceholderText, getByText } = render(
        <MemoryRouter initialEntries={['/login']}>
          <Routes>
            <Route path="/login" element={<Login />} />
          </Routes>
        </MemoryRouter>
      )

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
    })
  })

  describe('Invalid Login Credentials or API errors', () => {
    it('should handle a falsy API response', async () => {
      axios.post.mockResolvedValueOnce(undefined)

      const { getByPlaceholderText, getByText } = render(
        <MemoryRouter initialEntries={['/login']}>
          <Routes>
            <Route path="/login" element={<Login />} />
          </Routes>
        </MemoryRouter>
      )

      fireEvent.change(getByPlaceholderText('Enter Your Email'), { target: { value: 'test@example.com' } })
      fireEvent.change(getByPlaceholderText('Enter Your Password'), { target: { value: 'password123' } })
      fireEvent.click(getByText('LOGIN'))

      await waitFor(() => expect(axios.post).toHaveBeenCalled())

      // Since res is undefined, it should enter the error path
      expect(toast.error).toHaveBeenCalledWith('Something went wrong')
    })
    it('should display error message for failed credentials', async () => {
      axios.post.mockResolvedValueOnce({ message: 'Invalid email or password' })

      const { getByPlaceholderText, getByText } = render(
        <MemoryRouter initialEntries={['/login']}>
          <Routes>
            <Route path="/login" element={<Login />} />
          </Routes>
        </MemoryRouter>
      )

      fireEvent.change(getByPlaceholderText('Enter Your Email'), { target: { value: 'test@example.com' } })
      fireEvent.change(getByPlaceholderText('Enter Your Password'), { target: { value: 'password123' } })
      fireEvent.click(getByText('LOGIN'))

      await waitFor(() => expect(axios.post).toHaveBeenCalled())
      expect(toast.error).toHaveBeenCalledWith('Something went wrong')
    })
  })

  describe('Forgot Password Button', () => {
    it.failing('navigates to Account Recovery page when Forgot Password button is clicked', async () => {
      const { getByText } = render(
        <MemoryRouter initialEntries={['/login']}>
          <Routes>
            <Route path="/login" element={<Login />} />
          </Routes>
        </MemoryRouter>
      )

      fireEvent.click(getByText('Forgot Password'))
      expect(screen.getByText('Account Recovery')).toBeInTheDocument()
    })
  })
})
