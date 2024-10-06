import React from 'react'
import { render, fireEvent, waitFor, screen } from '@testing-library/react'
import axios from 'axios'
import { MemoryRouter, Routes, Route, useNavigate} from 'react-router-dom'
import '@testing-library/jest-dom/extend-expect'
import toast from 'react-hot-toast'
import Register from './Register'

// Mocking axios.post
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

window.matchMedia = window.matchMedia || function() {
    return {
      matches: false,
      addListener: function() {},
      removeListener: function() {}
    }
  }


describe('Register Component', () => {
  let getByPlaceholderText
  let getByText

  beforeEach(() => {
    jest.clearAllMocks()
    const component = render(
      <MemoryRouter initialEntries={['/register']}>
        <Routes>
          <Route path="/register" element={<Register />} />
        </Routes>
      </MemoryRouter>
    )
    getByPlaceholderText = component.getByPlaceholderText
    getByText = component.getByText
  })
  describe('Initial Render', () => {
    it('renders register form', ()=> {
      expect(getByText('REGISTER FORM')).toBeInTheDocument()
      expect(getByPlaceholderText('Enter Your Name')).toBeInTheDocument()
      expect(getByPlaceholderText('Enter Your Email')).toBeInTheDocument()
      expect(getByPlaceholderText('Enter Your Password')).toBeInTheDocument()
      expect(getByPlaceholderText('Enter Your Phone')).toBeInTheDocument()
      expect(getByPlaceholderText('Enter Your Address')).toBeInTheDocument()
      expect(getByPlaceholderText('Enter Your DOB')).toBeInTheDocument()
      expect(getByPlaceholderText('What is Your Favorite sports')).toBeInTheDocument()
    })

    it('inputs should be initially empty', () => {
      expect(getByPlaceholderText('Enter Your Name').value).toBe('')
      expect(getByPlaceholderText('Enter Your Email').value).toBe('')
      expect(getByPlaceholderText('Enter Your Password').value).toBe('')
      expect(getByPlaceholderText('Enter Your Phone').value).toBe('')
      expect(getByPlaceholderText('Enter Your Address').value).toBe('')
      expect(getByPlaceholderText('Enter Your DOB').value).toBe('')
      expect(getByPlaceholderText('What is Your Favorite sports').value).toBe('')
    })
  })

  describe('Register Form Input', () => {
    it('should allow inputs into input fields', () => {
      fireEvent.change(getByPlaceholderText('Enter Your Name'), { target: {value: 'test name' } })
      fireEvent.change(getByPlaceholderText('Enter Your Email'), { target: {value: 'test_email@email.com' } })
      fireEvent.change(getByPlaceholderText('Enter Your Password'), { target: {value: 'password!1' } })
      fireEvent.change(getByPlaceholderText('Enter Your Phone'), { target: {value: '12345678' } })
      fireEvent.change(getByPlaceholderText('Enter Your Address'), { target: {value: 'Sentosa #1' } })
      fireEvent.change(getByPlaceholderText('Enter Your DOB'), { target: {value: '1999-11-19' } })
      fireEvent.change(getByPlaceholderText('What is Your Favorite sports'), { target: {value: 'Badminton' } })

      expect(getByPlaceholderText('Enter Your Name').value).toBe('test name')
      expect(getByPlaceholderText('Enter Your Email').value).toBe('test_email@email.com')
      expect(getByPlaceholderText('Enter Your Password').value).toBe('password!1')
      expect(getByPlaceholderText('Enter Your Phone').value).toBe('12345678')
      expect(getByPlaceholderText('Enter Your Address').value).toBe('Sentosa #1')
      expect(getByPlaceholderText('Enter Your DOB').value).toBe('1999-11-19')
      expect(getByPlaceholderText('What is Your Favorite sports').value).toBe('Badminton')
    })

    describe('Valid Form Inputs', () => {
      describe('Password Field', () => {
        it('should accept a valid password', () => {
          const passwordInput = getByPlaceholderText('Enter Your Password')

          fireEvent.change(passwordInput, { target: { value: 'abc123$90' } })

          expect(passwordInput).toBeValid()
        })
      })
      describe('Phone Number Field', () => {
        it('should accept a valid phone number', () => {
          const phoneInput = getByPlaceholderText('Enter Your Phone')

          fireEvent.change(phoneInput, { target: { value: '12345678' } })

          expect(phoneInput).toBeValid()
        })
      })
      describe('DOB Field', () => {
        it('should accept a valid date', () => {
          const dobInput = getByPlaceholderText('Enter Your DOB')

          const dob = '2000-01-01'
          fireEvent.change(dobInput, { target: { value: dob } })

          expect(dobInput).toBeValid()
        })
      })

    describe('Invalid Form Inputs', () => {
      it('should not allow form submission if any field is invalid', () => {
        const nameInput = getByPlaceholderText('Enter Your Name')

        fireEvent.change(nameInput, { target: { value: '' } })
        fireEvent.click(getByText('REGISTER'))

        expect(axios.post).not.toHaveBeenCalled()
      })
      describe('Name Field', () => {
        it('should be invalid if it is empty', () => {
          const nameInput = getByPlaceholderText('Enter Your Name')
          fireEvent.change(nameInput, { target: { value: '' } })
          expect(nameInput).toBeInvalid()

        })
      })
      describe('Password Field', () => {
        it('should be invalid if is empty', () => {
          const passwordInput = getByPlaceholderText('Enter Your Password')

          fireEvent.change(passwordInput, { target: { value: '' } })

          expect(passwordInput).toBeInvalid()
        })
      })

      describe('DOB Field', () => {
        it.failing('should be invalid if DOB is in the future', () => {
          const dobInput = getByPlaceholderText('Enter Your DOB');

          const futureDOB = new Date();
          futureDOB.setDate(futureDOB.getDate() + 1);

          fireEvent.change(dobInput, { target: { value: futureDOB.toISOString().split('T')[0] } });

          fireEvent.click(getByText('REGISTER'));

          expect(dobInput).toBeInvalid();
        })

        it('should be invalid if DOB is empty', () => {
          const dobInput = getByPlaceholderText('Enter Your DOB');
          fireEvent.change(dobInput, { target: { value: '' } });

          fireEvent.click(getByText('REGISTER'));
          expect(dobInput).toBeInvalid();
        });
      })


      describe('Phone Number Field', () => {
        it.failing('should be invalid if it is not numeric', () => {
          const phoneInput = getByPlaceholderText('Enter Your Phone')

          fireEvent.change(phoneInput, { target: { value: 'abcd' } })

          expect(phoneInput).toBeInvalid()
        })
        it('should be invalid if it is empty', () => {
          const phoneInput = getByPlaceholderText('Enter Your Phone')

          fireEvent.change(phoneInput, { target: { value: '' } })

          expect(phoneInput).toBeInvalid()
        })
      })
    })
    })
  })
  describe('Register Form Submission', () => {
    describe('Successful Registration', () => {
      it('should show success message if registeration was successful', async () => {
        axios.post.mockResolvedValueOnce({ data: { success: true } })

        fireEvent.change(getByPlaceholderText('Enter Your Name'), { target: { value: 'John Doe' } })
        fireEvent.change(getByPlaceholderText('Enter Your Email'), { target: { value: 'test@example.com' } })
        fireEvent.change(getByPlaceholderText('Enter Your Password'), { target: { value: 'password123' } })
        fireEvent.change(getByPlaceholderText('Enter Your Phone'), { target: { value: '1234567890' } })
        fireEvent.change(getByPlaceholderText('Enter Your Address'), { target: { value: '123 Street' } })
        fireEvent.change(getByPlaceholderText('Enter Your DOB'), { target: { value: '2000-01-01' } })
        fireEvent.change(getByPlaceholderText('What is Your Favorite sports'), { target: { value: 'Football' } })

        fireEvent.click(getByText('REGISTER'))

        await waitFor(() => expect(axios.post).toHaveBeenCalled())
        expect(mockNavigate).toHaveBeenCalledWith('/login');
        expect(toast.success).toHaveBeenCalledWith('Register Successfully, please login')
      })
    })

    describe('Unsuccessful Registration', () => {
      it('should display error message on failed registration (email already exists)', async () => {
        axios.post.mockResolvedValueOnce({ data: {
          success: false,
          message: "Already Register please login"
         }})

        fireEvent.change(getByPlaceholderText('Enter Your Name'), { target: { value: 'John Doe' } })
        fireEvent.change(getByPlaceholderText('Enter Your Email'), { target: { value: 'test@example.com' } })
        fireEvent.change(getByPlaceholderText('Enter Your Password'), { target: { value: 'password123' } })
        fireEvent.change(getByPlaceholderText('Enter Your Phone'), { target: { value: '1234567890' } })
        fireEvent.change(getByPlaceholderText('Enter Your Address'), { target: { value: '123 Street' } })
        fireEvent.change(getByPlaceholderText('Enter Your DOB'), { target: { value: '2000-01-01' } })
        fireEvent.change(getByPlaceholderText('What is Your Favorite sports'), { target: { value: 'Football' } })

        fireEvent.click(getByText('REGISTER'))

        await waitFor(() => expect(axios.post).toHaveBeenCalled())
        expect(toast.error).toHaveBeenCalledWith('Already Register please login')
      })
    })

    it('should handle falsy API response', async () => {
      axios.post.mockRejectedValueOnce(undefined)

      fireEvent.change(getByPlaceholderText("Enter Your Name"), {
        target: { value: "Test Name" }
      });
      fireEvent.change(getByPlaceholderText("Enter Your Email"), {
        target: { value: "testname@example.com" }
      });
      fireEvent.change(getByPlaceholderText("Enter Your Password"), {
        target: { value: "password123" }
      });
      fireEvent.change(getByPlaceholderText("Enter Your Phone"), {
        target: { value: "1234567890" }
      });
      fireEvent.change(getByPlaceholderText("Enter Your Address"), {
        target: { value: "123 Woodlands St" }
      });
      fireEvent.change(getByPlaceholderText("Enter Your DOB"), {
        target: { value: "1999-01-01" }
      });
      fireEvent.change(getByPlaceholderText("What is Your Favorite sports"), {
        target: { value: "Football" }
      });

      fireEvent.click(getByText("REGISTER"));

      await waitFor(() => expect(axios.post).toHaveBeenCalled())

      expect(toast.error).toHaveBeenCalledWith('Something went wrong')
    })

    it('should call the API with values based on the form submitted', async () => {
      fireEvent.change(getByPlaceholderText("Enter Your Name"), {
        target: { value: "Test Name" }
      });
      fireEvent.change(getByPlaceholderText("Enter Your Email"), {
        target: { value: "testname@example.com" }
      });
      fireEvent.change(getByPlaceholderText("Enter Your Password"), {
        target: { value: "password123" }
      });
      fireEvent.change(getByPlaceholderText("Enter Your Phone"), {
        target: { value: "1234567890" }
      });
      fireEvent.change(getByPlaceholderText("Enter Your Address"), {
        target: { value: "123 Woodlands St" }
      });
      fireEvent.change(getByPlaceholderText("Enter Your DOB"), {
        target: { value: "1999-01-01" }
      });
      fireEvent.change(getByPlaceholderText("What is Your Favorite sports"), {
        target: { value: "Football" }
      });

      fireEvent.click(getByText("REGISTER"));

      await waitFor(() => expect(axios.post).toHaveBeenCalled());

      expect(axios.post).toHaveBeenCalledWith("/api/v1/auth/register", {
        name: "Test Name",
        email: "testname@example.com",
        password: "password123",
        phone: "1234567890",
        address: "123 Woodlands St",
        DOB: "1999-01-01",
        answer: "Football"
      })
    })
  })

})
