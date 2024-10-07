import React from 'react'
import { render, screen, fireEvent, waitFor, within } from '@testing-library/react'
import axios from 'axios'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import '@testing-library/jest-dom/extend-expect'
import toast from 'react-hot-toast'
import CreateCategory from './CreateCategory'

// Mocking dependencies
jest.mock('axios')
jest.mock('react-hot-toast')
const mockNavigate = jest.fn()
jest.mock('react-router-dom', () => ({
    ...jest.requireActual('react-router-dom'),
    useNavigate: () => mockNavigate,
}))
jest.mock('../../components/Layout', () => ({ children }) => <div>{children}</div>)
jest.mock('../../components/AdminMenu', () => {
    return jest.fn(() => (
        <div>
            Admin Menu
            <button onClick={() => mockNavigate('/dashboard/admin/create-category')}>
                Create Category
            </button>
        </div>
    ))
})
jest.mock('../../components/Form/CategoryForm', () => ({ handleSubmit, value, setValue }) => (
    <form onSubmit={handleSubmit}>
        <input
            type='text'
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder='Enter new category'
            data-testid='category-input'
        />
        <button type='submit' data-testid='submit-button'>
            Submit
        </button>
    </form>
))
jest.mock('antd', () => ({
    Modal: ({ children, visible, onCancel }) =>
        visible && (
            <div data-testid='edit-modal'>
                {children}
                <button onClick={onCancel}>Close</button>
            </div>
        ),
}))

