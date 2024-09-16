import React from 'react'
import {fireEvent, render, screen} from '@testing-library/react'
import '@testing-library/jest-dom/extend-expect'
import {MemoryRouter, Routes, Route} from "react-router-dom";
import AdminMenu from "./AdminMenu";

const CreateCategory = () => <div>Manage Category</div>;
const CreateProduct = () => <div>Create Product</div>;
const Products = () => <div>All Products List</div>;
const Orders = () => <div>All Orders</div>;

describe('Admin Menu Component', () => {
    it('renders admin menu correctly', () => {
        const { getByText } = render(
            <MemoryRouter>
                <AdminMenu />
            </MemoryRouter>
        )
        expect(getByText('Admin Panel')).toBeInTheDocument();
        expect(getByText('Create Category')).toBeInTheDocument();
        expect(getByText('Create Product')).toBeInTheDocument();
        expect(getByText('Products')).toBeInTheDocument();
        expect(getByText('Orders')).toBeInTheDocument();
    });

    it('navigate to create category', () => {
        const { getByText } = render(
            <MemoryRouter initialEntries={['/adminmenu']}>
                <Routes>
                    <Route path="/adminmenu" element={<AdminMenu />} />
                    <Route path="/dashboard/admin/create-category" element={<CreateCategory />} />
                </Routes>
            </MemoryRouter>
        )

        fireEvent.click(getByText('Create Category'));
        expect(screen.getByText('Manage Category')).toBeInTheDocument();
    });

    it('navigate to create product', () => {
        const { getByText } = render(
            <MemoryRouter initialEntries={['/adminmenu']}>
                <Routes>
                    <Route path="/adminmenu" element={<AdminMenu />} />
                    <Route path="/dashboard/admin/create-product" element={<CreateProduct />} />
                </Routes>
            </MemoryRouter>
        )

        fireEvent.click(getByText('Create Product'));
        expect(screen.getByText('Create Product')).toBeInTheDocument();
    });

    it('navigate to create product', () => {
        const { getByText } = render(
            <MemoryRouter initialEntries={['/adminmenu']}>
                <Routes>
                    <Route path="/adminmenu" element={<AdminMenu />} />
                    <Route path="/dashboard/admin/products" element={<Products />} />
                </Routes>
            </MemoryRouter>
        )

        fireEvent.click(getByText('Products'));
        expect(screen.getByText('All Products List')).toBeInTheDocument();
    });

    it('navigate to create product', () => {
        const { getByText } = render(
            <MemoryRouter initialEntries={['/adminmenu']}>
                <Routes>
                    <Route path="/adminmenu" element={<AdminMenu />} />
                    <Route path="/dashboard/admin/orders" element={<Orders />} />
                </Routes>
            </MemoryRouter>
        )

        fireEvent.click(getByText('Orders'));
        expect(screen.getByText('All Orders')).toBeInTheDocument();
    });
});
