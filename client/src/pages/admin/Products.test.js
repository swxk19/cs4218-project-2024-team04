import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import axios from 'axios'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import '@testing-library/jest-dom/extend-expect'
import toast from 'react-hot-toast'
import Products from './Products'

// Mocking dependencies
jest.mock('axios')
jest.mock('react-hot-toast')
jest.mock('../../components/Layout', () => ({ children }) => <div>{children}</div>)
jest.mock('../../components/AdminMenu', () => () => <div>Admin Menu</div>)

describe('Products Component', () => {
    beforeEach(() => {
        jest.clearAllMocks()
    })

    it('renders products list and AdminMenu', async () => {
        axios.get.mockResolvedValueOnce({ data: { products: [] } })

        render(
            <MemoryRouter>
                <Routes>
                    <Route path='/' element={<Products />} />
                </Routes>
            </MemoryRouter>
        )

        await waitFor(() => {
            expect(screen.getByText('All Products List')).toBeInTheDocument()
            expect(screen.getByText('Admin Menu')).toBeInTheDocument()
        })
    })

    it('fetches and displays products', async () => {
        const mockProducts = [
            { _id: '1', name: 'Product 1', description: 'Description 1', slug: 'product-1' },
            { _id: '2', name: 'Product 2', description: 'Description 2', slug: 'product-2' },
        ]
        axios.get.mockResolvedValueOnce({ data: { products: mockProducts } })

        render(
            <MemoryRouter>
                <Routes>
                    <Route path='/' element={<Products />} />
                </Routes>
            </MemoryRouter>
        )

        await waitFor(() => {
            expect(screen.getByText('Product 1')).toBeInTheDocument()
            expect(screen.getByText('Description 1')).toBeInTheDocument()
            expect(screen.getByText('Product 2')).toBeInTheDocument()
            expect(screen.getByText('Description 2')).toBeInTheDocument()
        })
    })

    it('handles empty product list', async () => {
        axios.get.mockResolvedValueOnce({ data: { products: [] } })

        render(
            <MemoryRouter>
                <Routes>
                    <Route path='/' element={<Products />} />
                </Routes>
            </MemoryRouter>
        )

        await waitFor(() => {
            expect(screen.queryByText('Product 1')).not.toBeInTheDocument()
        })
    })

    it('handles API error', async () => {
        axios.get.mockRejectedValueOnce(new Error('API Error'))

        render(
            <MemoryRouter>
                <Routes>
                    <Route path='/' element={<Products />} />
                </Routes>
            </MemoryRouter>
        )

        await waitFor(() => {
            expect(toast.error).toHaveBeenCalledWith('Someething Went Wrong')
        })
    })

    it('renders product images correctly', async () => {
        const mockProducts = [
            { _id: '1', name: 'Product 1', description: 'Description 1', slug: 'product-1' },
        ]
        axios.get.mockResolvedValueOnce({ data: { products: mockProducts } })

        render(
            <MemoryRouter>
                <Routes>
                    <Route path='/' element={<Products />} />
                </Routes>
            </MemoryRouter>
        )

        await waitFor(() => {
            const productImage = screen.getByAltText('Product 1')
            expect(productImage).toHaveAttribute('src', '/api/v1/product/product-photo/1')
        })
    })

    it('creates correct link for each product', async () => {
        const mockProducts = [
            { _id: '1', name: 'Product 1', description: 'Description 1', slug: 'product-1' },
        ]
        axios.get.mockResolvedValueOnce({ data: { products: mockProducts } })

        render(
            <MemoryRouter>
                <Routes>
                    <Route path='/' element={<Products />} />
                </Routes>
            </MemoryRouter>
        )

        await waitFor(() => {
            const productLink = screen.getByRole('link', { name: /Product 1/i })
            expect(productLink).toHaveAttribute('href', '/dashboard/admin/product/product-1')
        })
    })
})
