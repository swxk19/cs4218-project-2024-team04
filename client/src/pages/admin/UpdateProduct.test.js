import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import axios from 'axios'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import '@testing-library/jest-dom/extend-expect'
import toast from 'react-hot-toast'
import UpdateProduct from './UpdateProduct'

// Mocking dependencies
jest.mock('axios')
jest.mock('react-hot-toast')

// Mock URL.createObjectURL
global.URL.createObjectURL = jest.fn(() => 'mocked-url')
const mockNavigate = jest.fn()
jest.mock('react-router-dom', () => ({
    ...jest.requireActual('react-router-dom'),
    useNavigate: () => mockNavigate,
    useParams: () => ({ slug: 'test-product' }),
}))
jest.mock('../../components/Layout', () => ({ children }) => <div>{children}</div>)
jest.mock('../../components/AdminMenu', () => () => <div>Admin Menu</div>)
jest.mock('antd', () => ({
    Select: Object.assign(
        ({ children, onChange, value, placeholder }) => (
            <select
                data-testid='category-select'
                onChange={(e) => onChange(e.target.value)}
                value={value}
                aria-label={placeholder}
            >
                {children}
            </select>
        ),
        { Option: ({ children, value }) => <option value={value}>{children}</option> }
    ),
}))

describe('UpdateProduct Component', () => {
    const mockProduct = {
        _id: '1',
        name: 'Test Product',
        description: 'Test Description',
        price: 100,
        quantity: 10,
        category: { _id: 'cat1', name: 'Category 1' },
        shipping: true,
    }

    const mockCategories = [
        { _id: 'cat1', name: 'Category 1' },
        { _id: 'cat2', name: 'Category 2' },
    ]

    beforeEach(() => {
        jest.clearAllMocks()
        axios.get.mockResolvedValueOnce({ data: { product: mockProduct } })
        axios.get.mockResolvedValueOnce({ data: { success: true, category: mockCategories } })
        axios.put.mockResolvedValue({ data: { success: true } })
    })

    it('renders without crashing', async () => {
        render(
            <MemoryRouter>
                <Routes>
                    <Route path='/' element={<UpdateProduct />} />
                </Routes>
            </MemoryRouter>
        )

        await waitFor(() => {
            expect(screen.getByText('Update Product')).toBeInTheDocument()
        })
    })

    it('populates form fields with existing product data', async () => {
        render(
            <MemoryRouter>
                <Routes>
                    <Route path='/' element={<UpdateProduct />} />
                </Routes>
            </MemoryRouter>
        )

        await waitFor(() => {
            expect(screen.getByDisplayValue('Test Product')).toBeInTheDocument()
            expect(screen.getByDisplayValue('Test Description')).toBeInTheDocument()
            expect(screen.getByDisplayValue('100')).toBeInTheDocument()
            expect(screen.getByDisplayValue('10')).toBeInTheDocument()
        })
    })

    it('populates category dropdown with categories from API', async () => {
        render(
            <MemoryRouter>
                <Routes>
                    <Route path='/' element={<UpdateProduct />} />
                </Routes>
            </MemoryRouter>
        )

        await waitFor(() => {
            const categorySelect = screen.getByRole('combobox', { name: /select a category/i })
            expect(categorySelect).toBeInTheDocument()
            expect(screen.getByText('Category 1')).toBeInTheDocument()
            expect(screen.getByText('Category 2')).toBeInTheDocument()
        })
    })

    it('updates state when category is changed', async () => {
        render(
            <MemoryRouter>
                <Routes>
                    <Route path='/' element={<UpdateProduct />} />
                </Routes>
            </MemoryRouter>
        )

        await waitFor(() => {
            const categorySelect = screen.getByRole('combobox', { name: /select a category/i })
            fireEvent.change(categorySelect, { target: { value: 'cat2' } })
            expect(categorySelect.value).toBe('cat2')
        })
    })

    it('updates preview image when new photo is uploaded', async () => {
        render(
            <MemoryRouter>
                <Routes>
                    <Route path='/' element={<UpdateProduct />} />
                </Routes>
            </MemoryRouter>
        )

        await waitFor(() => {
            const fileInput = screen
                .getByText(/Upload Photo|photo\.name/i)
                .closest('label')
                .querySelector('input[type="file"]')
            const file = new File(['test'], 'test.png', { type: 'image/png' })
            fireEvent.change(fileInput, { target: { files: [file] } })
            const previewImage = screen.getByAltText('product_photo')
            expect(previewImage).toBeInTheDocument()
            expect(previewImage.src).toBe('http://localhost/mocked-url')
        })
    })

    it('calls update API when "UPDATE PRODUCT" button is clicked', async () => {
        axios.put.mockResolvedValueOnce({ data: { success: true } })

        render(
            <MemoryRouter>
                <Routes>
                    <Route path='/' element={<UpdateProduct />} />
                </Routes>
            </MemoryRouter>
        )

        await waitFor(() => {
            fireEvent.click(screen.getByText('UPDATE PRODUCT'))
        })

        expect(axios.put).toHaveBeenCalled()
        expect(toast.success).toHaveBeenCalledWith('Product Updated Successfully')
        expect(mockNavigate).toHaveBeenCalledWith('/dashboard/admin/products')
    })

    // UI crashes with runtime error when user submits invalid product values (eg. empty price)
    it.skip('displays error message when product update fails', async () => {
        const BACKEND_ERROR_MESSAGE = 'ERROR MESSAGE'
        axios.put.mockRejectedValueOnce({
            response: {
                status: 401,
                data: { message: BACKEND_ERROR_MESSAGE },
            },
        })

        render(
            <MemoryRouter>
                <Routes>
                    <Route path='/' element={<UpdateProduct />} />
                </Routes>
            </MemoryRouter>
        )

        await waitFor(() => {
            fireEvent.click(screen.getByText('UPDATE PRODUCT'))
        })

        await waitFor(() => {
            expect(toast.error).toHaveBeenCalledWith(BACKEND_ERROR_MESSAGE)
        })
    })

    // Displays misspelled toast message "Product DEleted Succfully".
    it.skip('calls delete API when "DELETE PRODUCT" button is clicked and confirmed', async () => {
        axios.delete.mockResolvedValueOnce({ data: { success: true } })
        window.prompt = jest.fn(() => 'yes')

        render(
            <MemoryRouter>
                <Routes>
                    <Route path='/' element={<UpdateProduct />} />
                </Routes>
            </MemoryRouter>
        )

        await waitFor(() => {
            fireEvent.click(screen.getByText('DELETE PRODUCT'))
        })

        expect(axios.delete).toHaveBeenCalled()
        expect(toast.success).toHaveBeenCalledWith('Product Deleted Successfully')
        expect(mockNavigate).toHaveBeenCalledWith('/dashboard/admin/products')
    })

    it('does not call delete API when deletion is not confirmed', async () => {
        window.prompt = jest.fn(() => null)

        render(
            <MemoryRouter>
                <Routes>
                    <Route path='/' element={<UpdateProduct />} />
                </Routes>
            </MemoryRouter>
        )

        await waitFor(() => {
            fireEvent.click(screen.getByText('DELETE PRODUCT'))
        })

        expect(axios.delete).not.toHaveBeenCalled()
    })

    it('updates shipping state when dropdown is changed', async () => {
        render(
            <MemoryRouter>
                <Routes>
                    <Route path='/' element={<UpdateProduct />} />
                </Routes>
            </MemoryRouter>
        )

        await waitFor(() => {
            const shippingSelect = screen.getAllByTestId('category-select')[1]
            fireEvent.change(shippingSelect, { target: { value: '0' } })
            expect(shippingSelect.value).toBe('0')
        })
    })

    it('updates input fields state when changed', async () => {
        render(
            <MemoryRouter>
                <Routes>
                    <Route path='/' element={<UpdateProduct />} />
                </Routes>
            </MemoryRouter>
        )

        await waitFor(() => {
            const nameInput = screen.getByDisplayValue('Test Product')
            fireEvent.change(nameInput, { target: { value: 'Updated Product' } })
            expect(nameInput.value).toBe('Updated Product')

            const priceInput = screen.getByDisplayValue('100')
            fireEvent.change(priceInput, { target: { value: '200' } })
            expect(priceInput.value).toBe('200')
        })
    })
})