describe('CreateCategory Component', () => {
    beforeEach(() => {
        jest.clearAllMocks()
    })

    it('renders create category form and table', async () => {
        axios.get.mockResolvedValueOnce({ data: { success: true, category: [] } })

        render(
            <MemoryRouter>
                <Routes>
                    <Route path='/' element={<CreateCategory />} />
                </Routes>
            </MemoryRouter>
        )

        await waitFor(() => {
            expect(screen.getByText('Manage Category')).toBeInTheDocument()
            expect(screen.getByPlaceholderText('Enter new category')).toBeInTheDocument()
            expect(screen.getByText('Name')).toBeInTheDocument()
            expect(screen.getByText('Actions')).toBeInTheDocument()
        })
    })

    it('navigates to create category page when "Create Category" button is clicked', async () => {
        render(
            <MemoryRouter>
                <Routes>
                    <Route path='/' element={<CreateCategory />} />
                </Routes>
            </MemoryRouter>
        )

        fireEvent.click(screen.getByText('Create Category'))

        expect(mockNavigate).toHaveBeenCalledWith('/dashboard/admin/create-category')
    })

    it('displays existing categories from mock database', async () => {
        const mockCategories = [
            { _id: '1', name: 'Category 1' },
            { _id: '2', name: 'Category 2' },
        ]
        axios.get.mockResolvedValueOnce({ data: { success: true, category: mockCategories } })

        render(
            <MemoryRouter>
                <Routes>
                    <Route path='/' element={<CreateCategory />} />
                </Routes>
            </MemoryRouter>
        )

        await waitFor(() => {
            expect(screen.getByText('Category 1')).toBeInTheDocument()
            expect(screen.getByText('Category 2')).toBeInTheDocument()
        })
    })

    it('opens update modal when edit button is clicked', async () => {
        const mockCategories = [{ _id: '1', name: 'Category 1' }]
        axios.get.mockResolvedValueOnce({ data: { success: true, category: mockCategories } })

        render(
            <MemoryRouter>
                <Routes>
                    <Route path='/' element={<CreateCategory />} />
                </Routes>
            </MemoryRouter>
        )

        await waitFor(() => {
            fireEvent.click(screen.getByText('Edit'))
        })

        const editModal = await screen.findByTestId('edit-modal')
        expect(editModal).toBeInTheDocument()

        // Check if the input field in the modal has the correct initial value
        const input = within(editModal).getByTestId('category-input')
        expect(input).toHaveValue('Category 1')

        // Check if the Submit button is present in the modal
        const submitButton = within(editModal).getByTestId('submit-button')
        expect(submitButton).toBeInTheDocument()
    })

    // Displays misspelled toast message "Something wwent wrong in getting catgeory".
    it.failing('handles error when fetching categories fails due to unreachable server', async () => {
        axios.get.mockRejectedValueOnce({
            isAxiosError: true,
            code: 'ECONNABORTED',
            message: 'Network Error',
        })

        render(
            <MemoryRouter>
                <Routes>
                    <Route path='/' element={<CreateCategory />} />
                </Routes>
            </MemoryRouter>
        )

        await waitFor(() => {
            expect(toast.error).toHaveBeenCalledWith('Something went wrong in getting category')
        })
    })

    // Displays misspelled toast message "Something wwent wrong in getting catgeory".
    it.failing('handles error when fetching categories fails due to 500 Internal Server Error', async () => {
        axios.get.mockRejectedValueOnce({
            response: {
                status: 500,
                data: 'Internal Server Error',
            },
        })

        render(
            <MemoryRouter>
                <Routes>
                    <Route path='/' element={<CreateCategory />} />
                </Routes>
            </MemoryRouter>
        )

        await waitFor(() => {
            expect(toast.error).toHaveBeenCalledWith('Something went wrong in getting category')
        })
    })

    it('creates a new category when no categories exist', async () => {
        axios.get
            .mockResolvedValueOnce({ data: { success: true, category: [] } })
            .mockResolvedValueOnce({
                data: { success: true, category: [{ _id: '1', name: 'My New Category' }] },
            })
        axios.post.mockResolvedValueOnce({
            data: {
                success: true,
                message: 'new category created',
                category: {
                    _id: '1',
                    name: 'My New Category',
                },
            },
        })

        render(
            <MemoryRouter>
                <Routes>
                    <Route path='/' element={<CreateCategory />} />
                </Routes>
            </MemoryRouter>
        )

        const input = await screen.findByPlaceholderText('Enter new category')
        fireEvent.change(input, { target: { value: 'My New Category' } })
        fireEvent.click(screen.getByText('Submit'))

        await waitFor(() => {
            expect(axios.post).toHaveBeenCalledWith('/api/v1/category/create-category', {
                name: 'My New Category',
            })
            expect(toast.success).toHaveBeenCalledWith('My New Category is created')
            expect(screen.getByText('My New Category')).toBeInTheDocument()
        })
    })

    // Displays a toast message "somthing went wrong in input form" which is
    // both misspelled, and also not the error message returned by the backend.
    it.failing('shows error when trying to create category with empty name', async () => {
        const mockCategories = [
            { _id: '1', name: 'Category 1' },
            { _id: '2', name: 'Category 2' },
        ]
        axios.get.mockResolvedValueOnce({ data: { success: true, category: mockCategories } })

        const BACKEND_ERROR_MESSAGE = 'ERROR MESSAGE'
        axios.post.mockRejectedValueOnce({
            response: {
                status: 400,
                data: {
                    success: false,
                    message: BACKEND_ERROR_MESSAGE,
                },
            },
        })

        render(
            <MemoryRouter>
                <Routes>
                    <Route path='/' element={<CreateCategory />} />
                </Routes>
            </MemoryRouter>
        )

        const submitButton = await screen.findByText('Submit')
        fireEvent.click(submitButton)

        await waitFor(() => {
            expect(axios.post).toHaveBeenCalledWith('/api/v1/category/create-category', {
                name: '',
            })
            expect(toast.error).toHaveBeenCalledWith(BACKEND_ERROR_MESSAGE)
        })
    })

    // Displays misspelled toast message "somthing went wrong in input form".
    it.failing('displays error toast when category creation fails', async () => {
        axios.get.mockResolvedValueOnce({ data: { success: true, category: [] } })
        axios.post.mockRejectedValueOnce(new Error('Creation failed'))

        render(
            <MemoryRouter>
                <Routes>
                    <Route path='/' element={<CreateCategory />} />
                </Routes>
            </MemoryRouter>
        )

        const input = await screen.findByPlaceholderText('Enter new category')
        fireEvent.change(input, { target: { value: 'New Category' } })
        fireEvent.click(screen.getByText('Submit'))

        await waitFor(() => {
            expect(toast.error).toHaveBeenCalledWith('Something went wrong in input form')
        })
    })

    it('updates category successfully', async () => {
        const mockCategories = [{ _id: '1', name: 'Category 1' }]
        axios.get.mockResolvedValueOnce({ data: { success: true, category: mockCategories } })
        axios.put.mockResolvedValueOnce({ data: { success: true } })

        render(
            <MemoryRouter>
                <Routes>
                    <Route path='/' element={<CreateCategory />} />
                </Routes>
            </MemoryRouter>
        )

        await waitFor(() => {
            fireEvent.click(screen.getByText('Edit'))
        })

        // Getting the "Submit" button for editing category name.
        const editModal = screen.getByTestId('edit-modal')
        const input = within(editModal).getByTestId('category-input')
        const submitButton = within(editModal).getByTestId('submit-button')

        fireEvent.change(input, { target: { value: 'Updated Category' } })
        fireEvent.click(submitButton)

        await waitFor(() => {
            expect(axios.put).toHaveBeenCalledWith('/api/v1/category/update-category/1', {
                name: 'Updated Category',
            })
            expect(toast.success).toHaveBeenCalledWith('Updated Category is updated')
        })
    })

    // Displays the toast message "Somtihing went wrong" which is both
    // misspelled, and also not the error message returned by the backend.
    it.failing('shows error when editing category to an existing name', async () => {
        const mockCategories = [
            { _id: '1', name: 'Category 1' },
            { _id: '2', name: 'Category 2' },
        ]
        axios.get.mockResolvedValueOnce({ data: { success: true, category: mockCategories } })

        const BACKEND_ERROR_MESSAGE = 'ERROR MESSAGE'
        axios.post.mockRejectedValueOnce({
            response: {
                status: 400,
                data: {
                    success: false,
                    message: BACKEND_ERROR_MESSAGE,
                },
            },
        })

        render(
            <MemoryRouter>
                <Routes>
                    <Route path='/' element={<CreateCategory />} />
                </Routes>
            </MemoryRouter>
        )

        await waitFor(() => {
            fireEvent.click(screen.getAllByText('Edit')[0])
        })

        const editModal = screen.getByTestId('edit-modal')
        const input = within(editModal).getByTestId('category-input')
        const submitButton = within(editModal).getByTestId('submit-button')

        fireEvent.change(input, { target: { value: 'Category 2' } })
        fireEvent.click(submitButton)

        await waitFor(() => {
            expect(toast.error).toHaveBeenCalledWith(BACKEND_ERROR_MESSAGE)
        })
    })

    it('deletes category successfully', async () => {
        const mockCategories = [{ _id: '1', name: 'Category 1' }]
        axios.get.mockResolvedValueOnce({ data: { success: true, category: mockCategories } })
        axios.delete.mockResolvedValueOnce({ data: { success: true } })

        render(
            <MemoryRouter>
                <Routes>
                    <Route path='/' element={<CreateCategory />} />
                </Routes>
            </MemoryRouter>
        )

        await waitFor(() => {
            fireEvent.click(screen.getByText('Delete'))
        })

        await waitFor(() => {
            expect(axios.delete).toHaveBeenCalledWith('/api/v1/category/delete-category/1')
            expect(toast.success).toHaveBeenCalledWith('category is deleted')
        })
    })
})
